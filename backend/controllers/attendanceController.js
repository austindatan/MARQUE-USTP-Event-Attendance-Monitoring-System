// controllers/attendanceController.js

const AttendanceLog = require("../models/Attendance_log");
const Student = require("../models/Student");
const User = require("../models/User");
const Department = require("../models/Department");
const Event = require("../models/Event"); // <--- ADD THIS LINE
const { cloudinary } = require('../routes/cloudinaryConfig');


/**
 * Checks if the current time is after the event started and within 1 hour of the start time.
 * @param {object} event The event document with a start_time field.
 * @returns {boolean} True if within the 1-hour registration window, false otherwise.
 */
const isEventWithin1Hour = (event) => {
    if (!event || !event.start_time) {
        return false;
    }

    const now = new Date();
    const startTime = new Date(event.start_time);
    
    const cutoffTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 60 minutes = 1 hour

    // The event must have started (now >= start_time) 
    // AND it must be before the 1-hour cutoff (now <= cutoff_time)
    const hasStarted = now >= startTime;
    const isWithinCutoff = now <= cutoffTime;

    return hasStarted && isWithinCutoff;
};

const registerAttendance = async (req, res) => {
  try {
    const { event_id, student_number } = req.body;

    if (!event_id) {
      return res.status(400).json({ message: "Missing required field: event_id" });
    }

    if (!student_number) {
      return res.status(400).json({ message: "Missing required field: student_number" });
    }

    // Find student by student_number and populate related fields
    const student = await Student.findOne({ student_number })
      .populate("users_id")
      .populate("department_id");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const user = student.users_id;

    // Fetch event to check time restrictions
    const event = await Event.findById(event_id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if within first 1 hour of event start
    if (!isEventWithin1Hour(event)) {
      return res.status(403).json({
        message:
          "Scanner is disabled. Attendance can only be registered within the first 1 hour of the event start.",
      });
    }

    // Prevent duplicate logs for the same event
    const existingLog = await AttendanceLog.findOne({ event_id, user_id: user._id });

    if (existingLog) {
      return res.status(200).json({
        message: "Student already registered for this event.",
        alreadyRegistered: true,
        data: {
          name: `${user.firstname} ${user.lastname}`,
          student_number: student.student_number,
          program: student.department_id?.department_code || "",
          time_in: existingLog.time_in,
        },
      });
    }

    // Create new attendance log
    const newLog = await AttendanceLog.create({
      event_id,
      user_id: user._id,
      status: "Present",
      time_in: new Date(),
    });

    return res.status(201).json({
      message: "Attendance registered successfully.",
      alreadyRegistered: false,
      data: {
        name: `${user.firstname} ${user.lastname}`,
        student_number: student.student_number,
        program: student.department_id?.department_code || "",
        time_in: newLog.time_in,
      },
    });
  } catch (error) {
    console.error("REGISTER ATTENDANCE ERROR:", error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

function formatLocalDateTime(utcDate) {
    const date = new Date(utcDate);

    // Convert to PH timezone using Intl.DateTimeFormat
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true, // Use 12-hour format
        timeZone: "Asia/Manila",
    });

    const parts = dateFormatter.formatToParts(date);
    
    // Extract parts for MM-DD-YYYY
    const month = parts.find(p => p.type === 'month').value;
    const day = parts.find(p => p.type === 'day').value;
    const year = parts.find(p => p.type === 'year').value;
    const formattedDate = `${month}-${day}-${year}`; // MM-DD-YYYY

    // Extract parts for h:mm A (12-hour time)
    const hour = parts.find(p => p.type === 'hour').value;
    const minute = parts.find(p => p.type === 'minute').value;
    const ampm = parts.find(p => p.type === 'dayPeriod').value;

    const formattedTime = `${hour}:${minute} ${ampm}`; // h:mm AM/PM

    return { formattedDate, formattedTime };
}

const getAttendanceHistory = async (req, res) => {
    try {
        let { event_id } = req.params;

        if (!event_id) {
            return res.status(400).json({ message: "Missing required field: event_id" });
        }
        event_id = event_id.trim();

        // Find all attendance logs for this event
        const logs = await AttendanceLog.find({ event_id }).populate("user_id");

        const formatted = await Promise.all(
            logs.map(async (log) => {
                const student = await Student.findOne({
                    users_id: log.user_id._id,
                }).populate("department_id");

                // Convert UTC → PH local & format
                const { formattedDate, formattedTime } = formatLocalDateTime(log.time_in);

                return {
                    name: `${log.user_id.firstname} ${log.user_id.lastname}`,
                    student_number: student?.student_number || "",
                    program: student?.department_id?.department_code || "",
                    status: log.status, // <--- ADDED THIS FIELD
                    date: formattedDate,  // MM-DD-YYYY
                    time: formattedTime,  // HH:mm (now 12-hour)
                };
            })
        );

        return res.status(200).json({
            message: "Attendance history retrieved successfully",
            history: formatted,
        });
    } catch (error) {
        console.error("GET HISTORY ERROR:", error);
        return res.status(500).json({ message: "Server Error", error });
    }
};

const searchAttendanceLogs = async (req, res) => {
  try {
    const { event_id } = req.params;
    const { q } = req.query; // search query

    if (!event_id) {
      return res.status(400).json({ message: "Missing required field: event_id" });
    }

    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Missing search query" });
    }

    const searchRegex = new RegExp(q.trim(), "i"); // case-insensitive

    // Find attendance logs for the event and populate user
    const logs = await AttendanceLog.find({ event_id }).populate("user_id");

    // Filter logs based on name OR student_number
    const filteredLogs = [];
    for (const log of logs) {
      const student = await Student.findOne({ users_id: log.user_id._id }).populate("department_id");

      const name = `${log.user_id.firstname} ${log.user_id.lastname}`;
      const studentNumber = student?.student_number || "";

      // Only include if matches name or student_number
      if (!searchRegex.test(name) && !searchRegex.test(studentNumber)) continue;

      const { formattedDate, formattedTime } = formatLocalDateTime(log.time_in);

      filteredLogs.push({
        name,
        student_number: studentNumber,
        program: student?.department_id?.department_code || "",
        status: log.status,
        date: formattedDate,
        time: formattedTime,
      });
    }

    return res.status(200).json({
      message: "Search results retrieved successfully",
      history: filteredLogs,
    });
  } catch (error) {
    console.error("SEARCH ATTENDANCE ERROR:", error);
    return res.status(500).json({ message: "Server Error", error });
  }
};



const uploadPhotoproof = async (req, res) => {
  try {
    const watermarkText = req.body?.watermarkText || '';

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const originalUrl = req.file.path;

    // Use Cloudinary to create a watermarked version of the uploaded image.
    // We re-upload the already-hosted image URL and apply a text overlay transformation.
    const uploadOptions = {
      folder: 'MARQUE Events/PHOTOPROOF_WATERMARKED',
      public_id: `photoproof-wm-${Date.now()}`,
      transformation: []
    };

    if (watermarkText && watermarkText.trim() !== '') {
      uploadOptions.transformation.push({
        overlay: {
          font_family: 'Arial',
          font_size: 36,
          font_weight: 'bold',
          text: watermarkText
        },
        gravity: 'south_west',
        x: 20,
        y: 20,
        color: '#FFFFFF'
      });
    }

    const result = await cloudinary.uploader.upload(originalUrl, uploadOptions);

    return res.status(200).json({ message: 'Uploaded', url: result.secure_url });
  } catch (err) {
    console.error('UPLOAD PHOTOPROOF ERROR:', err);
    return res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

/* ============================================================
    EXPORT ATTENDANCE LOGS AS PDF
============================================================ */
const PDFDocument = require("pdfkit");
const path = require("path");

const exportAttendancePDF = async (req, res) => {
  try {
    const { event_id } = req.params;

    if (!event_id) {
      return res.status(400).json({ message: "Missing event_id" });
    }

    // Fetch event
    const event = await Event.findById(event_id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Fetch logs
    const logs = await AttendanceLog.find({ event_id }).populate("user_id");

    // Format logs
    const formatted = await Promise.all(
      logs.map(async (log) => {
        const student = await Student.findOne({
          users_id: log.user_id._id,
        }).populate("department_id", "department_code"); // <-- POPULATE ONLY CODE

        const { formattedDate, formattedTime } = formatLocalDateTime(
          log.time_in
        );

        return {
          name: `${log.user_id.firstname} ${log.user_id.lastname}`,
          student_number: student?.student_number || "",
          department: student?.department_id?.department_code || "N/A", // <-- CODE is here
          time: formattedTime,
          date: formattedDate,
          status: log.status,
        };
      })
    );

    // Prepare PDF
    const doc = new PDFDocument({ margin: 40, size: "A4" });

    // Set headers for browser download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="attendance_${event.event_name}.pdf"`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    /* HEADER */
    doc
      .fontSize(20)
      .text("Attendance Report", { align: "center" })
      .moveDown(1);

    doc.fontSize(14).text(`Event: ${event.event_name}`);
    doc.text(`Date: ${new Date(event.event_date).toDateString()}`);
    doc.moveDown(1);

    const startX = 40; // Left Margin
    const endX = 550; // Right side limit (A4 width - margin)
    let currentY = doc.y; // Track the current Y position

    // Define column positions and widths (total width is 510)
    const columns = [
        { title: "Student No.", x: startX, width: 90 },
        { title: "Name", x: startX + 95, width: 140 },
        { title: "Dept.", x: startX + 240, width: 100 },
        { title: "Time In", x: startX + 345, width: 70 },
        { title: "Status", x: startX + 420, width: 70 },
    ];

    /* TABLE HEADER */
    doc.fontSize(12).font("Helvetica-Bold");

    columns.forEach((col) => {
        doc.text(col.title, col.x, currentY, { width: col.width, align: "left" });
    });

    doc.moveDown(0.2);
    currentY = doc.y; // Update Y after header text
    
    // Separator line
    doc.moveTo(startX, currentY).lineTo(endX, currentY).stroke();
    doc.moveDown(0.3);

    /* TABLE ROWS */
    doc.fontSize(10).font("Helvetica");

    formatted.forEach((row) => {
        currentY = doc.y; // Start position for the new row

        // Student No.
        doc.text(row.student_number, columns[0].x, currentY, { width: columns[0].width, align: "left" });

        // Name (This is the longest field, use it to determine row height)
        // We use doc.text() and capture the resulting height
        const nameHeight = doc.text(row.name, columns[1].x, currentY, { width: columns[1].width, align: "left", continued: false }).currentLineHeight();

        // Dept.
        doc.text(row.department, columns[2].x, currentY, { width: columns[2].width, align: "left" });

        // Time In
        doc.text(row.time, columns[3].x, currentY, { width: columns[3].width, align: "left" });

        // Status
        doc.text(row.status, columns[4].x, currentY, { width: columns[4].width, align: "left" });

        // Move cursor down by the required height (plus a small buffer)
        doc.y = currentY + nameHeight + 5; 
    });

    doc.end();
  } catch (error) {
    console.error("PDF EXPORT ERROR:", error);
    res.status(500).json({ message: "Server error generating PDF" });
  }
};



/* ============================================================
    EXPORTS
============================================================ */
module.exports = {
  registerAttendance,
  getAttendanceHistory,
  isEventWithin1Hour,
  searchAttendanceLogs, // export Event model if needed for routes
  uploadPhotoproof,
  exportAttendancePDF,
};

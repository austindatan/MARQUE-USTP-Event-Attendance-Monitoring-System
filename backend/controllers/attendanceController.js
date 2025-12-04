// controllers/attendanceController.js

const AttendanceLog = require("../models/Attendance_log");
const Student = require("../models/Student");
const User = require("../models/User");
const Department = require("../models/Department");
const Event = require("../models/Event"); // <--- ADD THIS LINE


/**
 * Checks if the current time is after the event started and within 30 minutes of the start time.
 * @param {object} event The event document with a start_time field.
 * @returns {boolean} True if within the 30-minute registration window, false otherwise.
 */
const isEventWithin30Min = (event) => {
    if (!event || !event.start_time) {
        return false;
    }

    const now = new Date();
    const startTime = new Date(event.start_time);
    
    // Calculate the time 60 minutes after the event started
    const cutoffTime = new Date(startTime.getTime() + 60 * 60000); // 60 minutes in milliseconds

    // The event must have started (now >= start_time) 
    // AND it must be before the 60-minute cutoff (now <= cutoff_time)
    const hasStarted = now >= startTime;
    const isWithinCutoff = now <= cutoffTime;

    return hasStarted && isWithinCutoff;
};

/* ============================================================
    REGISTER ATTENDANCE
============================================================ */
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

    // Check if within first 30 minutes of event start
    if (!isEventWithin30Min(event)) {
      return res.status(403).json({
        message:
          "Scanner is disabled. Attendance can only be registered within the first 30 minutes of the event start.",
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

/* ============================================================
    HELPER: FORMAT UTC → LOCAL PH (MM-DD-YYYY & h:mm A)
============================================================ */
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

/* ============================================================
    GET ATTENDANCE HISTORY (with PH local time)
============================================================ */
const getAttendanceHistory = async (req, res) => {
    try {
        let { event_id } = req.params;

        if (!event_id) {
            return res.status(400).json({ message: "Missing required field: event_id" });
        }

        // Trim to avoid ObjectId cast errors
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

/* ============================================================
    SEARCH ATTENDANCE LOGS BY NAME OR STUDENT NUMBER
============================================================ */
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


/* ============================================================
    EXPORTS
============================================================ */
module.exports = {
  registerAttendance,
  getAttendanceHistory,
  isEventWithin30Min,
  searchAttendanceLogs, // export Event model if needed for routes
};

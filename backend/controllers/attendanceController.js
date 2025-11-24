// controllers/attendanceController.js

const AttendanceLog = require("../models/Attendance_log");
const Student = require("../models/Student");
const User = require("../models/User");
const Department = require("../models/Department");

/* ============================================================
    TEMP DEFAULT EVENT ID FOR TESTING (COMMENTED OUT)
============================================================ */
 const DEFAULT_EVENT_ID = "6923517772c7b61301a4e31f"; 

/* ============================================================
    REGISTER ATTENDANCE
============================================================ */
exports.registerAttendance = async (req, res) => {
  try {
    let { event_id, student_number } = req.body;

    // Optional testing mode: uncomment the next lines to use default event
     if (!event_id) {
       console.warn("⚠️ No event_id provided — using DEFAULT event for testing.");
       event_id = DEFAULT_EVENT_ID;
     } 
    

    if (!event_id) {
      return res.status(400).json({
        message: "Missing required field: event_id",
      });
    }

    if (!student_number) {
      return res.status(400).json({
        message: "Missing required field: student_number",
      });
    }

    // Find student by student_number and populate related fields
    const student = await Student.findOne({ student_number })
      .populate("users_id")
      .populate("department_id");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const user = student.users_id;

    // Prevent duplicate logs for the same event
    const existingLog = await AttendanceLog.findOne({
      event_id,
      user_id: user._id,
    });

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
    GET ATTENDANCE HISTORY
============================================================ */
exports.getAttendanceHistory = async (req, res) => {
  try {
    let { event_id } = req.params;

    // Optional testing mode: uncomment the next lines to use default event
     if (!event_id) {
       console.warn("⚠️ No event_id provided — using DEFAULT event for testing.");
       event_id = DEFAULT_EVENT_ID;
     }
    

    if (!event_id) {
      return res.status(400).json({
        message: "Missing required field: event_id",
      });
    }

    // Trim to avoid ObjectId cast errors
    event_id = event_id.trim();

    // Find all attendance logs for the event and populate user
    const logs = await AttendanceLog.find({ event_id }).populate("user_id");

    // Format logs with student info and department
    const formatted = await Promise.all(
      logs.map(async (log) => {
        const student = await Student.findOne({ users_id: log.user_id._id })
          .populate("department_id");

        return {
          name: `${log.user_id.firstname} ${log.user_id.lastname}`,
          student_number: student?.student_number || "",
          program: student.department_id?.department_code || "",
          status: log.status,
          time_in: log.time_in,
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

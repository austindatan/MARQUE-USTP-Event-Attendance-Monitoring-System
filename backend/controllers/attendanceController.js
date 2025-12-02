// controllers/attendanceController.js

const AttendanceLog = require("../models/Attendance_log");
const Student = require("../models/Student");
const User = require("../models/User");
const Department = require("../models/Department");
const Event = require("../models/Event");

/* ============================================================
    HELPER: CHECK IF EVENT IS ACTIVE
============================================================ */
const isEventActive = (event) => {
  if (!event) return false;

  const now = new Date();
  const eventDate = new Date(event.event_date);
  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);

  // Check if today is the same day as event
  const isSameDay =
    now.getFullYear() === eventDate.getFullYear() &&
    now.getMonth() === eventDate.getMonth() &&
    now.getDate() === eventDate.getDate();

  const isWithinTime = now >= startTime && now <= endTime;

  return isSameDay && isWithinTime;
};

/**
 * Returns true if the current time is within the first 30 minutes of the event start
 */
const isEventWithin30Min = (event) => {
  if (!event) return false;

  const now = new Date();
  const startTime = new Date(event.start_time);

  // Event is active only within first 30 minutes after start
  const thirtyMinutesAfterStart = new Date(startTime.getTime() + 30 * 60 * 1000);

  return now >= startTime && now <= thirtyMinutesAfterStart;
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
    GET ATTENDANCE HISTORY
============================================================ */
const getAttendanceHistory = async (req, res) => {
  try {
    let { event_id } = req.params;

    if (!event_id) {
      return res.status(400).json({ message: "Missing required field: event_id" });
    }

    // Trim to avoid ObjectId cast errors
    event_id = event_id.trim();

    // Find all attendance logs for the event and populate user
    const logs = await AttendanceLog.find({ event_id }).populate("user_id");

    // Format logs with student info and department
    const formatted = await Promise.all(
      logs.map(async (log) => {
        const student = await Student.findOne({ users_id: log.user_id._id }).populate(
          "department_id"
        );

        return {
          name: `${log.user_id.firstname} ${log.user_id.lastname}`,
          student_number: student?.student_number || "",
          program: student?.department_id?.department_code || "",
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

/* ============================================================
    EXPORTS
============================================================ */
module.exports = {
  registerAttendance,
  getAttendanceHistory,
  isEventActive,
  isEventWithin30Min,
  Event, // export Event model if needed for routes
};

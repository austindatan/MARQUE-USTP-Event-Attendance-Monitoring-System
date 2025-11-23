const express = require("express");
const router = express.Router();
const { markAttendance, getAttendanceLogs } = require("../controllers/attendanceController");

// Mark attendance: POST /attendance/scan/:userId/:eventId
router.post("/scan/:userId/:eventId", markAttendance);

// Get attendance logs (optionally filter by studentId): GET /attendance/:eventId?studentId=12345
router.get("/:eventId", getAttendanceLogs);

module.exports = router;

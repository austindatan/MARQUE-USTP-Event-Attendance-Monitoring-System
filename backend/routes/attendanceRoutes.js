const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.post('/register', attendanceController.registerAttendance); // no parentheses
router.get('/history/:event_id', attendanceController.getAttendanceHistory);
router.get("/search/:event_id", attendanceController.searchAttendanceLogs);


module.exports = router;

const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { uploadPhotoproof } = require('../routes/cloudinaryConfig');

router.post('/register', attendanceController.registerAttendance); // no parentheses
router.get('/history/:event_id', attendanceController.getAttendanceHistory);
router.get("/search/:event_id", attendanceController.searchAttendanceLogs);

// Upload photoproof and generate watermarked version server-side
router.post(
	'/upload-photoproof',
	uploadPhotoproof.single('file'),
	attendanceController.uploadPhotoproof
);

module.exports = router;

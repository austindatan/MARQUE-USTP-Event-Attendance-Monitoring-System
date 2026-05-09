const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { uploadPhotoproof } = require('../routes/cloudinaryConfig');
const authMiddleware = require('../middleware/auth');

router.post('/register', authMiddleware, attendanceController.registerAttendance);
router.get('/history/:event_id', attendanceController.getAttendanceHistory);
router.get("/search/:event_id", attendanceController.searchAttendanceLogs);
router.get("/log/:event_id/:student_number", attendanceController.getAttendanceLogStatus);

router.post(
	'/upload-photoproof',
	authMiddleware,
	uploadPhotoproof.single('file'),
	attendanceController.uploadPhotoproof
);

router.post('/register-or-get-log', authMiddleware, attendanceController.registerOrGetAttendanceLog);
router.get('/photoproofs/pending/:event_id', attendanceController.getPendingPhotoproofs);
router.post('/verify-photoproof', authMiddleware, attendanceController.verifyPhotoproof);

router.get("/export/:event_id", attendanceController.exportAttendancePDF);

module.exports = router;
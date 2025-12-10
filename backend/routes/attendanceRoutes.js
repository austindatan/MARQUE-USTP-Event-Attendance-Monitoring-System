const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { uploadPhotoproof } = require('../routes/cloudinaryConfig');

router.post('/register', attendanceController.registerAttendance); 
router.get('/history/:event_id', attendanceController.getAttendanceHistory);
router.get("/search/:event_id", attendanceController.searchAttendanceLogs);

// NEW ROUTE: Used by the client (EventDetails_Unified.tsx) to check for log/photo proof status
router.get("/log/:event_id/:student_number", attendanceController.getAttendanceLogStatus); 

// Upload photoproof and generate watermarked version server-side
router.post(
	'/upload-photoproof',
	uploadPhotoproof.single('file'),
	attendanceController.uploadPhotoproof
);

// NEW route for stateless Photo Proof
router.post('/register-or-get-log', attendanceController.registerOrGetAttendanceLog);

// routes/attendance.js
router.get('/photoproofs/pending/:event_id', attendanceController.getPendingPhotoproofs);
router.post('/verify-photoproof', attendanceController.verifyPhotoproof);

// DOWNLOAD PDF of attendance logs
router.get("/export/:event_id", attendanceController.exportAttendancePDF);

module.exports = router;
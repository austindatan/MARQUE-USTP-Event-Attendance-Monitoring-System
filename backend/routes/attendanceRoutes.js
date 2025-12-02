const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Register attendance
router.post('/register', attendanceController.registerAttendance);

// Get attendance history for an event
router.get('/history/:event_id', attendanceController.getAttendanceHistory);

// Optional: Check if event is active and/or within first 30 minutes
router.get('/event-status/:event_id', async (req, res) => {
  try {
    const { event_id } = req.params;

    if (!event_id) {
      return res.status(400).json({ message: "Missing required field: event_id" });
    }

    // Fetch event
    const event = await attendanceController.Event.findById(event_id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({
      isActive: attendanceController.isEventActive(event),
      within30Min: attendanceController.isEventWithin30Min(event),
    });
  } catch (error) {
    console.error("EVENT STATUS ERROR:", error);
    return res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;

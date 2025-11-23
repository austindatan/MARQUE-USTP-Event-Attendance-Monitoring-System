const AttendanceLog = require('../models/AttendanceLog');
const Event = require('../models/Event');
const User = require('../models/User'); // to query by studentId

/**
 * Mark attendance when scanning QR
 * Params: { userId, eventId }
 */
const markAttendance = async (req, res) => {
  try {
    const { userId, eventId } = req.params;

    if (!userId || !eventId) {
      return res.status(400).json({ message: 'userId and eventId are required' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const now = new Date();
    const eventStart = new Date(event.start_time);
    const lateThreshold = new Date(eventStart.getTime() + 30 * 60 * 1000);

    let status = 'Present';
    if (now > lateThreshold) status = 'Late';

    const existingLog = await AttendanceLog.findOne({ user_id: userId, event_id: eventId });
    if (existingLog) {
      return res.status(400).json({ message: 'Attendance already recorded' });
    }

    const newLog = new AttendanceLog({
      user_id: userId,
      event_id: eventId,
      status,
      time_in: now,
    });

    await newLog.save();

    res.status(201).json({ message: 'Attendance recorded', log: newLog });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get attendance logs for an event
 * Params: { eventId }
 * Query: { studentId } optional
 */
const getAttendanceLogs = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { studentId } = req.query;

    if (!eventId) return res.status(400).json({ message: 'eventId is required' });

    const event = await Event.findById(eventId).populate('participants');
    if (!event) return res.status(404).json({ message: 'Event not found' });

    let logs = await AttendanceLog.find({ event_id: eventId }).populate('user_id', 'name studentId program');

    // Mark unscanned participants as Absent
    if (event.participants && event.participants.length > 0) {
      const scannedIds = logs.map(log => log.user_id._id.toString());

      const absentLogs = event.participants
        .filter(u => !scannedIds.includes(u.toString()))
        .map(u => ({
          user_id: u,
          event_id: eventId,
          status: 'Absent',
        }));

      if (absentLogs.length > 0) {
        await AttendanceLog.insertMany(absentLogs);
        logs = await AttendanceLog.find({ event_id: eventId }).populate('user_id', 'name studentId program');
      }
    }

    // Filter by studentId if provided
    if (studentId) {
      logs = logs.filter(log => log.user_id.studentId === studentId);
    }

    res.json(logs);
  } catch (error) {
    console.error('Error fetching attendance logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { markAttendance, getAttendanceLogs };

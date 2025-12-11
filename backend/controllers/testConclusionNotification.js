// Test endpoint for manually triggering conclusion notifications
// Add this to your eventRoutes.js for testing purposes

const Event = require('../models/Event');
const Notification = require('../models/Notification');
const AttendanceLog = require('../models/Attendance_log');

const testConclusionNotification = async (req, res) => {
    try {
        const { eventId } = req.params;

        if (!eventId) {
            return res.status(400).json({ message: 'Event ID is required' });
        }

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        console.log(`[TEST] Manually triggering conclusion notification for event: ${event.event_name}`);
        console.log(`[TEST] Event status: ${event.status}`);
        console.log(`[TEST] Conclusion notification sent: ${event.remindersSent?.conclusion}`);

        // Get all students who attended this event
        const attendanceLogs = await AttendanceLog.find({
            event_id: event._id
        }).select('student_id').lean();

        console.log(`[TEST] Found ${attendanceLogs.length} attendees`);

        if (attendanceLogs.length === 0) {
            return res.status(200).json({
                message: 'No attendees found for this event',
                eventName: event.event_name,
                attendeeCount: 0
            });
        }

        const attendeeIds = attendanceLogs.map(log => log.student_id.toString());

        const title = `${event.event_name} - Share Your Feedback!`;
        const message = `Thank you for attending "${event.event_name}"! We'd love to hear your thoughts. Please take a moment to share your feedback and help us improve future events.`;

        const notifications = attendeeIds.map(studentId => ({
            student_id: studentId,
            title: title,
            message: message,
            type: 'event_concluded',
            event_id: event._id,
            is_read: false,
            createdAt: new Date()
        }));

        await Notification.insertMany(notifications);
        console.log(`[TEST] Created ${notifications.length} notifications`);

        // Mark as sent
        await Event.findByIdAndUpdate(event._id, {
            'remindersSent.conclusion': true
        });

        res.status(200).json({
            success: true,
            message: 'Conclusion notifications sent successfully',
            eventName: event.event_name,
            attendeeCount: attendeeIds.length,
            notificationsSent: notifications.length
        });

    } catch (error) {
        console.error('[TEST] Error:', error);
        res.status(500).json({
            message: 'Error sending conclusion notifications',
            error: error.message
        });
    }
};

module.exports = { testConclusionNotification };

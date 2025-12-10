const cron = require('node-cron');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const FollowedOrgs = require('../models/Followed_org');
const Organization = require('../models/Organization');

const sendReminder = async (event, reminderType) => {
    try {
        const org = await Organization.findById(event.organization_id);
        if (!org) return;

        let targetStudentIds = new Set();

        if (org.org_type === "Mother Organization") {
            // Mother Organization -> Notify ALL Students
            const allStudents = await Student.find({}).select("_id");
            allStudents.forEach(s => targetStudentIds.add(s._id.toString()));
        } else {
            // A. Department Members
            if (org.department_id) {
                const deptStudents = await Student.find({ department_id: org.department_id }).select("_id");
                deptStudents.forEach(s => targetStudentIds.add(s._id.toString()));
            }

            // B. Followers (Note: FollowedOrgs stores STUDENT IDs in the user_id field)
            const followers = await FollowedOrgs.find({ organization_id: event.organization_id }).select("user_id");
            const followerStudentIds = followers.map(f => f.user_id); // These are Student IDs

            if (followerStudentIds.length > 0) {
                // console.log(`[Scheduler] Adding ${followerStudentIds.length} followers directly.`);
                followerStudentIds.forEach(id => targetStudentIds.add(id.toString()));
            }
        }

        let title, message;
        if (reminderType === 'twentyFourHours') {
            title = `Reminder: ${event.event_name}`;
            message = `This event is happening in 1 day! Don't miss it.`;
        } else if (reminderType === 'oneHour') {
            title = `Starting Soon: ${event.event_name}`;
            message = `This event starts in 1 hour! Get ready.`;
        }

        const notifications = Array.from(targetStudentIds).map(studentId => ({
            user_id: studentId,
            organization_id: event.organization_id,
            event_id: event._id,
            type: "event",
            title,
            message,
            status: "info",
            is_read: false
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
            console.log(`[Scheduler] Sent ${reminderType} reminder for event: ${event.event_name} to ${notifications.length} students.`);
        }

        // Mark as sent
        if (reminderType === 'twentyFourHours') {
            event.remindersSent.twentyFourHours = true;
        } else {
            event.remindersSent.oneHour = true;
        }
        await event.save();

    } catch (error) {
        console.error(`[Scheduler] Error sending reminder for event ${event._id}:`, error);
    }
};

const initScheduler = () => {
    console.log('[Scheduler] Initializing Notification Scheduler...');

    // Run every minute (for testing purposes and better granularity given the logic)
    // '0 * * * *' is every hour. '* * * * *' is every minute.
    // For production, every 15 mins or 30 mins is probably fine.
    // Let's go with every 10 minutes to be responsive but not spammy loop-wise.
    cron.schedule('*/10 * * * *', async () => {

        // console.log('[Scheduler] Checking for upcoming events...');
        const now = new Date();

        try {
            // 1. 24 Hour Reminder (Look for events starting in 23.5 - 24.5 hours)
            // Broaden window to match the cron frequency (10 mins) + some buffer
            // 24 hours from now +/- 30 mins
            const start24 = new Date(now.getTime() + (23.5 * 60 * 60 * 1000));
            const end24 = new Date(now.getTime() + (24.5 * 60 * 60 * 1000));

            const events24 = await Event.find({
                status: 'Upcoming',
                'remindersSent.twentyFourHours': false,
                start_time: { $gte: start24, $lte: end24 }
            });

            for (const event of events24) {
                await sendReminder(event, 'twentyFourHours');
            }

            // 2. 1 Hour Reminder (Look for events starting in 50m - 70m)
            const start1 = new Date(now.getTime() + (50 * 60 * 1000));
            const end1 = new Date(now.getTime() + (70 * 60 * 1000));

            const events1 = await Event.find({
                status: 'Upcoming',
                'remindersSent.oneHour': false,
                start_time: { $gte: start1, $lte: end1 }
            });

            for (const event of events1) {
                await sendReminder(event, 'oneHour');
            }

        } catch (error) {
            console.error('[Scheduler] Error checking events:', error);
        }
    });
};

module.exports = initScheduler;

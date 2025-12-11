const cron = require('node-cron');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const FollowedOrgs = require('../models/Followed_org');
const Organization = require('../models/Organization');
const AttendanceLog = require('../models/Attendance_log');

const sendReminder = async (event, reminderType) => {
    try {
        // 2. UPDATED POPULATE TO FETCH COLLEGE ID
        const org = await Organization.findById(event.organization_id)
            .populate({
                path: "department_id",
                select: "college_id", // Fetch department/college linkage
                // Populate the college ID from the Department model
                populate: { path: "college_id", select: "_id" }
            });

        if (!org) return;

        let targetStudentIds = new Set();
        const orgCollegeId = org.department_id?.college_id?._id; // Get the college ID (if available)

        // *** 3. CORE LOGIC CHANGE FOR AUDIENCE TARGETING ***
        if (org.org_type === "Mother Organization") {
            if (orgCollegeId) {
                // A. Mother Organization Target: ALL Students in the SAME COLLEGE

                // 1. Find all departments belonging to this College
                const collegeDepartments = await Department.find({ college_id: orgCollegeId }).select("_id");
                const departmentIds = collegeDepartments.map(d => d._id);

                // 2. Find all students belonging to those departments (i.e., the same college)
                const collegeStudents = await Student.find({ department_id: { $in: departmentIds } }).select("_id");

                // Add these students to the target set
                collegeStudents.forEach(s => targetStudentIds.add(s._id.toString()));

            } else {
                console.error(`[EventCreate] Mother Organization: Could not find College ID for organization ${org.org_name}. Sending to nobody in the college.`);
            }

        } else {
            // Unit/FAESO Logic: Department Members (If they have a department)

            // A. Department Members
            if (org.department_id) {
                const deptStudents = await Student.find({ department_id: org.department_id }).select("_id");
                deptStudents.forEach(s => targetStudentIds.add(s._id.toString()));
            }
        }

        // B. Followers (APPLIED TO ALL ORG TYPES, including Mother Org)
        const followers = await FollowedOrgs.find({ organization_id: event.organization_id }).select("user_id");
        const followerStudentIds = followers.map(f => f.user_id);

        if (followerStudentIds.length > 0) {
            followerStudentIds.forEach(id => targetStudentIds.add(id.toString()));
        }
        // *** END OF CORE LOGIC CHANGE ***

        let title, message;
        // ... (Rest of the function is unchanged)

        const notifications = Array.from(targetStudentIds).map(studentId => ({
            // ... (Notification creation)
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }
        // ... (Mark as sent logic)
    } catch (error) {
        // ...
    }
};

// NEW: Send conclusion notification to attendees urging them to submit feedback
const sendConclusionNotification = async (event) => {
    try {

        // Get all students who attended this event
        const attendanceLogs = await AttendanceLog.find({
            event_id: event._id
        }).select('student_id').lean();

        if (attendanceLogs.length === 0) {
            await Event.findByIdAndUpdate(event._id, {
                'remindersSent.conclusion': true
            });
            return;
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

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        // Mark as sent
        await Event.findByIdAndUpdate(event._id, {
            'remindersSent.conclusion': true
        });

    } catch (error) {
        console.error(`[Scheduler] Error sending conclusion notification:`, error);
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

            // 3. NEW: Conclusion Notification (Look for recently concluded events)
            const concludedEvents = await Event.find({
                status: 'Concluded',
                'remindersSent.conclusion': false,
                end_time: { $lte: now }
            });

            for (const event of concludedEvents) {
                await sendConclusionNotification(event);
            }

        } catch (error) {
            console.error('[Scheduler] Error checking events:', error);
        }
    });
};

module.exports = initScheduler;

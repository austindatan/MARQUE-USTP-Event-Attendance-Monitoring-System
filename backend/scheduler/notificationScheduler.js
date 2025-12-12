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
        const org = await Organization.findById(event.organization_id)
            .populate({
                path: "department_id",
                select: "college_id",
                populate: { path: "college_id", select: "_id" }
            });

        if (!org) return;

        let targetStudentIds = new Set();
        const orgCollegeId = org.department_id?.college_id?._id;

        if (org.org_type === "Mother Organization") {
            if (orgCollegeId) {
                const collegeDepartments = await Department.find({ college_id: orgCollegeId }).select("_id");
                const departmentIds = collegeDepartments.map(d => d._id);

                const collegeStudents = await Student.find({ department_id: { $in: departmentIds } }).select("_id");

                collegeStudents.forEach(s => targetStudentIds.add(s._id.toString()));

            } else {
                console.error(`[EventCreate] Mother Organization: Could not find College ID for organization ${org.org_name}. Sending to nobody in the college.`);
            }

        } else {
            if (org.department_id) {
                const deptStudents = await Student.find({ department_id: org.department_id }).select("_id");
                deptStudents.forEach(s => targetStudentIds.add(s._id.toString()));
            }
        }

        const followers = await FollowedOrgs.find({ organization_id: event.organization_id }).select("user_id");
        const followerStudentIds = followers.map(f => f.user_id);

        if (followerStudentIds.length > 0) {
            followerStudentIds.forEach(id => targetStudentIds.add(id.toString()));
        }

        let title, message;

        const notifications = Array.from(targetStudentIds).map(studentId => ({
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }
    } catch (error) {
        // ...
    }
};

const sendConclusionNotification = async (event) => {
    try {
        const attendanceLogs = await AttendanceLog.find({
            event_id: event._id
        }).select('user_id').lean();

        if (attendanceLogs.length === 0) {
            await Event.findByIdAndUpdate(event._id, {
                'remindersSent.conclusion': true
            });
            return;
        }

        const userIds = attendanceLogs.map(log => log.user_id);
        const students = await Student.find({ users_id: { $in: userIds } }).select('_id');
        const studentIds = students.map(s => s._id);

        if (studentIds.length === 0) {
            await Event.findByIdAndUpdate(event._id, {
                'remindersSent.conclusion': true
            });
            return;
        }

        const org = await Organization.findById(event.organization_id);
        if (!org) {
            console.error('[Scheduler] Organization not found for event:', event._id);
            return;
        }

        await Notification.deleteMany({
            event_id: event._id,
            type: 'event',
            title: {
                $not: {
                    $regex: /attendance|confirmed|registered/i
                }
            }
        });
        console.log(`[Scheduler] Deleted old event announcement notifications for event: ${event.event_name}`);

        const title = `Event Concluded - We Need Your Feedback!`;
        const message = `Thank you for attending "${event.event_name}"! 📝 Your feedback matters! Please take a moment to answer our feedback survey and help us improve future events. Tap here to share your thoughts.`;

        const notifications = studentIds.map(studentId => ({
            user_id: studentId,
            organization_id: event.organization_id,
            event_id: event._id,
            type: 'event',
            title: title,
            message: message,
            status: 'info',
            is_read: false
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
            console.log(`[Scheduler] Sent ${notifications.length} conclusion notifications for event: ${event.event_name}`);
        }

        await Event.findByIdAndUpdate(event._id, {
            'remindersSent.conclusion': true
        });

    } catch (error) {
        console.error(`[Scheduler] Error sending conclusion notification:`, error);
    }
};

const initScheduler = () => {
    console.log('[Scheduler] Initializing Notification Scheduler...');

    cron.schedule('*/30 * * * * *', async () => {

        const now = new Date();

        try {
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

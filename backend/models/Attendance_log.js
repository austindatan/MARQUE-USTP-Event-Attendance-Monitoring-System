const mongoose = require('mongoose');

const AttendanceLogSchema = new mongoose.Schema(
    {
        event_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true },
        time_in: {type: Date},
        time_out: {type: Date},
    },
);

const AttendanceLog = mongoose.model('Attendance_log', AttendanceLogSchema); 

module.exports = AttendanceLog;
const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
    {
        event_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
        },
        // 🔑 ADDED: Link to the user who submitted the feedback
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Assuming your User model is named 'User'
            required: true,
        },
        // 🔑 CHANGED: Now an object to hold all four specific ratings
        ratings: { 
            overall_experience: {
                type: Number,
                required: true,
                min: 1,
                max: 5,
            },
            venue_facilities: {
                type: Number,
                required: true,
                min: 1,
                max: 5,
            },
            speakers_program: {
                type: Number,
                required: true,
                min: 1,
                max: 5,
            },
            event_organization: {
                type: Number,
                required: true,
                min: 1,
                max: 5,
            },
        },
        // 🔑 CHANGED: Renamed from 'thoughts' to 'comment' to match the frontend
        comment: {
            type: String,
            trim: true,
            default: '',
        },
    }, 
    { timestamps: true }
); 

// 🔑 CRITICAL: Prevents a user from submitting feedback more than once per event
FeedbackSchema.index({ event_id: 1, user_id: 1 }, { unique: true });

const Feedback = mongoose.model('Feedback', FeedbackSchema); 

module.exports = Feedback;
const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
    {
        event_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
        },
        stars: { type: Number, min: 1, max: 5},
        thoughts: { type: String },
    },
);

const Feedback = mongoose.model('Feedback', FeedbackSchema); 

module.exports = Feedback;
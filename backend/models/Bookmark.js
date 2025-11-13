const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
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
        }
    },
);

const Bookmark = mongoose.model('Bookmark', bookmarkSchema); 

module.exports = Bookmark;
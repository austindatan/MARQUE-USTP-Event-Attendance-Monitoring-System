const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
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

const Notification = mongoose.model.model('Notification', notificationSchema); 

module.exports = Notification;
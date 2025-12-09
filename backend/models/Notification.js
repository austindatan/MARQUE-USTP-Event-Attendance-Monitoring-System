const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // ENUM: allowed notification categories
        type: {
            type: String,
            enum: ["invite", "event", "role_change", "announcement"],
            required: true,
        },

        title: {
            type: String,
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        // The "sender"
        // This is the organization that created the notification
        organization_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },

        is_read: {
            type: Boolean,
            default: false,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);

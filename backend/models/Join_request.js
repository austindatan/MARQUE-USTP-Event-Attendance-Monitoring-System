const mongoose = require('mongoose');

const JoinRequestSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        organization_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
        },
        status: {type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    },
);

const JoinRequest = mongoose.model('Join_request', JoinRequestSchema);

module.exports = JoinRequest;
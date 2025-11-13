const mongoose = require('mongoose');

const FollowedOrgsSchema = new mongoose.Schema(
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
    },
);

const FollowedOrgs = mongoose.model('Followed_org', FollowedOrgsSchema);

module.exports = FollowedOrgs;
const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema(
    {
        department_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: true,
        },
        org_name: { type: String, required: true },
        org_type: { type: String, enum: ["Department Organization", "Mother Organization", "FAESO Organization"], required: true },
        description: { type: String, required: true },
        pfp: { type: String }, // profile picture URL or file path
        cover_photo: { type: String }, // cover photo URL or file path
        fb_link: { type: String },
        ig_link: { type: String },
        x_link: { type: String },
        moderator_name: { type: String, required: true }, // array of moderator names
    },
);

const Organization = mongoose.model('Organization', OrganizationSchema);

module.exports = Organization;
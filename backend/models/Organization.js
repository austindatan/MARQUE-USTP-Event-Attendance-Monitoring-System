const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema(
    {
        department_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: true,
        },
        org_name: { type: String, required: true },
        org_type: { type: String, enum: ["Unit Organization", "Mother Organization", "FAESO Organization"], required: true },
        description: { type: String, required: true },
        pfp: { type: String },
        cover_photo: { type: String }, 
        fb_link: { type: String },
        ig_link: { type: String },
        x_link: { type: String },
        moderator_name: { type: String, required: true }, 
    },
);

const Organization = mongoose.model('Organization', OrganizationSchema);

module.exports = Organization;
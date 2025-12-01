// models/Org_officer.js

const mongoose = require('mongoose');

const OrgOfficerSchema = new mongoose.Schema({
    // The student who is a member/officer
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student', 
        required: true,
    },
    // The organization the student is associated with
    org_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization', 
        required: true,
    },
    // Role of the student in the organization
    role: { 
        type: String, 
        enum: ['Member', 'Officer', 'President'], 
        default: 'Member' 
    },
    date_joined: { type: Date, default: Date.now },
});

// Ensure a student can only be linked to an organization once
OrgOfficerSchema.index({ student_id: 1, org_id: 1 }, { unique: true });

const OrgOfficer = mongoose.model('Org_officer', OrgOfficerSchema);
module.exports = OrgOfficer;
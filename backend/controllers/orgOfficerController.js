// controllers/orgOfficerController.js

const OrgOfficer = require('../models/Org_officer');
const Organization = require('../models/Organization');
const mongoose = require('mongoose');

// GET all organizations a student is a member of
exports.getJoinedOrganizations = async (req, res) => {
    try {
        const { studentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: "Invalid student ID" });
        }

        // 1. Find all Org_officer entries for the given studentId
        const officerLinks = await OrgOfficer.find({ student_id: studentId })
            .select('org_id') 
            .lean(); 

        // 2. Extract the list of organization IDs
        const orgIds = officerLinks.map(link => link.org_id);

        if (orgIds.length === 0) {
            return res.status(200).json([]); 
        }

        // 3. Fetch the full organization details for those IDs
        const organizations = await Organization.find({ _id: { $in: orgIds } });

        res.status(200).json(organizations);
    } catch (error) {
        console.error("Error fetching joined organizations:", error);
        res.status(500).json({ message: "Server error fetching joined organizations" });
    }
};

// Get organizations that the student has NOT joined yet
exports.getAvailableOrganizations = async (req, res) => {
    try {
        const { studentId } = req.params;

        if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: "Invalid student ID" });
        }

        // 1. Find orgs the student has already joined
        const joinedLinks = await OrgOfficer.find({ student_id: studentId }).select('org_id').lean();
        const joinedOrgIds = joinedLinks.map(link => link.org_id);

        // 2. Fetch organizations NOT in joinedOrgIds
        const availableOrgs = await Organization.find({ 
            _id: { $nin: joinedOrgIds } 
        });

        res.status(200).json(availableOrgs);

    } catch (error) {
        console.error("Error fetching available organizations:", error);
        res.status(500).json({ message: "Server error fetching available organizations" });
    }
};



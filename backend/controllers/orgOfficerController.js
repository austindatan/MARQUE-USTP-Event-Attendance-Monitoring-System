const OrgOfficer = require('../models/Org_officer');
const Organization = require('../models/Organization');
const mongoose = require('mongoose');

// GET all organizations a student is a member of along with their role
exports.getJoinedOrganizations = async (req, res) => {
    try {
        const { studentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: "Invalid student ID" });
        }

        // Find all Org_officer entries for the given studentId
        const officerLinks = await OrgOfficer.find({ student_id: studentId })
            .populate('org_id') // populate organization details
            .lean();

        if (officerLinks.length === 0) {
            return res.status(200).json([]); 
        }

        // Map to include organization + role
        const organizationsWithRole = officerLinks.map(link => ({
            _id: link.org_id._id,
            name: link.org_id.name,         // assuming Organization has 'name'
            description: link.org_id.description || "",
            role: link.role,                // include role for frontend checks
            date_joined: link.date_joined,
        }));

        res.status(200).json(organizationsWithRole);
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

        const joinedLinks = await OrgOfficer.find({ student_id: studentId }).select('org_id').lean();
        const joinedOrgIds = joinedLinks.map(link => link.org_id);

        const availableOrgs = await Organization.find({ 
            _id: { $nin: joinedOrgIds } 
        });

        res.status(200).json(availableOrgs);

    } catch (error) {
        console.error("Error fetching available organizations:", error);
        res.status(500).json({ message: "Server error fetching available organizations" });
    }
};

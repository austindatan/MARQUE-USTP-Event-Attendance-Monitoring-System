const OrgOfficer = require('../models/Org_officer');
const Organization = require('../models/Organization');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// GET all organizations a student is a member of along with their role
exports.getJoinedOrganizations = async (req, res) => {
    try {
        const { studentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: "Invalid student ID" });
        }

        const officerLinks = await OrgOfficer.find({ student_id: studentId })
            .populate('org_id') 
            .lean();

        if (officerLinks.length === 0) {
            return res.status(200).json([]);
        }

        const organizations = officerLinks.map(link => ({
            _id: link.org_id._id,
            org_name: link.org_id.org_name,             // ✔ renamed for frontend
            description: link.org_id.description || "",
            pfp: link.org_id.pfp || null,           // ✔ include pfp
            role: link.role,
            date_joined: link.date_joined,
        }));

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

// --- SEND INVITE (organization_id must be provided) ---
exports.sendInvite = async (req, res) => {
    const { sender_student_number, target_student_id, role, organization_id } = req.body;
    console.log("sendInvite called:", { sender_student_number, target_student_id, role, organization_id });

    if (!role) {
        console.error("No role selected for invite");
        return res.status(400).json({ message: "Select a role before inviting" });
    }

    if (!organization_id || !mongoose.Types.ObjectId.isValid(organization_id)) {
        console.error("Invalid or missing organization_id");
        return res.status(400).json({ message: "Valid organization_id is required" });
    }

    try {
        // 1. LOOKUP sender student _id
        const senderStudent = await Student.findOne({ student_number: sender_student_number }).select('_id').lean();
        if (!senderStudent) {
            console.error("Sender student not found for number:", sender_student_number);
            return res.status(404).json({ message: "Sender student record not found." });
        }
        const sender_student_id = senderStudent._id;

        // 2. VERIFY sender is officer of the organization
        const senderOfficer = await OrgOfficer.findOne({ student_id: sender_student_id, org_id: organization_id });
        if (!senderOfficer) {
            return res.status(403).json({ message: "You are not authorized to invite for this organization." });
        }

        // 3. Prevent duplicate invite
        const existingInvite = await Notification.findOne({
            user_id: target_student_id,
            organization_id: organization_id,
            type: "invite",
        });

        if (existingInvite) {
            return res.status(409).json({ message: `Student already has a pending invitation as ${existingInvite.role}.`, role: existingInvite.role });
        }

        // 4. Create notification
        const notification = await Notification.create({
            user_id: target_student_id,
            organization_id: organization_id,
            type: "invite",
            title: "Organization Invite",
            message: `You have been invited to join the organization as ${role}`,
            role: role,
            status: "pending"
        });

        console.log("Invite notification created:", notification);
        res.status(201).json({ message: "Invite sent successfully", notification });

    } catch (err) {
        console.error("Failed to send invite:", err);
        res.status(500).json({ message: "Server error sending invite", error: err.message });
    }
};

// --- NEW: GET Current Outstanding Invites (from the sender's organization) ---
exports.getOutstandingInvites = async (req, res) => {
    try {
        const { orgId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orgId)) {
            return res.status(400).json({ message: "Invalid Organization ID" });
        }

        // Find all outstanding invitations from this specific organization
        const invites = await Notification.find({
            organization_id: orgId,
            type: "invite",
            // Add any other filter needed to ensure it's "pending" (e.g., is_resolved: false)
        }).select('user_id role');

        // Map the results to a simpler object { student_id: role } for fast lookup on the client
        const inviteMap = invites.reduce((acc, invite) => {
            // Note: user_id is the recipient student's _id
            acc[invite.user_id.toString()] = invite.role;
            return acc;
        }, {});

        res.status(200).json(inviteMap);

    } catch (error) {
        console.error("Error fetching outstanding invites:", error);
        res.status(500).json({ message: "Server error fetching outstanding invites" });
    }
};

// --- ACCEPT INVITE ---
exports.acceptInvite = async (req, res) => {
    const { notification_id, student_id } = req.body;
    console.log("acceptInvite called:", { notification_id, student_id });

    try {
        const notif = await Notification.findById(notification_id);
        if (!notif) {
            console.error("Notification not found:", notification_id);
            return res.status(404).json({ message: "Notification not found" });
        }

        const existingOfficer = await OrgOfficer.findOne({ student_id, org_id: notif.organization_id });
        if (existingOfficer) {
            console.error("Student already in organization:", student_id);
            return res.status(400).json({ message: "Already a member of the organization" });
        }

        const newOfficer = await OrgOfficer.create({
            student_id,
            org_id: notif.organization_id,
            role: notif.role || "Committee",
        });
        console.log("New officer added:", newOfficer);

        notif.is_read = true;
        await notif.save();

        res.status(201).json({ message: "Invite accepted, added to organization", officer: newOfficer });
    } catch (err) {
        console.error("Error accepting invite:", err);
        res.status(500).json({ message: "Server error accepting invite", error: err.message });
    }
};

// --- CANCEL INVITE ---
exports.cancelInvite = async (req, res) => {
    const { target_student_id, orgId } = req.body;

    if (!target_student_id || !orgId) {
        return res.status(400).json({ message: "target_student_id and orgId are required" });
    }

    try {
        const invite = await Notification.findOneAndDelete({
            user_id: target_student_id,
            organization_id: orgId,
            type: "invite"
        });

        if (!invite) {
            return res.status(404).json({ message: "No pending invite found to cancel" });
        }

        res.status(200).json({ message: "Invite cancelled successfully" });
    } catch (err) {
        console.error("Error cancelling invite:", err);
        res.status(500).json({ message: "Server error cancelling invite", error: err.message });
    }
};

// --- CHANGE ROLE ---
exports.changeRole = async (req, res) => {
    const { student_id, new_role } = req.body;
    console.log("changeRole called:", { student_id, new_role });

    if (!new_role) {
        console.error("No role selected");
        return res.status(400).json({ message: "Select a role first" });
    }

    try {
        const officer = await OrgOfficer.findOneAndUpdate(
            { student_id },
            { role: new_role },
            { new: true }
        );

        if (!officer) {
            console.error("Student not found in organization:", student_id);
            return res.status(404).json({ message: "Student not found in organization" });
        }

        const notification = await Notification.create({
            user_id: student_id,
            organization_id: officer.org_id,
            type: "role_change",
            title: "Role Updated",
            message: `Your role has been updated to ${new_role} in the organization`,
        });

        console.log("Role change notification created:", notification);
        res.status(200).json({ message: "Role updated successfully", notification, officer });
    } catch (err) {
        console.error("Error changing role:", err);
        res.status(500).json({ message: "Server error changing role", error: err.message });
    }
};

// --- REMOVE USER ---
exports.removeUser = async (req, res) => {
    const { student_id } = req.body;
    console.log("removeUser called:", student_id);

    try {
        const officer = await OrgOfficer.findOneAndDelete({ student_id });
        if (!officer) {
            console.error("Student not found in organization:", student_id);
            return res.status(404).json({ message: "Student not found in organization" });
        }

        // Look up student to get the correct User ObjectId for the notification
        const student = await Student.findById(student_id);
        let userIdForNotif = student_id; // fallback
        if (student && student.users_id) {
            userIdForNotif = student.users_id;
        }

        const notification = await Notification.create({
            user_id: userIdForNotif,
            organization_id: officer.org_id,
            type: "announcement",
            title: "Removed from Organization",
            message: `You have been removed from the organization`,
        });

        console.log("Removal notification created:", notification);
        res.status(200).json({ message: "User removed successfully", notification });
    } catch (err) {
        console.error("Error removing user:", err);
        res.status(500).json({ message: "Server error removing user", error: err.message });
    }
};
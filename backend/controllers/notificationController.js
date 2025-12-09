const Notification = require("../models/Notification");
const OrgOfficer = require("../models/Org_officer");
const mongoose = require("mongoose");

// Send an invite to join an organization
exports.sendInvite = async (req, res) => {
  const { target_user_id, sender_student_id, role } = req.body;

  if (!role) {
    return res.status(400).json({ message: "Role must be selected before sending invite" });
  }

  try {
    // Find the organization of the sender
    const senderLink = await OrgOfficer.findOne({ student_id: sender_student_id });
    if (!senderLink) return res.status(400).json({ message: "Sender not linked to an organization" });

    // Create a notification for the invite
    const notification = await Notification.create({
      user_id: target_user_id,
      organization_id: senderLink.org_id,
      type: "invite",
      title: "Organization Invite",
      message: `You have been invited as ${role} to join this organization`,
      role, // store role in notification for reference
    });

    res.status(201).json({ message: "Invite sent", notification });
  } catch (err) {
    console.error("Failed to send invite:", err);
    res.status(500).json({ message: "Failed to send invite" });
  }
};

// Accept an invite
exports.acceptInvite = async (req, res) => {
  const { notification_id, user_id } = req.body;

  try {
    const notif = await Notification.findById(notification_id);
    if (!notif || notif.type !== "invite") return res.status(404).json({ message: "Invite not found" });

    // Add user to OrgOfficer
    await OrgOfficer.create({
      student_id: user_id,
      org_id: notif.organization_id,
      role: notif.role, // role stored in notification
    });

    // Mark notification as read
    notif.is_read = true;
    await notif.save();

    res.status(200).json({ message: "Invite accepted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to accept invite" });
  }
};

// Decline an invite
exports.declineInvite = async (req, res) => {
  const { notification_id } = req.body;

  try {
    const notif = await Notification.findById(notification_id);
    if (!notif || notif.type !== "invite") return res.status(404).json({ message: "Invite not found" });

    notif.is_read = true;
    await notif.save();

    res.status(200).json({ message: "Invite declined" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to decline invite" });
  }
};

// Change role of a user
exports.changeRole = async (req, res) => {
  const { student_id, new_role } = req.body;
  if (!new_role) return res.status(400).json({ message: "No role selected" });

  try {
    const officer = await OrgOfficer.findOne({ student_id });
    if (!officer) return res.status(404).json({ message: "User not found in organization" });

    officer.role = new_role;
    await officer.save();

    // Notify user about role change
    await Notification.create({
      user_id: student_id,
      organization_id: officer.org_id,
      type: "role_change",
      title: "Role Updated",
      message: `Your role has been updated to ${new_role}`,
    });

    res.status(200).json({ message: "Role updated", officer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update role" });
  }
};

// Remove a user from the organization
exports.removeUser = async (req, res) => {
  const { student_id } = req.body;

  try {
    const officer = await OrgOfficer.findOneAndDelete({ student_id });
    if (!officer) return res.status(404).json({ message: "User not found in organization" });

    // Notify the removed user
    await Notification.create({
      user_id: student_id,
      organization_id: officer.org_id,
      type: "role_change",
      title: "Removed from Organization",
      message: "You have been removed from this organization",
    });

    res.status(200).json({ message: "User removed from organization" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove user" });
  }
};

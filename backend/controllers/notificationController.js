const Notification = require("../models/Notification");
const OrgOfficer = require("../models/Org_officer");
const Student = require("../models/Student");
const mongoose = require("mongoose");

exports.sendInvite = async (req, res) => {
  const { target_user_id, sender_student_id, role } = req.body;

  if (!role) {
    return res.status(400).json({ message: "Role must be selected before sending invite" });
  }

  try {
    const senderLink = await OrgOfficer.findOne({ student_id: sender_student_id });
    if (!senderLink) return res.status(400).json({ message: "Sender not linked to an organization" });

    const notification = await Notification.create({
      user_id: target_user_id,
      organization_id: senderLink.org_id,
      type: "invite",
      title: "Organization Invite",
      message: `You have been invited as ${role} to join this organization`,
      role,
      status: "pending"
    });

    res.status(201).json({ message: "Invite sent", notification });
  } catch (err) {
    console.error("Failed to send invite:", err);
    res.status(500).json({ message: "Failed to send invite" });
  }
};

exports.acceptInvite = async (req, res) => {
  const { notification_id, user_id } = req.body;

  try {
    const notif = await Notification.findById(notification_id);
    if (!notif || notif.type !== "invite") return res.status(404).json({ message: "Invite not found" });

    const student = await Student.findOne({ student_number: user_id });
    if (!student) {
      return res.status(404).json({ message: "Student record not found." });
    }

    // Add user to OrgOfficer using the correct Student ObjectId
    await OrgOfficer.create({
      student_id: student._id,
      org_id: notif.organization_id,
      role: notif.role, // role stored in notification
    });

    // Update notification status
    notif.status = "accepted";

    // Mark notification as read
    notif.is_read = true;
    await notif.save();

    res.status(200).json({ message: "Invite accepted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to accept invite" });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { studentId: studentNumber } = req.params;
    console.log(`[NOTIF CONTROLLER] Received studentNumber: ${studentNumber}`);

    // ⭐️ NEW LOG: Confirms we are about to hit the database ⭐️
    console.log("[NOTIF CONTROLLER] Attempting Student.findOne query...");

    // 1. Look up the Student document using the student_number string
    const student = await Student.findOne({ student_number: studentNumber });

    // ⭐️ LOG 3: This line will only appear if the query succeeded ⭐️
    if (!student) {
      console.error(`[NOTIF CONTROLLER] Student not found for number: ${studentNumber}`);
      return res.status(404).json({ message: "Student record not found for this Student Number." });
    }

    console.log(`[NOTIF CONTROLLER] Found Student ObjectId: ${student._id}`);

    // 2. Query notifications using the Student's MongoDB ObjectId
    const notifications = await Notification.find({ user_id: student._id })
      .populate("organization_id", "org_name pfp")
      .populate("event_id", "event_name event_image event_date start_time end_time")
      .sort({ createdAt: -1 });

    console.log(`[NOTIF CONTROLLER] Notifications fetched: ${notifications.length}`);
    res.status(200).json(notifications);

  } catch (error) {
    console.error("Error fetching notifications:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to fetch notifications due to server error." });
    }
  }
};

exports.declineInvite = async (req, res) => {
  const { notification_id } = req.body;

  try {
    const notif = await Notification.findById(notification_id);

    if (!notif || notif.type !== "invite") return res.status(404).json({ message: "Invite not found" });
    if (notif.status !== "pending" && notif.status !== "info") return res.status(400).json({ message: `Invite already ${notif.status}` });

    notif.status = "rejected";
    notif.is_read = true;
    await notif.save();

    res.status(200).json({ message: "Invite declined" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to decline invite" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      { is_read: true },
      { new: true }
    );

    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    res.status(200).json({ message: "Notification marked as read." });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to update notification status." });
  }
};
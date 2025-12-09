const express = require("express");
const router = express.Router();
const { sendInvite } = require("../controllers/notificationController");

// POST /api/notifications/invite
router.post("/invite", sendInvite);

module.exports = router;

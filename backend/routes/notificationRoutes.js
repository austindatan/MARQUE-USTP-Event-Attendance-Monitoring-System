// routes/notificationRoutes.js (Updated)

const express = require("express");
const router = express.Router();
const { 
    sendInvite,
    getNotifications, 
    markAsRead, 
    acceptInvite, 
    declineInvite, 
} = require("../controllers/notificationController");

// --- CREATION ---
router.post("/invite", sendInvite);

// --- FETCHING ---
// ⭐️ CHANGE: Route parameter updated to expect the student's MongoDB ObjectId
router.get("/:studentId", getNotifications);

// --- ACTIONS ---
router.post("/accept", acceptInvite);
router.post("/decline", declineInvite);
router.patch("/read/:id", markAsRead);

module.exports = router;
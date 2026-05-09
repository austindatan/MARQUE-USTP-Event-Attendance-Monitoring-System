const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
    sendInvite,
    getNotifications,
    markAsRead,
    acceptInvite,
    declineInvite,
    deleteReadNotifications
} = require("../controllers/notificationController");

router.post("/invite", authMiddleware, sendInvite);
router.get("/:studentId", getNotifications);
router.post("/accept", authMiddleware, acceptInvite);
router.post("/decline", authMiddleware, declineInvite);
router.patch("/read/:id", authMiddleware, markAsRead);

router.delete("/read/:studentId", authMiddleware, deleteReadNotifications);

module.exports = router;
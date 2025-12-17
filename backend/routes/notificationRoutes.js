const express = require("express");
const router = express.Router();
const {
    sendInvite,
    getNotifications,
    markAsRead,
    acceptInvite,
    declineInvite,
    deleteReadNotifications
} = require("../controllers/notificationController");

router.post("/invite", sendInvite);
router.get("/:studentId", getNotifications);
router.post("/accept", acceptInvite);
router.post("/decline", declineInvite);
router.patch("/read/:id", markAsRead);

router.delete("/read/:studentId", deleteReadNotifications);

module.exports = router;
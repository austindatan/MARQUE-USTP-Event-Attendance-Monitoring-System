const express = require("express");
const router = express.Router();
const controller = require("../controllers/bookmarkController");

// Get all bookmarks of a student (e.g., GET /api/bookmarks/12345)
router.get("/:student_number", controller.getBookmarks);

// Add a bookmark (e.g., POST /api/bookmarks/12345 with event_id in body)
router.post("/:student_number", controller.addBookmark);

// Remove a bookmark (e.g., DELETE /api/bookmarks/12345/67890)
router.delete("/:student_number/:event_id", controller.removeBookmark);

// Check if event is bookmarked (e.g., GET /api/bookmarks/check/12345/67890)
router.get("/check/:student_number/:event_id", controller.checkBookmark);


module.exports = router;
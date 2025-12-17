const express = require("express");
const router = express.Router();
const controller = require("../controllers/bookmarkController");

// Get all bookmarks of a student 
router.get("/:student_number", controller.getBookmarks);

// Add a bookmark
router.post("/:student_number", controller.addBookmark);

// Remove a bookmark 
router.delete("/:student_number/:event_id", controller.removeBookmark);

// Check if event is bookmarked 
router.get("/check/:student_number/:event_id", controller.checkBookmark);


module.exports = router;
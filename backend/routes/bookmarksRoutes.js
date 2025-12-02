const express = require("express");
const router = express.Router();
const {
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  checkBookmark,
} = require("../controllers/bookmarksController");

router.post("/add", addBookmark);
router.delete("/:userId/:eventId", removeBookmark);
router.get("/user/:userId", getUserBookmarks);
router.get("/check/:userId/:eventId", checkBookmark);

module.exports = router;

const Bookmark = require("../models/Bookmark");
const Event = require("../models/Event");
const User = require("../models/User");

// ===========================
// ADD BOOKMARK
// ===========================
const addBookmark = async (req, res) => {
  try {
    const { event_id, user_id } = req.body;

    // Validate event
    const event = await Event.findById(event_id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Validate user
    const user = await User.findById(user_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if already bookmarked
    const existing = await Bookmark.findOne({ event_id, user_id });
    if (existing)
      return res.status(400).json({ message: "Already bookmarked" });

    const bookmark = new Bookmark({ event_id, user_id });
    await bookmark.save();

    return res.status(201).json({
      message: "Event bookmarked successfully",
      bookmark,
    });
  } catch (err) {
    console.error("ADD BOOKMARK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===========================
// REMOVE BOOKMARK
// ===========================
const removeBookmark = async (req, res) => {
  try {
    const { eventId, userId } = req.params;

    const deleted = await Bookmark.findOneAndDelete({
      event_id: eventId,
      user_id: userId,
    });

    if (!deleted)
      return res.status(404).json({ message: "Bookmark not found" });

    res.json({ message: "Bookmark removed successfully" });
  } catch (err) {
    console.error("REMOVE BOOKMARK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===========================
// GET USER'S BOOKMARKS
// ===========================
const getUserBookmarks = async (req, res) => {
  try {
    const { userId } = req.params;

    const bookmarks = await Bookmark.find({ user_id: userId })
      .populate("event_id") // return event details
      .sort({ createdAt: -1 });

    res.json({ bookmarks });
  } catch (err) {
    console.error("GET BOOKMARKS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===========================
// CHECK IF EVENT IS BOOKMARKED
// ===========================
const checkBookmark = async (req, res) => {
  try {
    const { userId, eventId } = req.params;

    const bookmark = await Bookmark.findOne({
      user_id: userId,
      event_id: eventId,
    });

    res.json({ isBookmarked: !!bookmark });
  } catch (err) {
    console.error("CHECK BOOKMARK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  checkBookmark,
};

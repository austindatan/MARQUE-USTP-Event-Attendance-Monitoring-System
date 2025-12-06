const Bookmark = require("../models/Bookmark");
const Event = require("../models/Event");
const Student = require("../models/Student");
const mongoose = require('mongoose'); 

// ===========================
// GET BOOKMARKS (Fixed)
// ===========================
exports.getBookmarks = async (req, res) => {
  try {
    const student_number = req.params.student_number;

    // Find student → get user_id
    const student = await Student.findOne({ student_number }).populate("users_id");
    if (!student) return res.status(404).json({ message: "Student not found" });

    const user_id = student.users_id._id;

    const bookmarks = await Bookmark.find({ user_id })
      .populate({
        path: "event_id",
        // Ensure Organization ID is populated for the card details
        select: "event_name event_date event_image event_images organization_id", 
        populate: {
            path: 'organization_id',
            // ⭐️ FIX: Select 'org_name' for the name and 'pfp' for the logo
            select: 'org_name pfp' 
        }
      })
      .sort({ createdAt: -1 }); // Added sorting from the second controller

    // Optional: Filter out bookmarks where event_id is null (deleted events)
    const validBookmarks = bookmarks.filter(b => b.event_id !== null);

    res.json(validBookmarks);
  } catch (err) {
    console.error("Error fetching bookmarks:", err.message, err.stack);
    res.status(500).json({ message: "Server error" });
  }
};

// ===========================
// ADD BOOKMARK
// (Used by client when adding a bookmark via student_number)
// ===========================
exports.addBookmark = async (req, res) => {
  try {
    const { event_id } = req.body;
    const student_number = req.params.student_number;

    const student = await Student.findOne({ student_number }).populate("users_id");
    if (!student) return res.status(404).json({ message: "Student not found" });

    const user_id = student.users_id._id;

    // Check if already bookmarked
    const exists = await Bookmark.findOne({ user_id, event_id });
    if (exists) return res.status(400).json({ message: "Event already bookmarked" });

    const bookmark = new Bookmark({ user_id, event_id });
    await bookmark.save();

    res.status(201).json({ message: "Bookmark added", bookmark }); // Use 201 Created status
  } catch (err) {
    console.error("Error adding bookmark:", err.message, err.stack);
    res.status(500).json({ message: "Server error" });
  }
};

// ===========================
// REMOVE BOOKMARK
// (Used by Bookmark_Page.tsx)
// ===========================
exports.removeBookmark = async (req, res) => {
  try {
    const student_number = req.params.student_number;
    const { event_id } = req.params;

    const student = await Student.findOne({ student_number }).populate("users_id");
    if (!student) return res.status(404).json({ message: "Student not found" });

    const user_id = student.users_id._id;

    const deleted = await Bookmark.findOneAndDelete({ 
        user_id: user_id, 
        event_id: event_id 
    });

    if (!deleted) return res.status(404).json({ message: "Bookmark not found or already removed" });

    res.json({ message: "Bookmark removed successfully" });
  } catch (err) {
    console.error("❌ Fatal Error removing bookmark (500):", err.message, err.stack); 
    res.status(500).json({ message: "Server error. Check server logs." });
  }
};

// ===========================
// CHECK IF EVENT IS BOOKMARKED (New, useful function)
// This uses student_number like the rest of the controller
// ===========================
exports.checkBookmark = async (req, res) => {
    try {
        const student_number = req.params.student_number;
        const { event_id } = req.params;

        const student = await Student.findOne({ student_number }).populate("users_id");
        if (!student) return res.status(404).json({ message: "Student not found" });

        const user_id = student.users_id._id;

        const bookmark = await Bookmark.findOne({
            user_id: user_id,
            event_id: event_id,
        });

        res.json({ isBookmarked: !!bookmark });
    } catch (err) {
        console.error("CHECK BOOKMARK ERROR:", err.message, err.stack);
        res.status(500).json({ message: "Server error" });
    }
};
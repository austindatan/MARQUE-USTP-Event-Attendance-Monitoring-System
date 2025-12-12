const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/Student");
require("dotenv").config();

const router = express.Router();

// LOGIN
router.post("/login", async (req, res) => {
  const { student_number, password } = req.body;
  const loginId = student_number; // local variable

  try {
    let user = null;
    let student = null;

    // 1. Try to find the user via Student record (using student_number)
    student = await Student.findOne({ student_number: loginId }).populate("users_id"); //

    if (student) {
      user = student.users_id; //
    }

    // 2. If not found as a Student, try to find the user via Username (for Admins)
    if (!user) {
      user = await User.findOne({ username: loginId }); //
    }

    // Authentication Check

    if (!user) {
      return res.status(400).json({ message: "Invalid ID or password" }); //
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password); //
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid ID or password" }); //
    }

    // Successful Login

    const token = jwt.sign(
      { id: user._id, role: user.role }, //
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "1h" }
    );

    const { password: _, ...userData } = user._doc;

    // Determine the identifier to send back
    const loginIdentifier = student ? student.student_number : user.username; // Logic to handle Student or Admin

    res.json({
      message: "Login successful",
      token,
      user: userData,
      // CRITICAL FIX: The response key is now "student_number"
      student_number: loginIdentifier,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  return res.json({ message: "Logged out successfully" });
});

module.exports = router;
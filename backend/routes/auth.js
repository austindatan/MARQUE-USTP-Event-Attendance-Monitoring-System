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

  if (!student_number || !password || student_number.trim() === "" || password.trim() === "") {
    return res.status(400).json({ message: "Student number and password are required" });
  }

  const loginId = student_number; 

  try {
    let user = null;
    let student = null;

    // find the user via Student record
    student = await Student.findOne({ student_number: loginId }).populate("users_id"); //

    if (student) {
      user = student.users_id; //
    }

    // If not found as a Student (for Admins)
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
      { expiresIn: "12h" }
    );

    const { password: _, ...userData } = user._doc;

    // Determine the identifier to send back
    const loginIdentifier = student ? student.student_number : user.username; // Logic to handle Student or Admin

    res.json({
      message: "Login successful",
      token,
      user: userData,
      student_number: loginIdentifier,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/user-details/:identifier", async (req, res) => {
  const { identifier } = req.params;
  
  try {
    const user = await User.findOne({ username: identifier });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Return the fields
    res.json({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      profile_image: user.profile_image,
      role: user.role,
    });

  } catch (error) {
    console.error("Error fetching generic user data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  return res.json({ message: "Logged out successfully" });
});

module.exports = router;
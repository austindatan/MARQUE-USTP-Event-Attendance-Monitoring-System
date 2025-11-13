const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/Student");
require("dotenv").config();

const router = express.Router();

router.post("/login", async (req, res) => {
  const { student_number, password } = req.body;

  try {
    // find by student_number 
    const student = await Student.findOne({ student_number }).populate("users_id");
    if (!student || !student.users_id) {
      return res.status(400).json({ message: "Invalid Student ID or password" });
    }

    const user = student.users_id;

    // compare input password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Student ID or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "1h" }
    );

    const { password: _, ...userData } = user._doc;

    res.json({
      message: "Login successful",
      token,
      user: userData,
      student_number: student.student_number,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

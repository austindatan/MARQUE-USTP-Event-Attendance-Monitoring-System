const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Student = require("../models/Student");
const User = require("../models/User");
const Department = require("../models/Department");
const College = require("../models/College");

console.log("✅ student.js router loaded");

// Fetch student_number
router.get("/id/:student_number", async (req, res) => {
  const student_number = req.params.student_number;
  console.log("🔍 Route hit: /api/student/id/:student_number =", student_number);

  try {
    const student = await Student.findOne({ student_number })
      .populate({
        path: "department_id",
        select: "department_name department_code",
        populate: { path: "college_id", select: "college_name college_code" },
      })
      .populate("users_id", "firstname lastname email profile_image")
      .lean();

    if (!student) {
      console.log("Student record not found for number:", student_number);
      return res.status(404).json({ message: "Student record not found" });
    }

    // populate fields for response
    const user = student.users_id;
    const department = student.department_id;

    console.log("Found student by number:", student_number);

    res.json({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      student_number: student.student_number,
      department_name: department?.department_name || "",
      department_code: department?.department_code || "",
      college_name: department?.college_id?.college_name || "",
      profile_image: user.profile_image || "",
    });
  } catch (error) {
    console.error("Error fetching student data by student_number:", error);
    res.status(500).json({ message: "Error fetching student data", error: error.message });
  }
});

// Fetch username ---
router.get("/:username", async (req, res) => {
  const username = req.params.username;
  console.log("🚀 Route hit: /api/student/:username =", username);

  try {
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log("User not found for username:", username);
      return res.status(404).json({ message: "User not found" });
    }

    const student = await Student.findOne({ users_id: user._id })
      .populate({
        path: "department_id",
        select: "department_name department_code",
        populate: { path: "college_id", select: "college_name college_code" },
      })
      .populate("users_id", "firstname lastname email profile_image") 
      .lean();
      
    if (!student) {
      console.log("Student record not found for user ID:", user._id);
      return res.status(404).json({ message: "Student record not found" });
    }

    const department = student.department_id;

    console.log("Found student by username:", username);

    res.json({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      student_number: student.student_number,
      department_name: department?.department_name || "",
      department_code: department?.department_code || "",
      college_name: department?.college_id?.college_name || "",
      profile_image: user.profile_image || "",
    });
  } catch (error) {
    console.error("Error fetching student data by username:", error);
    res.status(500).json({ message: "Error fetching student data", error: error.message });
  }
});

module.exports = router;
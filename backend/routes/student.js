const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Student = require("../models/Student");
const User = require("../models/User");
const Department = require("../models/Department");
const College = require("../models/College");
const OrgOfficer = require("../models/Org_officer.js");

console.log("✅ student.js router loaded");

router.get("/all", async (req, res) => {
    // 'all' for standard students (no role), 'roles' for students with roles
    const { filter } = req.query; 
    console.log(`🔍 Route hit: /api/student/users/all with filter: ${filter}`);

    try {
      const safeImage = (img) =>
        typeof img === "string" && img.trim() !== "" 
            ? { uri: img } 
            : require("../../assets/images/marque/crk.jpg");

        // --- 1. Fetch ALL Org Officer records to identify students with roles ---
        const managers = await OrgOfficer.find({})
            .populate("org_id", "org_name pfp") // Get organization name and logo
            .lean();

        // Create a quick map from Student ID to Role data
        const studentIdToRole = managers.reduce((map, manager) => {
            map[manager.student_id.toString()] = {
                orgName: manager.org_id.org_name,
                orgLogo: manager.org_id.pfp,
                position: manager.role, // The 'role' field in Org_officer is the position
            };
            return map;
        }, {});

        // --- 2. Fetch ALL Student records and populate ALL linked data ---
        const students = await Student.find({})
            .populate("users_id", "firstname lastname email profile_image") // User Details
            .populate({
                path: "department_id",
                select: "department_name department_code",
                populate: { path: "college_id", select: "college_name college_code" }, // College Details
            })
            .lean();

        // --- 3. Process and Filter the combined data ---
        const detailedUsers = students
            .map(student => {
                const user = student.users_id;
                const department = student.department_id;
                const role = studentIdToRole[student._id.toString()];
                const hasRole = !!role;

                const baseUser = {
                    id: student._id, // Use Student ID for key and editing
                    studentId: student.student_number,
                    name: `${user?.firstname || ''} ${user?.lastname || ''}`,
                    email: user?.email || '',
                    studentImage: user?.profile_image || "",
                    
                    // Academic Info (Department & Course)
                    department: department?.college_id?.college_name || department?.department_name || "N/A", // Use College Name for department prop
                    course: department?.department_name || "N/A", // Use Department Name for course prop
                    
                    hasRole: hasRole,
                    orgName: null,
                    orgLogo: "",
                    position: null,
                };

                // Add role details if found
                if (hasRole) {
                    baseUser.orgName = role.orgName;
                    baseUser.orgLogo = role.orgLogo;
                    baseUser.position = role.position;
                }

                return baseUser;
            })
            .filter(user => {
                if (filter === 'roles') {
                    // Filter: Students w/ Roles
                    return user.hasRole;
                }
                if (filter === 'all') {
                    // Filter: Standard Students (no role)
                    return !user.hasRole;
                }
                return true; // Should not happen if frontend logic is sound, but returns all if no filter
            });

        console.log(`Successfully fetched ${detailedUsers.length} users for filter: ${filter}.`);
        res.json(detailedUsers);

    } catch (error) {
        console.error("❌ Error fetching all users for admin:", error);
        res.status(500).json({ message: "Error fetching user list", error: error.message });
    }
});

router.get("/id/:student_number", async (req, res) => {
  const student_number = req.params.student_number;
  console.log("🔍 Route hit: /api/student/id/:student_number =", student_number);

  try {
    const student = await Student.findOne({ student_number })
      .populate({
        path: "department_id",
        select: "_id department_name department_code",
        populate: { path: "college_id", select: "_id college_name college_code" },
      })
      .populate("users_id", "firstname lastname email profile_image")
      .lean();

    if (!student) {
      console.log("Student record not found for number:", student_number);
      return res.status(404).json({ message: "Student record not found" });
    }

    // populate fields for response
    const user = student.users_id;
    // Debug: log raw student and department
    console.log("Found student document (by number):", student);
    const department = student.department_id;
    console.log("Student.department_id (raw) (by number):", department);

    console.log("Found student by number:", student_number);


    res.json({
      _id: student._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      student_number: student.student_number,
      department_id: department?._id || student.department_id || null,
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
  console.log("🚀 /api/student/:username =", username);

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const student = await Student.findOne({ users_id: user._id })
      .populate({
        path: "department_id",
        select: "_id department_name department_code", 
        populate: {
          path: "college_id",
          select: "_id college_name college_code"
        }
      })
      .populate("users_id", "firstname lastname email profile_image")
      .lean();

    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    // student.department_id may be:
    //  • an object (POPULATED) → use ._id
    //  • a plain string ID (NOT POPULATED) → use directly
    const dept = student.department_id;

    const departmentId =
      dept && typeof dept === "object" && "_id" in dept
        ? dept._id
        : student.department_id;

    console.log("🔥 Final resolved departmentId:", departmentId);

    res.json({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      student_number: student.student_number,

      // *** FIXED: return REAL department ID ***
      department_id: departmentId,

      department_name: dept?.department_name || "",
      department_code: dept?.department_code || "",
      college_name: dept?.college_id?.college_name || "",
      profile_image: user.profile_image || ""
    });

  } catch (error) {
    console.error("❌ Error fetching student:", error);
    res.status(500).json({ message: "Error", error: error.message });
  }
});

module.exports = router;
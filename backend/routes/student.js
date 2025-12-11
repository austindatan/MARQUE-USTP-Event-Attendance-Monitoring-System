const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Student = require("../models/Student");
const User = require("../models/User");
const Department = require("../models/Department");
const College = require("../models/College");
const OrgOfficer = require("../models/Org_officer.js");
const Organization = require('../models/Organization'); // make sure this line exists

console.log("✅ student.js router loaded");

router.get("/all", async (req, res) => {
    // for students with roles
    const { filter } = req.query; 
    console.log(`🔍 Route hit: /api/student/users/all with filter: ${filter}`);

    try {
      const safeImage = (img) =>
        typeof img === "string" && img.trim() !== "" 
            ? { uri: img } 
            : require("../../assets/images/marque/crk.jpg");

        // Fetch ALL Org Officer records to identify students with roles
        const managers = await OrgOfficer.find({})
            .populate("org_id", "org_name pfp") 
            .lean();
        

        // Create a quick map from Student ID to Role data
        const studentIdToRole = managers.reduce((map, manager) => {
          const studentId = manager.student_id.toString();
            if (!map[studentId]) {
              map[studentId] = [];
            }

            map[studentId].push({
                orgName: manager.org_id.org_name,
                orgLogo: manager.org_id.pfp,
                position: manager.role, 
            });
            return map;
        }, {});

        // Fetch ALL Student records and populate ALL linked data
        const students = await Student.find({})
            .populate("users_id", "firstname lastname email profile_image") 
            .populate({
                path: "department_id",
                select: "department_name department_code",
                populate: { path: "college_id", select: "college_name college_code" }, 
            })
            .lean();

        // Process and Filter the combined data
        const detailedUsers = students
            .map(student => {
                const user = student.users_id;
                const department = student.department_id;
                const allRoles = studentIdToRole[student._id.toString()] || []; // Initialize to empty array if undefined
                const hasRole = allRoles.length > 0;

                const baseUser = {
                    id: student._id, 
                    studentId: student.student_number,
                    name: `${user?.firstname || ''} ${user?.lastname || ''}`,
                    email: user?.email || '',
                    studentImage: user?.profile_image || "",
                    
                    department: department?.college_id?.college_name || department?.department_name || "N/A",
                    course: department?.department_name || "N/A", 
                    
                    hasRole: hasRole,
                    allRoles: allRoles,
                    orgName: null,
                    orgLogo: "",
                    position: null,
                };

                

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
                return true; 
            });

        console.log(`Successfully fetched ${detailedUsers.length} users for filter: ${filter}.`);
        res.json(detailedUsers);

    } catch (error) {
        console.error("❌ Error fetching all users for admin:", error);
        res.status(500).json({ message: "Error fetching user list", error: error.message });
    }
});

router.get("/officers/all", async (req, res) => {
    const { filter, orgId } = req.query;

    console.log(`🔍 Route hit: /api/student/users/all`, { filter, orgId });

    try {
        if (!orgId) {
            return res.status(400).json({ message: "orgId is required." });
        }

        // Fetch Organization to determine filtering rules
        const Organization = mongoose.model('Organization'); // Ensure models are accessible
        const OrgOfficer = mongoose.model('Org_officer'); // Ensure models are accessible

        const org = await Organization.findById(orgId)
            .populate({
                path: "department_id",
                populate: { path: "college_id" }
            })
            .lean();

        if (!org) {
            return res.status(404).json({ message: "Organization not found." });
        }

        const orgType = org.org_type;
        const orgDeptId = org.department_id?._id?.toString();
        const orgCollegeId = org.department_id?.college_id?._id?.toString();

        console.log(`Org Type: ${orgType}`);

        // ------------------------------------------------------------
        // 1. IMPROVEMENT: Fetch Org Officers for *THIS* Organization ONLY
        //    (This improves efficiency and simplifies Step 5 logic.)
        // ------------------------------------------------------------
        const officers = await OrgOfficer.find({ org_id: orgId }) 
            .populate("org_id", "org_name pfp")
            .lean();

        // Map will only contain roles for the CURRENT organization (orgId)
        const studentIdToRole = officers.reduce((map, officer) => {
            map[officer.student_id.toString()] = {
                orgId: officer.org_id?._id?.toString(),
                orgName: officer.org_id?.org_name,
                orgLogo: officer.org_id?.pfp,
                position: officer.role
            };
            return map;
        }, {});

        // --------------------------------------------
        // 2. Fetch Students with full population
        // --------------------------------------------
        const Student = mongoose.model('Student'); // Ensure model is accessible
        let students = await Student.find({})
            .populate("users_id", "firstname lastname email profile_image")
            .populate({
                path: "department_id",
                select: "department_name department_code college_id",
                populate: { path: "college_id", select: "college_name college_code" },
            })
            .lean();

        // --------------------------------------------
        // 3. Apply Organization Type Filter (Correct - As requested)
        // --------------------------------------------
        students = students.filter(student => {
            const studentDeptId = student.department_id?._id?.toString();
            const studentCollegeId = student.department_id?.college_id?._id?.toString();

            if (orgType === "Unit Organization") {
                return studentDeptId === orgDeptId;
            }
            if (orgType === "Mother Organization") {
                return studentCollegeId === orgCollegeId;
            }
            if (orgType === "FAESO Organization") {
                return true; // Show all students
            }

            return false;
        });

        // --------------------------------------------
        // 4. Build Detailed User List
        // --------------------------------------------
        let detailedUsers = students.map(student => {
            const user = student.users_id;
            const dept = student.department_id;
            const role = studentIdToRole[student._id.toString()]; // Role only from the current org
            const hasRole = !!role;

            return {
                id: student._id,
                studentId: student.student_number,
                name: `${user?.firstname || ''} ${user?.lastname || ''}`,
                email: user?.email || '',
                studentImage: user?.profile_image || "",
                // Determine Department/College display name
                department: dept?.college_id?.college_name || dept?.department_name || "N/A",
                course: dept?.department_name || "N/A",

                // Role data for the CURRENT organization (orgId)
                hasRole: hasRole,
                orgId: role?.orgId || null,
                orgName: role?.orgName || null,
                orgLogo: role?.orgLogo || "",
                position: role?.position || null,
            };
        });

        // ------------------------------------------------------------
        // 5. FIX: Filter Students based on 'all' (Available) vs 'roles' (Officers)
        // ------------------------------------------------------------
        if (filter === 'roles') {
            // "Students w/ Roles" tab: Show only students who ARE officers of this specific org.
            // Since studentIdToRole only contained officers of this org, we filter for those who have a role.
            detailedUsers = detailedUsers.filter(u => u.hasRole);
        }

        if (filter === 'all') {
            // "Students" tab: Show only students who are NOT officers of this specific org 
            // (i.e., those who are available to be invited).
            detailedUsers = detailedUsers.filter(u => !u.hasRole);
        }

        res.json(detailedUsers);

    } catch (error) {
        console.error("❌ Error fetching users:", error);
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
        select: "_id department_name department_code college_id",
        populate: { path: "college_id", select: "_id college_name college_code" },
      })
      .populate("users_id", "firstname lastname email profile_image")
      .lean();

    if (!student) {
      console.log("Student record not found for number:", student_number);
      return res.status(404).json({ message: "Student record not found" });
    }

    const user = student.users_id;
    const department = student.department_id;

    console.log("Found student by number:", student_number);

    res.json({
      _id: student._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      student_number: student.student_number,

      // department
      department_id: department?._id || null,
      department_name: department?.department_name || "",
      department_code: department?.department_code || "",

      // NEW: college ID included
      college_id: department?.college_id?._id || null,
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

      // return department ID
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


router.post("/create", async (req, res) => {
  try {
    const {
      username,
      password,
      firstname,
      middlename,
      lastname,
      contact_number,
      email,
      role,
      profile_image 
    } = req.body;

    // Check required fields
    if (!username || !password || !firstname || !lastname || !email || !role) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists." });
    }

    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate user_id automatically 
    const user_id = Date.now();


    const newUser = new User({
      user_id,
      username,
      firstname,
      middlename,
      lastname,
      email,
      contact_number,
      password: hashedPassword,
      role
    });
    await newUser.save();

    // Create Student document if role is Student
    if (role === "Student") {
      const newStudent = new Student({
        student_number: req.body.student_number, 
        users_id: newUser._id, 
        department_id: req.body.department_id, 
        college_id: req.body.college_id 
      });
      await newStudent.save();
    }
    res.status(201).json({ message: "User created successfully", user: newUser });

  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
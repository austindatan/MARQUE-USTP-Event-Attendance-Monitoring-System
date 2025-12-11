const User = require('../models/User');
const Student = require('../models/Student');
const Event = require('../models/Event');
const AttendanceLog = require('../models/Attendance_log');
const mongoose = require('mongoose');
const OrgOfficer = require('../models/Org_officer');
const Organization = require('../models/Organization');

// GET API
exports.getStudentProfileByNumber = async (req, res) => {
  try {
    const student_number = req.params.student_number;

    const student = await Student.findOne({ student_number })
      .populate({
        path: 'department_id',
        select: '_id department_name department_code',
        populate: { path: 'college_id', select: '_id college_name college_code' }
      })
      .populate('users_id', 'firstname lastname email profile_image')
      .lean();

    if (!student) return res.status(404).json({ message: 'Student not found' });

    const user = student.users_id || {};

    // Fetch all org roles for this student
    const orgRoles = await OrgOfficer.find({ student_id: student._id })
      .populate('org_id', 'org_name')
      .lean();

    // Determine highest role
    const priority = ["President", "Manager", "Committee"];
    let highestRole = null;
    for (let p of priority) {
      if (orgRoles.some(r => r.role === p)) {
        highestRole = p;
        break;
      }
    }

    res.json({
      _id: student._id,
      student_number: student.student_number,
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      email: user.email || '',
      profile_image: user.profile_image ||
        'https://res.cloudinary.com/dhfgfpoav/image/upload/v1764669009/defaultProf_gbmq9j.jpg',

      department_id: student.department_id?._id || null,
      department_name: student.department_id?.department_name || '',
      department_code: student.department_id?.department_code || '',
      college_name: student.department_id?.college_id?.college_name || '',

      org_role: highestRole || "Student",
      org_roles: orgRoles,
    });

  } catch (err) {
    console.error('Error in getStudentProfileByNumber:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT API
exports.updateStudentProfile = async (req, res) => {
  try {
    const student_number = req.params.student_number;
    const {
      firstname,
      lastname,
      middlename,
      email,
      contact_number,
      roles, // NEW: Array of role objects
      department_id,
      college_id
    } = req.body;

    // Find student and user
    const student = await Student.findOne({ student_number });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const user = await User.findById(student.users_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update user fields
    if (firstname) user.firstname = firstname;
    if (middlename !== undefined) user.middlename = middlename;
    if (lastname) user.lastname = lastname;
    if (email) user.email = email;
    if (contact_number !== undefined) user.contact_number = contact_number;
    await user.save();

    // Update department & college
    if (department_id) student.department_id = department_id;
    if (college_id) student.college_id = college_id;
    await student.save();

    // Handle multiple roles
    if (roles && Array.isArray(roles)) {
      // Validate president count
      const presidentRoles = roles.filter(r => r.role === 'President');
      if (presidentRoles.length > 2) {
        return res.status(400).json({
          message: 'A student cannot be President of more than 2 organizations'
        });
      }

      // Delete ALL existing org officer records for this student
      await OrgOfficer.deleteMany({ student_id: student._id });

      // Create new org officer records
      for (const roleObj of roles) {
        if (roleObj.role !== 'Student' && roleObj.org_id) {
          await OrgOfficer.create({
            student_id: student._id,
            org_id: roleObj.org_id,
            role: roleObj.role
          });
        }
      }
    }

    res.json({
      message: 'Profile updated successfully',
      department_id: student.department_id,
      college_id: student.college_id
    });

  } catch (err) {
    console.error('Error in updateStudentProfile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



// POST API
exports.uploadStudentProfileImage = async (req, res) => {
  try {
    const student_number = req.params.student_number;

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = req.file.path;

    const student = await Student.findOne({ student_number });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const user = await User.findById(student.users_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profile_image = imageUrl;
    await user.save();

    res.json({ message: 'Image uploaded', profile_image: imageUrl });
  } catch (err) {
    console.error('Error in uploadStudentProfileImage:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET API
exports.getStudentAttendance = async (req, res) => {
  try {
    const student_number = req.params.student_number;
    const limit = parseInt(req.query.limit || '20', 10);

    const student = await Student.findOne({ student_number });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Find attendance logs by user_id
    const userId = student.users_id;

    const logs = await AttendanceLog.find({ user_id: userId })
      .sort({ time_in: -1 })
      .limit(limit)
      .populate({
        path: 'event_id',
        select: 'event_name event_date venue event_images event_image organization_id',
        populate: {
          path: 'organization_id',
          select: 'org_name pfp'
        }
      })
      .lean();

    // Attendance summary
    const summary = logs.map((l) => ({
      attendance_log_id: l._id,
      event: l.event_id ? {
        id: l.event_id._id,
        name: l.event_id.event_name,
        date: l.event_id.event_date,
        venue: l.event_id.venue,
        organization_id: l.event_id.organization_id,
        images: l.event_id.event_image
          ? [l.event_id.event_image]
          : (Array.isArray(l.event_id.event_images) ? l.event_id.event_images : [])
      } : null,
      time_in: l.time_in,
      time_out: l.time_out
    }));

    res.json({ count: summary.length, records: summary });
  } catch (err) {
    console.error('Error in getStudentAttendance:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// CHANGE STUDENT PASSWORD
const bcrypt = require("bcryptjs");

exports.changeStudentPassword = async (req, res) => {
  try {
    const student_number = req.params.student_number;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Password length min
    if (new_password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long."
      });
    }

    const student = await Student.findOne({ student_number });
    if (!student) return res.status(404).json({ message: "Student not found." });

    const user = await User.findById(student.users_id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(new_password, salt);

    await user.save();

    res.json({ message: "Password changed successfully." });

  } catch (err) {
    console.error("Error in changeStudentPassword:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE STUDENT AND ASSOCIATED USER PROFILE
exports.deleteStudentProfile = async (req, res) => {
  const { student_number } = req.params;

  try {
    // Find the student to get the user ID
    const studentToDelete = await Student.findOne({ student_number });

    if (!studentToDelete) {
      return res.status(404).json({ message: "Student not found." });
    }

    const userId = studentToDelete.users_id;
    const studentId = studentToDelete._id;

    // Delete the Student document
    await Student.deleteOne({ student_number });

    // Delete the associated User document
    await User.findByIdAndDelete(userId);

    // Delete any associated OrgOfficer records
    await OrgOfficer.deleteMany({ student_id: studentId });
    res.status(200).json({ message: "Student and associated user successfully deleted." });

  } catch (err) {
    console.error("🔥 Error deleting student:", err);
    res.status(500).json({ message: "Server error during deletion." });
  }
};

// GET API to fetch organizations by multiple department IDs
exports.getOrganizationsByDepartmentIds = async (req, res) => {
  try {
    const { departmentIds } = req.query; // Get the comma-separated string

    if (!departmentIds) {
      // This is the most likely cause of the 400 error in a newly implemented route
      return res.status(400).json({ message: 'Missing departmentIds query parameter' });
    }

    // 1. Split the string into an array of strings
    const stringIds = departmentIds.split(',');

    // 2. Map the string array to Mongoose ObjectIds
    const validObjectIds = stringIds
      .map(id => id.trim())
      .filter(id => mongoose.Types.ObjectId.isValid(id)) // Crucial validation
      .map(id => new mongoose.Types.ObjectId(id));

    if (validObjectIds.length === 0) {
      return res.status(400).json({ message: 'No valid department IDs provided.' });
    }

    // 3. Query using the $in operator to find organizations matching ANY of the IDs
    const organizations = await Organization.find({
      department_id: { $in: validObjectIds }
    });

    res.json(organizations);
  } catch (err) {
    console.error('Error in getOrganizationsByDepartmentIds:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateStudentEmail = async (req, res) => {
  try {
    const student_number = req.params.student_number;
    const { email } = req.body;

    if (!email || email.trim() === '') {
      return res.status(400).json({ message: 'Email field is required.' });
    }

    // Simple client-side validation check (can be expanded)
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }


    const student = await Student.findOne({ student_number });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const user = await User.findById(student.users_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if the new email already exists for another user
    const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email address is already in use by another user.' });
    }

    user.email = email.trim();
    await user.save();

    res.json({ message: 'Email updated successfully', email: user.email });

  } catch (err) {
    console.error('Error in updateStudentEmail:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
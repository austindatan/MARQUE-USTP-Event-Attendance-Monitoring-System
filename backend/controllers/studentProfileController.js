const User = require('../models/User');
const Student = require('../models/Student');
const Event = require('../models/Event');
const AttendanceLog = require('../models/Attendance_log');
const mongoose = require('mongoose');

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
    
    res.json({
      _id: student._id,
      student_number: student.student_number,
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      email: user.email || '',
      profile_image: user.profile_image || 'https://res.cloudinary.com/dhfgfpoav/image/upload/v1764669009/defaultProf_gbmq9j.jpg',
      department_id: student.department_id?._id || null,
      department_name: student.department_id?.department_name || '',
      department_code: student.department_id?.department_code || '',
      college_name: student.department_id?.college_id?.college_name || ''
    });
  } catch (error) {
    console.error('Error in getStudentProfileByNumber:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT API
exports.updateStudentProfile = async (req, res) => {
  try {
    const student_number = req.params.student_number;
    const { firstname, lastname, email } = req.body;

    // Find student and its user
    const student = await Student.findOne({ student_number });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const user = await User.findById(student.users_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (firstname) user.firstname = firstname;
    if (lastname) user.lastname = lastname;
    if (email) user.email = email;

    await user.save();

    res.json({ message: 'Profile updated', profile_image: user.profile_image });
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
      .populate('event_id', 'event_name event_date venue event_images event_image')
      .lean();

    // Attendance summary
    const summary = logs.map((l) => ({
      attendance_log_id: l._id,
      event: l.event_id ? {
        id: l.event_id._id,
        name: l.event_id.event_name,
        date: l.event_id.event_date,
        venue: l.event_id.venue,
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
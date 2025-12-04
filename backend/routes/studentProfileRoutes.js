const express = require('express');
const router = express.Router();
const controller = require('../controllers/studentProfileController');
const { uploadStudentImage } = require('./cloudinaryConfig');

// profile routes
router.get('/profile/:student_number', controller.getStudentProfileByNumber);
router.put('/profile/:student_number', controller.updateStudentProfile);
router.post('/profile/:student_number/upload-photo', uploadStudentImage.single('profile_image'), controller.uploadStudentProfileImage);
router.get('/profile/:student_number/attendance', controller.getStudentAttendance);

// change password route
router.put("/profile/:student_number/change-password", controller.changeStudentPassword
);


module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../controllers/studentProfileController');
const { uploadStudentImage } = require('./cloudinaryConfig');
const authMiddleware = require('../middleware/auth');

// profile routes
router.get('/profile/:student_number', controller.getStudentProfileByNumber);
router.put('/profile/:student_number', authMiddleware, controller.updateStudentProfile);
router.post('/profile/:student_number/upload-photo', authMiddleware, uploadStudentImage.single('profile_image'), controller.uploadStudentProfileImage);
router.get('/profile/:student_number/attendance', controller.getStudentAttendance);
router.delete('/profile/:student_number', authMiddleware, controller.deleteStudentProfile);

router.get('/organizations/by-departments', controller.getOrganizationsByDepartmentIds);

router.put('/profile/:student_number/email', authMiddleware, controller.updateStudentEmail);

// change password route
router.put("/profile/:student_number/change-password", authMiddleware, controller.changeStudentPassword
);


module.exports = router;

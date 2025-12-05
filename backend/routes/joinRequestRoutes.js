// routes/joinRequestRoutes.js

const express = require('express');
const router = express.Router();
const joinRequestController = require('../controllers/joinRequestController');

// IMPORTANT: Specific routes MUST come before generic :id routes

// Admin gets all pending requests (specific route first)
router.get('/pending', joinRequestController.getPendingRequests);

// Get all requests by a student (specific route)
router.get('/student/:student_id', joinRequestController.getStudentRequests);

// Student submits a join request (POST root)
router.post('/', joinRequestController.createJoinRequest);

// Admin approves/rejects a request (must be last)
router.patch('/:requestId', joinRequestController.updateRequestStatus);

module.exports = router;
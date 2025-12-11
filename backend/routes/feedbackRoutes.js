// routes/feedbackRoutes.js

const express = require('express');
const router = express.Router();
const { submitFeedback, checkIfFeedbackSubmitted, getFeedbackComments } = require('../controllers/feedbackController');
// ⚠️ ASSUMPTION: You have authMiddleware defined for protected routes
const authMiddleware = require('../middleware/auth');

// Route: POST /api/feedback/submit
// Submits a new feedback record. 
router.post('/submit', authMiddleware, submitFeedback);

router.get('/check/:eventId', authMiddleware, checkIfFeedbackSubmitted);

// Route: GET /api/feedback/comments/:eventId
// Gets all feedback comments for an event
router.get('/comments/:eventId', getFeedbackComments);

module.exports = router;
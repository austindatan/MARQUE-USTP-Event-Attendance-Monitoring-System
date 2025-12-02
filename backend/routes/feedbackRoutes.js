// routes/feedbackRoutes.js

const express = require('express');
const router = express.Router();
const { submitFeedback, checkIfFeedbackSubmitted } = require('../controllers/feedbackController'); 
// ⚠️ ASSUMPTION: You have authMiddleware defined for protected routes
const authMiddleware = require('../middleware/auth'); 

// Route: POST /api/feedback/submit
// Submits a new feedback record. 
router.post('/submit', authMiddleware, submitFeedback);

router.get('/check/:eventId', authMiddleware, checkIfFeedbackSubmitted);

module.exports = router;
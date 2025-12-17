const express = require('express');
const router = express.Router();
const { submitFeedback, checkIfFeedbackSubmitted, getFeedbackComments } = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/auth');

router.post('/submit', authMiddleware, submitFeedback);
router.get('/check/:eventId', authMiddleware, checkIfFeedbackSubmitted);
router.get('/comments/:eventId', getFeedbackComments);

module.exports = router;
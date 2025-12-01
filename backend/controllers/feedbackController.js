// controllers/feedbackController.js

const Feedback = require('../models/Feedback'); // ⚠️ ADJUST PATH if necessary
// Assuming you have an authMiddleware defined elsewhere
// If you don't have one, you can omit the import and middleware usage for now, 
// but it is highly recommended for security.
// const { authMiddleware } = require('../middleware/auth'); 

const submitFeedback = async (req, res) => {
    const { event_id, user_id, ratings, comment } = req.body;
    
    // Basic validation
    if (!event_id || !user_id || !ratings || 
        Object.values(ratings).some(r => r < 1 || r > 5)) {
        return res.status(400).json({ message: "Invalid or incomplete feedback data provided." });
    }

    try {
        // 1. Check for duplicate submission (relies on the unique index added above)
        const existingFeedback = await Feedback.findOne({ event_id, user_id });

        if (existingFeedback) {
            // Use 409 Conflict to indicate data integrity violation (already exists)
            return res.status(409).json({ message: "You have already submitted feedback for this event." });
        }

        // 2. Create and save new feedback record
        const newFeedback = new Feedback({
            event_id,
            user_id,
            ratings,
            comment,
        });

        await newFeedback.save();

        res.status(201).json({ 
            message: "Feedback submitted successfully!", 
            feedback: newFeedback 
        });

    } catch (error) {
        console.error("Error submitting feedback:", error);

        res.status(500).json({ message: "Server error during feedback submission." });
    }
};

module.exports = {
    submitFeedback,
};
// controllers/feedbackController.js

const Feedback = require("../models/Feedback");

const submitFeedback = async (req, res) => {
    try {
        const { event_id, ratings, comment, is_anonymous } = req.body;
        const user_id = req.user.id; // comes from auth middleware

        // Check if already submitted
        const exists = await Feedback.findOne({ event_id, user_id });
        if (exists) {
            return res.status(409).json({ message: "Feedback already submitted" });
        }

        const newFeedback = new Feedback({
            event_id,
            user_id,
            ratings,
            comment,
            is_anonymous: is_anonymous || false
        });

        await newFeedback.save();

        res.status(201).json({ message: "Feedback submitted successfully!" });

    } catch (error) {
        console.error("Submit Feedback Error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Validation failed. Please ensure all rating fields are selected.",
                details: error.message
            });
        }

        res.status(500).json({ message: "Server error" });
    }
};


const checkIfFeedbackSubmitted = async (req, res) => {
    try {
        const { eventId } = req.params;
        const user_id = req.user.id;

        if (!user_id) {
            return res.status(401).json({ message: "Authentication required." });
        }

        const exists = await Feedback.findOne({ event_id: eventId, user_id });

        res.status(200).json({ hasSubmitted: !!exists });

    } catch (error) {
        console.error("Check Feedback Error:", error);
        res.status(500).json({ message: "Server error during feedback check." });
    }
};


const getFeedbackComments = async (req, res) => {
    try {
        const { eventId } = req.params;

        if (!eventId) {
            return res.status(400).json({ message: "Event ID is required." });
        }

        // Fetch all feedback for this event, populate user details including profile image
        const feedbacks = await Feedback.find({ event_id: eventId })
            .populate('user_id', 'firstname lastname profile_image')
            .select('ratings comment is_anonymous createdAt user_id event_id')
            .sort({ createdAt: -1 }) // Most recent first
            .lean();

        res.status(200).json({ feedbacks });

    } catch (error) {
        console.error("Get Feedback Comments Error:", error);
        res.status(500).json({ message: "Server error fetching feedback comments." });
    }
};


module.exports = {
    submitFeedback,
    checkIfFeedbackSubmitted,
    getFeedbackComments
};

const JoinRequest = require('../models/JoinRequest');
const Organization = require('../models/Organization');
const mongoose = require('mongoose');

// GET: Your Orgs (organizations the user is already approved in)
exports.getYourOrgs = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Find all approved join requests for this user
        const joinRequests = await JoinRequest.find({ user_id: userId, status: 'Approved' })
            .populate('organization_id');

        const organizations = joinRequests.map(jr => jr.organization_id);

        res.json({ organizations });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET: Joinable Orgs (organizations the user has NOT joined)
exports.getJoinableOrgs = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Get all join requests (approved or pending) for this user
        const userRequests = await JoinRequest.find({ user_id: userId });
        const joinedOrgIds = userRequests.map(r => r.organization_id.toString());

        // Find organizations NOT joined
        const organizations = await Organization.find({ _id: { $nin: joinedOrgIds } });

        res.json({ organizations });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST: Send Join Request
exports.sendJoinRequest = async (req, res) => {
    try {
        const { user_id, organization_id } = req.body;

        // Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(user_id) || !mongoose.Types.ObjectId.isValid(organization_id)) {
            return res.status(400).json({ message: 'Invalid IDs' });
        }

        // Check if request already exists
        const existingRequest = await JoinRequest.findOne({ user_id, organization_id });
        if (existingRequest) return res.status(400).json({ message: 'Request already exists' });

        const joinRequest = new JoinRequest({ user_id, organization_id });
        await joinRequest.save();

        res.json({ message: 'Join request sent', joinRequest });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const FollowedOrgs = require('../models/Followed_org'); 

const getFollowedOrganizationIds = async (req, res) => {
    const { userId } = req.params; 

    if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
    }

    try {
        const followed = await FollowedOrgs.find({ user_id: userId })
            .select('organization_id -_id'); 

        const orgIds = followed.map(f => String(f.organization_id));

        res.status(200).json(orgIds);
    } catch (err) {
        console.error("Error fetching followed organization IDs:", err);
        res.status(500).json({ message: "Server error" });
    }
};



const toggleFollowOrganization = async (req, res) => {
    const { userId, organizationId } = req.body;
    const { action } = req.params; // 'follow' or 'unfollow'

    if (!userId || !organizationId) {
        return res.status(400).json({ message: "User ID and Organization ID are required." });
    }

    try {
        if (action === 'follow') {
            // Check if already following
            const existing = await FollowedOrgs.findOne({ user_id: userId, organization_id: organizationId });
            if (existing) {
                return res.status(200).json({ message: "Already following." });
            }
            
            // Create a new follow record
            const newFollow = new FollowedOrgs({ user_id: userId, organization_id: organizationId });
            await newFollow.save();
            return res.status(201).json({ message: "Organization followed successfully." });

        } else if (action === 'unfollow') {
            // Remove the follow record
            const result = await FollowedOrgs.deleteOne({ user_id: userId, organization_id: organizationId });
            
            if (result.deletedCount === 0) {
                 return res.status(404).json({ message: "Follow record not found." });
            }
            return res.status(200).json({ message: "Organization unfollowed successfully." });

        } else {
            return res.status(400).json({ message: "Invalid action." });
        }
    } catch (err) {
        console.error(`Error during ${action}:`, err);
        res.status(500).json({ message: "Server error during action." });
    }
};


module.exports = { 
    getFollowedOrganizationIds,
    toggleFollowOrganization 
};
const express = require("express");
const router = express.Router();
const { 
    getFollowedOrganizationIds,
    toggleFollowOrganization
} = require("../controllers/followedorgsController");

// Route to fetch all organization IDs followed by a user
router.get("/:userId/ids", getFollowedOrganizationIds); 

// Route to handle follow/unfollow actions
// Example POST /api/followed-orgs/follow or POST /api/followed-orgs/unfollow
router.post("/:action", toggleFollowOrganization); 

module.exports = router;
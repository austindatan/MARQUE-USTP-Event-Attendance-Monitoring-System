const express = require("express");
const router = express.Router();
const { 
    getFollowedOrganizationIds,
    toggleFollowOrganization
} = require("../controllers/followedorgsController");


router.get("/:userId/ids", getFollowedOrganizationIds); 
router.post("/:action", toggleFollowOrganization); 

module.exports = router;
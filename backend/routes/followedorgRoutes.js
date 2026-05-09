const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { 
    getFollowedOrganizationIds,
    toggleFollowOrganization
} = require("../controllers/followedorgsController");


router.get("/:userId/ids", getFollowedOrganizationIds);
router.post("/:action", authMiddleware, toggleFollowOrganization);

module.exports = router;
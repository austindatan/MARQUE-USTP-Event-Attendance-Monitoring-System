const express = require('express');
const router = express.Router();
const orgController = require('../controllers/orgController');

// Get all orgs the user is part of
router.get('/your-orgs/:userId', orgController.getYourOrgs);

// Get all orgs the user can join
router.get('/joinable/:userId', orgController.getJoinableOrgs);

// Send a join request
router.post('/join-request', orgController.sendJoinRequest);

module.exports = router;

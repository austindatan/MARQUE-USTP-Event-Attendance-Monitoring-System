// routes/orgOfficerRoutes.js

const express = require('express');
const router = express.Router();
const orgOfficerController = require('../controllers/orgOfficerController');

// This route defines the path AFTER the '/api/memberships' prefix (from step 1).
// Resulting full path: /api/memberships/student/:studentId
router.get('/student/:studentId', orgOfficerController.getJoinedOrganizations);

module.exports = router;
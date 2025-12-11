// routes/orgOfficerRoutes.js

const express = require('express');
const router = express.Router();
const orgOfficerController = require('../controllers/orgOfficerController');

// This route defines the path AFTER the '/api/memberships' prefix (from step 1).
// Resulting full path: /api/memberships/student/:studentId
router.get('/student/:studentId', orgOfficerController.getJoinedOrganizations);
router.get('/available/student/:studentId', orgOfficerController.getAvailableOrganizations);

router.post('/invite', orgOfficerController.sendInvite);
router.post('/accept-invite', orgOfficerController.acceptInvite);
router.put('/change-role', orgOfficerController.changeRole);
router.delete('/remove', orgOfficerController.removeUser);

// --- NEW ROUTES FOR INVITE STATUS CHECK ---
router.get('/outstanding-invites/:orgId', orgOfficerController.getOutstandingInvites);
router.delete("/cancel-invite", orgOfficerController.cancelInvite);
    
module.exports = router;
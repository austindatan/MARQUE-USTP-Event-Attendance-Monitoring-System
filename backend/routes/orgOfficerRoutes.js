const express = require('express');
const router = express.Router();
const orgOfficerController = require('../controllers/orgOfficerController');

router.get('/student/:studentId', orgOfficerController.getJoinedOrganizations);
router.get('/available/student/:studentId', orgOfficerController.getAvailableOrganizations);

router.post('/invite', orgOfficerController.sendInvite);
router.post('/accept-invite', orgOfficerController.acceptInvite);
router.put('/change-role', orgOfficerController.changeRole);
router.delete('/remove', orgOfficerController.removeUser);
router.get('/outstanding-invites/:orgId', orgOfficerController.getOutstandingInvites);
router.delete("/cancel-invite", orgOfficerController.cancelInvite);
    
module.exports = router;
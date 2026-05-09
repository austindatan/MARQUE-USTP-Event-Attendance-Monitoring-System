const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const orgOfficerController = require('../controllers/orgOfficerController');

router.get('/student/:studentId', orgOfficerController.getJoinedOrganizations);
router.get('/available/student/:studentId', orgOfficerController.getAvailableOrganizations);

router.post('/invite', authMiddleware, orgOfficerController.sendInvite);
router.post('/accept-invite', authMiddleware, orgOfficerController.acceptInvite);
router.put('/change-role', authMiddleware, orgOfficerController.changeRole);
router.delete('/remove', authMiddleware, orgOfficerController.removeUser);
router.get('/outstanding-invites/:orgId', orgOfficerController.getOutstandingInvites);
router.delete("/cancel-invite", authMiddleware, orgOfficerController.cancelInvite);
    
module.exports = router;
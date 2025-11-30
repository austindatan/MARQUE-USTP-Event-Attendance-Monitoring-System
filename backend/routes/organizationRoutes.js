const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');

// GET all organizations, optionally filtered by type via query
router.get('/', organizationController.getOrganizations);

// GET organizations by type in path param (for frontend convenience)
router.get('/by-type/:type', organizationController.getOrganizationsByType);

// GET single organization by ID
router.get('/:id', organizationController.getOrganizationById);

// POST: add organization
router.post('/', organizationController.addOrganization);

module.exports = router;

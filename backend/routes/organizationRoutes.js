const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');

const Organization = require("../models/Organization");
const Event = require("../models/Event");

// multer Cloudinary
const { uploadOrgImages } = require('./cloudinaryConfig');

// GET /api/organizations/profile/:orgId
router.get('/profile/:orgId', async (req, res) => {
  try {
    const orgId = req.params.orgId;

    const organization = await Organization.findById(orgId);
    if (!organization) return res.status(404).json({ message: "Organization not found" });

    const events = await Event.find({ organization_id: orgId });
    const incomingEvents = events.filter(e => e.status === "Upcoming");
    const concludedEvents = events.filter(e => e.status === "Concluded");

    res.json({
      organization,
      events: {
        incoming: incomingEvents,
        concluded: concludedEvents,
      }
    });
  } catch (error) {
    console.error("Error fetching organization profile:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Org routes
router.get('/', organizationController.getOrganizations);
router.get('/by-type/:type', organizationController.getOrganizationsByType);
router.get('/:id', organizationController.getOrganizationById);
router.post('/', organizationController.addOrganization);

// UPDATE organization profile
router.put(
  '/:orgId',
  uploadOrgImages.fields([
    { name: 'pfp', maxCount: 1 },
    { name: 'cover_photo', maxCount: 1 },
  ]),
  organizationController.updateOrganizationProfile
);

module.exports = router;

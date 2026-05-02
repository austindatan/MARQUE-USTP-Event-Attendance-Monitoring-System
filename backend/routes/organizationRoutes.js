const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const authMiddleware = require('../middleware/auth');

const Organization = require("../models/Organization");
const Event = require("../models/Event");

// multer Cloudinary
const { uploadOrgImages } = require('./cloudinaryConfig');

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

// GET all orgs by department ID
router.get('/department/:departmentId', async (req, res) => {
  try {
    console.log(`✅ Organization Department Route Hit. ID: ${req.params.departmentId}`);
    const { departmentId } = req.params;
    const orgs = await Organization.find({ department_id: departmentId }).lean();

    res.json(orgs || []);
  } catch (err) {
    console.error("Error fetching organizations by department:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get('/:id', organizationController.getOrganizationById);
router.post(
  '/',
  authMiddleware,
  uploadOrgImages.fields([
    { name: 'pfp', maxCount: 1 }, 
    { name: 'cover_photo', maxCount: 1 },
  ]),
  organizationController.addOrganization
);

// UPDATE organization profile
router.put(
  '/:orgId',
  authMiddleware,
  uploadOrgImages.fields([
    { name: 'pfp', maxCount: 1 },
    { name: 'cover_photo', maxCount: 1 },
  ]),
  organizationController.updateOrganizationProfile
);

router.delete('/:orgId', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.params;
    const deleted = await Organization.findByIdAndDelete(orgId);

    if (!deleted) return res.status(404).json({ message: "Organization not found" });

    res.status(200).json({ message: "Organization deleted successfully" });
  } catch (err) {
    console.error("Error deleting organization:", err);
    res.status(500).json({ message: "Server error deleting organization" });
  }
});


module.exports = router;

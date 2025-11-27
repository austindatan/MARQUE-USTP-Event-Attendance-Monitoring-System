// routes/eventRoutes.js
const express = require("express");
const router = express.Router();
const { getEventsByDepartment, getAllUpcomingEvents, getAllConcludedEvents, getEventsByFollowedOrgs, getFollowedOrgEvents, addEvent, updateEvent, getOrgEventsByStatus } = require("../controllers/eventController");

// ⚠️ IMPORTANT: Route order matters! More specific routes must come BEFORE generic ones.
// /all/upcoming must come before /:departmentId to avoid being caught by the parameterized route.

// Multer middleware
const { uploadEventImages } = require("../middleware/upload");

router.get("/all/upcoming", getAllUpcomingEvents);

router.get("/all/concluded", getAllConcludedEvents);

router.get("/followed", getEventsByFollowedOrgs);

router.get("/following/:userId", getFollowedOrgEvents);

router.get("/:departmentId", getEventsByDepartment);

// Add Event (multiple images)
router.post("/add", uploadEventImages.array("event_images", 10), addEvent);

// Update Event (multiple images)
router.put("/update/:id", uploadEventImages.array("event_images", 10), updateEvent);

// Get event details by event ID
router.get("/details/:organizationId", getOrgEventsByStatus);




module.exports = router;

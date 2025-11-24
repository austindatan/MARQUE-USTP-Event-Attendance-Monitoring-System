// routes/eventRoutes.js
const express = require("express");
const router = express.Router();
const { getEventsByDepartment, getAllUpcomingEvents, getAllConcludedEvents, getEventsByFollowedOrgs, getFollowedOrgEvents } = require("../controllers/eventController");

// ⚠️ IMPORTANT: Route order matters! More specific routes must come BEFORE generic ones.
// /all/upcoming must come before /:departmentId to avoid being caught by the parameterized route.

router.get("/all/upcoming", getAllUpcomingEvents);

router.get("/all/concluded", getAllConcludedEvents);

router.get("/followed", getEventsByFollowedOrgs);

router.get("/following/:userId", getFollowedOrgEvents);

router.get("/:departmentId", getEventsByDepartment);



module.exports = router;

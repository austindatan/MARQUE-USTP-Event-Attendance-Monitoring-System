const express = require("express");
const router = express.Router();

const eventController = require("../controllers/eventController");
const {
    getEventsByDepartment,
    getAllUpcomingEvents,
    getAllConcludedEvents,
    getEventsByFollowedOrgs,
    getFollowedOrgEvents,
    createEvent,
    updateEvent,
    getOrgEventsByStatus,
    getOngoingEvents,
    getEventsByOrgType,
    getFilteredEvents,
    getUpcomingEventsByOrganization,
    getConcludedEventsByOrganization,
    isEventActive,
    isEventWithin30Min,
    getEventStatus,
    deleteEvent
} = eventController;

const { uploadEventImages } = require('./cloudinaryConfig');
const { testConclusionNotification } = require('../controllers/testConclusionNotification');

// TEST ENDPOINT - Remove in production
router.get('/test-conclusion/:eventId', testConclusionNotification);

router.get('/search', eventController.searchEvents);
router.get('/ongoing', getOngoingEvents);

router.get("/all/upcoming", getAllUpcomingEvents);
router.get("/all/concluded", getAllConcludedEvents);

// GET upcoming events for a given organization
router.get('/organization/:orgId/upcoming', eventController.getUpcomingEventsByOrganization);
router.get('/organization/:orgId/concluded', eventController.getConcludedEventsByOrganization);

// Change .array(...) to .single('event_image')
router.post('/create', uploadEventImages.single('event_image'), createEvent);
router.put('/:eventId', uploadEventImages.single('event_image'), updateEvent);
router.delete('/:id', deleteEvent);

// Optional: Check if event is active and/or within first 30 minutes
router.get('/event-status/:id', eventController.getEventStatus);

// CANCEL and RESUME event
router.put("/cancel/:eventId", eventController.cancelEvent);
router.put("/resume/:eventId", eventController.resumeEvent);

// NEW ROUTE – MUST BE ABOVE departmentId
router.get("/event/:id", eventController.getEventById); //also used for edit event

router.get("/followed", getEventsByFollowedOrgs);
router.get("/following/:userId", getFollowedOrgEvents);

router.get("/details/:organizationId", getOrgEventsByStatus);
router.get("/by-org-type/:orgType", getEventsByOrgType);
router.get('/filter', getFilteredEvents);

// LAST
router.get("/:departmentId", getEventsByDepartment);



module.exports = router;
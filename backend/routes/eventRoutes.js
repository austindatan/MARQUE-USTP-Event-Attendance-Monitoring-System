const express = require("express");
const router = express.Router();

const eventController = require("../controllers/eventController"); 
const { 
    getEventsByDepartment, 
    getAllUpcomingEvents, 
    getAllConcludedEvents, 
    getEventsByFollowedOrgs, 
    getFollowedOrgEvents, 
    addEvent, 
    updateEvent, 
    getOrgEventsByStatus, 
    getOngoingEvents 
} = eventController;


const { uploadEventImages } = require("../middleware/upload");


router.get('/search', eventController.searchEvents);
router.get('/ongoing', getOngoingEvents);

router.get("/all/upcoming", getAllUpcomingEvents);
router.get("/all/concluded", getAllConcludedEvents);
router.get("/followed", getEventsByFollowedOrgs);

router.get("/following/:userId", getFollowedOrgEvents);

router.post("/add", uploadEventImages.array("event_images", 10), addEvent);
router.put("/update/:id", uploadEventImages.array("event_images", 10), updateEvent);

router.get("/details/:organizationId", getOrgEventsByStatus);


router.get("/:departmentId", getEventsByDepartment); 


module.exports = router;
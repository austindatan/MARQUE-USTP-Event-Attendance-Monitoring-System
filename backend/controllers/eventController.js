//const Event = require("../models/Event");
//const Organization = require("../models/Organization");
//const FollowedOrgs = require("../models/Followed_org");
import Event from "../models/Event.js";
import Organization from "../models/Organization.js";
import FollowedOrgs from "../models/Followed_org.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";


const getEventsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    // Find organizations in this department
    const orgs = await Organization.find({ department_id: departmentId }).select("_id");
    const orgIds = orgs.map(o => o._id);

    const now = new Date();

    // Find events whose end_time is in the future
    const events = await Event.find({
      organization_id: { $in: orgIds },
      end_time: { $gte: now } // only upcoming events
    })
    .populate('organization_id')
    .sort({ event_date: 1 }); // 

    res.status(200).json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getEventsByOrgType = async (req, res) => {
  const { orgType } = req.params;

  let mappedType;
  if (orgType === "units") mappedType = "Unit Organization";
  else if (orgType === "mothers") mappedType = "Mother Organization";
  else return res.status(400).json({ message: "Invalid organization type" });

  try {
    const orgs = await Organization.find({ org_type: mappedType }).select("_id");
    const orgIds = orgs.map((o) => o._id);

    const events = await Event.find({
      organization_id: { $in: orgIds },
      end_time: { $gte: new Date() }
    })
      .populate("organization_id")
      .sort({ event_date: 1 });

    res.status(200).json({ events }); 
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const getFilteredEvents = async (req, res) => {
  try {
    let { orgs } = req.query;

    console.log("Received orgs query:", orgs);

    if (!orgs) return res.status(200).json([]);

    if (typeof orgs === "string") {
      try {
        orgs = JSON.parse(orgs);
      } catch (err) {
        orgs = orgs.split(',');
      }
    }

    const orgObjectIds = orgs
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (orgObjectIds.length === 0) return res.status(200).json([]);

    const now = new Date();

    const filteredEvents = await Event.find({
      organization_id: { $in: orgObjectIds },
      end_time: { $gte: now } 
    })
      .sort({ event_date: 1 })
      .populate('organization_id', 'org_name pfp description');

    return res.status(200).json(filteredEvents);
  } catch (err) {
    console.error("Error fetching filtered events:", err);
    return res.status(500).json({ message: "Server error fetching filtered events" });
  }
};



const getFollowedEvents = async (req, res) => {
    try {
        const { orgs } = req.query;

        if (!orgs) {
            return res.status(200).json([]); 
        }

        const orgIdStrings = orgs.split(',');
        const orgObjectIds = orgIdStrings
            .filter(id => mongoose.Types.ObjectId.isValid(id.trim()))
            .map(id => new mongoose.Types.ObjectId(id.trim()));

        if (orgObjectIds.length === 0) {
            return res.status(200).json([]); 
        }

        const events = await Event.find({
            organization_id: { $in: orgObjectIds }
        })
        .sort({ event_date: 1 })
        .populate('organization_id');

        res.status(200).json(events);

    } catch (err) {
        console.error("Error fetching followed events:", err);
        res.status(500).json({ message: "Server error fetching followed events" });
    }
};




const getAllUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({ event_date: { $gte: new Date() } }) 
      .populate("organization_id")
      .sort({ event_date: 1 });

    res.status(200).json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching upcoming events" });
  }
};

const getAllConcludedEvents = async (req, res) => {
  try {
    const events = await Event.find({ end_time: { $lt: new Date() } }) 
      .populate("organization_id")
      .sort({ event_date: -1 }); 

    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching concluded events:", err);
    res.status(500).json({ message: "Server error fetching concluded events" });
  }
};

// get upcoming events for a specific organization
const getUpcomingEventsByOrganization = async (req, res) => {
  try {
    const { orgId } = req.params;
    if (!orgId) return res.status(400).json({ message: "Organization ID required" });

    // Filter: event_date >= now AND organization_id == orgId
    const now = new Date();

    const events = await Event.find({
      organization_id: orgId,
      event_date: { $gte: now },
    })
      .populate("organization_id")
      .sort({ event_date: 1 });

    return res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching organization upcoming events:", err);
    return res.status(500).json({ message: "Server error fetching organization's upcoming events" });
  }
};

const getConcludedEventsByOrganization = async (req, res) => {
  try {
    const { orgId } = req.params;

    const events = await Event.find({
      organization_id: orgId,
      end_time: { $lt: new Date() }, // already ended
    })
    .populate("organization_id")
    .sort({ end_time: -1 }); // recent first

    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching concluded events:", err);
    res.status(500).json({ message: "Server error fetching concluded events" });
  }
};


const getEventsByFollowedOrgs = async (req, res) => {
    const orgsString = req.query.orgs; 
    
    if (!orgsString) {
        return res.status(200).json([]); 
    }
    
    const orgIds = orgsString.split(','); 

    try {
        const events = await Event.find({ 
            organization_id: { $in: orgIds }, 
        })
        .populate('organization_id')
        .sort({ event_date: 1 }); 

        res.status(200).json(events);
    } catch (err) {
        console.error("Error fetching events by followed organizations:", err);
        res.status(500).json({ message: "Server error" });
    }
};

const getFollowedOrgEvents = async (req, res) => {
  try {
    const { userId } = req.params;

    const followed = await FollowedOrgs.find({ user_id: userId })
      .select("organization_id");

    const orgIds = followed.map(f => f.organization_id);

    if (orgIds.length === 0) {
      return res.status(200).json([]);
    }

    const events = await Event.find({
      organization_id: { $in: orgIds }
    }).populate("organization_id");

    res.status(200).json(events);

  } catch (err) {
    console.error("Error getting followed org events:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =========================
// ADD EVENT
// =========================
const addEvent = async (req, res) => {
  try {
    const {
      organization_id,
      event_name,
      event_type,
      description,
      event_date,
      start_time,
      end_time,
      venue,
      is_mandatory
    } = req.body;

    // File upload paths (multiple images)
    const images = req.body.event_images || [];

    const newEvent = new Event({
      organization_id,
      event_name,
      event_type,
      description,
      event_images: images,
      event_date,
      start_time,
      end_time,
      venue,
      is_mandatory
    });

    await newEvent.save();

    res.status(201).json({
      message: "Event created successfully",
      event: newEvent
    });

  } catch (error) {
    console.error("Add Event Error:", error);
    res.status(500).json({ message: "Server error adding event" });
  }
};

// =========================
// UPDATE EVENT
// =========================
const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    const {
      organization_id,
      event_name,
      event_type,
      description,
      event_date,
      start_time,
      end_time,
      venue,
      is_mandatory,
      keep_old_images // optional: ["img1.jpg", "img2.png"]
    } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Prepare new uploaded images
    const newImages = req.body.event_images || []; 

    let finalImages = req.body.keep_old_images || [];

    // If user wants to keep old images
    if (keep_old_images && Array.isArray(keep_old_images)) {
      finalImages = [...keep_old_images];
    }

    // Add newly uploaded images
    finalImages = [...finalImages, ...newImages];

    // Delete old images that were removed
    const removedImages =
      event.event_images.filter(img => !finalImages.includes(img));

    removedImages.forEach(imgPath => {
      const fullPath = path.join(process.cwd(), imgPath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    });

    // Update fields
    event.organization_id = organization_id ?? event.organization_id;
    event.event_name = event_name ?? event.event_name;
    event.event_type = event_type ?? event.event_type;
    event.description = description ?? event.description;
    event.event_date = event_date ?? event.event_date;
    event.start_time = start_time ?? event.start_time;
    event.end_time = end_time ?? event.end_time;
    event.venue = venue ?? event.venue;
    event.is_mandatory = is_mandatory ?? event.is_mandatory;
    event.event_images = finalImages;

    await event.save();

    res.status(200).json({
      message: "Event updated successfully",
      event
    });

  } catch (error) {
    console.error("Update Event Error:", error);
    res.status(500).json({ message: "Server error updating event" });
  }
};

// =========================
// GET ALL EVENTS OF AN ORGANIZATION BY STATUS
// =========================
const getOrgEventsByStatus = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { status } = req.query; // optional: "Upcoming", "Ongoing", "Concluded"

    // Build query
    let query = { organization_id: organizationId };
    if (status) {
      query.status = status;
    }

    const events = await Event.find(query)
      .populate("organization_id")
      .sort({ event_date: 1 }); // earliest first

    res.status(200).json(events);
  } catch (error) {
    console.error("Get Org Events by Status Error:", error);
    res.status(500).json({ message: "Server error fetching organization's events" });
  }
};

const getOngoingFilter = () => {
    const now = new Date();
    
    return {
        start_time: { $lte: now },
        end_time: { $gt: now } 
    }; 
};


const getOngoingEvents = async (req, res) => { 
    try {
        const ongoingEvents = await Event.find(getOngoingFilter())
            .populate('organization_id', 'org_name pfp') 
            .sort({ event_date: 1 });
        
        return res.status(200).json(ongoingEvents);
    } catch (error) {
        console.error("Error fetching ongoing events:", error);
        return res.status(500).json({ message: "Server error fetching ongoing events." });
    }
};


const searchEvents = async (req, res) => {
    const { query } = req.query; 

    if (!query || query.trim() === "") {
        return getOngoingEvents(req, res); 
    }

    try {
        const searchRegex = new RegExp(query, 'i');
        
        const searchConditions = {
            $or: [
                { event_name: searchRegex },
                { description: searchRegex },
            ],
            ...getOngoingFilter() 
        };

        const searchResults = await Event.find(searchConditions)
            .populate('organization_id', 'org_name pfp')
            .sort({ event_date: 1 });

        return res.status(200).json(searchResults);

    } catch (error) {
        console.error("Error searching events:", error);
        return res.status(500).json({ message: "Server error during search." });
    }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organization_id", "org_name pfp description");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (err) {
    console.error("Error fetching event details:", err);
    res.status(500).json({ message: "Server error fetching event details" });
  }
};




export { getEventsByDepartment, getAllUpcomingEvents, getAllConcludedEvents, getEventsByFollowedOrgs, getFollowedOrgEvents, addEvent, updateEvent, getOrgEventsByStatus, getOngoingFilter, getOngoingEvents, searchEvents, getEventsByOrgType, getFilteredEvents, getFollowedEvents, getEventById, getUpcomingEventsByOrganization, getConcludedEventsByOrganization,  };
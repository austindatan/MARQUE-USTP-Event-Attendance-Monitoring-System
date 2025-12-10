import Event from "../models/Event.js";
import Organization from "../models/Organization.js";
import FollowedOrgs from "../models/Followed_org.js";
import Notification from "../models/Notification.js";
import Student from "../models/Student.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

// Auto-update status of all events
const autoUpdateEventStatuses = async () => {
  const now = new Date();

  try {
    // 1. Upcoming → Ongoing
    await Event.updateMany(
      {
        status: "Upcoming",
        start_time: { $lte: now },
        end_time: { $gt: now }
      },
      { $set: { status: "Ongoing" } }
    );

    // 2. Ongoing → Concluded
    await Event.updateMany(
      {
        status: "Ongoing",
        end_time: { $lte: now }
      },
      { $set: { status: "Concluded" } }
    );

  } catch (err) {
    console.error("Error auto-updating statuses:", err);
  }
};


const getEventsByDepartment = async (req, res) => {
  try {
    await autoUpdateEventStatuses();

    const { departmentId } = req.params;

    // Find organizations in this department
    const orgs = await Organization.find({ department_id: departmentId }).select("_id");
    const orgIds = orgs.map((o) => o._id);

    const now = new Date();

    // Find events whose end_time is in the future
    const events = await Event.find({
      organization_id: { $in: orgIds },
      end_time: { $gte: now }, // only upcoming events
    })
      .populate("organization_id")
      .sort({ event_date: 1 });

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
    await autoUpdateEventStatuses();

    const orgs = await Organization.find({ org_type: mappedType }).select("_id");
    const orgIds = orgs.map((o) => o._id);

    const events = await Event.find({
      organization_id: { $in: orgIds },
      end_time: { $gte: new Date() },
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
    await autoUpdateEventStatuses();

    let { orgs } = req.query;

    console.log("Received orgs query:", orgs);

    if (!orgs) return res.status(200).json([]);

    if (typeof orgs === "string") {
      try {
        orgs = JSON.parse(orgs);
      } catch (err) {
        orgs = orgs.split(",");
      }
    }

    const orgObjectIds = orgs
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (orgObjectIds.length === 0) return res.status(200).json([]);

    const now = new Date();

    const filteredEvents = await Event.find({
      organization_id: { $in: orgObjectIds },
      end_time: { $gte: now },
    })
      .sort({ event_date: 1 })
      .populate("organization_id", "org_name pfp description");

    return res.status(200).json(filteredEvents);
  } catch (err) {
    console.error("Error fetching filtered events:", err);
    return res.status(500).json({ message: "Server error fetching filtered events" });
  }
};

const getFollowedEvents = async (req, res) => {
  try {
    await autoUpdateEventStatuses();

    const { orgs } = req.query;

    if (!orgs) {
      return res.status(200).json([]);
    }

    const orgIdStrings = orgs.split(",");
    const orgObjectIds = orgIdStrings
      .filter((id) => mongoose.Types.ObjectId.isValid(id.trim()))
      .map((id) => new mongoose.Types.ObjectId(id.trim()));

    if (orgObjectIds.length === 0) {
      return res.status(200).json([]);
    }

    const events = await Event.find({
      organization_id: { $in: orgObjectIds },
    })
      .sort({ event_date: 1 })
      .populate("organization_id");

    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching followed events:", err);
    res.status(500).json({ message: "Server error fetching followed events" });
  }
};

const getAllUpcomingEvents = async (req, res) => {
  try {
    await autoUpdateEventStatuses();

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
    await autoUpdateEventStatuses();

    const events = await Event.find({ end_time: { $lt: new Date() } })
      .populate("organization_id")
      .sort({ event_date: -1 });

    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching concluded events:", err);
    res.status(500).json({ message: "Server error fetching concluded events" });
  }
};

// events/organization/:orgId/upcoming
const getUpcomingEventsByOrganization = async (req, res) => {
  try {
    await autoUpdateEventStatuses();

    const { orgId } = req.params;
    if (!orgId) return res.status(400).json({ message: "Organization ID required" });

    const now = new Date();

    const events = await Event.find({
      organization_id: orgId,
      end_time: { $gte: now }, // hasn't ended
      status: { $ne: "Cancelled" } // exclude cancelled
    })
      .populate("organization_id")
      .sort({ start_time: 1 });

    return res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching organization upcoming events:", err);
    return res.status(500).json({ message: "Server error fetching organization's upcoming events" });
  }
};

const getConcludedEventsByOrganization = async (req, res) => {
  try {
    await autoUpdateEventStatuses();

    const { orgId } = req.params;

    const now = new Date();

    // 1️⃣ Update events that have ended but are not yet concluded
    await Event.updateMany(
      {
        organization_id: orgId,
        end_time: { $lt: now },
        status: { $nin: ["Concluded", "Cancelled"] },
      },
      { $set: { status: "Concluded" } }
    );

    // 2️⃣ Fetch concluded and cancelled events
    const events = await Event.find({
      organization_id: orgId,
      $or: [
        { end_time: { $lt: now } }, // already ended
        { status: "Cancelled" }      // cancelled events
      ]
    })
      .populate("organization_id")
      .sort({ end_time: -1 }); // recent first

    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching concluded/cancelled events:", err);
    res.status(500).json({ message: "Server error fetching concluded/cancelled events" });
  }
};


const getEventsByFollowedOrgs = async (req, res) => {
  const orgsString = req.query.orgs;

  if (!orgsString) {
    return res.status(200).json([]);
  }

  const orgIds = orgsString.split(",");

  try {
    await autoUpdateEventStatuses();

    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to midnight

    const events = await Event.find({
      organization_id: { $in: orgIds },
      event_date: { $gte: today }  // Only upcoming events
    })
      .populate("organization_id")
      .sort({ event_date: 1 });

    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching events by followed organizations:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getFollowedOrgEvents = async (req, res) => {
  try {
    await autoUpdateEventStatuses();

    const { userId } = req.params;

    const followed = await FollowedOrgs.find({ user_id: userId }).select("organization_id");

    const orgIds = followed.map((f) => f.organization_id);

    if (orgIds.length === 0) {
      return res.status(200).json([]);
    }

    const events = await Event.find({
      organization_id: { $in: orgIds },
    }).populate("organization_id");

    res.status(200).json(events);
  } catch (err) {
    console.error("Error getting followed org events:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =========================
// GET ALL EVENTS OF AN ORGANIZATION BY STATUS
// =========================
const getOrgEventsByStatus = async (req, res) => {
  try {
    await autoUpdateEventStatuses();

    const { organizationId } = req.params;
    const { status } = req.query; // optional: "Upcoming", "Ongoing", "Concluded"

    // Build query
    let query = { organization_id: organizationId };
    if (status) {
      query.status = status;
    }

    const events = await Event.find(query).populate("organization_id").sort({ event_date: 1 }); // earliest first

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
    end_time: { $gt: now },
  };
};

const getOngoingEvents = async (req, res) => {
  try {
    await autoUpdateEventStatuses();

    const ongoingEvents = await Event.find(getOngoingFilter())
      .populate("organization_id", "org_name pfp")
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
    await autoUpdateEventStatuses();

    const searchRegex = new RegExp(query, "i");

    const searchConditions = {
      $or: [{ event_name: searchRegex }, { description: searchRegex }],
      ...getOngoingFilter(),
    };

    const searchResults = await Event.find(searchConditions)
      .populate("organization_id", "org_name pfp")
      .sort({ event_date: 1 });

    return res.status(200).json(searchResults);
  } catch (error) {
    console.error("Error searching events:", error);
    return res.status(500).json({ message: "Server error during search." });
  }
};

const getEventById = async (req, res) => {
  try {
    await autoUpdateEventStatuses();

    const event = await Event.findById(req.params.id).populate("organization_id", "org_name pfp description");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (err) {
    console.error("Error fetching event details:", err);
    res.status(500).json({ message: "Server error fetching event details" });
  }
};

/* ============================================================
    HELPER: CHECK IF EVENT IS ACTIVE
============================================================ */
const isEventActive = (event) => {
  if (!event) return false;

  const now = new Date();
  const eventDate = new Date(event.event_date);
  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);

  // Check if today is the same day as event
  const isSameDay =
    now.getFullYear() === eventDate.getFullYear() &&
    now.getMonth() === eventDate.getMonth() &&
    now.getDate() === eventDate.getDate();

  const isWithinTime = now >= startTime && now <= endTime;

  return isSameDay && isWithinTime;
};

/**
 * Returns true if the current time is within the first 1 hour of the event start
 */
const isEventWithin1Hour = (event) => {
  if (!event) return false;

  const now = new Date();
  const startTime = new Date(event.start_time);

  const oneHourAfterStart = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour

  return now >= startTime && now <= oneHourAfterStart;
};

const getEventStatus = async (req, res) => {
  try {
    await autoUpdateEventStatuses();

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);

    const isActive = now >= startTime && now <= endTime;

    // Within 1 hour of start time
    const within1Hour = now >= startTime && now <= new Date(startTime.getTime() + 60 * 60 * 1000);

    return res.json({
      isActive,
      within1Hour,
    });
  } catch (error) {
    console.error("Error in getEventStatus:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const createEvent = async (req, res) => {
  try {
    await autoUpdateEventStatuses();

    const {
      organization_id,
      event_name,
      event_type,
      venue,
      venue_details,
      description,
      event_date,
      end_date,
      start_time,
      end_time,
    } = req.body;

    const event_image_url = req.file ? req.file.path || req.file.secure_url : null;

    const eventDateUTC = new Date(event_date);
    const endDateUTC = new Date(end_date);
    const startTimeUTC = new Date(start_time);
    const endTimeUTC = new Date(end_time);

    const newEvent = new Event({
      organization_id,
      event_name,
      event_type,
      description,
      venue,
      venue_details,
      event_image: event_image_url,
      event_date: eventDateUTC,
      end_date: endDateUTC,
      start_time: startTimeUTC,
      end_time: endTimeUTC,
    });

    const savedEvent = await newEvent.save();

    // --- NOTIFICATION LOGIC ---
    try {
      // 1. Get Org details (for Department & Name)
      const org = await Organization.findById(organization_id);

      if (org) {
        // 2. Identify Target Students
        let targetStudentIds = new Set();

        // A. Department Members
        if (org.department_id) {
          const deptStudents = await Student.find({ department_id: org.department_id }).select("_id");
          deptStudents.forEach(s => targetStudentIds.add(s._id.toString()));
        }

        // B. Followers (map User ID -> Student ID)
        const followers = await FollowedOrgs.find({ organization_id }).select("user_id");
        const followerUserIds = followers.map(f => f.user_id);

        if (followerUserIds.length > 0) {
          const followerStudents = await Student.find({ users_id: { $in: followerUserIds } }).select("_id");
          followerStudents.forEach(s => targetStudentIds.add(s._id.toString()));
        }

        // 3. Create Notifications
        const notifications = Array.from(targetStudentIds).map(studentId => ({
          user_id: studentId,
          organization_id,
          event_id: savedEvent._id,
          type: "event",
          title: "New Event: " + event_name,
          message: `${org.org_name} has published a new event: "${event_name}". Check it out!`,
          status: "info",
          is_read: false
        }));

        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
          console.log(`Created ${notifications.length} notifications for event: ${event_name}`);
        }
      }
    } catch (notifErr) {
      console.error("Error creating notifications for new event:", notifErr);
    }
    // ---------------------------

    res.status(201).json({ message: "Event created successfully", event: savedEvent });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ message: "Server error creating event", details: err.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    await autoUpdateEventStatuses();
    const { eventId } = req.params;
    const {
      organization_id,
      event_name,
      event_type,
      description,
      venue,
      venue_details,
      is_mandatory,
      event_date,
      end_date,        // <-- ADDED
      start_time,
      end_time,
    } = req.body;

    // Handle new image if uploaded
    const new_event_image_url = req.file ? req.file.path || req.file.secure_url : undefined;

    // Convert to Date objects
    const eventDateUTC = new Date(event_date);
    const endDateUTC = new Date(end_date);    // <-- ADDED
    const startTimeUTC = new Date(start_time);
    const endTimeUTC = new Date(end_time);

    const now = new Date();

    // Determine status based on current time
    let status = "Upcoming";

    // Event is ongoing if current time is between start and end
    if (now >= startTimeUTC && now <= endTimeUTC) {
      status = "Ongoing";
    } 
    
    // Event is concluded if now is past the END TIME
    else if (now > endTimeUTC) {
      status = "Concluded";
    }

    const updateData = {
      event_name,
      event_type,
      description,
      venue,
      venue_details,
      is_mandatory,
      event_date: eventDateUTC,  // START DATE
      end_date: endDateUTC,      // <-- ADDED
      start_time: startTimeUTC,
      end_time: endTimeUTC,
      status,
    };

    if (new_event_image_url !== undefined) {
      updateData.event_image = new_event_image_url;
    }

    const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });

  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({
      message: "Server error updating event",
      details: err.message,
    });
  }
};



// CANCEL EVENT
const cancelEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.status = "Cancelled";
    await event.save();

    return res.json({
      message: "Event cancelled successfully",
      status: event.status
    });
  } catch (error) {
    console.error("Cancel event error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// RESUME EVENT
const resumeEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.status = "Upcoming";
    await event.save();

    return res.json({
      message: "Event resumed successfully",
      status: event.status
    });
  } catch (error) {
    console.error("Resume event error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};



const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Server error deleting event" });
  }
};



export {
  autoUpdateEventStatuses,
  getEventsByDepartment,
  getAllUpcomingEvents,
  getAllConcludedEvents,
  getEventsByFollowedOrgs,
  getFollowedOrgEvents,
  createEvent,
  updateEvent,
  getOrgEventsByStatus,
  getOngoingFilter,
  getOngoingEvents,
  searchEvents,
  getEventsByOrgType,
  getFilteredEvents,
  getFollowedEvents,
  getEventById,
  getUpcomingEventsByOrganization,
  getConcludedEventsByOrganization,
  isEventActive,
  isEventWithin1Hour,
  getEventStatus,
  cancelEvent,
  resumeEvent,
  deleteEvent
};
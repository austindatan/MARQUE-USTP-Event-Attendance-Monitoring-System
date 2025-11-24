const Event = require("../models/Event");
const Organization = require("../models/Organization");
const FollowedOrgs = require("../models/Followed_org");

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

const getEventsByFollowedOrgs = async (req, res) => {
    const orgsString = req.query.orgs; 
    
    if (!orgsString) {
        return res.status(200).json([]); 
    }
    
    const orgIds = orgsString.split(','); 

    try {
        const events = await Event.find({ 
            organization_id: { $in: orgIds }, // Filter by the list of organization IDs
            // event_date: { $gte: new Date() }   // Filter for upcoming events only
        })
        .populate('organization_id')
        .sort({ event_date: 1 }); // Sort by date ascending

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

module.exports = {
  getFollowedOrgEvents,
};

module.exports = { getEventsByDepartment, getAllUpcomingEvents, getAllConcludedEvents, getEventsByFollowedOrgs, getFollowedOrgEvents };

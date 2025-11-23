const Event = require("../models/Event");
const Organization = require("../models/Organization");
const Department = require("../models/Department");

const getEventsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    // 1️⃣ Find all organizations in this department
    const orgs = await Organization.find({ department_id: departmentId }).select("_id");
    const orgIds = orgs.map(o => o._id);

    // 2️⃣ Find all events for those organizations
    const events = await Event.find({ organization_id: orgIds })
    .populate('organization_id');

    res.status(200).json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getEventsByDepartment };

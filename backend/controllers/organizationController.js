const Organization = require('../models/Organization');
const mongoose = require('mongoose');

exports.getOrganizations = async (req, res) => {
    console.log("GET /api/organizations/all REACHED");
    try {
        const { type } = req.query; 

        let filter = {};
        if (type) {
            if (type === "Unit") filter.org_type = "Unit Organization";
            else if (type === "Mother") filter.org_type = "Mother Organization";
            else if (type === "FAESO") filter.org_type = "FAESO Organization";
        }

        const organizations = await Organization.find(filter).sort({ org_name: 1 });
        res.status(200).json(organizations);
    } catch (err) {
        console.error("Error fetching organizations:", err);
        res.status(500).json({ message: "Server error fetching organizations" });
    }
};

exports.getOrganizationsByType = async (req, res) => {
    console.log(`GET /api/organizations/type/${req.params.type} REACHED`);
    try {
        const { type } = req.params;

        let filter = {};
        if (type) {
            if (type.toLowerCase() === "units") filter.org_type = "Unit Organization";
            else if (type.toLowerCase() === "mothers") filter.org_type = "Mother Organization"; 
            else if (type.toLowerCase() === "faeso") filter.org_type = "FAESO Organization";
        }

        const organizations = await Organization.find(filter).sort({ org_name: 1 });
        res.status(200).json(organizations);
    } catch (err) {
        console.error("Error fetching organizations by type:", err);
        res.status(500).json({ message: "Server error fetching organizations by type" });
    }
};

exports.getOrganizationById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: 'Invalid organization ID' });

        const org = await Organization.findById(id);
        if (!org) return res.status(404).json({ message: 'Organization not found' });

        res.status(200).json(org);
    } catch (err) {
        console.error("Error fetching organization:", err);
        res.status(500).json({ message: "Server error fetching organization" });
    }
};

// organizationController.js

exports.addOrganization = async (req, res) => {
  try {
    const { department_id, org_name, org_type, description, fb_link, ig_link, x_link, moderator_name } = req.body;

    // Validate department_id
    if (!department_id || !mongoose.Types.ObjectId.isValid(department_id)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }

    // Validate org_type
    const validTypes = ["Unit Organization", "Mother Organization", "FAESO Organization"];
    if (!validTypes.includes(org_type)) {
      return res.status(400).json({ message: 'Invalid organization type' });
    }

    const pfp = req.files?.pfp ? req.files.pfp[0].path : undefined;
    const cover_photo = req.files?.cover_photo ? req.files.cover_photo[0].path : undefined;

    const newOrg = new Organization({
      department_id,
      org_name,
      org_type,
      description,
      pfp,
      cover_photo,
      fb_link,
      ig_link,
      x_link,
      moderator_name
    });

    await newOrg.save();
    res.status(201).json({ message: "Organization created successfully", organization: newOrg });

  } catch (err) {
    console.error("UNHANDLED ERROR:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


exports.updateOrganizationProfile = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { org_name, description, fb_link, ig_link, x_link, department_id, org_type, moderator_name } = req.body;

    const pfp = req.files?.pfp ? req.files.pfp[0].path : undefined;
    const cover_photo = req.files?.cover_photo ? req.files.cover_photo[0].path : undefined;

    const updateData = {
      org_name,
      description,
      fb_link,
      ig_link,
      x_link,
      department_id,
      org_type,
      moderator_name
    };

    if (pfp) updateData.pfp = pfp;
    if (cover_photo) updateData.cover_photo = cover_photo;

    const updated = await Organization.findByIdAndUpdate(orgId, updateData, { new: true });

    if (!updated) return res.status(404).json({ message: "Organization not found" });

    res.status(200).json({ message: "Organization profile updated successfully", organization: updated });

  } catch (err) {
    console.error("Error updating organization profile:", err);
    res.status(500).json({ message: "Server error updating organization" });
  }
};

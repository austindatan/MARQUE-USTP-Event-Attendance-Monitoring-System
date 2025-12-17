const exploreOrganization = require("../models/Organization"); 

const getAllOrganizations = async (req, res) => {
    try {
        // Fetch all organizations
        const exploreorganizations = await exploreOrganization.find({})
            .select('org_name pfp description') // Select the fields the card needs
            .sort({ org_name: 1 }); // Sort alphabetically

        res.status(200).json(exploreorganizations);
    } catch (err) {
        console.error("Error fetching all organizations:", err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { getAllOrganizations };
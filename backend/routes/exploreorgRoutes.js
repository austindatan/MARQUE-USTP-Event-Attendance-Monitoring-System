const express = require("express");
const router = express.Router();
const { getAllOrganizations } = require("../controllers/exploreorgsController");

// Route to fetch all organizations
router.get("/all", getAllOrganizations);

module.exports = router;
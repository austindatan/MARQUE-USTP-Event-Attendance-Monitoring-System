const express = require("express");
const router = express.Router();
const { getAllOrganizations } = require("../controllers/exploreorgsController");

router.get("/all", getAllOrganizations);

module.exports = router;
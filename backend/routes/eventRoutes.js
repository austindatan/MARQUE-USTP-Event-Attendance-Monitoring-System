// routes/eventRoutes.js
const express = require("express");
const router = express.Router();
const { getEventsByDepartment } = require("../controllers/eventController");

router.get("/:departmentId", getEventsByDepartment);

module.exports = router;

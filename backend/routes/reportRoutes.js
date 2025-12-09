const express = require("express");
const router = express.Router();
const { downloadEventReport, } = require("../controllers/reportController");

// DOWNLOAD EVENT REPORT
router.get("/event/:eventId/download-report", downloadEventReport);

module.exports = router;

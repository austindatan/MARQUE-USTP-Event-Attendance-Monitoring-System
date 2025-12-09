const express = require('express');
const router = express.Router();
const College = require('../models/College');

// GET all colleges
router.get('/colleges', async (req, res) => {
  try {
    const colleges = await College.find(); // Fetch all colleges
    res.status(200).json(colleges);
  } catch (err) {
    console.error("Error fetching colleges:", err);
    res.status(500).json({ error: "Failed to fetch colleges" });
  }
});

module.exports = router;

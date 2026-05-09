const express = require('express');
const router = express.Router();
const College = require('../models/College');
const authMiddleware = require('../middleware/auth');

router.get('/colleges', async (req, res) => {
  try {
    const colleges = await College.find(); 
    res.status(200).json(colleges);
  } catch (err) {
    console.error("Error fetching colleges:", err);
    res.status(500).json({ error: "Failed to fetch colleges" });
  }
});

router.post('/colleges', authMiddleware, async (req, res) => {
  try {
    const { college_code, college_name } = req.body;
    if (!college_name) return res.status(400).json({ error: "college_name is required" });
    
    const newCollege = new College({ college_code, college_name });
    await newCollege.save();
    
    res.status(201).json(newCollege);
  } catch (err) {
    console.error("Error creating college:", err);
    res.status(500).json({ error: "Failed to create college" });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

// GET all departments
router.get('/departments', async (req, res) => {
  try {
    const depts = await Department.find();  
    res.status(200).json(depts);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

module.exports = router;

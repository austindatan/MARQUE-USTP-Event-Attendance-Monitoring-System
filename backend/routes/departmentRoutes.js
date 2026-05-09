const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const authMiddleware = require('../middleware/auth');

router.get('/departments', async (req, res) => {
  try {
    const depts = await Department.find();
    res.status(200).json(depts);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

router.post('/departments', authMiddleware, async (req, res) => {
  try {
    const { college_id, department_code, department_name } = req.body;
    if (!college_id || !department_name) return res.status(400).json({ error: "college_id and department_name are required" });

    const newDept = new Department({ college_id, department_code, department_name });
    await newDept.save();

    res.status(201).json(newDept);
  } catch (err) {
    console.error("Error creating department:", err);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

module.exports = router;

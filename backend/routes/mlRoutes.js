const express = require('express');
const router = express.Router();
const { getForecast, triggerTrain } = require('../controllers/mlController');

// GET /api/ml/forecast/:eventId  → predict turnout for a specific event
router.get('/forecast/:eventId', getForecast);

// POST /api/ml/train  → manually retrain the model (officers/admins)
router.post('/train', triggerTrain);

module.exports = router;

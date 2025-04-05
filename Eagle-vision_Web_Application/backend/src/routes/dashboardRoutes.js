// routes/dashboardRoutes.js
const express = require('express');
const { getDashboardStats,updateStats } = require('../controllers/dashboardController');

const router = express.Router();

// Route to fetch and store statistics
router.get('/fetch-stats', getDashboardStats);


// Route to update stats
router.post('/update-stats', updateStats);
module.exports = router;

// In your backend routes file (e.g., alerts.js or routes.js)

const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert'); // Assuming you have a model for alerts

// Get all alerts (this should return a list of alerts)
router.get('/fetch-alerts', async (req, res) => {
  try {
    const alerts = await Alert.find(); // Fetching all alerts
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alerts' });
  }
});

// Delete a specific alert by ID
router.delete('/delete-alerts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const alert = await Alert.findByIdAndDelete(id); // Delete alert by ID
    if (alert) {
      res.json({ message: 'Alert deleted successfully' });
    } else {
      res.status(404).json({ message: 'Alert not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting alert' });
  }
});

// Get alert count (this should return the count of alerts)
router.get('/fetch-alert-count', async (req, res) => {
  try {
    const alertCount = await Alert.countDocuments(); // Count all alerts
    res.json({ count: alertCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alert count' });
  }
});

module.exports = router;

// controllers/dashboardController.js
const { fetchAndStoreDashboardData } = require('../services/dashboardService');
const Stats = require('../models/DashboardStatistics');

// Endpoint to fetch and store statistics
const getDashboardStats = async (req, res) => {
  try {
    const stats = await fetchAndStoreDashboardData();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard statistics.' });
  }
};

// Controller to update stats
const updateStats = async (req, res) => {
  const updatedStats = req.body; // Expecting an array of stats objects

  try {
    // Loop through the stats and update each one
    for (const stat of updatedStats) {
      await Stats.findOneAndUpdate(
        { name: stat.name },   // Find stat by name
        { value: stat.value }, // Update the value
        { new: true, upsert: true } // Create if not found
      );
    }
    res.status(200).json({ message: 'Stats updated successfully' });
  } catch (error) {
    console.error('Error updating stats:', error);
    res.status(500).json({ message: 'Failed to update stats', error });
  }
};

module.exports = { getDashboardStats, updateStats};

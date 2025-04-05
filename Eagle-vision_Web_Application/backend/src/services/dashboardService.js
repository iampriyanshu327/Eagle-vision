// services/dashboardService.js
const fs = require('fs');
const path = require('path');
const DashboardStatistics = require('../models/DashboardStatistics');

// Function to fetch data and write it to a JSON file
const fetchAndStoreDashboardData = async () => {
  try {
    // Fetch data from MongoDB
    const stats = await DashboardStatistics.find({}, { _id: 0, name: 1, value: 1 }); // Fetch only name and value

    // Define file path
    const filePath = path.join(__dirname, "../../data/dashboardStats.json");

    // Write data to JSON file
    fs.writeFileSync(filePath, JSON.stringify(stats, null, 2));

    console.log('Dashboard statistics saved successfully!');
    return stats;
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    throw error;
  }
};

module.exports = { fetchAndStoreDashboardData };

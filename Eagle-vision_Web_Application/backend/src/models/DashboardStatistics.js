// models/DashboardStatistics.js
const mongoose = require('mongoose');

const DashboardStatisticsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, required: true },
});

module.exports = mongoose.model('DashboardStatistics', DashboardStatisticsSchema,"dashboard-statistics");

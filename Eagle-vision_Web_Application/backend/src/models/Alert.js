const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  alert: { type: Boolean, required: true },
  footageUrl: { type: String, required: true },
  location: { type: String, required: true },
  anomalyDate: { type: String, required: true },
  anomalyTime: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  createdContract: {type: String}
});

const Alert = mongoose.model("Alert", alertSchema);

module.exports = Alert;

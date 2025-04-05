const mongoose = require("mongoose");

const residentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  locality: String,
});

module.exports = mongoose.model("Resident", residentSchema);

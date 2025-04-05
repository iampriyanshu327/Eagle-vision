const mongoose = require("mongoose");

const authoritySchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  locality: String,
});

module.exports = mongoose.model("Authority", authoritySchema);

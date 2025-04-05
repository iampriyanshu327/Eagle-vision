const Resident = require("../models/Resident");

const addResident = async (req, res) => {
  try {
    const { name, email, locality } = req.body;
    const newResident = new Resident({ name, email, locality });
    await newResident.save();
    res.status(200).send("Resident added successfully!");
  } catch (error) {
    res.status(500).send("Failed to add resident.");
  }
};

const getResidents = async (req, res) => {
  try {
    const residents = await Resident.find();
    res.status(200).json(residents);
  } catch (error) {
    res.status(500).send("Failed to fetch residents.");
  }
};

module.exports = { addResident, getResidents };

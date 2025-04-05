const Authority = require("../models/Authority");

const addAuthority = async (req, res) => {
  try {
    const { name, email, locality } = req.body;
    const newAuthority = new Authority({ name, email, locality });
    await newAuthority.save();
    res.status(200).send("Authority added successfully!");
  } catch (error) {
    res.status(500).send("Failed to add authority.");
  }
};

const getAuthorities = async (req, res) => {
  try {
    const authorities = await Authority.find();
    res.status(200).json(authorities);
  } catch (error) {
    res.status(500).send("Failed to fetch authorities.");
  }
};

module.exports = { addAuthority, getAuthorities };

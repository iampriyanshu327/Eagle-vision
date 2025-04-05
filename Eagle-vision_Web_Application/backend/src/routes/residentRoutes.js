const express = require("express");
const router = express.Router();
const { addResident, getResidents } = require("../controllers/residentController");

router.post("/add-resident", addResident);
router.get("/get-residents", getResidents);

module.exports = router;

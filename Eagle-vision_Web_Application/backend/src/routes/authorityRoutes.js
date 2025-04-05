const express = require("express");
const router = express.Router();
const { addAuthority, getAuthorities } = require("../controllers/authorityController");

router.post("/add-authority", addAuthority);
router.get("/get-authorities", getAuthorities);

module.exports = router;

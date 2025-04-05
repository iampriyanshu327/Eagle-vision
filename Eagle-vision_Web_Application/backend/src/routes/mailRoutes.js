const express = require("express");
const multer = require("multer");
const { sendEmailToResidents, sendEmailToAuthorities } = require("../controllers/mailController");

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save uploaded videos in 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({ storage });

// Routes with file upload handling
router.post("/send-resident-alert", upload.single("video"), sendEmailToResidents);
router.post("/send-authority-alert", upload.single("video"), sendEmailToAuthorities);

module.exports = router;

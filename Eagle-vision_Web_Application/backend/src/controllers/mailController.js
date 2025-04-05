const { sendEmail } = require("../services/emailService");
const Resident = require("../models/Resident");
const Authority = require("../models/Authority");

const sendEmailToResidents = async (req, res) => {
  try {
    const residents = await Resident.find();
    const subject = "Alert: Important Notification";
    const text = "This is an important alert message sent to all residents.";

    // Check if a video file is provided
    const videoPath = req.file ? req.file.path : null;

    for (const resident of residents) {
      await sendEmail(resident.email, subject, text, videoPath);
    }

    res.status(200).json({ message: "Emails sent successfully with video attachment." });
  } catch (error) {
    res.status(500).json({ message: "Failed to send emails", error });
  }
};

const sendEmailToAuthorities = async (req, res) => {
  try {
    const authorities = await Authority.find();
    const subject = "Alert: Important Notification";
    const text = "This is an important alert message sent to all authorities.";

    // Check if a video file is provided
    const videoPath = req.file ? req.file.path : null;

    for (const authority of authorities) {
      await sendEmail(authority.email, subject, text, videoPath);
    }

    res.status(200).json({ message: "Emails sent successfully with video attachment." });
  } catch (error) {
    res.status(500).json({ message: "Failed to send emails", error });
  }
};

module.exports = { sendEmailToResidents, sendEmailToAuthorities };

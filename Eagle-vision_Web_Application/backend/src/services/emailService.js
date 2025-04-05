const nodemailer = require("nodemailer");
const path = require("path");

const sendEmail = async (to, subject, text, attachmentPath = null) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Change if needed
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      attachments: attachmentPath
        ? [
            {
              filename: path.basename(attachmentPath),
              path: attachmentPath,
            },
          ]
        : [],
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email", error);
    throw error;
  }
};

module.exports = { sendEmail };

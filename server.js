const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json()); // Parses incoming JSON data

// --- Contact Form Route ---
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  // 1. Server-Side Validation (The Last Line of Defense)
  // Even if the frontend is bypassed, the server stays safe.
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  if (message.trim().length < 10) {
    return res.status(400).json({ error: "Message too short." });
  }

  try {
    // 2. Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 3. Define the Email Content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.RECEIVER_EMAIL,
      replyTo: email,
      subject: `Portfolio Contact from ${name}`,
      text: `You have a new message from your portfolio:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    };

    // 4. Send the Email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Nodemailer Error:", error);
    res
      .status(500)
      .json({ error: "Failed to send email. Please try again later." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

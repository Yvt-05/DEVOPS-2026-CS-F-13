const Enquiry = require("../models/Enquiry");
const nodemailer = require("nodemailer");

/*
  Enquiry Controller
  ──────────────────
  Handles HTTP request logic for the /api/enquiries route.

  Email notifications:
  - After saving, sends a notification to the company email (COMPANY_EMAIL in .env)
  - Sends a confirmation to the visitor (optional)
  - Uses nodemailer with SMTP — credentials from .env only
*/

// Create the email transporter using SMTP settings from .env
function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// POST /api/enquiries — save a new enquiry and send email notifications
async function createEnquiry(req, res) {
  try {
    const { name, email, phone, projectType, location, budget, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required." });
    }

    // Save to MongoDB
    const enquiry = new Enquiry({ name, email, phone, projectType, location, budget, message });
    await enquiry.save();

    // Send email notifications (only if SMTP settings are configured in .env)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = createTransporter();

        // Email body shared by both notification and confirmation
        const enquiryDetails = `
Name:         ${name}
Email:        ${email}
Phone:        ${phone || "Not provided"}
Project Type: ${projectType}
Location:     ${location || "Not provided"}
Budget:       ${budget || "Not specified"}

Message:
${message}
        `.trim();

        // 1. Notify the company
        await transporter.sendMail({
          from:    `"Shivakriti Website" <${process.env.SMTP_USER}>`,
          to:      process.env.COMPANY_EMAIL || process.env.SMTP_USER,
          subject: `New Enquiry from ${name} — ${projectType}`,
          text:    `You have received a new project enquiry.\n\n${enquiryDetails}`,
        });

        // 2. Send confirmation to the visitor
        await transporter.sendMail({
          from:    `"Shivakriti Constructions" <${process.env.SMTP_USER}>`,
          to:      email,
          subject: "We've received your enquiry — Shivakriti Constructions",
          text: `Dear ${name},\n\nThank you for reaching out. We have received your enquiry and will get back to you within 24 hours.\n\nYour Enquiry Details:\n${enquiryDetails}\n\nWarm regards,\nShivakriti Constructions`,
        });

        console.log(`📧 Emails sent for enquiry from ${email}`);
      } catch (emailErr) {
        // Email failure does NOT block the success response
        // The enquiry is already saved to MongoDB
        console.error("Email send failed:", emailErr.message);
      }
    } else {
      console.log("ℹ️  SMTP not configured — skipping email notifications");
    }

    res.status(201).json({
      success: true,
      message: "Enquiry received. We will contact you shortly.",
      id: enquiry._id,
    });
  } catch (err) {
    console.error("Error saving enquiry:", err.message);
    res.status(500).json({ error: "Server error. Please try again." });
  }
}

// GET /api/enquiries — list all enquiries
async function getAllEnquiries(req, res) {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
}

module.exports = { createEnquiry, getAllEnquiries };

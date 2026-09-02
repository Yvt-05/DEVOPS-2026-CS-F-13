const Enquiry = require("../models/Enquiry");

/*
  Enquiry Controller
  ──────────────────
  Handles HTTP request logic for the /api/enquiries route.
  Keeps route files thin — all business logic lives here.
*/

// POST /api/enquiries — save a new enquiry from the contact form
async function createEnquiry(req, res) {
  try {
    const { name, email, phone, projectType, location, budget, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required." });
    }

    const enquiry = new Enquiry({
      name,
      email,
      phone,
      projectType,
      location,
      budget,
      message,
    });

    await enquiry.save();

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

// GET /api/enquiries — list all enquiries (for internal use)
async function getAllEnquiries(req, res) {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
}

module.exports = { createEnquiry, getAllEnquiries };

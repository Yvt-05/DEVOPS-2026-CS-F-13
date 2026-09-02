const express = require("express");
const { createEnquiry, getAllEnquiries } = require("../controllers/enquiryController");

const router = express.Router();

// POST /api/enquiries — submit a new enquiry from the contact form
router.post("/", createEnquiry);

// GET /api/enquiries — list all enquiries (internal use)
router.get("/", getAllEnquiries);

module.exports = router;

const mongoose = require("mongoose");

/*
  Enquiry Model
  ─────────────
  Stores project enquiries submitted through the Contact page.
  Each document represents one enquiry from a potential client.
*/
const enquirySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    email:       { type: String, required: true, trim: true, lowercase: true },
    phone:       { type: String, trim: true, default: "" },
    projectType: { type: String, default: "Residential" },
    location:    { type: String, trim: true, default: "" },
    budget:      { type: String, default: "" },
    message:     { type: String, required: true, trim: true },
    // Track follow-up status manually
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("Enquiry", enquirySchema);

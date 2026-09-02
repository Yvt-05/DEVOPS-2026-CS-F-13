const mongoose = require("mongoose");

/*
  Project Model
  ─────────────
  Stores project data in MongoDB.
  Initially seeded from src/data/projects.js via the seed script.
  The API reads from this collection.
*/
const projectSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    location:    { type: String, required: true },
    type:        { type: String, required: true },
    year:        { type: String, required: true },
    status:      { type: String, default: "Completed" },
    description: { type: String, required: true },
    image:       { type: String, default: "" },
    gallery:     { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);

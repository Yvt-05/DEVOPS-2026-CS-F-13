/*
  Database Seeder for Shivakriti Constructions
  ────────────────────────────────────────────
  Seeds MongoDB with the 5 verified company projects.
  Usage: node seed.js
*/

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Project = require("./models/Project");

dotenv.config();

const seedProjects = [
  {
    title: "The Aria Residences",
    location: "Jaipur, Rajasthan",
    type: "Residential",
    year: "2024",
    status: "Completed",
    description:
      "A contemporary residential development focused on modern architecture and functional living. The design emphasises natural light, open floor plans, and premium finishes throughout.",
    image: "/images/projects/project-1-main.jpg",
    gallery: ["/images/projects/project-1-gallery-1.jpg"],
  },
  {
    title: "Vertex Commercial Centre",
    location: "Jaipur, Rajasthan",
    type: "Commercial",
    year: "2023",
    status: "Completed",
    description:
      "A modern commercial development designed to meet the demands of contemporary business. Clean structural lines, efficient floor plans, and premium construction.",
    image: "/images/projects/project-2-main.jpg",
    gallery: ["/images/projects/project-2-gallery-1.jpg"],
  },
  {
    title: "Horizon Villa",
    location: "Dholpur, Rajasthan",
    type: "Luxury Residential",
    year: "2025",
    status: "Completed",
    description:
      "A luxury villa that blends a minimal architectural language with the warmth of natural materials. Every detail has been thoughtfully considered.",
    image: "/images/projects/project-3-main.jpg",
    gallery: ["/images/projects/project-3-gallery-1.jpg"],
  },
  {
    title: "Shivakriti Grand Complex",
    location: "Jaipur, Rajasthan",
    type: "Mixed Use",
    year: "2024",
    status: "Completed",
    description:
      "A large-scale mixed-use development combining residential and commercial spaces within a unified architectural vision.",
    image: "/images/projects/project-4-main.jpg",
    gallery: ["/images/projects/project-4-gallery-1.jpg"],
  },
  {
    title: "Prakash Residency",
    location: "Rajasthan",
    type: "Residential",
    year: "2023",
    status: "Completed",
    description:
      "A premium residential project designed for quality living. Clean construction, durable materials, and thoughtful spatial planning.",
    image: "/images/projects/project-5-main.jpg",
    gallery: ["/images/projects/project-5-gallery-1.jpg"],
  },
];

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI missing in environment. Please set in server/.env");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const count = await Project.countDocuments();
    if (count > 0) {
      console.log(`ℹ Found ${count} existing projects in database. Skipping duplicate seed.`);
    } else {
      await Project.insertMany(seedProjects);
      console.log(`✔ Successfully seeded ${seedProjects.length} projects into MongoDB!`);
    }

    await mongoose.disconnect();
    console.log("Done.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();

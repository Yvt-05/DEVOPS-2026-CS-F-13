// ─────────────────────────────────────────────────────────────────────────────
// api/index.js — Vercel Serverless Function wrapping the Express backend
//
// Vercel auto-detects this file and runs it as a serverless function.
// All /api/* requests are routed here via vercel.json rewrites.
// ─────────────────────────────────────────────────────────────────────────────

const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");

// ── Models (inline to avoid CJS path issues in serverless) ──────────────────

const enquirySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    email:       { type: String, required: true, trim: true, lowercase: true },
    phone:       { type: String, trim: true, default: "" },
    projectType: { type: String, default: "Residential" },
    location:    { type: String, trim: true, default: "" },
    budget:      { type: String, default: "" },
    message:     { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

const Enquiry = mongoose.models.Enquiry || mongoose.model("Enquiry", enquirySchema);

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
  { timestamps: true }
);

const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);

// ── Fallback project data (no MongoDB required) ────────────────────────────

const fallbackProjects = [
  { id: 1, title: "The Aria Residences", location: "Jaipur, Rajasthan", type: "Residential", year: "2024", status: "Completed", description: "A contemporary residential development focused on modern architecture and functional living." },
  { id: 2, title: "Vertex Commercial Centre", location: "Jaipur, Rajasthan", type: "Commercial", year: "2023", status: "Completed", description: "A modern commercial development designed to meet the demands of contemporary business." },
  { id: 3, title: "Horizon Villa", location: "Dholpur, Rajasthan", type: "Luxury Residential", year: "2025", status: "Completed", description: "A luxury villa that blends a minimal architectural language with natural materials." },
  { id: 4, title: "Shivakriti Grand Complex", location: "Jaipur, Rajasthan", type: "Mixed-Use", year: "2025", status: "In Progress", description: "Signature mixed-use development combining luxury retail and premium corporate suites." },
  { id: 5, title: "Palm Grove Estate", location: "Jaipur, Rajasthan", type: "Residential", year: "2024", status: "Completed", description: "Exclusive gated enclave featuring custom structural residences." }
];

// ── MongoDB connection (cached across warm invocations) ─────────────────────

let dbConnected = false;

async function connectDB() {
  if (dbConnected || !process.env.MONGO_URI) return;
  if (mongoose.connection.readyState === 1) { dbConnected = true; return; }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
      bufferCommands: false,
    });
    dbConnected = true;
  } catch (err) {
    console.warn("MongoDB offline — running in standalone mode:", err.message);
  }
}

// ── Nodemailer helper ──────────────────────────────────────────────────────

function createTransporter() {
  const nodemailer = require("nodemailer");
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

// ── Express App ────────────────────────────────────────────────────────────

const app = express();

app.use(cors());
app.use(express.json());

// Root endpoint
app.get("/api", (req, res) => {
  res.json({
    status: "ok",
    service: "Shivakriti Constructions REST API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      projects: "/api/projects",
      enquiries: "/api/enquiries [POST]",
    }
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Shivakriti Constructions API" });
});

// GET /api/projects
app.get("/api/projects", async (req, res) => {
  await connectDB();
  try {
    if (mongoose.connection.readyState === 1) {
      const projects = await Project.find().sort({ createdAt: -1 });
      if (projects && projects.length > 0) return res.json(projects);
    }
    return res.json(fallbackProjects);
  } catch (err) {
    res.json(fallbackProjects);
  }
});

// GET /api/projects/:id
app.get("/api/projects/:id", async (req, res) => {
  await connectDB();
  try {
    if (mongoose.connection.readyState === 1) {
      const project = await Project.findById(req.params.id);
      if (project) return res.json(project);
    }
    const fb = fallbackProjects.find(p => String(p.id) === String(req.params.id));
    if (fb) return res.json(fb);
    return res.status(404).json({ error: "Project not found." });
  } catch (err) {
    const fb = fallbackProjects.find(p => String(p.id) === String(req.params.id));
    if (fb) return res.json(fb);
    res.status(404).json({ error: "Project not found." });
  }
});

// POST /api/enquiries
app.post("/api/enquiries", async (req, res) => {
  await connectDB();
  try {
    const { name, email, phone, projectType, location, budget, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required." });
    }

    let enquiryId = "enq-" + Date.now();
    if (mongoose.connection.readyState === 1) {
      const enquiry = new Enquiry({ name, email, phone, projectType, location, budget, message });
      await enquiry.save();
      enquiryId = enquiry._id;
    } else {
      console.log("[Info] MongoDB offline - enquiry processed in standalone mode");
    }

    // Send email if SMTP configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = createTransporter();
        const enquiryDetails = `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\nProject Type: ${projectType}\nLocation: ${location || "Not provided"}\nBudget: ${budget || "Not specified"}\n\nMessage:\n${message}`;
        await transporter.sendMail({
          from:    `"Shivakriti Website" <${process.env.SMTP_USER}>`,
          to:      process.env.COMPANY_EMAIL || process.env.SMTP_USER,
          subject: `New Enquiry from ${name} - ${projectType}`,
          text:    `You have received a new project enquiry.\n\n${enquiryDetails}`,
        });
        await transporter.sendMail({
          from:    `"Shivakriti Constructions" <${process.env.SMTP_USER}>`,
          to:      email,
          subject: "We've received your enquiry - Shivakriti Constructions",
          text:    `Dear ${name},\n\nThank you for reaching out. We have received your enquiry and will get back to you within 24 hours.\n\nYour Enquiry Details:\n${enquiryDetails}\n\nWarm regards,\nShivakriti Constructions`,
        });
      } catch (emailErr) {
        console.error("Email send failed:", emailErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Enquiry received. We will contact you shortly.",
      id: enquiryId,
    });
  } catch (err) {
    console.error("Error saving enquiry:", err.message);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// GET /api/enquiries
app.get("/api/enquiries", async (req, res) => {
  await connectDB();
  try {
    if (mongoose.connection.readyState === 1) {
      const enquiries = await Enquiry.find().sort({ createdAt: -1 });
      return res.json(enquiries);
    }
    return res.json([]);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = app;

// ─────────────────────────────────────────────────────────────────────────────
// server.js — Shivakriti Constructions Express backend
//
// Start:  node server.js
// Dev:    nodemon server.js
//
// Required environment variables (create a server/.env file):
//   MONGO_URI   — MongoDB connection string
//   PORT        — Port to listen on (default: 5000)
// ─────────────────────────────────────────────────────────────────────────────

const express   = require("express");
const mongoose  = require("mongoose");
const cors      = require("cors");
const dotenv    = require("dotenv");

const projectRoutes  = require("./routes/projectRoutes");
const enquiryRoutes  = require("./routes/enquiryRoutes");

// Load environment variables from server/.env
dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/projects",  projectRoutes);
app.use("/api/enquiries", enquiryRoutes);

// Health check — useful for confirming the server is running
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Shivakriti Constructions API" });
});

// ── MongoDB Connection ─────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

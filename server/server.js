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

const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const dotenv     = require("dotenv");
const client     = require("prom-client");

const projectRoutes  = require("./routes/projectRoutes");
const enquiryRoutes  = require("./routes/enquiryRoutes");

// Load .env file from the server/ directory
dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Prometheus Metrics Setup ─────────────────────────────────────────────────
// Collect default Node.js metrics (CPU, memory, event loop, etc.)
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom counters
const httpRequestCounter = new client.Counter({
  name:    "http_requests_total",
  help:    "Total number of HTTP requests received",
  labelNames: ["method", "route", "status"],
  registers: [register],
});

const httpErrorCounter = new client.Counter({
  name:    "http_errors_total",
  help:    "Total number of HTTP errors (status >= 400)",
  labelNames: ["method", "route", "status"],
  registers: [register],
});

const httpDurationHistogram = new client.Histogram({
  name:    "http_request_duration_seconds",
  help:    "HTTP request duration in seconds",
  labelNames: ["method", "route"],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

// Middleware that tracks every request
app.use((req, res, next) => {
  const end = httpDurationHistogram.startTimer({ method: req.method, route: req.path });

  res.on("finish", () => {
    httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
    if (res.statusCode >= 400) {
      httpErrorCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
    }
    end();
  });

  next();
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/projects",  projectRoutes);
app.use("/api/enquiries", enquiryRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Shivakriti Constructions API" });
});

// Prometheus metrics endpoint — scraped by Prometheus
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// ── MongoDB Connection ────────────────────────────────────────────────────────
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

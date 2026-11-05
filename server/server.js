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
const client    = require("prom-client");

const projectRoutes  = require("./routes/projectRoutes");
const enquiryRoutes  = require("./routes/enquiryRoutes");

// Load environment variables from server/.env
dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Prometheus Metrics Setup ───────────────────────────────────────────────────
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: "shivakriti_" });

const httpRequestDuration = new client.Histogram({
  name: "shivakriti_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5]
});

const httpRequestsTotal = new client.Counter({
  name: "shivakriti_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"]
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Track HTTP metrics for every request
app.use((req, res, next) => {
  const start = process.hrtime();
  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds + nanoseconds / 1e9;
    const route = req.route ? req.route.path : req.path;
    httpRequestDuration.labels(req.method, route, res.statusCode).observe(duration);
    httpRequestsTotal.labels(req.method, route, res.statusCode).inc();
  });
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/projects",  projectRoutes);
app.use("/api/enquiries", enquiryRoutes);

// Root endpoint - API service overview
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Shivakriti Constructions REST API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      projects: "/api/projects",
      enquiries: "/api/enquiries [POST]",
      metrics: "/metrics"
    }
  });
});

// Health check — useful for confirming the server is running
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Shivakriti Constructions API" });
});

// Prometheus scraping endpoint
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// ── Server & MongoDB Initialization ───────────────────────────────────────────
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 })
    .then(() => {
      console.log("✅ MongoDB connected");
    })
    .catch((err) => {
      console.warn("⚠️ MongoDB offline — running API in standalone mode:", err.message);
    });
} else {
  console.log("ℹ️ No MONGO_URI configured — running API in standalone mode");
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

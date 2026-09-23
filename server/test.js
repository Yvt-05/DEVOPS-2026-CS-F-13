/*
  Backend Health & Schema Integrity Test
  ──────────────────────────────────────
  Verifies Mongoose models and Express router exports.
  Executes as part of CI/CD to prevent deployment regressions.
*/

const assert = require("assert");
const Enquiry = require("./models/Enquiry");
const Project = require("./models/Project");
const enquiryRoutes = require("./routes/enquiryRoutes");
const projectRoutes = require("./routes/projectRoutes");

console.log("Running backend verification checks...\n");

// 1. Verify Enquiry schema fields
const enquiryPaths = Enquiry.schema.paths;
assert(enquiryPaths.name, "Enquiry model must have 'name' field");
assert(enquiryPaths.email, "Enquiry model must have 'email' field");
assert(enquiryPaths.message, "Enquiry model must have 'message' field");
assert(enquiryPaths.status, "Enquiry model must have 'status' field");
console.log("✔ Enquiry schema validated (required paths present)");

// 2. Verify Project schema fields
const projectPaths = Project.schema.paths;
assert(projectPaths.title, "Project model must have 'title' field");
assert(projectPaths.location, "Project model must have 'location' field");
assert(projectPaths.type, "Project model must have 'type' field");
assert(projectPaths.year, "Project model must have 'year' field");
assert(projectPaths.gallery, "Project model must have 'gallery' field");
console.log("✔ Project schema validated (required paths present)");

// 3. Verify Express routers
assert(typeof enquiryRoutes === "function", "enquiryRoutes must export an Express router");
assert(typeof projectRoutes === "function", "projectRoutes must export an Express router");
console.log("✔ Express routers exported correctly");

console.log("\nAll backend checks passed successfully! (3/3)");
process.exit(0);

const Project = require("../models/Project");

/*
  Project Controller
  ──────────────────
  Handles HTTP request logic for the /api/projects route.
*/

// GET /api/projects — return all projects
async function getAllProjects(req, res) {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
}

// GET /api/projects/:id — return one project by its MongoDB _id
async function getProjectById(req, res) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
}

module.exports = { getAllProjects, getProjectById };

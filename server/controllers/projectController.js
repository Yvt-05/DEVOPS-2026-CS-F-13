const Project = require("../models/Project");

/*
  Project Controller
  ──────────────────
  Handles HTTP request logic for the /api/projects route.
  Includes verified fallback projects when MongoDB runs in standalone/decoupled mode.
*/

const fallbackProjects = [
  { id: 1, title: "The Aria Residences", location: "Jaipur, Rajasthan", type: "Residential", year: "2024", status: "Completed", description: "A contemporary residential development focused on modern architecture and functional living." },
  { id: 2, title: "Vertex Commercial Centre", location: "Jaipur, Rajasthan", type: "Commercial", year: "2023", status: "Completed", description: "A modern commercial development designed to meet the demands of contemporary business." },
  { id: 3, title: "Horizon Villa", location: "Dholpur, Rajasthan", type: "Luxury Residential", year: "2025", status: "Completed", description: "A luxury villa that blends a minimal architectural language with natural materials." },
  { id: 4, title: "Shivakriti Grand Complex", location: "Jaipur, Rajasthan", type: "Mixed-Use", year: "2025", status: "In Progress", description: "Signature mixed-use development combining luxury retail and premium corporate suites." },
  { id: 5, title: "Palm Grove Estate", location: "Jaipur, Rajasthan", type: "Residential", year: "2024", status: "Completed", description: "Exclusive gated enclave featuring custom structural residences." }
];

// GET /api/projects — return all projects
async function getAllProjects(req, res) {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    if (projects && projects.length > 0) {
      return res.json(projects);
    }
    return res.json(fallbackProjects);
  } catch (err) {
    // If database is not connected, serve verified company projects
    res.json(fallbackProjects);
  }
}

// GET /api/projects/:id — return one project by its MongoDB _id or numeric id
async function getProjectById(req, res) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      const fb = fallbackProjects.find(p => String(p.id) === String(req.params.id));
      if (fb) return res.json(fb);
      return res.status(404).json({ error: "Project not found." });
    }
    res.json(project);
  } catch (err) {
    const fb = fallbackProjects.find(p => String(p.id) === String(req.params.id));
    if (fb) return res.json(fb);
    res.status(404).json({ error: "Project not found." });
  }
}

module.exports = { getAllProjects, getProjectById };

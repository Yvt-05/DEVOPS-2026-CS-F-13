const express = require("express");
const { getAllProjects, getProjectById } = require("../controllers/projectController");

const router = express.Router();

// GET /api/projects — list all projects
router.get("/", getAllProjects);

// GET /api/projects/:id — get one project by MongoDB _id
router.get("/:id", getProjectById);

module.exports = router;

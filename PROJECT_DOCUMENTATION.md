# Shivakriti Constructions — Project Documentation

## 1. Project Overview
**Shivakriti Constructions** is a modern, responsive portfolio website and enquiry management system designed for a construction and architectural firm. It provides an immersive showcase of completed and ongoing architectural projects, interactive 3D visualizations, detailed project case studies, client enquiry processing, and an automated continuous integration pipeline.

---

## 2. Key Features

- **Responsive Architecture & Design:** Built with a dark architectural theme, fluid typography, and scroll-reveal interactions using native CSS keyframes and IntersectionObserver.
- **Interactive 3D Architectural Scene:** Three.js-powered WebGL canvas in the hero section illustrating structural progression across construction phases, featuring smooth mouse parallax and scroll-linked depth.
- **Comprehensive Project Showcase:** Editorial layouts for residential, commercial, luxury, and mixed-use projects, including high-resolution imagery and case study specifications.
- **On-Site Documentation Archive:** Dedicated gallery cataloging field construction photography, structural framing, and on-site works.
- **Before/After Transformation Slider:** Interactive comparison component allowing side-by-side inspection of construction stages and completed structures.
- **Smart Visitor Engagement:** Non-intrusive contextual prompt triggering after genuine visitor interaction thresholds (time on site, pages visited, scroll depth).
- **Client Enquiry Management:** Contact form connected to an Express.js REST API with input validation, MongoDB persistence, and automatic notification emails via Nodemailer.
- **Automated Testing & CI:** Comprehensive unit and schema validation suites executed automatically via a Jenkins CI pipeline and GitHub Actions.

---

## 3. Technology Stack

### Frontend
- **React 19:** Component-based UI architecture.
- **Vite 7:** Fast build tool and development server with Rollup chunk splitting.
- **Tailwind CSS v4:** Modern CSS utility engine using CSS variables and `@theme` configuration.
- **React Router v7:** Client-side routing with automatic scroll restoration.
- **Three.js:** WebGL 3D rendering for the interactive hero model.
- **Vitest:** Unit and integration test runner.

### Backend
- **Node.js (v20+):** Asynchronous JavaScript runtime.
- **Express.js:** Web application framework for RESTful API routes.
- **MongoDB & Mongoose:** Document database and schema modeling for project records and enquiries.
- **Nodemailer:** SMTP email transport for enquiry alerts and client acknowledgments.
- **CORS & Dotenv:** Cross-origin resource sharing and environment variable management.

### DevOps & Automation
- **Jenkins:** Automated CI pipeline verifying dependencies, test suites, and production builds.
- **GitHub Actions:** Scheduled automated progress reports and repository maintenance.

---

## 4. Project Structure

```
├── .github/
│   └── workflows/
│       └── auto_weekly_report.yml    # GitHub Actions weekly report workflow
├── public/
│   └── images/
│       ├── hero/                     # Hero background imagery
│       ├── logo/                     # Official company branding
│       └── projects/                 # Project covers and gallery photos
├── server/
│   ├── controllers/
│   │   ├── enquiryController.js      # Enquiry handling and email triggers
│   │   └── projectController.js      # Project catalog retrieval
│   ├── models/
│   │   ├── Enquiry.js                # Mongoose schema for enquiries
│   │   └── Project.js                # Mongoose schema for projects
│   ├── routes/
│   │   ├── enquiryRoutes.js          # /api/enquiries endpoints
│   │   └── projectRoutes.js          # /api/projects endpoints
│   ├── .env.example                  # Environment configuration template
│   ├── package.json                  # Backend dependencies and scripts
│   ├── seed.js                       # Database seeder for project catalog
│   ├── server.js                     # Express application entrypoint
│   └── test.js                       # Backend schema verification tests
├── src/
│   ├── __tests__/
│   │   ├── contactValidation.test.js # Contact form validation test suite
│   │   └── projects.test.js          # Projects data schema and integrity tests
│   ├── components/
│   │   ├── BeforeAfterSlider.jsx     # Transformation comparison slider
│   │   ├── EngagementPrompt.jsx      # Contextual visitor engagement modal
│   │   ├── Footer.jsx                # Site-wide navigation footer
│   │   ├── Navbar.jsx                # Sticky header with logo and navigation
│   │   └── ThreeHeroScene.jsx        # Three.js 3D architectural model
│   ├── data/
│   │   └── projects.js               # Central project catalog and metadata
│   ├── pages/
│   │   ├── About.jsx                 # Company background, values, and expertise
│   │   ├── Contact.jsx               # Client enquiry form with live API dispatch
│   │   ├── Home.jsx                  # Main landing page with 7 distinct sections
│   │   ├── ProjectDetails.jsx        # Detailed case study with gallery & slider
│   │   └── Projects.jsx              # All projects directory and field archive
│   ├── utils/
│   │   └── validation.js             # Client-side input validation rules
│   ├── App.jsx                       # Root application routing
│   ├── index.css                     # Global styles, animations, and CSS variables
│   └── main.jsx                      # React application mount
├── Jenkinsfile                       # Multi-stage CI pipeline configuration
├── package.json                      # Frontend dependencies, build and test scripts
└── vite.config.js                    # Vite configuration with chunk splitting
```

---

## 5. Installation and Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)
- MongoDB instance (local or MongoDB Atlas connection string)

### 1. Clone the Repository
```bash
git clone https://github.com/Yvt-05/DEVOPS-2026-CS-F-13.git
cd construction-company-website
```

### 2. Frontend Setup
```bash
# Install frontend dependencies
npm install

# Start local development server
npm run dev

# Run frontend test suite
npm run test

# Build for production
npm run build
```

### 3. Backend Setup
```bash
cd server

# Install backend dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and supply your MONGO_URI and SMTP settings

# Seed database with projects (optional)
npm run seed

# Run backend verification tests
npm test

# Start the API server
npm start
# or start with hot-reload
npm run dev
```

---

## 6. Testing

The project incorporates automated testing for both frontend and backend modules to prevent regressions:

### Frontend Tests (Vitest)
Run via `npm run test`:
- `projects.test.js`: Validates catalog consistency, ensuring all 5 projects adhere to the required schema, contain unique IDs, valid image paths, and that the 20-photo on-site archive is fully accessible.
- `contactValidation.test.js`: Verifies client-side form validation logic, email regex correctness, and input constraint handling.

### Backend Verification (`server/test.js`)
Run via `npm test` inside `server/`:
- Validates that Mongoose models (`Enquiry`, `Project`) export all required schema paths and validation constraints.
- Verifies that Express routers (`enquiryRoutes`, `projectRoutes`) are correctly exported and mountable.

---

## 7. CI/CD Pipeline (Jenkins)

The repository includes a declarative `Jenkinsfile` for continuous integration upon each commit or pull request.

### Pipeline Stages
1. **Checkout:** Retrieves the latest source code from the Git repository.
2. **Install Frontend Dependencies:** Executes `npm install` for frontend packages.
3. **Test Frontend:** Runs the Vitest test suite (`npm run test`) to ensure component and data integrity.
4. **Build Frontend:** Runs `npm run build` to compile the optimized production bundle.
5. **Install Backend Dependencies:** Executes `npm install` within the `server/` directory.
6. **Test Backend:** Executes `npm test` within `server/` to verify schemas and routes.
7. **Archive Build:** Archives the compiled `dist/` directory artifacts.

---

## 8. API Information

The Express backend serves the following endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check endpoint returning API service status. |
| `GET` | `/api/projects` | Retrieves all project records from MongoDB. |
| `GET` | `/api/projects/:id` | Retrieves a specific project record by its MongoDB ID. |
| `POST` | `/api/enquiries` | Accepts an enquiry payload, validates fields, persists to MongoDB, and triggers notification emails. |

### Sample Enquiry Payload (`POST /api/enquiries`):
```json
{
  "name": "Arun Verma",
  "email": "arun.verma@example.com",
  "phone": "+91 9876543210",
  "projectType": "Commercial",
  "location": "Jaipur, Rajasthan",
  "budget": "₹1Cr – ₹5 Crore",
  "message": "Inquiry regarding architectural design and structural execution."
}
```

---

## 9. Technical Implementation Highlights

### Three.js Performance & Resource Management
- **Procedural Mesh Groups:** The 3D model is constructed from primitive box geometries and grid lines, minimizing GPU overhead.
- **Lifecycle Cleanup:** The component implements strict teardown logic on unmount: cancels active animation frame requests, detaches window listeners, and calls `WebGLRenderer.dispose()`, eliminating WebGL memory leaks.
- **Rollup Chunk Splitting:** Three.js is separated into an independent vendor chunk (`three-*.js`) via `manualChunks` in `vite.config.js`, enabling long-term browser caching.

### Smart Engagement Logic
The `EngagementPrompt` component evaluates visitor engagement using three non-intrusive heuristics:
1. Active session duration $\ge 45\text{ seconds}$
2. Distinct routes navigated $\ge 2$
3. Page scroll percentage $\ge 60\%$

When all three conditions are satisfied, a styled bottom-right invitation modal appears. A `sessionStorage` flag ensures it is never displayed more than once during a user session.

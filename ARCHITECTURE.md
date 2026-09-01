# HirePrep — System Architecture & Codebase Map

> **Comprehensive Architecture Guide & Project Map for Developers & Evaluators.**

---

## 📊 High-Level Architecture

HirePrep is a production-ready, full-stack recruitment & technical interview preparation platform deployed on **Render (Node.js/Express Backend)** and **Netlify (Vanilla JS/HTML5/CSS3 Frontend)** with **MongoDB Atlas**.

```mermaid
graph TD
    subgraph Netlify_Edge [Netlify Edge Frontend]
        Landing[Landing Page index.html]
        StudentUI[Student Portal /frontend/student/]
        RecruiterUI[Recruiter Suite /frontend/recruiter/]
        AdminUI[Admin Dashboard /frontend/admin/]
        AceIDE[Interactive Ace Code IDE]
        MCQQuiz[MCQ & Aptitude Solver + Retry]
        ThemeEngine[Dark/Light Theme Engine]
        APIClient[Universal API Client /js/api.js]
        Proxy[_redirects /api/* Proxy]
    end

    subgraph Render_Backend [Render Cloud Backend (Node.js + Express)]
        Server[server.js & CORS]
        AuthGuard[JWT & Admin Secret Key Auth]
        MatchEngine[AI Fuzzy Skill & Candidate Matcher]
        Routes[API Routes: Auth, Jobs, Apps, Admin, Prep]
        NotificationHub[Universal Notification Dispatcher]
        Logger[Activity & Audit Logger]
    end

    subgraph Database [MongoDB Atlas Cluster]
        Users[(Users & Roles)]
        Profiles[(StudentProfiles & Skills)]
        Jobs[(Jobs & Requirements)]
        Apps[(Applications & Match %)]
        Companies[(Companies & Verification)]
        Prep[(PreparationRoadmaps)]
        Notifs[(Notifications & Logs)]
    end

    StudentUI --> APIClient
    RecruiterUI --> APIClient
    AdminUI --> APIClient
    APIClient --> Proxy
    Proxy -->|HTTPS| Server
    Server --> AuthGuard
    AuthGuard --> Routes
    Routes --> MatchEngine
    Routes --> NotificationHub
    Routes --> Logger
    Routes --> Users & Profiles & Jobs & Apps & Companies & Prep & Notifs
```

---

## 👥 Team & Module Ownership

| Member | Role | Primary Modules & Contributions |
| :--- | :--- | :--- |
| **Suraj Kumar** | Backend, API, Auth & Integration Lead | Express REST APIs, MongoDB Atlas schemas & models, JWT & Google OAuth security, Fuzzy skill matching engine, Render + Netlify cloud deployment & integration |
| **Sunny Kumar** | Admin Module Lead | Admin Dashboard (17 sections), User Management & Role controls, Company verification workflow, Question Bank CMS, CSV reports export, Site health monitoring |
| **Shikha Chaurasia** | Recruiter Module Lead | Recruiter Dashboard & Auth, Job Posting & Management, Applicant Pipeline & AI Ranking, Interview Scheduling Desk (Google Meet), Company Profile |
| **Reenu Yadav** | Student/User Module Lead | Student Dashboard & Profile, Job Browsing & Match scoring, 630+ Practice Hub (Ace Code IDE & MCQ Retry), Timed Mock Tests, Career Roadmap, Interactive Resume Builder (PDF) |

---

## 📂 Directory Structure & File Map

### 1. Root Files
- `index.html`: Main landing page with interactive practice overview, live stats, and dynamic role-based navigation.
- `team.html`: Team profiles and module contribution showcase.
- `docs.html`: System architecture, database schema, API reference, and algorithm documentation.
- `netlify.toml` & `_redirects`: Netlify Edge proxy rules forwarding `/api/*` requests to the Render backend.
- `render.yaml`: Render blueprint for automated zero-downtime backend deployment.

### 2. Frontend Subsystems (`/frontend/`)
- **`frontend/auth.html`**: Unified authentication with role selection (`student`, `recruiter`, `admin`), Google OAuth login, and Admin Secret Key verification.
- **`frontend/student/`**:
  - `student-dashboard.html`: Student home with in-progress practice resume banner and recommended jobs.
  - `practice.html`: 630+ problem practice hub (Coding, Technical MCQs, Aptitude) with solved badges and filters.
  - `question-detail.html`: Ace Code Editor IDE with real-time debounced autosave, multi-language support (Python, JS, Java, C++), and test runner.
  - `mcq-detail.html`: Interactive MCQ solver with instant retry on wrong answers, status badge recalibration, and progress tracking.
  - `student-profile.html`: Profile management with skills rating and experience history.
  - `resume-builder.html`: Live interactive resume builder with PDF export.
  - `preparation.html`: Company hiring roadmaps and pattern guides.
- **`frontend/recruiter/`**:
  - `recruiter-dashboard.html`: Recruiter portal with active job management and pipeline statistics.
  - `post-job.html`: Job creation wizard with required skill tags and salary parameters.
  - `applicant-list.html`: AI-ranked applicant table with match score pills.
  - `interview-schedule.html`: Recruiter interview scheduler with Google Meet link generation.
- **`frontend/admin/`**:
  - `admin-dashboard.html`: Admin panel with analytics, company verification, user manager, full Question Content CMS CRUD, interactive platform settings toggles, and live backend connection tester.

### 3. Core JavaScript Logic (`/js/`)
- `js/api.js`: Universal API client wrapper with token caching, custom backend URL overrides, and normalized response parsing.
- `js/admin.js`: Full admin logic, Question CMS CRUD, and platform settings.
- `js/practice.js`: Problem filtering, solved status tracking, and "Resume where you left off" handler.
- `js/nav-auth.js`: Universal dynamic navbar updater based on JWT role.
- `js/theme.js`: Dark/Light theme toggle engine with persistent state.

### 4. Backend Services (`/server/`)
- `server/server.js`: Express server setup, CORS configuration, and route registration.
- `server/routes/`:
  - `auth.js`: Registration, login, Google OAuth, and JWT generation.
  - `jobs.js`: Job postings, search filters, and application submission with real-time match scoring.
  - `applications.js`: Applicant retrieval, status advancement, and recruiter review.
  - `admin.js`: System metrics, company verification, question bank CRUD, and CSV exports.
  - `preparation.js`: Company prep paths and hiring roadmaps.
  - `notifications.js`: In-app notification creation and mark-as-read endpoints.
- `server/models/`:
  - `User.js`, `StudentProfile.js`, `Job.js`, `Application.js`, `Company.js`, `PreparationPath.js`, `Notification.js`, `ActivityLog.js`.

# Team Module Ownership Map

> This document defines the exact ownership of every important source file in the HirePreparation project. Each file has one owner (or is marked SHARED with a coordinator).

**Repository:** https://github.com/Suraj09871/HirePreparation

---

## Branch Assignments

| Developer | Branch | Module |
|-----------|--------|--------|
| Suraj | `suraj-backend-integration` | Backend, API, Auth, Integration & Deployment |
| Sunny | `sunny-admin` | Admin Module |
| Shikha | `shikha-recruiter` | Recruiter Module |
| Reenu | `reenu-student` | Student/User Module |

---

## SURAJ — Backend, API, Authentication, Integration & Deployment

> **Branch:** `suraj-backend-integration`
> **Role:** Coordinator for all shared files. Owns all backend code and deployment config.

### Backend Core

| File | Owner | Reason | Dependencies |
|------|-------|--------|-------------|
| `server/server.js` | Suraj | Express entry point, CORS, Helmet, route registration, auto-seed | All routes, all models, config/db.js |
| `server/config/db.js` | Suraj | MongoDB/Mongoose connection handler | mongoose, MONGODB_URI env var |
| `server/middleware/auth.js` | Suraj | JWT auth middleware & RBAC roleCheck() | models/User.js, JWT_SECRET env var |
| `server/seed.js` | Suraj | Database seeding script for demo data | All models |
| `server/package.json` | Suraj | Server dependencies manifest | — |
| `server/.env.example` | Suraj | Environment variable template | — |
| `server/utils/logger.js` | Suraj | Activity logging utility | models/ActivityLog.js |
| `server/utils/matchingAlgorithm.js` | Suraj | Candidate matching & scoring engine | Pure computation, no dependencies |

### Mongoose Models

| File | Owner | Reason | Used By |
|------|-------|--------|---------|
| `server/models/User.js` | Suraj | Foundation user model (all roles) | All routes |
| `server/models/Company.js` | Suraj | Company schema with verification | routes/companies.js, routes/admin.js |
| `server/models/Job.js` | Suraj | Job posting schema | routes/jobs.js, routes/applications.js |
| `server/models/Application.js` | Suraj | Application with matching metrics | routes/applications.js |
| `server/models/Resume.js` | Suraj | Resume builder data schema | routes/resume.js |
| `server/models/StudentProfile.js` | Suraj | Student profile schema | routes/profile.js, routes/applications.js |
| `server/models/Notification.js` | Suraj | Notification schema | routes/notifications.js, many routes |
| `server/models/ActivityLog.js` | Suraj | Audit log schema | utils/logger.js, routes/admin.js |
| `server/models/PreparationPath.js` | Suraj | Interview prep roadmap schema | routes/preparation.js, routes/admin.js |

### Backend Routes

| File | Owner | Endpoints | Primary Consumer |
|------|-------|-----------|-----------------|
| `server/routes/auth.js` | Suraj | 8 endpoints | All modules |
| `server/routes/admin.js` | Suraj | 27 endpoints | Sunny (admin frontend) |
| `server/routes/jobs.js` | Suraj | 6 endpoints | Shikha + Reenu |
| `server/routes/companies.js` | Suraj | 5 endpoints | Shikha |
| `server/routes/applications.js` | Suraj | 17 endpoints | Shikha + Reenu |
| `server/routes/notifications.js` | Suraj | 5 endpoints | All modules |
| `server/routes/preparation.js` | Suraj | 4 endpoints | Reenu |
| `server/routes/profile.js` | Suraj | 8 endpoints | Reenu |
| `server/routes/resume.js` | Suraj | 3 endpoints | Reenu |

### Deployment & Configuration

| File | Owner | Reason |
|------|-------|--------|
| `render.yaml` | Suraj | Render backend deployment blueprint |
| `netlify.toml` | Suraj | Netlify frontend config + API proxy |
| `_redirects` | Suraj | Netlify redirect rules |
| `package.json` | Suraj | Root project manifest |
| `.gitignore` | Suraj | Git exclusion rules |

### Shared Frontend (Suraj Coordinates)

| File | Owner | Reason | Modify? |
|------|-------|--------|---------|
| `js/api.js` | SHARED (Suraj coordinates) | Universal API client — ALL modules | Only Suraj |
| `js/nav-auth.js` | SHARED (Suraj coordinates) | Dynamic navbar — ALL authenticated pages | Only Suraj |
| `js/theme.js` | SHARED (Suraj coordinates) | Dark/light theme — ALL pages | Only Suraj |
| `js/sanitize.js` | SHARED (Suraj coordinates) | XSS protection — ALL pages | Only Suraj |
| `js/auth.js` | SHARED (Suraj coordinates) | Auth page logic | Only Suraj |
| `js/unified-auth.js` | SHARED (Suraj coordinates) | Extended auth with OTP + Google OAuth | Only Suraj |
| `js/app.js` | SHARED (Suraj coordinates) | Landing page logic | Only Suraj |
| `js/supabaseClient.js` | Suraj | Unused placeholder | — |
| `css/style.css` | SHARED (Suraj coordinates) | Global stylesheet — ALL pages | Coordinate with Suraj |
| `index.html` | SHARED (Suraj coordinates) | Landing page | Only Suraj |
| `team.html` | SHARED (Suraj coordinates) | Team showcase | Only Suraj |
| `docs.html` | SHARED (Suraj coordinates) | Architecture docs | Only Suraj |
| `frontend/auth.html` | SHARED (Suraj coordinates) | Unified auth page | Only Suraj |

### Data & Documentation

| File | Owner | Reason |
|------|-------|--------|
| `data/questions.json` | SHARED (Suraj coordinates) | Question bank (510KB) — student practice + admin CMS |
| `data/*.js` | Suraj | Question generation scripts |
| `scripts/fetch_questions.js` | Suraj | Question fetch utility |
| `ARCHITECTURE.md` | Suraj | Architecture documentation |
| `docs/*.md` | Suraj | All project documentation |
| `assets/logo.png` | SHARED | Project logo |
| `images/logo.png` | SHARED | Project logo |

---

## SUNNY — Admin Module

> **Branch:** `sunny-admin`
> **4 files owned**

| File | Owner | Reason | Dependencies |
|------|-------|--------|-------------|
| `frontend/admin/admin-dashboard.html` | Sunny | Admin dashboard with 17 sidebar sections | js/admin.js, js/api.js, js/theme.js, js/sanitize.js, css/style.css, Chart.js CDN |
| `frontend/admin/admin-panel.html` | Sunny | Compact admin CMS panel | js/admin-panel.js, js/api.js, js/nav-auth.js, js/theme.js, js/sanitize.js, css/style.css, Chart.js CDN |
| `js/admin.js` | Sunny | Full admin logic (222KB) | js/api.js, js/nav-auth.js, js/theme.js |
| `js/admin-panel.js` | Sunny | Admin panel page logic | js/api.js, js/nav-auth.js |

---

## SHIKHA — Recruiter Module

> **Branch:** `shikha-recruiter`
> **7 files owned**

| File | Owner | Reason | Dependencies |
|------|-------|--------|-------------|
| `frontend/recruiter/recruiter-auth.html` | Shikha | Recruiter onboarding & auth wizard | js/api.js, js/theme.js, js/sanitize.js, css/style.css, Google Sign-In CDN |
| `frontend/recruiter/recruiter-dashboard.html` | Shikha | Main recruiter operations hub | js/recruiter-dashboard.js, js/api.js, js/theme.js, js/sanitize.js, css/style.css, Chart.js CDN |
| `frontend/recruiter/job-posting.html` | Shikha | Job creation form | js/job-posting.js, js/api.js, js/nav-auth.js, js/theme.js, js/sanitize.js, css/style.css |
| `frontend/recruiter/applicant-list.html` | Shikha | Candidate ranking & tracking | js/applicant-list.js, js/api.js, js/nav-auth.js, js/theme.js, js/sanitize.js, css/style.css |
| `js/recruiter-dashboard.js` | Shikha | Full recruiter logic (125KB) | js/api.js, js/nav-auth.js, js/theme.js |
| `js/job-posting.js` | Shikha | Job posting handler | js/api.js, js/nav-auth.js |
| `js/applicant-list.js` | Shikha | Applicant listing logic | js/api.js, js/nav-auth.js |

---

## REENU — Student/User Module

> **Branch:** `reenu-student`
> **25 files owned**

### HTML Pages (14 files)

| File | Owner | Reason | Dependencies |
|------|-------|--------|-------------|
| `frontend/student/student-auth.html` | Reenu | Student login & registration | js/auth.js, js/api.js, js/sanitize.js, css/style.css, Google Sign-In CDN |
| `frontend/student/student-dashboard.html` | Reenu | Student hub with stats | js/student-dashboard.js, js/api.js, js/theme.js, js/sanitize.js, css/style.css, Chart.js CDN |
| `frontend/student/student-profile.html` | Reenu | Profile management | js/student-profile.js, js/api.js, js/nav-auth.js, js/theme.js, js/sanitize.js, css/style.css |
| `frontend/student/student-activity.html` | Reenu | Activity & audit summary | js/theme.js, css/style.css |
| `frontend/student/jobs.html` | Reenu | Job search & application | js/jobs.js, js/api.js, js/nav-auth.js, js/theme.js, js/sanitize.js, css/style.css |
| `frontend/student/match-result.html` | Reenu | Match score breakdown | js/match-result.js, js/api.js, js/nav-auth.js, js/theme.js, js/sanitize.js, css/style.css |
| `frontend/student/preparation.html` | Reenu | Company prep paths | js/preparation.js, js/api.js, js/nav-auth.js, js/theme.js, js/sanitize.js, css/style.css |
| `frontend/student/practice.html` | Reenu | 630+ problem practice hub | js/practice.js, js/api.js, js/nav-auth.js, js/theme.js, js/sanitize.js, css/style.css |
| `frontend/student/mcq-quiz.html` | Reenu | MCQ quiz with timer | js/mcq-quiz.js, js/api.js, js/theme.js, js/sanitize.js, css/style.css, Chart.js CDN |
| `frontend/student/mcq-detail.html` | Reenu | MCQ solver with retry | js/api.js, js/theme.js, js/sanitize.js, css/style.css, data/questions.json |
| `frontend/student/mock-test.html` | Reenu | Full mock test platform | js/mock-test.js, js/api.js, js/theme.js, js/sanitize.js, css/style.css |
| `frontend/student/roadmap.html` | Reenu | 5-step career roadmap | js/roadmap.js, js/api.js, js/unified-auth.js, js/theme.js, js/sanitize.js, css/style.css |
| `frontend/student/question-detail.html` | Reenu | Coding IDE with Ace Editor | js/question-detail.js, js/api.js, js/nav-auth.js, js/theme.js, js/sanitize.js, css/style.css, Ace Editor CDN, data/questions.json |
| `frontend/student/resume-builder.html` | Reenu | Resume builder + PDF export | js/resume-builder.js, js/api.js, js/nav-auth.js, js/theme.js, js/sanitize.js, css/style.css, PDF.js CDN, Mammoth.js CDN |

### JavaScript Files (11 files)

| File | Owner | Reason | Dependencies |
|------|-------|--------|-------------|
| `js/student-dashboard.js` | Reenu | Dashboard logic | js/api.js, js/nav-auth.js, js/theme.js |
| `js/student-profile.js` | Reenu | Profile management | js/api.js, js/nav-auth.js |
| `js/jobs.js` | Reenu | Job browsing & application | js/api.js, js/nav-auth.js |
| `js/match-result.js` | Reenu | Match result display | js/api.js, js/nav-auth.js |
| `js/preparation.js` | Reenu | Preparation paths logic | js/api.js, js/nav-auth.js |
| `js/practice.js` | Reenu | Practice hub logic | js/api.js, js/nav-auth.js |
| `js/mcq-quiz.js` | Reenu | MCQ quiz engine | js/api.js, js/nav-auth.js |
| `js/mock-test.js` | Reenu | Mock test engine | js/api.js, js/nav-auth.js |
| `js/roadmap.js` | Reenu | Roadmap tracker | js/api.js, js/nav-auth.js |
| `js/question-detail.js` | Reenu | Question detail + code editor | js/api.js, js/nav-auth.js |
| `js/resume-builder.js` | Reenu | Resume builder logic (68KB) | js/api.js, js/nav-auth.js |

---

## Summary

| Developer | Files Owned | Module |
|-----------|------------|--------|
| **Suraj** | ~45+ | Backend + Shared + Deployment |
| **Sunny** | 4 | Admin frontend |
| **Shikha** | 7 | Recruiter frontend |
| **Reenu** | 25 | Student frontend |
| **SHARED** | 13 | Cross-module (Suraj coordinates) |

> **Rule:** No developer should modify files outside their ownership without coordinating with the owner and Suraj (integration lead).

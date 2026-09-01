# Suraj — Backend, API, Authentication, Integration & Deployment

## Role
Backend development, REST APIs, MongoDB/database integration, authentication/authorization, JWT, shared API infrastructure, security utilities, backend middleware, deployment configuration, final integration, and coordination of shared/global files.

## Git Branch
`suraj-backend-integration`

## Your Files (FULL OWNERSHIP)

### Backend Core
- `server/server.js` — Express entry point, CORS, Helmet, route registration, auto-seed logic
- `server/config/db.js` — MongoDB/Mongoose connection handler
- `server/middleware/auth.js` — JWT authentication middleware & RBAC roleCheck()
- `server/seed.js` — Database seeding script for demo data
- `server/package.json` — Server-side package manifest
- `server/.env.example` — Environment variable template
- `server/utils/logger.js` — Activity logging utility (ActivityLog model)
- `server/utils/matchingAlgorithm.js` — Candidate matching & scoring engine

### All Mongoose Models
- `server/models/User.js` — User schema (student, recruiter, admin, sub-admin roles)
- `server/models/Company.js` — Company schema with verification workflow
- `server/models/Job.js` — Job posting schema
- `server/models/Application.js` — Application with matching metrics & interview data
- `server/models/Resume.js` — Resume builder data schema
- `server/models/StudentProfile.js` — Student profile with skills, education, projects
- `server/models/Notification.js` — In-app notification schema
- `server/models/ActivityLog.js` — Audit log schema
- `server/models/PreparationPath.js` — Interview prep roadmap schema

### All Backend Routes
- `server/routes/auth.js` — 8 endpoints: register, login, Google OAuth, admin login, OTP, /me
- `server/routes/admin.js` — 27 admin endpoints: stats, analytics, users, companies, jobs, applications, questions CMS, exports, health
- `server/routes/jobs.js` — 6 endpoints: job CRUD, search, recruiter jobs
- `server/routes/companies.js` — 5 endpoints: company profile, verification, directory
- `server/routes/applications.js` — 17 endpoints: apply, preview match, pipeline, interviews, compare, export
- `server/routes/notifications.js` — 5 endpoints: fetch, unread count, mark read, broadcast
- `server/routes/preparation.js` — 4 endpoints: list paths, get by ID/company, sample questions
- `server/routes/profile.js` — 8 endpoints: profile CRUD, skills, projects, resume upload
- `server/routes/resume.js` — 3 endpoints: resume builder CRUD

### Deployment & Configuration
- `render.yaml` — Render backend deployment blueprint
- `netlify.toml` — Netlify frontend config + API proxy rules
- `_redirects` — Netlify redirect rules
- `package.json` — Root project manifest
- `.gitignore` — Git exclusion rules

### Shared Frontend Files (COORDINATOR — do not let others modify without approval)
- `js/api.js` — Universal API client wrapper
- `js/nav-auth.js` — Dynamic navbar builder with notifications
- `js/theme.js` — Dark/light theme toggle engine
- `js/sanitize.js` — HTML sanitization utility
- `js/auth.js` — Auth page logic
- `js/unified-auth.js` — Extended auth with OTP + Google OAuth
- `js/app.js` — Landing page logic
- `js/supabaseClient.js` — Unused placeholder
- `css/style.css` — Global stylesheet
- `index.html` — Landing page
- `team.html` — Team showcase
- `docs.html` — Architecture documentation
- `frontend/auth.html` — Unified auth page

### Data & Documentation
- `data/questions.json` — Question bank (510KB)
- `data/*.js` — Question generation scripts
- `scripts/fetch_questions.js` — Question fetch utility
- `ARCHITECTURE.md` — Architecture documentation
- `docs/*.md` — All project documentation

## Files You Must NOT Modify
- `frontend/admin/admin-dashboard.html` — Sunny's file
- `frontend/admin/admin-panel.html` — Sunny's file
- `js/admin.js` — Sunny's file
- `js/admin-panel.js` — Sunny's file
- `frontend/recruiter/*.html` — Shikha's files
- `js/recruiter-dashboard.js` — Shikha's file
- `js/job-posting.js` — Shikha's file
- `js/applicant-list.js` — Shikha's file
- `frontend/student/*.html` — Reenu's files
- `js/student-dashboard.js` — Reenu's file
- `js/student-profile.js` — Reenu's file
- `js/jobs.js` — Reenu's file
- `js/match-result.js` — Reenu's file
- `js/preparation.js` — Reenu's file
- `js/practice.js` — Reenu's file
- `js/mcq-quiz.js` — Reenu's file
- `js/mock-test.js` — Reenu's file
- `js/roadmap.js` — Reenu's file
- `js/question-detail.js` — Reenu's file
- `js/resume-builder.js` — Reenu's file

## Shared Files You Coordinate
As integration lead, you are responsible for reviewing and approving any changes to shared files. Other developers must create a Pull Request or discuss with you before modifying:
- `js/api.js`, `js/nav-auth.js`, `js/theme.js`, `js/sanitize.js`
- `css/style.css`
- `index.html`, `team.html`, `docs.html`, `frontend/auth.html`
- `data/questions.json`

## APIs You Maintain
You maintain ALL backend API routes. Here is the complete endpoint list organized by route file:

### Authentication (`/api/auth`)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/send-verification-otp`
- `POST /api/auth/verify-email-otp`
- `GET /api/auth/me`
- `POST /api/auth/google`
- `POST /api/auth/admin-login`
- `GET /api/auth/company-status`

### Admin (`/api/admin`) — consumed by Sunny
- `GET /api/admin/stats`
- `GET /api/admin/analytics`
- `GET /api/admin/analytics/advanced`
- `GET /api/admin/activity-log`
- `GET /api/admin/matching-logic`
- `GET /api/admin/top-performers`
- `GET /api/admin/users`
- `GET /api/admin/profile` & `PUT /api/admin/profile`
- `PUT /api/admin/users/:id/role`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/users/:id/detail` & `GET /api/admin/users/:id`
- `GET /api/admin/companies` & `POST /api/admin/companies`
- `PUT /api/admin/companies/:id` & `DELETE /api/admin/companies/:id`
- `PUT /api/admin/companies/:id/verify`
- `GET /api/admin/companies/:id/full`
- `POST /api/admin/notifications/bulk` & `POST /api/admin/notifications/send`
- `GET /api/admin/export/users`, `/export/applications`, `/export/performance`
- `GET /api/admin/site-health`, `/db-status`, `/security-overview`, `/traffic`, `/system-logs`
- `GET /api/admin/jobs`, `PUT /api/admin/jobs/:id/status`, `DELETE /api/admin/jobs/:id`
- `GET /api/admin/applications`, `PUT /api/admin/applications/:id/status`, `DELETE /api/admin/applications/:id`
- `POST /api/admin/system/clean-temp`
- `GET/POST/PUT/DELETE /api/admin/questions`
- `POST/PUT/DELETE /api/admin/preparation`

### Jobs (`/api/jobs`) — consumed by Shikha + Reenu
- `GET /api/jobs`
- `GET /api/jobs/recruiter/my`
- `GET /api/jobs/:id`
- `POST /api/jobs`
- `PUT /api/jobs/:id`
- `DELETE /api/jobs/:id`

### Companies (`/api/companies`) — consumed by Shikha
- `GET /api/companies/my-company`
- `PUT /api/companies/my-company`
- `GET /api/companies/all`
- `GET /api/companies/:id`
- `PUT /api/companies/hr-profile`

### Applications (`/api/applications`) — consumed by Shikha + Reenu
- `POST /api/applications`
- `GET /api/applications/preview/:jobId`
- `GET /api/applications/my`
- `GET /api/applications/detail/:id`
- `DELETE /api/applications/:id` & `DELETE /api/applications/job/:jobId`
- `GET /api/applications/job/:jobId`
- `GET /api/applications/job/:jobId/recommended`
- `POST /api/applications/compare`
- `PUT /api/applications/:id/status`
- `PUT /api/applications/:id/interview`
- `GET /api/applications/job/:jobId/analytics`
- `GET /api/applications/recruiter/all`
- `GET /api/applications/recruiter/interviews`
- `POST /api/applications/:id/schedule-interview`
- `POST /api/applications/:id/resend-invitation`
- `GET /api/applications/export/recruiter`

### Notifications (`/api/notifications`) — consumed by ALL
- `GET /api/notifications/my`
- `GET /api/notifications/unread-count`
- `PUT /api/notifications/:id/read`
- `GET /api/notifications/:id`
- `POST /api/notifications`

### Profile (`/api/profile`) — consumed by Reenu
- `GET /api/profile`
- `GET /api/profile/:userId`
- `PUT /api/profile`
- `POST /api/profile/skills`
- `DELETE /api/profile/skills/:skillId`
- `POST /api/profile/projects`
- `DELETE /api/profile/projects/:projectId`
- `POST /api/profile/resume`

### Resume (`/api/resume`) — consumed by Reenu
- `GET /api/resume`
- `POST /api/resume`
- `PUT /api/resume`

### Preparation (`/api/preparation`) — consumed by Reenu
- `GET /api/prep/sample-questions`
- `GET /api/preparation`
- `GET /api/preparation/:id`
- `GET /api/preparation/company/:name`

### Health
- `GET /api/health`

## Dependencies on Other Modules
Your backend code is consumed by all frontend modules. When changing API response formats or endpoint paths, notify:
- Sunny → if changing `/api/admin/*` responses
- Shikha → if changing `/api/jobs/*`, `/api/applications/*`, `/api/companies/*` responses
- Reenu → if changing `/api/profile/*`, `/api/resume/*`, `/api/preparation/*`, `/api/jobs/*` responses

## How to Test Your Module
1. Set up `server/.env` with MongoDB Atlas URI, JWT_SECRET, ADMIN_SECRET_KEY, etc.
2. Run `cd server && npm install && npm run dev` for hot-reload development
3. Test health: `curl http://localhost:5000/api/health`
4. Test auth: POST to `/api/auth/register` and `/api/auth/login` with test data
5. Test all route files using tools like Postman, curl, or Thunder Client
6. Run `npm run seed` to verify database seeding works
7. Verify CORS works from `http://localhost:5500` (frontend dev server)
8. Deploy to Render and verify `/api/health` responds

## What Must Not Be Changed
- Production `.env` files (never commit secrets)
- MongoDB Atlas connection strings
- JWT secret key values
- Google OAuth client secrets
- The existing API endpoint paths (breaking changes affect all frontends)
- The Netlify proxy configuration pointing to Render

## How Your Module Will Be Merged Back Into Main
1. Your branch (`suraj-backend-integration`) merges FIRST — before all other branches
2. All frontend modules depend on your backend APIs being stable
3. Create a Pull Request: `suraj-backend-integration → main`
4. Verify all API endpoints work after merge
5. Verify MongoDB connection and seeding
6. Verify CORS allows Netlify frontend origin
7. Verify Render deployment auto-deploys from main
8. After your merge, notify other developers to rebase their branches on updated main

## Recommended Commit Structure
```
feat(backend): improve auth route error handling
fix(api): correct CORS origin for production
refactor(models): add index to Application schema
docs(api): update .env.example with new variables
chore(deploy): update render.yaml health check path
```

## Git Commands
```bash
# Clone the repository
git clone https://github.com/Suraj09871/HirePreparation.git
cd HirePreparation

# Create and switch to your branch
git checkout -b suraj-backend-integration

# Check which branch you're on
git branch

# Check file status
git status

# Stage your changes
git add server/routes/auth.js server/models/User.js
# Or stage all changes
git add .

# Commit with a meaningful message
git commit -m "feat(auth): add email OTP verification endpoint"

# Push your branch to GitHub
git push origin suraj-backend-integration

# Pull latest main before continuing work
git checkout main
git pull origin main
git checkout suraj-backend-integration
git merge main
# Resolve any conflicts, then:
git add .
git commit -m "merge: sync with latest main"

# Create Pull Request on GitHub:
# Go to https://github.com/Suraj09871/HirePreparation
# Click 'Compare & pull request'
# Base: main ← Compare: suraj-backend-integration
# Add description and request review
```

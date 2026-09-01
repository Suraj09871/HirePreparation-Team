# Shikha — Recruiter Module

## Role

Recruiter authentication, recruiter dashboard, recruiter profile/company functionality, job posting, job management, applicant management, interview scheduling, recruiter-related frontend JavaScript.

## Git Branch

`shikha-recruiter`

**Repository:** https://github.com/Suraj09871/HirePreparation

---

## Your Files (FULL OWNERSHIP) — 7 Files

### HTML Pages

| # | File | Description |
|---|------|-------------|
| 1 | `frontend/recruiter/recruiter-auth.html` | Dedicated recruiter multi-step onboarding & auth wizard (3-step: Account Info → Company Info → HR Contact & Verification) |
| 2 | `frontend/recruiter/recruiter-dashboard.html` | Main recruiter operations hub with sidebar (Overview, My Jobs, Applicants, Interviews, Pipeline, Company Profile, Notifications) |
| 3 | `frontend/recruiter/job-posting.html` | Job creation & publishing form (title, description, skills, experience, location, salary) |
| 4 | `frontend/recruiter/applicant-list.html` | Candidate ranking & tracking pipeline (match distribution, sorting, CSV export, review table) |

### JavaScript Files

| # | File | Size | Description |
|---|------|------|-------------|
| 5 | `js/recruiter-dashboard.js` | 125KB | Full recruiter portal logic — jobs CRUD, applicant pipeline (Kanban), candidate comparison, interview scheduling (Google Meet), company profile editing, analytics |
| 6 | `js/job-posting.js` | 2KB | Job posting form handler |
| 7 | `js/applicant-list.js` | 4KB | Applicant listing with match score display |

---

## Files You Must NOT Modify

- **ALL files in `server/`** — Suraj's responsibility
- **ALL files in `frontend/student/`** — Reenu's responsibility
- **ALL files in `frontend/admin/`** — Sunny's responsibility
- `js/api.js`, `js/nav-auth.js`, `js/theme.js`, `js/sanitize.js` — SHARED (Suraj coordinates)
- `js/auth.js`, `js/unified-auth.js`, `js/app.js` — SHARED (Suraj coordinates)
- `js/admin.js`, `js/admin-panel.js` — Sunny's files
- `js/student-dashboard.js`, `js/student-profile.js`, `js/jobs.js`, etc. — Reenu's files
- `css/style.css` — SHARED (coordinate with Suraj before changes)
- `index.html`, `team.html`, `docs.html`, `frontend/auth.html` — SHARED
- `render.yaml`, `netlify.toml`, `_redirects` — Suraj's deployment files
- `package.json`, `.gitignore` — Suraj's files
- `data/questions.json` — SHARED (Suraj coordinates)

---

## Files Shared With Other Members

| Shared File | Used By | Your Usage | Coordinator |
|------------|---------|------------|-------------|
| `js/api.js` | ALL modules | API calls to job/application/company endpoints | Suraj |
| `js/nav-auth.js` | ALL authenticated pages | Navigation bar on recruiter pages | Suraj |
| `js/theme.js` | ALL pages | Dark/light theme toggle | Suraj |
| `js/sanitize.js` | ALL pages | XSS protection for user inputs | Suraj |
| `css/style.css` | ALL pages | Global styles | Suraj |

---

## APIs You Consume

### Job Management (`/api/jobs`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/jobs/recruiter/my` | List recruiter's own job postings |
| `POST` | `/api/jobs` | Create new job posting (requires verified company) |
| `PUT` | `/api/jobs/:id` | Update job details |
| `DELETE` | `/api/jobs/:id` | Delete job posting |

### Applicant Pipeline (`/api/applications`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/applications/job/:jobId` | List ranked applicants for a job |
| `GET` | `/api/applications/job/:jobId/recommended` | Auto-recommended candidates |
| `POST` | `/api/applications/compare` | Compare 2-3 candidate profiles side-by-side |
| `PUT` | `/api/applications/:id/status` | Update pipeline status (new → in-review → shortlisted → interview → selected → rejected) |
| `PUT` | `/api/applications/:id/interview` | Schedule interview details |
| `POST` | `/api/applications/:id/schedule-interview` | Schedule with notification to candidate |
| `POST` | `/api/applications/:id/resend-invitation` | Resend interview invitation |
| `GET` | `/api/applications/recruiter/all` | Master applicant board |
| `GET` | `/api/applications/recruiter/interviews` | Scheduled interviews calendar |
| `GET` | `/api/applications/job/:jobId/analytics` | Job applicant conversion analytics |
| `GET` | `/api/applications/export/recruiter` | Export applicants as CSV |

### Company Profile (`/api/companies`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/companies/my-company` | Get recruiter's company profile |
| `PUT` | `/api/companies/my-company` | Update company info, hiring process, criteria |
| `PUT` | `/api/companies/hr-profile` | Update HR contact details and password |

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Recruiter login |
| `POST` | `/api/auth/register` | Recruiter registration (with company payload) |
| `POST` | `/api/auth/google` | Google OAuth login (role: recruiter) |
| `GET` | `/api/auth/company-status` | Check company verification status |

---

## Dependencies on Other Modules

- **Suraj's Backend:** All recruiter APIs must be running. Job creation requires company verification approval from admin.
- **Sunny's Admin:** Company verification is handled by admin (approve/reject). Recruiter cannot post jobs until company is approved.
- **Shared JS:** `api.js` for HTTP calls, `nav-auth.js` for navbar, `theme.js` for dark mode, `sanitize.js` for XSS
- **Chart.js CDN:** `https://cdn.jsdelivr.net/npm/chart.js` — loaded in `recruiter-dashboard.html`
- **Google Sign-In CDN:** `https://accounts.google.com/gsi/client` — loaded in `recruiter-auth.html`

---

## How to Test Your Module

1. Ensure backend is running: `cd server && npm run dev`
2. Register as recruiter at `/frontend/recruiter/recruiter-auth.html` (or `/frontend/auth.html` recruiter tab)
3. Complete company registration (3-step wizard)
4. Wait for admin to approve company (or self-approve via admin panel for testing)
5. Navigate to `/frontend/recruiter/recruiter-dashboard.html`
6. Test each section:
   - **Overview:** Verify stats load with correct numbers
   - **My Jobs:** Create a job, edit it, delete it
   - **Applicants:** View applicants for a job, change status through pipeline
   - **Interviews:** Schedule an interview, verify notification sent to candidate
   - **Pipeline:** View Kanban board with draggable cards
   - **Company Profile:** Edit company details, update hiring process and criteria
   - **Notifications:** Check notification feed
7. Test `/frontend/recruiter/job-posting.html` — create and publish a job
8. Test `/frontend/recruiter/applicant-list.html` — view applicant rankings and scores
9. Test dark/light theme toggle
10. Test mobile responsive layout

---

## What Must Not Be Changed

- The API endpoint paths — Suraj maintains backend routes
- The recruiter role check — backend enforces `roleCheck('recruiter', 'admin')`
- Company verification flow — do not bypass admin approval
- Google OAuth configuration in `recruiter-auth.html`
- Chart.js CDN version — changing may break chart rendering

---

## How Your Module Will Be Merged Back Into Main

1. Suraj's backend branch merges **FIRST** (your APIs must be available)
2. Create Pull Request: `shikha-recruiter → main`
3. Verify recruiter registration flow works end-to-end
4. Verify job posting with verified company
5. Verify applicant pipeline management (all status transitions)
6. Verify interview scheduling sends notifications
7. No conflicts expected if you only modify your 7 files

---

## Recommended Commit Structure

```
feat(recruiter): add interview reminder notification
fix(recruiter): correct applicant sorting by match score
refactor(recruiter): optimize dashboard job loading performance
style(recruiter): improve mobile layout for Kanban pipeline
docs(recruiter): add comments to recruiter-dashboard.js
```

---

## Git Commands

```bash
# Clone the repository
git clone https://github.com/Suraj09871/HirePreparation.git
cd HirePreparation

# Create and switch to your branch
git checkout -b shikha-recruiter

# Verify your branch
git branch
# Should show: * shikha-recruiter

# Check file status
git status

# Stage specific files
git add js/recruiter-dashboard.js frontend/recruiter/recruiter-dashboard.html

# Or stage all changes
git add .

# Commit with meaningful message
git commit -m "feat(recruiter): add candidate comparison view"

# Push your branch to GitHub
git push -u origin shikha-recruiter

# Pull latest main before continuing work
git checkout main
git pull origin main
git checkout shikha-recruiter
git merge main
# Resolve any conflicts, then:
git add .
git commit -m "merge: sync with latest main"

# Create Pull Request on GitHub:
# Go to https://github.com/Suraj09871/HirePreparation
# Click 'Compare & pull request'
# Base: main ← Compare: shikha-recruiter
# Add description and request review from Suraj
```

---

## Pull Request Template

```markdown
## Recruiter Module Changes

### What Changed
- [List specific changes]

### Files Modified
- `js/recruiter-dashboard.js`
- `frontend/recruiter/recruiter-dashboard.html`
- [List other files]

### Testing Done
- [ ] Recruiter registration works
- [ ] Company profile setup works
- [ ] Job posting (create/edit/delete) works
- [ ] Applicant listing with match scores works
- [ ] Interview scheduling works
- [ ] Candidate comparison works
- [ ] CSV export works
- [ ] Google OAuth login works
- [ ] Dark/light theme works
- [ ] Mobile responsive layout works

### Shared File Changes
- None (or list with justification)
```

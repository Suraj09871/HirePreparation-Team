# Reenu — Student/User Module

## Role

Student authentication UI, student dashboard, student profile, student activity, job browsing, job matching, preparation, practice, MCQ, mock tests, roadmap, question details, resume builder, student-related frontend JavaScript.

## Git Branch

`reenu-student`

**Repository:** https://github.com/Suraj09871/HirePreparation

---

## Your Files (FULL OWNERSHIP) — 25 Files

### HTML Pages (14 files)

| # | File | Description |
|---|------|-------------|
| 1 | `frontend/student/student-auth.html` | Student login & registration form with Google Sign-in |
| 2 | `frontend/student/student-dashboard.html` | Central student hub (welcome banner, practice resume banner, stats widgets, skill chart, recommended companies, quick access cards, notifications) |
| 3 | `frontend/student/student-profile.html` | Profile management (sidebar nav, settings tabs, ATS resume banner, accordion sections for details/links/experience/education) |
| 4 | `frontend/student/student-activity.html` | Activity & audit summary (profile info, account stats) |
| 5 | `frontend/student/jobs.html` | Job search & application portal (real-time search, job cards, match preview, apply modal) |
| 6 | `frontend/student/match-result.html` | Match score breakdown (skill match %, hiring probability %, missing skills, apply CTA) |
| 7 | `frontend/student/preparation.html` | Company-wise preparation paths (25+ companies, interview rounds, coding questions) |
| 8 | `frontend/student/practice.html` | 630+ problem practice hub (resume banner, stats, company filters, category tabs, search, difficulty filter, paginated cards) |
| 9 | `frontend/student/mcq-quiz.html` | MCQ practice quiz with timer, question navigator, score analysis with Chart.js |
| 10 | `frontend/student/mcq-detail.html` | Single MCQ solver with instant retry, localStorage progress tracking, side navigator grid |
| 11 | `frontend/student/mock-test.html` | Full-length timed mock exam (category/count/time config, countdown, performance scorecard) |
| 12 | `frontend/student/roadmap.html` | 5-step career roadmap (Build Profile → Upload Resume → Prepare → Apply → Track) |
| 13 | `frontend/student/question-detail.html` | Split-screen coding IDE (Ace Editor, multi-language, autosave, test runner, submissions) |
| 14 | `frontend/student/resume-builder.html` | Interactive resume builder (4 templates, PDF/DOCX import, typography controls, live preview, PDF export) |

### JavaScript Files (11 files)

| # | File | Size | Description |
|---|------|------|-------------|
| 15 | `js/student-dashboard.js` | 12KB | Dashboard logic (stats, recommended jobs, activity) |
| 16 | `js/student-profile.js` | 23KB | Profile CRUD (education, experience, skills, projects) |
| 17 | `js/jobs.js` | 35KB | Job browsing, search, filtering, match preview, application submission |
| 18 | `js/match-result.js` | 4KB | Match score display and breakdown |
| 19 | `js/preparation.js` | 31KB | Preparation path browser (company cards, difficulty, topics) |
| 20 | `js/practice.js` | 15KB | Practice hub (question loading, filtering, solved tracking, resume session) |
| 21 | `js/mcq-quiz.js` | 15KB | MCQ quiz engine (timer, answer feedback, retry, score tracking) |
| 22 | `js/mock-test.js` | 11KB | Mock test engine (config, exam session, countdown, scorecard) |
| 23 | `js/roadmap.js` | 3KB | Roadmap progress tracker (profile/resume/practice/apply checks) |
| 24 | `js/question-detail.js` | 5KB | Question detail with Ace code editor integration |
| 25 | `js/resume-builder.js` | 68KB | Resume builder (template selection, section management, PDF export, data import) |

---

## Files You Must NOT Modify

- **ALL files in `server/`** — Suraj's responsibility
- **ALL files in `frontend/admin/`** — Sunny's responsibility
- **ALL files in `frontend/recruiter/`** — Shikha's responsibility
- `js/api.js`, `js/nav-auth.js`, `js/theme.js`, `js/sanitize.js` — SHARED (Suraj coordinates)
- `js/auth.js`, `js/unified-auth.js`, `js/app.js` — SHARED (Suraj coordinates)
- `js/admin.js`, `js/admin-panel.js` — Sunny's files
- `js/recruiter-dashboard.js`, `js/job-posting.js`, `js/applicant-list.js` — Shikha's files
- `css/style.css` — SHARED (coordinate with Suraj before any changes)
- `index.html`, `team.html`, `docs.html`, `frontend/auth.html` — SHARED
- `render.yaml`, `netlify.toml`, `_redirects` — Suraj's deployment files
- `package.json`, `.gitignore` — Suraj's files

---

## Files Shared With Other Members

| Shared File | Used By | Your Usage | Coordinator |
|------------|---------|------------|-------------|
| `js/api.js` | ALL modules | API calls for profile, jobs, applications, resume | Suraj |
| `js/nav-auth.js` | ALL authenticated pages | Navigation bar on student pages | Suraj |
| `js/theme.js` | ALL pages | Dark/light theme toggle | Suraj |
| `js/sanitize.js` | ALL pages | XSS protection for user inputs | Suraj |
| `js/unified-auth.js` | Auth + Roadmap | Used in `roadmap.html` for auth state | Suraj |
| `css/style.css` | ALL pages | Global styles | Suraj |
| `data/questions.json` | Student + Admin | Practice, MCQ detail, and question detail pages read this | Suraj |

---

## APIs You Consume

### Profile Management (`/api/profile`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/profile` | Get current student's profile & completion percentage |
| `GET` | `/api/profile/:userId` | Get profile by user ID |
| `PUT` | `/api/profile` | Update profile fields (education, experience, location, etc.) |
| `POST` | `/api/profile/skills` | Add a skill with proficiency level (Beginner/Intermediate/Advanced) |
| `DELETE` | `/api/profile/skills/:skillId` | Remove a skill |
| `POST` | `/api/profile/projects` | Add a project |
| `DELETE` | `/api/profile/projects/:projectId` | Remove a project |
| `POST` | `/api/profile/resume` | Upload resume file (PDF, multipart/form-data) |

### Resume Builder (`/api/resume`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/resume` | Get saved resume builder data |
| `POST` | `/api/resume` | Create initial resume document |
| `PUT` | `/api/resume` | Update resume template and JSON content |

### Job Browsing (`/api/jobs`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/jobs` | List all active jobs (pagination, search, filters) |
| `GET` | `/api/jobs/:id` | Get single job posting details |

### Job Applications (`/api/applications`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/applications` | Submit job application (triggers matching algorithm) |
| `GET` | `/api/applications/preview/:jobId` | Preview match score before applying |
| `GET` | `/api/applications/my` | View student's submitted applications |
| `DELETE` | `/api/applications/:id` | Withdraw application |
| `DELETE` | `/api/applications/job/:jobId` | Withdraw application by job ID |

### Interview Preparation (`/api/preparation`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/preparation` | List all company preparation paths |
| `GET` | `/api/preparation/:id` | Get preparation path by ID |
| `GET` | `/api/preparation/company/:name` | Find preparation by company name |
| `GET` | `/api/prep/sample-questions` | Random sample questions for preview |

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Student login |
| `POST` | `/api/auth/register` | Student registration |
| `POST` | `/api/auth/google` | Google OAuth login (role: student) |
| `GET` | `/api/auth/me` | Get current authenticated user |

### Notifications (`/api/notifications`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications/my` | Fetch student's notifications |
| `GET` | `/api/notifications/unread-count` | Unread notification count |
| `PUT` | `/api/notifications/:id/read` | Mark notification as read |

### Companies (`/api/companies`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/companies/all` | List verified companies (for job browsing) |

### Admin Questions (Read-Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/questions` | Read questions for practice hub |

---

## Dependencies on Other Modules

- **Suraj's Backend:** All student APIs must be running. Profile, resume, jobs, applications, preparation endpoints required.
- **Shared JS:** `api.js`, `nav-auth.js`, `theme.js`, `sanitize.js`, `unified-auth.js`
- **data/questions.json:** Practice, MCQ detail, and question detail pages fetch from this file directly or via API
- **Chart.js CDN:** Used in `student-dashboard.html` and `mcq-quiz.html`
- **Ace Editor CDN:** `https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.6/ace.js` — Used in `question-detail.html`
- **PDF.js CDN:** Used in `resume-builder.html` for PDF import
- **Mammoth.js CDN:** Used in `resume-builder.html` for DOCX import
- **Google Sign-In CDN:** Used in `student-auth.html`

---

## How to Test Your Module

1. Ensure backend is running: `cd server && npm run dev`
2. Register as student at `/frontend/student/student-auth.html` or `/frontend/auth.html`
3. Navigate to `/frontend/student/student-dashboard.html`
4. Test each page:
   - **Dashboard:** Stats load, recommended jobs appear, quick access links work
   - **Profile:** Edit details, add/remove skills, add/remove projects, upload resume
   - **Jobs:** Search jobs, preview match score, apply for a job
   - **Match Result:** View match breakdown after applying
   - **Preparation:** Browse company prep paths, filter by company/difficulty
   - **Practice:** Load questions, filter by category/company/difficulty, mark as solved
   - **MCQ Quiz:** Start quiz, answer questions with timer, view final score
   - **MCQ Detail:** Solve individual MCQ, test retry on wrong answer, progress saves to localStorage
   - **Mock Test:** Configure test (category, count, time), complete exam, view scorecard
   - **Roadmap:** Verify progress steps auto-update based on profile completion
   - **Question Detail:** Open coding problem, write code in Ace editor, verify autosave
   - **Resume Builder:** Select template, add sections, preview, export PDF, import profile data
5. Test dark/light theme on all pages
6. Test mobile responsive layout
7. Test Google OAuth login

---

## What Must Not Be Changed

- API endpoint paths — Suraj maintains backend routes
- `data/questions.json` structure — coordinate with Suraj if changes needed
- Ace Editor CDN version and initialization code
- PDF.js and Mammoth.js CDN versions
- localStorage keys used for progress tracking:
  - `hireprep_solved_coding_mcq`
  - `hireprep_solved_aptitude`
  - `hs_submissions`
  - `hireprep_last_question_*`
- Student role check — backend enforces `roleCheck('student')`

---

## How Your Module Will Be Merged Back Into Main

1. Suraj's backend branch merges **FIRST** (your APIs must be available)
2. Create Pull Request: `reenu-student → main`
3. You have the most files (25) but they are **completely isolated** to `frontend/student/` and student-specific JS files
4. **Very low conflict risk** — no other developer touches your files
5. After merge, verify: student registration, login, dashboard, profile, all practice features, resume builder
6. Verify all `data/questions.json` pages load correctly

---

## Recommended Commit Structure

```
feat(student): add export PDF button to resume builder
fix(student): correct match score calculation display
refactor(student): optimize practice question loading
style(student): improve mobile layout for MCQ quiz
docs(student): add inline comments to student-profile.js
```

---

## Git Commands

```bash
# Clone the repository
git clone https://github.com/Suraj09871/HirePreparation.git
cd HirePreparation

# Create and switch to your branch
git checkout -b reenu-student

# Verify your branch
git branch
# Should show: * reenu-student

# Check file status
git status

# Stage specific files
git add js/student-dashboard.js frontend/student/student-dashboard.html

# Or stage all changes
git add .

# Commit with meaningful message
git commit -m "feat(student): add skill proficiency chart to dashboard"

# Push your branch to GitHub
git push -u origin reenu-student

# Pull latest main before continuing work
git checkout main
git pull origin main
git checkout reenu-student
git merge main
# Resolve any conflicts, then:
git add .
git commit -m "merge: sync with latest main"

# Create Pull Request on GitHub:
# Go to https://github.com/Suraj09871/HirePreparation
# Click 'Compare & pull request'
# Base: main ← Compare: reenu-student
# Add description and request review from Suraj
```

---

## Pull Request Template

```markdown
## Student Module Changes

### What Changed
- [List specific changes]

### Files Modified
- [List files modified]

### Testing Done
- [ ] Student registration works
- [ ] Student login works
- [ ] Google OAuth login works
- [ ] Dashboard loads with stats and recommended jobs
- [ ] Profile edit (education, experience, skills, projects) works
- [ ] Resume upload works
- [ ] Job search and filtering works
- [ ] Match score preview works
- [ ] Job application submission works
- [ ] Preparation paths load with company filters
- [ ] Practice questions load with all filters
- [ ] MCQ quiz works with timer and scoring
- [ ] MCQ detail solver with retry works
- [ ] Mock test complete flow works
- [ ] Roadmap progress tracking auto-updates
- [ ] Question detail with Ace editor works
- [ ] Resume builder with PDF export works
- [ ] Dark/light theme works on all pages
- [ ] Mobile responsive layout works

### Shared File Changes
- None (or list with justification)
```

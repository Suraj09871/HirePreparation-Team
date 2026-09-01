# Sunny — Admin Module

## Role
Admin dashboard, admin panel, user management, company approval/rejection, admin content management, question bank CMS, platform analytics, CSV exports, site health monitoring.

## Git Branch
`sunny-admin`

## Your Files (FULL OWNERSHIP) — 4 Files

### HTML Pages
1. `frontend/admin/admin-dashboard.html` — Primary admin control center with 17 sidebar sections (Overview, Analytics, Admin Profile, Users, Companies, All Jobs, Applications, Content CMS, Top Performers, Notifications, Activity Log, Matching Logic, Reports & Export, Settings, Architecture, Site Health, Security, Database)
2. `frontend/admin/admin-panel.html` — Compact/alternative admin CMS panel for analytics, user management, company verification

### JavaScript Files
3. `js/admin.js` (222KB) — Full admin logic covering:
   - Dashboard statistics and KPI metrics
   - Analytics charts (Chart.js) — user growth, role distributions, conversion funnels
   - User management CRUD — search, filter, role modification, status toggle, delete
   - Company verification — approve/reject companies, view documentation
   - Job moderation — view all jobs, change status, delete
   - Application pipeline — view all applications, override status
   - Question bank CMS — CRUD for coding/MCQ/aptitude questions
   - Preparation roadmap editor — CRUD for company prep paths
   - CSV exports — users, applications, performance data
   - Site health monitoring — server status, DB connection, traffic
   - Activity log viewer — audit trail of platform actions
   - Matching logic transparency — view algorithm formula and sample calculations
   - Top performers leaderboard
   - Bulk notification sender
4. `js/admin-panel.js` (31KB) — Supplementary admin panel logic:
   - Dashboard stats display
   - User list management
   - Company verification audit

## Files You Must NOT Modify
- ALL files in `server/` — Suraj's responsibility
- ALL files in `frontend/student/` — Reenu's responsibility
- ALL files in `frontend/recruiter/` — Shikha's responsibility
- `js/api.js` — SHARED (Suraj coordinates)
- `js/nav-auth.js` — SHARED (Suraj coordinates)
- `js/theme.js` — SHARED (Suraj coordinates)
- `js/sanitize.js` — SHARED (Suraj coordinates)
- `js/auth.js`, `js/unified-auth.js` — SHARED (Suraj coordinates)
- `js/app.js` — SHARED (Suraj coordinates)
- `js/student-dashboard.js`, `js/student-profile.js`, `js/jobs.js` — Reenu's files
- `js/recruiter-dashboard.js`, `js/job-posting.js`, `js/applicant-list.js` — Shikha's files
- `css/style.css` — SHARED (coordinate with Suraj before changes)
- `index.html`, `team.html`, `docs.html`, `frontend/auth.html` — SHARED
- `render.yaml`, `netlify.toml`, `_redirects` — Suraj's deployment files
- `package.json`, `.gitignore` — Suraj's files
- `data/questions.json` — SHARED (Suraj coordinates)

## Files Shared With Other Members
| Shared File | Used By | Your Usage | Coordinator |
|------------|---------|------------|-------------|
| `js/api.js` | ALL | API calls to `/api/admin/*` | Suraj |
| `js/nav-auth.js` | ALL | Navigation bar in admin-panel.html | Suraj |
| `js/theme.js` | ALL | Dark/light theme toggle | Suraj |
| `js/sanitize.js` | ALL | XSS protection for user inputs | Suraj |
| `css/style.css` | ALL | Global styles | Suraj |
| `data/questions.json` | Student + Admin | Admin CMS reads/writes this via API | Suraj |

## APIs You Consume
All admin API endpoints are under `/api/admin/` and maintained by Suraj.

### Dashboard & Analytics
- `GET /api/admin/stats` — Platform metrics (users, jobs, applications count)
- `GET /api/admin/analytics` — User growth trends, role distributions
- `GET /api/admin/analytics/advanced` — Granular trends, skill gaps, conversion funnel
- `GET /api/admin/top-performers` — Ranked student leaderboard
- `GET /api/admin/matching-logic` — Algorithm formula and sample calculation

### User Management
- `GET /api/admin/users` — User list with search and filters
- `GET /api/admin/users/:id/detail` — Complete user 360° view
- `PUT /api/admin/users/:id/role` — Role assignment (promote/demote)
- `DELETE /api/admin/users/:id` — Delete user and associated data
- `GET /api/admin/profile` & `PUT /api/admin/profile` — Admin's own profile

### Company Verification
- `GET /api/admin/companies` — Company list with verification status
- `POST /api/admin/companies` — Create company record
- `PUT /api/admin/companies/:id` — Update company details
- `DELETE /api/admin/companies/:id` — Delete company
- `PUT /api/admin/companies/:id/verify` — Approve or reject company registration
- `GET /api/admin/companies/:id/full` — Full company review details

### Job & Application Management
- `GET /api/admin/jobs` — All jobs list
- `PUT /api/admin/jobs/:id/status` — Change job status
- `DELETE /api/admin/jobs/:id` — Delete job
- `GET /api/admin/applications` — All applications list
- `PUT /api/admin/applications/:id/status` — Override application status
- `DELETE /api/admin/applications/:id` — Delete application

### Content CMS (Question Bank)
- `GET /api/admin/questions` — List questions
- `POST /api/admin/questions` — Add new question
- `PUT /api/admin/questions/:id` — Edit question
- `DELETE /api/admin/questions/:id` — Delete question

### Preparation Roadmap Editor
- `POST /api/admin/preparation` — Create preparation path
- `PUT /api/admin/preparation/:id` — Update preparation path
- `DELETE /api/admin/preparation/:id` — Delete preparation path

### System Health & Monitoring
- `GET /api/admin/site-health` — Server and service status
- `GET /api/admin/db-status` — Database connection status
- `GET /api/admin/security-overview` — Security configuration summary
- `GET /api/admin/traffic` — Request traffic statistics
- `GET /api/admin/system-logs` — System log entries
- `GET /api/admin/activity-log` — User activity audit trail

### Notifications
- `POST /api/admin/notifications/bulk` — Send bulk notifications
- `POST /api/admin/notifications/send` — Send targeted notification

### Exports
- `GET /api/admin/export/users` — Export users as CSV
- `GET /api/admin/export/applications` — Export applications as CSV
- `GET /api/admin/export/performance` — Export performance data as CSV

### System Maintenance
- `POST /api/admin/system/clean-temp` — Clean expired OTP records

## Dependencies on Other Modules
- **Suraj's Backend**: All admin functionality depends on `/api/admin/*` endpoints being available
- **Shared JS**: `api.js` for HTTP calls, `theme.js` for dark mode, `sanitize.js` for XSS
- **Chart.js CDN**: `https://cdn.jsdelivr.net/npm/chart.js` — loaded in HTML for analytics charts
- **data/questions.json**: Admin CMS reads/writes questions through the API

## How to Test Your Module
1. Ensure the backend is running (`cd server && npm run dev`)
2. Log in as admin using the admin secret key at `/frontend/auth.html`
   - Default admin key: check `server/.env.example` → `ADMIN_SECRET_KEY`
3. Navigate to `/frontend/admin/admin-dashboard.html`
4. Test each sidebar section:
   - **Overview**: Verify stat cards load with real numbers
   - **Analytics**: Verify Chart.js charts render
   - **Users**: Search, filter, change roles, delete a test user
   - **Companies**: Approve/reject a company, view full details
   - **Jobs**: View all jobs, change status, delete
   - **Applications**: View pipeline, change status
   - **Content CMS**: Add/edit/delete a question
   - **Preparation**: Add/edit/delete a prep path
   - **Exports**: Download CSV files
   - **Site Health**: Verify all indicators show green
   - **Activity Log**: Verify audit entries appear
5. Test `/frontend/admin/admin-panel.html` for compact view
6. Test dark/light theme toggle
7. Test on mobile viewport (responsive layout)

## What Must Not Be Changed
- The API endpoint paths (coordinate with Suraj if backend changes are needed)
- The authentication flow — admin login uses a secret key, not regular login
- Chart.js CDN version — changing may break chart rendering
- The admin sidebar navigation structure (unless adding new sections)
- Admin role check logic — the backend enforces `roleCheck('admin', 'sub-admin')`

## How Your Module Will Be Merged Back Into Main
1. Suraj's backend branch merges first (your admin APIs must be available)
2. Create Pull Request: `sunny-admin → main`
3. Ensure your changes don't conflict with shared files
4. Test admin login and all dashboard sections after merge
5. Verify company verification flow works end-to-end
6. Verify CSV exports download correctly
7. Verify Chart.js analytics render with real data

## Recommended Commit Structure
```
feat(admin): add bulk user export functionality
fix(admin): correct company verification status display
refactor(admin): optimize dashboard stats loading
style(admin): improve mobile responsive layout for admin sidebar
docs(admin): add inline comments to admin.js analytics section
```

## Git Commands
```bash
# Clone the repository
git clone https://github.com/Suraj09871/HirePreparation.git
cd HirePreparation

# Create and switch to your branch
git checkout -b sunny-admin

# Check which branch you're on
git branch

# Check file status
git status

# Stage specific files
git add js/admin.js frontend/admin/admin-dashboard.html
# Or stage all changes
git add .

# Commit with a meaningful message
git commit -m "feat(admin): add bulk notification sender"

# Push your branch to GitHub
git push origin sunny-admin

# Pull latest main before continuing work
git checkout main
git pull origin main
git checkout sunny-admin
git merge main
# Resolve any conflicts, then:
git add .
git commit -m "merge: sync with latest main"

# Create Pull Request on GitHub:
# Go to https://github.com/Suraj09871/HirePreparation
# Click 'Compare & pull request'
# Base: main ← Compare: sunny-admin
# Add description and request review from Suraj
```

## Pull Request Template
When creating your PR, use this format:
```
## Admin Module Changes

### What Changed
- [List specific changes]

### Files Modified
- `js/admin.js`
- `frontend/admin/admin-dashboard.html`

### Testing Done
- [ ] Admin login works
- [ ] Dashboard stats load
- [ ] User management CRUD works
- [ ] Company verification works
- [ ] Question CMS works
- [ ] CSV exports work
- [ ] Site health shows correct status
- [ ] Dark/light theme works
- [ ] Mobile responsive layout works

### Shared File Changes
- None (or list any shared file changes with justification)
```

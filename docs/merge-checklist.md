# Post-Merge Testing Checklist

After every merge into main, test the following. Mark each item as PASS or FAIL.

## Authentication
- [ ] Student registration (email/password)
- [ ] Student login (email/password)
- [ ] Recruiter registration (email/password + company info)
- [ ] Recruiter login
- [ ] Admin login (with secret key)
- [ ] Google OAuth login (all roles)
- [ ] Email OTP verification
- [ ] JWT token generation and validation
- [ ] Logout clears session
- [ ] Role-based redirect (student → student dashboard, recruiter → recruiter dashboard, admin → admin dashboard)

## Student Dashboard
- [ ] Dashboard loads with stats (profile completion, resume score, skills count, mock tests)
- [ ] Recommended jobs appear
- [ ] Quick access cards navigate correctly
- [ ] Practice resume banner works
- [ ] Skill overview chart renders (Chart.js)
- [ ] Notification feed loads

## Student Profile
- [ ] Profile loads with existing data
- [ ] Edit basic details (name, phone, location)
- [ ] Add/remove education entries
- [ ] Add/remove work experience
- [ ] Add/remove skills with proficiency levels
- [ ] Add/remove projects
- [ ] Upload resume (PDF)
- [ ] Profile completion percentage updates

## Job Browsing & Applications
- [ ] Job list loads with active jobs
- [ ] Search by title/company/skill works
- [ ] Filter by experience level works
- [ ] Match score preview shows before applying
- [ ] Job application submission works
- [ ] Application appears in "My Applications"
- [ ] Application withdrawal works

## Interview Preparation
- [ ] Preparation paths load (company cards)
- [ ] Filter by company works
- [ ] Filter by difficulty works
- [ ] Individual preparation path details load
- [ ] Topics and questions display correctly

## Practice Hub
- [ ] Questions load (630+ problems)
- [ ] Category tabs work (Coding, Coding MCQ, Aptitude)
- [ ] Company filter pills work
- [ ] Difficulty filter works
- [ ] Search works
- [ ] Question cards display correctly
- [ ] Solved badge tracking works (localStorage)
- [ ] Resume session banner works

## MCQ Quiz
- [ ] Quiz starts with timer
- [ ] Questions display with options
- [ ] Answer selection and feedback works
- [ ] Question navigator dots update
- [ ] Score analysis displays at end
- [ ] Chart.js score visualization renders

## MCQ Detail
- [ ] Individual MCQ loads
- [ ] Option selection with instant validation
- [ ] Retry on wrong answer works
- [ ] Progress tracking (localStorage) works
- [ ] Side navigator grid works

## Mock Test
- [ ] Test configuration (category, count, time) works
- [ ] Exam session starts with countdown
- [ ] Progress dots work
- [ ] Score calculation is correct
- [ ] Performance scorecard displays

## Coding Questions
- [ ] Question detail loads in split-screen
- [ ] Ace Code Editor initializes
- [ ] Language selection works (Python, JS, Java, C++)
- [ ] Code autosave to localStorage works
- [ ] Test case display works
- [ ] Code execution simulation works

## Resume Builder
- [ ] Template selection works (Modern, Classic, Minimal, Executive)
- [ ] Contact info section editable
- [ ] Work experience section (add/remove entries)
- [ ] Education section (add/remove entries)
- [ ] Skills section editable
- [ ] Projects section (add/remove entries)
- [ ] Live preview updates
- [ ] PDF export works
- [ ] Resume data saves to backend
- [ ] Import from profile works
- [ ] PDF/DOCX file import works

## Career Roadmap
- [ ] 5-step progress path displays
- [ ] Completion status auto-updates based on profile data
- [ ] Progress bar reflects completion percentage
- [ ] Navigation links to relevant pages work

## Recruiter Dashboard
- [ ] Dashboard loads with overview stats
- [ ] Job performance metrics display
- [ ] All sidebar sections navigate correctly

## Recruiter Job Management
- [ ] Create new job posting
- [ ] Edit existing job
- [ ] Delete job
- [ ] Save job as draft
- [ ] Published job appears in student job list
- [ ] Company verification check before posting

## Recruiter Applicant Management
- [ ] Applicant list loads for a job
- [ ] Match score pills display
- [ ] Sort by match %, experience, date works
- [ ] Update application status (new → in-review → shortlisted → interview → selected/rejected)
- [ ] Candidate comparison (2-3 candidates) works
- [ ] Auto-recommended candidates list loads
- [ ] CSV export works

## Interview Scheduling
- [ ] Schedule interview form works
- [ ] Interview type selection (phone/video/onsite)
- [ ] Meeting link input/generation
- [ ] Candidate notification sent
- [ ] Interview calendar/list displays
- [ ] Resend invitation works

## Company Profile
- [ ] Company profile loads
- [ ] Edit company details works
- [ ] Update hiring process/criteria
- [ ] HR contact details update
- [ ] Company verification status displays

## Admin Dashboard
- [ ] Dashboard loads with KPI metrics
- [ ] Analytics charts render (Chart.js)
- [ ] All 17 sidebar sections accessible

## Admin User Management
- [ ] User list loads with search/filter
- [ ] User detail 360° view works
- [ ] Role assignment (promote/demote)
- [ ] User deletion works
- [ ] Admin profile edit works

## Admin Company Management
- [ ] Company list loads
- [ ] Approve company registration
- [ ] Reject company registration
- [ ] View full company details
- [ ] Delete company

## Admin Content CMS
- [ ] Question list loads
- [ ] Add new question
- [ ] Edit existing question
- [ ] Delete question
- [ ] Preparation path CRUD works

## Admin Reports & Exports
- [ ] Export users CSV
- [ ] Export applications CSV
- [ ] Export performance CSV

## Admin System Health
- [ ] Site health indicators display
- [ ] Database status shows connected
- [ ] Activity log entries load
- [ ] Matching logic formula displays
- [ ] Top performers leaderboard loads

## Notifications
- [ ] Notification bell icon shows unread count
- [ ] Notification panel opens
- [ ] Mark as read works
- [ ] Admin bulk notification delivery works

## UI/UX
- [ ] Dark/light theme toggle works on all pages
- [ ] Theme persists across page navigation
- [ ] Mobile responsive layout works (all pages)
- [ ] Navigation bar renders correctly for each role
- [ ] Footer displays on public pages

## Infrastructure
- [ ] MongoDB connection established
- [ ] `/api/health` returns online status
- [ ] CORS allows Netlify origin
- [ ] All API endpoints return expected responses
- [ ] Rate limiting works on auth routes
- [ ] JWT authentication works across all protected routes
- [ ] File upload (resume) works
- [ ] Render backend responds (check URL)
- [ ] Netlify frontend loads (check URL)

## Security
- [ ] `.env` files NOT in repository
- [ ] `node_modules/` NOT in repository
- [ ] Passwords are hashed (bcrypt)
- [ ] JWT tokens expire after configured time
- [ ] Admin login requires secret key
- [ ] Helmet security headers present
- [ ] Rate limiting active on auth routes

## Production URLs
- Backend: https://hirepreparation-backend.onrender.com/api/health
- Frontend: https://hiresmart.netlify.app

## Sign-Off
| Tester | Date | Result | Notes |
|--------|------|--------|-------|
| Suraj | | | |
| Sunny | | | |
| Shikha | | | |
| Reenu | | | |

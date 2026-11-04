# HirePrep Project Requirements

## Project Overview

**Project Name:** HirePrep
**Description:** Intelligent Job Matching & Interview Preparation Platform

**Team:**
- **Suraj Kumar** (Backend, API, Auth & Integration Lead)
- **Sunny Kumar** (Admin Module Lead)
- **Shikha Chaurasia** (Recruiter Module Lead)
- **Reenu Yadav** (Student/User Module Lead)

## User Roles

The system supports four distinct user roles, defined in the User model:
- **Student:** Candidates who create profiles, upload resumes, practice for interviews, and apply for jobs.
- **Recruiter:** Company representatives who post jobs, view applicants, manage pipelines, and schedule interviews.
- **Admin:** Platform administrators who manage users, companies, content, and view system-wide analytics.
- **Sub-admin:** Administrative staff with specific, restricted permissions granted by the admin.

## Core Features (Implemented)

1. **Authentication System**
   - JWT-based authentication.
   - bcrypt password hashing (12 salt rounds).
   - Support for local and Google OAuth (`authProvider` field).
   - Unified auth page with tabs for Student/Recruiter/Developer.
   - Role-based access control (RBAC) and granular permission system for admin/sub-admin roles.
   - Admin login with a secret key.

2. **Student Profile Management**
   - Comprehensive profile capturing education (institution, degree, field, dates, grade), experience (company, position, dates, description), skills (name/level), projects (title, description, techStack), and certifications.
   - Profile completion percentage is auto-calculated.
   - Resume management: resumeUrl, resumeScore.
   - Additional details using a Mixed schema (DOB, pronouns, hobbies, social links).

3. **Job Management**
   - Complete CRUD operations for jobs (Recruiter/Admin).
   - Fields captured: title, companyName, description, requiredSkills, experienceRequired, location, salary, status (active/closed/draft).
   - Search, filter, and pagination capabilities.
   - Dedicated view for a recruiter to manage their own jobs.

4. **Job Application & Matching**
   - Students can apply for jobs with an application preview.
   - **Automatic skill matching algorithm**: Calculates skillMatch (0-100), hiringProbability (0-100), matchedSkills, and missingSkills.
   - Matching Formula: (Skill Match × 60%) + (Experience Score × 20%) + (Resume Completeness × 20%).
   - Applicant pipeline statuses: new → in-review → shortlisted → interview → selected → rejected.

5. **Recruiter Enterprise Dashboard & Intelligence Suite**
   - Overview stats and real-time job performance analytics.
   - Kanban-style applicant pipeline view across 6 stages (new, in-review, shortlisted, interview, selected, rejected).
   - Candidate comparison (compare multiple candidates side-by-side).
   - **Structured Interview Scorecards:** 1-5 star objective ratings across DSA, System Architecture, Communication, and Culture Fit with interviewer feedback and decision logging.
   - **AI Resume Screener & Skill Gap Breakdown:** Automatic candidate-to-job fit scoring (0-100%), verified strengths, prioritized skill gaps, and 1-click auto-shortlisting.
   - **HirePrep Coding Challenge Dispatcher:** Direct assignment of coding problems from 210-question library with automated deadline tracking.
   - **Automated Offer Letter Generator & Printable PDF:** Compensation configuration (CTC, signing bonus, joining date), executive letterhead preview, and printable PDF export.
   - **Hiring Funnel Analytics:** 5-stage visual conversion funnel, candidate inflow tracking, sourcing channel distribution, and applicant pool competency breakdown.
   - Interview scheduling tool with Google Meet link generation and candidate notification.

6. **Interview Preparation & Multi-Language Practice Engine**
   - 630+ questions (210 Coding Problems, 210 CS Technical MCQs, 210 Aptitude Questions).
   - **Multi-Language Built-in Solutions:** Optimal solutions provided for all coding challenges in Python 3, Java 17, and C++ 20 with Big-O time & space complexity explanations and 1-click copy-to-editor.
   - Ace Code Editor IDE with fast sandbox execution runtime, syntax highlighting, and debounced auto-save.
   - Company-specific preparation paths (Amazon, Google, Microsoft, Meta, etc.).
   - Interactive MCQ quizzes with instant retry on wrong answers and status recalibration.
   - Timed mock tests configurable by category and difficulty.

7. **Overleaf-Style Resume Builder**
   - Dual-mode editing: Overleaf-inspired code editor side-by-side with live visual builder.
   - Single-page A4 format compliance for industry ATS standards.
   - Resume upload support (PDF format, using multer) with parsing integration.
   - Live printable preview and direct clean PDF export.
   - Template selection: Modern, Classic, Minimal, Academic.

8. **Admin Dashboard**
   - Analytics with Chart.js: user growth charts, conversion funnels, skill gap trends.
   - User Management: CRUD, role modification, status toggling.
   - Company Management: CRUD, verification processes, and documentation tracking.
   - Content and question management for interview prep.
   - CSV data exports for users, applications, and performance.
   - Bulk notifications, site health monitoring, and activity logging.
   - Matching logic transparency view.

9. **Career Roadmap**
   - 5-step interactive progress tracking: Complete Profile → Build Resume → Practice Questions → Apply for Jobs → Get Hired.
   - Tracks completion automatically based on user profile data.

10. **Notification System**
    - Types: announcement, alert, recommendation, system.
    - Targeted delivery by role or specific user.
    - Read/unread state tracking with unread count badges.

11. **Activity Logging**
    - Tracks key platform actions: login, register, profile_update, job_apply, job_post, status_change, etc.

12. **UI/UX Enhancements**
    - Dark/Light theme toggle with localStorage persistence via CSS custom properties.
    - Mock API fallback for frontend demonstrations when the backend is unavailable.

13. **Company Database**
    - Comprehensive company profiles: name, website, description, logo, domain (product/service/startup), industry, size, headquarters, isVerified, verificationDoc.

14. **Candidate Recommendations**
    - Auto-recommendation system to suggest top candidates for jobs based on calculated match scores.

## Planned / Partially Implemented Features

- **Google OAuth:** Frontend UI is present and backend route (`/auth/google`) exists, but full integration relies on specific environment variables and external configuration.
- **Sub-Admin Role Management:** Sub-admin schema and permissions exist, but extensive management UI is still in progress.

## Scope

**In-Scope:**
- Job matching and skill gap analysis
- Interview preparation (questions, tests, quizzes)
- Resume management and building
- Recruitment management (pipelines, scheduling)
- Admin analytics and system management

**Out-of-Scope:**
- Payment and billing integrations
- Chat/messaging systems between users
- Video interviews functionality
- Native mobile applications
- Email notifications (no SMTP configured)
- Social media integrations beyond basic profile links

## Non-Functional Requirements

- **Security:**
  - Configured with Helmet.js for secure HTTP headers.
  - Rate limiting implemented (e.g., 50 requests/15 minutes on authentication routes).
  - Password security using bcrypt (12 rounds).
  - Secure JWT authentication and express-validator for robust input validation.
  - Role-based access control and admin permissions system.
- **Performance:**
  - Pagination applied on all list endpoints.
  - MongoDB indexing implemented for optimal query performance.
  - Rate limiting protects system resources.
- **Responsiveness:**
  - Mobile, tablet, and desktop breakpoints handled via CSS.
- **Maintainability:**
  - Modular architecture with clean separation of routes, models, controllers, and middleware.

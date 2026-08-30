# HirePrep Project Requirements

## Project Overview

**Project Name:** HirePrep
**Description:** Intelligent Job Matching & Interview Preparation Platform

**Team:**
- Suraj Kumar (Lead)
- Prabhat Kumar
- Ankit Kumar
- Om Prakash Tiwari
- Ravi Kumar
- Shalini Kumari

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

5. **Recruiter Dashboard**
   - Overview stats and job performance analytics.
   - Kanban-style applicant pipeline view.
   - Candidate comparison (compare 2-3 candidates side-by-side).
   - Interview scheduling tool (date, type [phone/video/onsite], notes).

6. **Interview Preparation**
   - Company-specific preparation paths (e.g., Amazon, Google, Microsoft).
   - Questions organized by difficulty, topic, and roles.
   - Practice interface with detailed views (explanations, hints).
   - MCQ quizzes with timers.
   - Mock tests configurable by category, question count, and time.

7. **Resume Builder**
   - Resume upload support (PDF format, using multer).
   - PDF parsing integration (pdf-parse).
   - Resume data CRUD operations and ATS score display.
   - Template selection options: Modern, Classic, Minimal.

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

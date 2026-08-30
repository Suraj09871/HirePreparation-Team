# HirePrep Project Development Rules

These rules document the architecture, coding conventions, security practices, and standards for the HirePrep project. All new development MUST follow these established patterns.

## 1. General Rules
- **File Naming Conventions:**
  - HTML files: `kebab-case.html` (e.g., `student-dashboard.html`).
  - JavaScript files (Frontend): `kebab-case.js` (e.g., `student-dashboard.js`).
  - Mongoose Models: `PascalCase.js` (e.g., `StudentProfile.js`).
  - Routes and API Paths: `kebab-case` (e.g., `/api/auth/admin-login`).
- **User Roles:** The system uses four primary roles: `student`, `recruiter`, `admin`, and `sub-admin`.
- **Application Statuses:** `new`, `in-review`, `shortlisted`, `interview`, `selected`, `rejected`.
- **Job Statuses:** `active`, `closed`, `draft`.

## 2. Technology Rules (MUST use)
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+). NO frontend frameworks (React, Vue, Angular) are allowed.
- **Backend:** Node.js with Express.js.
- **Database:** MongoDB with Mongoose ODM.
- **Styling:** Custom CSS using CSS Custom Properties (Variables) for theming.
- **Font:** Inter (via Google Fonts).

## 3. Library Rules
- **Backend Dependencies:**
  - Core: `express` (v4.21.0), `mongoose` (v8.5.0), `dotenv`.
  - Authentication: `jsonwebtoken`, `bcryptjs`.
  - Security/Middleware: `cors`, `helmet`, `express-rate-limit`, `express-validator`, `morgan` (logging).
  - Utilities: `multer` (file uploads), `pdf-parse` (resume parsing).
- **Frontend Libraries:**
  - Charts: Chart.js via CDN (used in admin dashboard).
  - Fonts: Google Fonts (Inter).

## 4. Frontend Rules
- **Architecture:** HTML Pages → JS Files (in `/js/`) → API Wrapper (`api.js`) → Backend.
- **API Wrapper:** `api.js` is the SINGLE point of communication with the backend. All network requests must use its methods (`API.get()`, `API.post()`, etc.). Do not use raw `fetch()` or `XMLHttpRequest` in feature scripts.
- **Theming:**
  - Use CSS Variables for all colors, spacing, and typography.
  - Implement Dark/Light mode using the `data-theme` attribute on the root `<html>` element.
- **Authentication State:** JWT and user details are stored in `localStorage` under keys `hireprep_token` and `hireprep_user`.

## 5. Backend Rules
- **Architecture:** Route → Controller (inline within route files) → Model → Database.
- **Mongoose Models:** Define schema explicitly. Ensure sensitive data (like passwords) is stripped when sending JSON responses (e.g., overriding the `toJSON` method).
- **File Uploads:** Handled via `multer`. Files are stored in `server/uploads/`.
- **Logging:** Use `morgan` for HTTP request logging.

## 6. API Rules
- **Endpoints:** All endpoints must be prefixed with `/api` and use kebab-case routing.
- **Success Responses:** Always structure as `{ success: true, data: {...} }` or similar.
- **Error Responses:** Always structure as `{ success: false, message: '...', errors: [...] }`.

## 7. Security Rules
- **Authentication:** Use JWT for session management.
- **Passwords:** Hash all passwords using `bcryptjs` with 12 salt rounds. NEVER return the password hash in API responses.
- **Authorization:** Enforce role-based access control (RBAC). Use the `roleCheck` middleware for admin-only or role-specific routes.
- **Rate Limiting:** Apply `express-rate-limit` (e.g., 50 requests per 15 minutes) on authentication routes to prevent brute-force attacks.
- **Headers:** Use `helmet` to set secure HTTP headers.
- **Validation:** Sanitize and validate all incoming request bodies and parameters using `express-validator`.
- **Git:** Ensure `.env`, `server/.env`, `node_modules/`, and `server/uploads/*` are excluded via `.gitignore`.

## 8. Error Handling Rules
- Express routes must catch async errors and pass them to error-handling middleware.
- Validate inputs early using `express-validator` and return 400 Bad Request with an array of specific error messages if validation fails.
- Do not expose stack traces or internal server error details in production responses.

# HireSmart Architecture & Project Map

> **For AI Assistants:** Read this file first to quickly understand the project structure and where logic is handled. This will save tokens and provide immediate context for modifications.

## 📊 High-Level Architecture
HireSmart is a full-stack platform using a **Node.js/Express backend** with MongoDB, and a **Vanilla HTML/CSS/JS frontend**.

```mermaid
graph TD
    subgraph Frontend [Frontend (Vanilla HTML/JS/CSS)]
        UI[HTML Pages]
        Styles[CSS/style.css]
        ClientJS[Client Logic /js/]
        API_Wrapper[API Wrapper /js/api.js]
        
        UI --> Styles
        UI --> ClientJS
        ClientJS --> API_Wrapper
    end

    subgraph Backend [Backend (Node.js + Express + Mongoose)]
        Server[server.js]
        Routes[Express Routes /server/routes/]
        Models[Mongoose Models /server/models/]
        DB[(MongoDB Atlas)]
        
        API_Wrapper -->|HTTP/REST| Server
        Server --> Routes
        Routes --> Models
        Models --> DB
    end
```

---

## 📂 Directory Structure & File Map

### 1. Frontend HTML (`/frontend/` & Root)
Where the UI markup lives.
- `index.html` - The public landing page.
- `frontend/auth.html` - Login and Signup page.
- `frontend/admin/admin-dashboard.html` - The central admin portal (Analytics, Users, Companies, Questions).
- `frontend/student/` - Core user portal.
  - `student-dashboard.html` - Main landing area post-login.
  - `student-profile.html` - User settings, forms, and basic details (Accordion layout).
  - `roadmap.html` - Step-by-step career tracking layout.
  - `practice.html` & `preparation.html` - Question banks and company prep interfaces.

### 2. Client-Side JavaScript (`/js/`)
Where all browser-side logic, API calling, and DOM manipulation lives.
- **`js/api.js`**: **CRITICAL FILE.** The central wrapper for all backend communication (`API.get()`, `API.post()`). Handles JWT tokens, authentication state, and error handling.
- **`js/unified-auth.js`**: Handles login/signup forms, Google Auth (mocked currently), and role-based redirects.
- **`js/admin.js`**: Controls the Admin Dashboard (tab switching, Chart.js rendering, user role management).
- **`js/student-profile.js`**: Handles form population, UI pill selection, and saving data to the backend for the Settings page.
- **`js/roadmap.js`**: Calculates user progress (0/5 steps) based on profile completion.
- **`js/theme.js`**: Global dark/light mode toggle logic.

### 3. Backend Routes (`/server/routes/`)
Where RESTful endpoints are defined.
- `auth.js` - `/api/auth/register` and `/api/auth/login`. Issues JWTs.
- `profile.js` - `/api/profile`. Handles fetching and updating the massive `StudentProfile` schema (including the dynamic `additionalDetails` field).
- `admin.js` - `/api/admin/...`. Protected routes (Admin role only) for fetching system analytics and updating user roles.
- `companies.js` - Manages preparation company data.

### 4. Backend Models (`/server/models/`)
Where MongoDB Mongoose schemas are defined.
- `User.js` - Basic credentials: name, email, password, role (`student` or `admin`).
- `StudentProfile.js` - Extended user data: education, skills, resume URL. Contains an `additionalDetails` Mixed-type object to dynamically store complex frontend form fields (DOB, Pronouns, Hobbies) without rigid schema migrations.

### 5. Styling (`/css/`)
- `style.css` - A unified, tailwind-like utility stylesheet. Contains root CSS variables (`--primary`, `--card-bg`) that power the theme engine.

---

## 🔑 Key Workflows for Future Edits

1. **Adding a new form field to the Student Profile:**
   - **Edit:** `frontend/student/student-profile.html` (Add the HTML input).
   - **Edit:** `js/student-profile.js` (Extract the value and push it to the `additionalDetails` object in the payload).
   - *No backend changes needed* (The `additionalDetails` field automatically accepts arbitrary JSON).

2. **Editing the Admin Dashboard Tabs:**
   - **Edit:** `frontend/admin/admin-dashboard.html` (Add the empty container).
   - **Edit:** `js/admin.js` (Add a `renderNewTab()` function and map it to the navigation click).

3. **Updating API logic or Tokens:**
   - **Edit:** `js/api.js` (Do not use raw `fetch()` anywhere else in the app; always route through `API.js`).

4. **Changing Colors or Themes:**
   - **Edit:** `css/style.css` (Modify the `:root` and `[data-theme="dark"]` CSS variables).

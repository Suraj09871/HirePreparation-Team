# Git Workflow & GitHub Contribution Guide

## Repository
https://github.com/Suraj09871/HirePreparation

## Branch Strategy
```
main (production — stable, working application)
   |
   +---- suraj-backend-integration  (Suraj — Backend, API, Auth, Deployment)
   |
   +---- sunny-admin                (Sunny — Admin Module)
   |
   +---- shikha-recruiter           (Shikha — Recruiter Module)
   |
   +---- reenu-student              (Reenu — Student/User Module)
```

## Production Architecture (DO NOT CHANGE)
```
GitHub → HirePreparation
        ↓
   ┌────┴─────┐
   ↓          ↓
Netlify     Render
(Frontend)  (Backend)
              ↓
         MongoDB Atlas
```

## Initial Setup — For ALL Developers

### 1. Clone the Repository
```bash
git clone https://github.com/Suraj09871/HirePreparation.git
cd HirePreparation
```

### 2. Create Your Branch
Each developer creates their own branch from main:

Suraj:
```bash
git checkout -b suraj-backend-integration
```

Sunny:
```bash
git checkout -b sunny-admin
```

Shikha:
```bash
git checkout -b shikha-recruiter
```

Reenu:
```bash
git checkout -b reenu-student
```

### 3. Verify Your Branch
```bash
git branch
# Should show: * your-branch-name
```

## Daily Development Workflow

### 1. Check Status
```bash
git status
```

### 2. Stage Changes
```bash
# Stage specific files
git add path/to/modified/file.js

# Stage all changes
git add .
```

### 3. Commit with Meaningful Message
```bash
git commit -m "feat(module): brief description of change"
```

Commit message format:
- `feat(module):` — new feature
- `fix(module):` — bug fix
- `refactor(module):` — code restructuring
- `style(module):` — formatting, no logic change
- `docs(module):` — documentation
- `chore(module):` — maintenance tasks

### 4. Push to GitHub
```bash
git push origin your-branch-name
```

First push (set upstream):
```bash
git push -u origin your-branch-name
```

### 5. Pull Latest Main Before Continuing
Always sync with main regularly:
```bash
git checkout main
git pull origin main
git checkout your-branch-name
git merge main
```

If there are merge conflicts:
1. Git will mark conflicting files
2. Open each file and resolve conflicts (look for `<<<<<<<`, `=======`, `>>>>>>>`)
3. After resolving:
```bash
git add .
git commit -m "merge: resolve conflicts with latest main"
```

## Creating Pull Requests

### 1. Push Your Branch
```bash
git push origin your-branch-name
```

### 2. Go to GitHub
Visit: https://github.com/Suraj09871/HirePreparation

### 3. Click "Compare & pull request"

### 4. Configure Pull Request
- **Base branch:** `main`
- **Compare branch:** `your-branch-name`
- **Title:** Clear description of changes
- **Description:** What changed, files modified, testing done

### 5. Request Review
- All PRs should be reviewed by Suraj (integration lead)

### 6. Wait for Approval
- Reviewer may request changes
- Make changes, commit, push — PR updates automatically

## Recommended Merge Order

Based on dependencies:

```
1. suraj-backend-integration → main   (FIRST — backend APIs must exist)
2. reenu-student             → main   (Student module — most files, least conflicts)
3. shikha-recruiter          → main   (Recruiter module)
4. sunny-admin               → main   (Admin module — last, depends on all data)
```

Why this order:
1. Suraj's backend must be merged first because ALL frontend modules depend on the API endpoints
2. Reenu has the most files (25) but they're completely isolated in `frontend/student/` and student JS files — lowest conflict risk
3. Shikha's recruiter files are also isolated in `frontend/recruiter/` — low conflict risk
4. Sunny merges last because admin has visibility into ALL data (users, companies, jobs, applications)

## After Each Merge

After Suraj merges backend:
```bash
# All other developers should update their branches:
git checkout main
git pull origin main
git checkout your-branch-name
git merge main
```

## Resolving Merge Conflicts

### Step 1: Identify Conflicts
```bash
git status
# Shows files with conflicts
```

### Step 2: Open Conflicting Files
Look for conflict markers:
```
<<<<<<< HEAD
your changes
=======
their changes
>>>>>>> main
```

### Step 3: Choose the Correct Version
- Keep your changes if they're in your module files
- Keep main's changes if they're in shared files
- Combine both if needed

### Step 4: Resolve and Continue
```bash
git add .
git commit -m "merge: resolve conflicts with main"
git push origin your-branch-name
```

## Rules for All Developers

1. **Never push directly to main** — always use Pull Requests
2. **Never modify files outside your module** — see docs/team-ownership.md
3. **Never commit secrets** — .env files, API keys, passwords
4. **Always pull latest main** before starting new work
5. **Write meaningful commit messages** with the conventional format
6. **Test your changes locally** before pushing
7. **Coordinate with Suraj** before modifying any shared file

## Important: What NOT to Commit

These files are in `.gitignore` and must NEVER be committed:
- `.env` and `server/.env` — secrets!
- `node_modules/` — install with `npm install`
- `server/uploads/*` — user uploaded files
- `*.log` — log files
- `.vscode/`, `.idea/` — IDE config

## Updating Your Branch from Main

If main has been updated (e.g., another developer's PR was merged):

```bash
# Method 1: Merge (recommended for beginners)
git checkout main
git pull origin main
git checkout your-branch-name
git merge main

# Method 2: Rebase (cleaner history, advanced)
git checkout your-branch-name
git fetch origin
git rebase origin/main
```

## Final Integration Process

After all four developers complete their modules:

1. Update local main:
```bash
git checkout main
git pull origin main
```

2. Merge in order (via Pull Requests on GitHub):
   - `suraj-backend-integration → main`
   - `reenu-student → main`
   - `shikha-recruiter → main`
   - `sunny-admin → main`

3. After each merge, all remaining developers rebase/merge main

4. Run complete application locally:
```bash
cd server && npm install && npm run dev
# In another terminal, serve frontend (e.g., Live Server)
```

5. Test all major workflows from merge checklist

6. Push final main:
```bash
git push origin main
```

7. Verify automatic deployments:
   - Render: Check https://hirepreparation-backend.onrender.com/api/health
   - Netlify: Check https://hiresmart.netlify.app

8. Production smoke testing:
   - Login as student, recruiter, admin
   - Test critical workflows
   - Verify MongoDB data integrity

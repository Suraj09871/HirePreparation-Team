/**
 * Universal Navigation Auth Handler
 * Role-based navigation: Admin, Recruiter, Student each see different links.
 * Include AFTER api.js on every page.
 * 
 * Features:
 * - Role-based nav links (admin sees admin links, student sees student links, etc.)
 * - Page access protection (prevents students from accessing admin pages)
 * - Logout functionality
 */
(function() {
    const user = API.getUser();
    const nav = document.querySelector('.nav-actions');
    const navLinks = document.querySelector('.nav-links');
    if (!nav) return;

    // ── Page Access Protection ──
    // Prevent unauthorized access to role-specific pages
    const currentPath = window.location.pathname.toLowerCase();
    if (user) {
        const role = user.role;
        // Students cannot access admin or recruiter pages
        if (role === 'student') {
            if (currentPath.includes('/admin/') || currentPath.includes('/recruiter/')) {
                window.location.href = '/frontend/student/student-dashboard.html';
                return;
            }
        }
        // Recruiters cannot access admin or student dashboard/profile pages
        if (role === 'recruiter') {
            if (currentPath.includes('/admin/')) {
                window.location.href = '/frontend/recruiter/recruiter-dashboard.html';
                return;
            }
            // Recruiters CAN view student practice/jobs pages (public pages), but not student dashboards
            if (currentPath.includes('/student/student-dashboard') || currentPath.includes('/student/student-profile') || currentPath.includes('/student/resume-builder')) {
                window.location.href = '/frontend/recruiter/recruiter-dashboard.html';
                return;
            }
        }
        // Admin can access everything - no restrictions
    } else {
        // Guest users cannot access any dashboard pages
        if (currentPath.includes('/admin/') || currentPath.includes('/recruiter/') || 
            currentPath.includes('student-dashboard') || currentPath.includes('student-profile') || 
            currentPath.includes('resume-builder')) {
            window.location.href = '/frontend/auth.html';
            return;
        }
    }

    // ── Build role-based navigation links ──
    if (navLinks) {
        const role = user?.role || 'guest';
        const linkMap = {
            admin: [
                { text: 'Dashboard', href: '/frontend/admin/admin-dashboard.html' },
                { text: 'Team', href: '/team.html' },
                { text: 'Docs', href: '/docs.html' }
            ],
            'sub-admin': [
                { text: 'Dashboard', href: '/frontend/admin/admin-dashboard.html' },
                { text: 'Docs', href: '/docs.html' }
            ],
            recruiter: [
                { text: 'Dashboard', href: '/frontend/recruiter/recruiter-dashboard.html' },
                { text: 'Post Jobs', href: '/frontend/recruiter/job-posting.html' },
                { text: 'Applicants', href: '/frontend/recruiter/applicant-list.html' }
            ],
            student: [
                { text: 'Home', href: '/index.html' },
                { text: 'Jobs', href: '/frontend/student/jobs.html' },
                { text: 'Practice', href: '/frontend/student/practice.html' },
                { text: 'Preparation', href: '/frontend/student/preparation.html' },
                { text: 'Dashboard', href: '/frontend/student/student-dashboard.html' },
                { text: 'Resume Builder', href: '/frontend/student/resume-builder.html' }
            ],
            guest: [
                { text: 'Home', href: '/index.html' },
                { text: 'Jobs', href: '/frontend/student/jobs.html' },
                { text: 'Practice', href: '/frontend/student/practice.html' },
                { text: 'Preparation', href: '/frontend/student/preparation.html' }
            ]
        };

        const links = linkMap[role] || linkMap.guest;

        navLinks.innerHTML = links.map(l => {
            const isActive = currentPath.includes(l.href.replace('/index.html','')) && l.href !== '/index.html' 
                            || currentPath === l.href 
                            || (l.href === '/index.html' && (currentPath === '/' || currentPath.endsWith('index.html')));
            return `<a href="${l.href}" ${isActive ? 'class="active"' : ''}>${l.text}</a>`;
        }).join('');
    }

    // ── Build auth actions (profile button + sign out) ──
    if (user) {
        const dashboardLink = user.role === 'admin' || user.role === 'sub-admin' 
            ? '/frontend/admin/admin-dashboard.html' 
            : user.role === 'recruiter' 
            ? '/frontend/recruiter/recruiter-dashboard.html'
            : '/frontend/student/student-dashboard.html';
        
        const roleBadge = user.role === 'admin' ? '👑' : user.role === 'recruiter' ? '💼' : '🎓';
        
        nav.innerHTML = `
            <span id="themeToggle" onclick="toggleTheme()" style="font-size:1.25rem;color:var(--text-muted);cursor:pointer;margin-right:0.5rem;transition:color 0.2s;">☼</span>
            <a href="${dashboardLink}" style="display:flex;align-items:center;gap:0.5rem;font-weight:500;font-size:0.875rem;text-decoration:none;color:var(--text-main);cursor:pointer;transition:opacity 0.2s;" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1">
                <span style="width:28px;height:28px;background:var(--primary);color:white;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.8rem;">${user.name.charAt(0).toUpperCase()}</span>
                ${user.name} <span style="font-size:0.7rem;">${roleBadge}</span>
            </a>
            <button class="btn btn-outline" onclick="handleLogout()" style="display:flex;align-items:center;gap:0.3rem;">
                <span>↪</span> Sign Out
            </button>
        `;
    } else {
        nav.innerHTML = `
            <span id="themeToggle" onclick="toggleTheme()" style="font-size:1.25rem;color:var(--text-muted);cursor:pointer;margin-right:0.5rem;transition:color 0.2s;">☼</span>
            <button class="btn btn-outline" onclick="window.location.href='/frontend/auth.html'">Sign In</button>
            <button class="btn btn-dark" onclick="window.location.href='/frontend/auth.html'">Get Started</button>
        `;
    }

    // ── Sync theme icon ──
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) toggleBtn.textContent = isDark ? '🌙' : '☼';

    // ── Fix logo text ──
    document.querySelectorAll('.logo').forEach(el => {
        if (el.textContent.includes('HirePrep')) {
            el.innerHTML = el.innerHTML.replace('HirePrep', 'HireSmart');
        }
    });
})();

// Global logout handler
function handleLogout() {
    API.clearAuth();
    window.location.href = '/frontend/auth.html';
}

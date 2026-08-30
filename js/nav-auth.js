/**
 * Universal Navigation Auth Handler
 * Role-based navigation: Admin, Recruiter, Student each see different links.
 * Include AFTER api.js on every page.
 * 
 * Features:
 * - Role-based nav links (admin sees admin links, student sees student links, etc.)
 * - Page access protection (prevents unauthorized access)
 * - Rock-solid global logout functionality
 * - Theme toggle (☀️ / 🌙)
 * - Fully responsive hamburger menu
 */

// ── Global Logout Handler ──
window.handleLogout = function() {
    try {
        if (typeof API !== 'undefined' && API.clearAuth) {
            API.clearAuth();
        }
    } catch(e) {}
    localStorage.removeItem('hireprep_token');
    localStorage.removeItem('hireprep_user');
    sessionStorage.clear();

    var path = window.location.pathname;
    var base = '';
    if (/\/frontend\/(student|recruiter|admin)\//i.test(path)) base = '../../';
    else if (/\/frontend\//i.test(path)) base = '../';
    
    window.location.href = base + 'frontend/auth.html';
};

(function() {
    function getBasePath() {
        var path = window.location.pathname;
        if (/\/frontend\/(student|recruiter|admin)\//i.test(path)) return '../../';
        if (/\/frontend\//i.test(path)) return '../';
        return '';
    }

    function initNavAuth() {
        var user = (typeof API !== 'undefined' && API.getUser) ? API.getUser() : null;
        var nav = document.querySelector('.nav-actions');
        var navLinks = document.querySelector('.nav-links');
        var base = getBasePath();
        var currentPath = window.location.pathname.toLowerCase();

        // ── Page Access Protection ──
        if (user) {
            var role = user.role;
            if (role === 'student') {
                if (currentPath.includes('/admin/') || currentPath.includes('/recruiter/')) {
                    window.location.href = base + 'frontend/student/student-dashboard.html';
                    return;
                }
            }
            if (role === 'recruiter') {
                if (currentPath.includes('/admin/')) {
                    window.location.href = base + 'frontend/recruiter/recruiter-dashboard.html';
                    return;
                }
                if (currentPath.includes('/student/student-dashboard') || currentPath.includes('/student/student-profile') || currentPath.includes('/student/resume-builder')) {
                    window.location.href = base + 'frontend/recruiter/recruiter-dashboard.html';
                    return;
                }
            }
        } else {
            if (currentPath.includes('/admin/') || currentPath.includes('/recruiter/') || 
                currentPath.includes('student-dashboard') || currentPath.includes('student-profile') || 
                currentPath.includes('resume-builder') || currentPath.includes('roadmap')) {
                window.location.href = base + 'frontend/auth.html';
                return;
            }
        }

        // ── Build role-based navigation links ──
        if (navLinks) {
            var userRole = user ? user.role : 'guest';
            var linkMap = {
                admin: [
                    { text: 'Dashboard', href: base + 'frontend/admin/admin-dashboard.html' },
                    { text: 'Team', href: base + 'team.html' },
                    { text: 'Docs', href: base + 'docs.html' }
                ],
                'sub-admin': [
                    { text: 'Dashboard', href: base + 'frontend/admin/admin-dashboard.html' },
                    { text: 'Docs', href: base + 'docs.html' }
                ],
                recruiter: [
                    { text: 'Dashboard', href: base + 'frontend/recruiter/recruiter-dashboard.html' },
                    { text: 'Post Jobs', href: base + 'frontend/recruiter/job-posting.html' },
                    { text: 'Applicants', href: base + 'frontend/recruiter/applicant-list.html' }
                ],
                student: [
                    { text: 'Home', href: base + 'index.html' },
                    { text: 'Jobs', href: base + 'frontend/student/jobs.html' },
                    { text: 'Practice', href: base + 'frontend/student/practice.html' },
                    { text: 'Preparation', href: base + 'frontend/student/preparation.html' },
                    { text: 'Dashboard', href: base + 'frontend/student/student-dashboard.html' },
                    { text: 'Resume', href: base + 'frontend/student/resume-builder.html' }
                ],
                guest: [
                    { text: 'Home', href: base + 'index.html' },
                    { text: 'Jobs', href: base + 'frontend/student/jobs.html' },
                    { text: 'Practice', href: base + 'frontend/student/practice.html' },
                    { text: 'Preparation', href: base + 'frontend/student/preparation.html' }
                ]
            };

            var links = linkMap[userRole] || linkMap.guest;

            navLinks.innerHTML = links.map(function(l) {
                var linkPath;
                try { linkPath = new URL(l.href, window.location.href).pathname; } catch(e) { linkPath = ''; }
                var isActive = currentPath === linkPath ||
                                (l.text === 'Home' && (currentPath === '/' || currentPath.endsWith('index.html')));
                return '<a href="' + l.href + '"' + (isActive ? ' class="active"' : '') + '>' + l.text + '</a>';
            }).join('');
        }

        // ── Brand Logo Update ──
        var logoEl = document.querySelector('.logo');
        if (logoEl) {
            logoEl.style.cursor = 'pointer';
            logoEl.style.display = 'inline-flex';
            logoEl.style.alignItems = 'center';
            logoEl.style.gap = '0.5rem';
            logoEl.onclick = function() { window.location.href = base + 'index.html'; };
            logoEl.innerHTML = '<img src="' + base + 'assets/logo.png" alt="HirePrep Logo" style="height:36px;width:auto;object-fit:contain;vertical-align:middle;"> <span style="vertical-align:middle;font-weight:700;letter-spacing:-0.5px;color:var(--text-main);">HirePrep</span>';
        }

        // ── Render nav-actions ──
        if (nav) {
            nav.innerHTML = '';

            // Theme toggle button
            var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            var themeBtn = document.createElement('button');
            themeBtn.id = 'themeToggle';
            themeBtn.type = 'button';
            themeBtn.className = 'btn-theme-toggle';
            themeBtn.setAttribute('aria-label', 'Toggle dark mode');
            themeBtn.style.cssText = 'background:none;border:none;font-size:1.3rem;cursor:pointer;padding:0.4rem 0.5rem;border-radius:8px;color:var(--text-muted);transition:all 0.2s;display:inline-flex;align-items:center;justify-content:center;margin-right:0.3rem;';
            themeBtn.textContent = isDark ? '🌙' : '☀️';

            themeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (typeof toggleTheme === 'function') {
                    toggleTheme();
                }
                var nowDark = document.documentElement.getAttribute('data-theme') === 'dark';
                themeBtn.textContent = nowDark ? '🌙' : '☀️';
            });
            nav.appendChild(themeBtn);

            if (user) {
                // Universal Notification Bell for Logged-in Users
                var notifBtn = document.createElement('button');
                notifBtn.id = 'universalNotifBell';
                notifBtn.type = 'button';
                notifBtn.setAttribute('aria-label', 'Open Notifications');
                notifBtn.style.cssText = 'position:relative;background:none;border:none;cursor:pointer;font-size:1.25rem;padding:0.35rem 0.55rem;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;margin-right:0.4rem;transition:transform 0.15s ease;';
                notifBtn.innerHTML = '🔔<span id="universalNotifBadge" style="position:absolute;top:-2px;right:-2px;background:#ef4444;color:white;font-size:0.6rem;font-weight:700;padding:0.1rem 0.35rem;border-radius:999px;display:none;">0</span>';

                notifBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.openUniversalNotificationCenter();
                });
                nav.appendChild(notifBtn);

                // Fetch real unread notification count
                if (typeof API !== 'undefined' && API.get) {
                    API.get('/notifications/unread-count').then(function(res) {
                        var badge = document.getElementById('universalNotifBadge');
                        if (badge && res && res.count > 0) {
                            badge.textContent = res.count;
                            badge.style.display = 'inline-block';
                        }
                    }).catch(function() {});
                }

                var dashboardLink = (user.role === 'admin' || user.role === 'sub-admin')
                    ? base + 'frontend/admin/admin-dashboard.html'
                    : user.role === 'recruiter' 
                    ? base + 'frontend/recruiter/recruiter-dashboard.html'
                    : base + 'frontend/student/student-dashboard.html';
                
                var roleBadge = user.role === 'admin' ? '👑' : user.role === 'recruiter' ? '💼' : '🎓';
                var initial = user.name ? user.name.charAt(0).toUpperCase() : '?';
                var safeName = (typeof sanitize === 'function') ? sanitize(user.name) : user.name;

                // Profile link
                var profileLink = document.createElement('a');
                profileLink.href = dashboardLink;
                profileLink.className = 'user-nav-profile';
                profileLink.style.cssText = 'display:flex;align-items:center;gap:0.4rem;font-weight:500;font-size:0.875rem;text-decoration:none;color:var(--text-main);cursor:pointer;transition:opacity 0.2s;';
                profileLink.innerHTML = '<span style="width:28px;height:28px;background:var(--primary);color:white;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.8rem;flex-shrink:0;">' + initial + '</span> <span class="profile-name-text">' + safeName + '</span> <span style="font-size:0.75rem;">' + roleBadge + '</span>';
                nav.appendChild(profileLink);

                // Sign out button
                var signOutBtn = document.createElement('button');
                signOutBtn.className = 'btn btn-outline btn-signout';
                signOutBtn.type = 'button';
                signOutBtn.style.cssText = 'display:inline-flex;align-items:center;gap:0.3rem;cursor:pointer;';
                signOutBtn.innerHTML = '<span>↪</span> Sign Out';
                signOutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.handleLogout();
                });
                nav.appendChild(signOutBtn);

            } else {
                // Sign In link
                var signInLink = document.createElement('a');
                signInLink.href = base + 'frontend/auth.html';
                signInLink.className = 'btn btn-outline';
                signInLink.textContent = 'Sign In';
                signInLink.style.textDecoration = 'none';
                nav.appendChild(signInLink);

                // Get Started link
                var getStartedLink = document.createElement('a');
                getStartedLink.href = base + 'frontend/auth.html';
                getStartedLink.className = 'btn btn-dark';
                getStartedLink.textContent = 'Get Started';
                getStartedLink.style.textDecoration = 'none';
                nav.appendChild(getStartedLink);
            }
        }

        // ── Mobile Hamburger menu ──
        var hamburger = document.getElementById('hamburgerBtn');
        if (hamburger && navLinks) {
            hamburger.addEventListener('click', function(e) {
                e.stopPropagation();
                var expanded = hamburger.classList.toggle('active');
                navLinks.classList.toggle('active');
                hamburger.setAttribute('aria-expanded', String(expanded));
            });

            navLinks.addEventListener('click', function(e) {
                if (e.target.tagName === 'A') {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            });

            document.addEventListener('click', function(e) {
                if (!e.target.closest('.navbar')) {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // ── Fix logo text ──
        document.querySelectorAll('.logo').forEach(function(el) {
            if (el.textContent.includes('HirePrep')) {
                el.innerHTML = el.innerHTML.replace('HirePrep', 'HirePrep');
            }
        });
    }

    // Execute immediately and on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavAuth);
    } else {
        initNavAuth();
    }
})();

// ── Universal Notification Center Modal ──
window.closeUniversalNotificationCenter = function() {
    var m1 = document.getElementById('universalNotifModal');
    if (m1) m1.style.display = 'none';
    var m2 = document.getElementById('universalNotifDetailModal');
    if (m2) m2.style.display = 'none';
};

window.openUniversalNotificationCenter = async function() {
    var modal = document.getElementById('universalNotifModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'universalNotifModal';
        modal.className = 'modal-backdrop';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.65);backdrop-filter:blur(4px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:1rem;';
        document.body.appendChild(modal);
    }

    // Close on backdrop click
    modal.onclick = function(e) {
        if (e.target === modal) {
            window.closeUniversalNotificationCenter();
        }
    };

    modal.innerHTML = '<div style="background:var(--card-bg, white);color:var(--text-main);border-radius:16px;padding:2.5rem;text-align:center;font-weight:600;"><div style="font-size:2rem;margin-bottom:0.75rem;animation:pulse 2s infinite;">⏳</div>Loading notifications...</div>';
    modal.style.display = 'flex';

    try {
        var res = await API.get('/notifications/my');
        var notifs = res.notifications || [];
        window._universalNotifsCache = notifs;

        var typeIcons = {
            announcement: '📢',
            alert: '⚠️',
            achievement: '🏆',
            reminder: '🔔',
            system: '⚙️'
        };

        modal.innerHTML = `
            <div style="background:var(--card-bg, #ffffff);color:var(--text-main, #0f172a);border-radius:16px;max-width:580px;width:100%;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 25px 50px -12px rgba(0,0,0,0.35);border:1px solid var(--border-color, #e2e8f0);overflow:hidden;position:relative;" onclick="event.stopPropagation()">
                <div style="display:flex;justify-content:space-between;align-items:center;padding:1.25rem 1.5rem;border-bottom:1px solid var(--border-color);background:var(--bg-muted, #f8fafc);">
                    <div style="display:flex;align-items:center;gap:0.6rem;">
                        <span style="font-size:1.3rem;">🔔</span>
                        <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:var(--text-main);">Notifications Center (${notifs.length})</h3>
                    </div>
                    <button type="button" onclick="window.closeUniversalNotificationCenter()" style="background:rgba(0,0,0,0.05);border:none;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:1.25rem;cursor:pointer;color:var(--text-muted);line-height:1;transition:background 0.15s ease;" onmouseover="this.style.background='rgba(0,0,0,0.1)'" onmouseout="this.style.background='rgba(0,0,0,0.05)'" title="Close">&times;</button>
                </div>

                <div style="padding:1.25rem;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:0.75rem;">
                    ${notifs.length === 0 ? '<div style="text-align:center;padding:3rem 1rem;color:var(--text-muted);font-size:0.9rem;">🎉 You\'re all caught up! No notifications right now.</div>' : notifs.map(function(n, idx) {
                        var icon = typeIcons[n.type] || '📢';
                        var isUnread = !n.isRead;
                        var notifIdStr = String(n._id || n.id || idx);
                        return `
                            <div onclick="window.openUniversalNotifDetail('${notifIdStr}')" style="background:var(--card-bg, white);border:1px solid var(--border-color);border-radius:10px;padding:1rem;cursor:pointer;${isUnread ? 'border-left:4px solid #f97316;background:rgba(249,115,22,0.03);' : ''}transition:all 0.15s ease;" onmouseover="this.style.borderColor='#f97316';this.style.transform='translateY(-1px)';" onmouseout="this.style.borderColor='var(--border-color)';this.style.transform='none';" title="Click to view details">
                                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.75rem;margin-bottom:0.35rem;">
                                    <div style="display:flex;align-items:center;gap:0.5rem;">
                                        <span style="font-size:1.15rem;">${icon}</span>
                                        <span style="font-weight:700;font-size:0.92rem;color:var(--text-main);">${typeof sanitize === 'function' ? sanitize(n.title) : n.title}</span>
                                    </div>
                                    <div style="display:flex;align-items:center;gap:0.5rem;">
                                        ${isUnread ? '<span style="background:#ef4444;color:white;font-size:0.65rem;font-weight:700;padding:0.1rem 0.4rem;border-radius:999px;">NEW</span>' : ''}
                                        <span style="font-size:0.75rem;color:var(--text-muted);">${new Date(n.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div style="font-size:0.85rem;color:var(--text-muted);line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                                    ${typeof sanitize === 'function' ? sanitize(n.message) : n.message}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div style="display:flex;justify-content:flex-end;padding:1rem 1.5rem;border-top:1px solid var(--border-color);background:var(--bg-muted, #f8fafc);">
                    <button type="button" onclick="window.closeUniversalNotificationCenter()" class="btn btn-outline" style="font-size:0.85rem;padding:0.45rem 1.5rem;border-radius:8px;cursor:pointer;font-weight:600;">Close</button>
                </div>
            </div>
        `;
    } catch(err) {
        modal.innerHTML = '<div style="background:white;border-radius:16px;padding:2rem;text-align:center;color:#ef4444;">Failed to load notifications: ' + err.message + '<br><br><button type="button" onclick="window.closeUniversalNotificationCenter()" class="btn btn-outline">Close</button></div>';
    }
};

window.openUniversalNotifDetail = async function(notifIdOrIndex) {
    var notifs = window._universalNotifsCache || [];
    var n = notifs.find(function(item, idx) {
        return String(item._id) === String(notifIdOrIndex) || String(item.id) === String(notifIdOrIndex) || String(idx) === String(notifIdOrIndex);
    });
    if (!n && notifs.length > 0) n = notifs[0];
    if (!n) return;

    // Mark as read in DB
    if (n._id || n.id) {
        try {
            var targetId = n._id || n.id;
            await API.put('/notifications/' + targetId + '/read');
            n.isRead = true;
            var badge = document.getElementById('universalNotifBadge');
            if (badge) {
                var cur = parseInt(badge.textContent || '1') - 1;
                badge.textContent = Math.max(0, cur);
                if (cur <= 0) badge.style.display = 'none';
            }
        } catch(e) {}
    }

    var typeIcons = { announcement: '📢', alert: '⚠️', achievement: '🏆', reminder: '🔔', system: '⚙️' };
    var icon = typeIcons[n.type] || '📢';

    // Hide main modal while detail is shown
    var mainModal = document.getElementById('universalNotifModal');
    if (mainModal) mainModal.style.display = 'none';

    var detailModal = document.getElementById('universalNotifDetailModal');
    if (!detailModal) {
        detailModal = document.createElement('div');
        detailModal.id = 'universalNotifDetailModal';
        detailModal.className = 'modal-backdrop';
        detailModal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.7);backdrop-filter:blur(4px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:1.25rem;';
        document.body.appendChild(detailModal);
    }

    // Close on backdrop click
    detailModal.onclick = function(e) {
        if (e.target === detailModal) {
            window.closeUniversalNotificationCenter();
        }
    };

    detailModal.innerHTML = `
        <div style="background:var(--card-bg, #ffffff);color:var(--text-main, #0f172a);border-radius:16px;padding:1.75rem;max-width:520px;width:100%;box-shadow:0 25px 50px -12px rgba(0,0,0,0.35);border:1px solid var(--border-color);position:relative;" onclick="event.stopPropagation()">
            <button type="button" onclick="window.closeUniversalNotificationCenter()" style="position:absolute;top:1rem;right:1rem;background:rgba(0,0,0,0.05);border:none;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:1.25rem;cursor:pointer;color:var(--text-muted);line-height:1;" title="Close">&times;</button>
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
                <span style="font-size:2rem;">${icon}</span>
                <div>
                    <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:var(--text-main);">${typeof sanitize === 'function' ? sanitize(n.title) : n.title}</h3>
                    <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.2rem;">Received: ${new Date(n.createdAt).toLocaleString()}</div>
                </div>
            </div>
            <div style="background:var(--bg-muted, #f8fafc);border:1px solid var(--border-color);border-radius:10px;padding:1.25rem;font-size:0.92rem;line-height:1.6;color:var(--text-main);white-space:pre-wrap;margin-bottom:1.5rem;max-height:40vh;overflow-y:auto;">${typeof sanitize === 'function' ? sanitize(n.message) : n.message}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem;">
                <button type="button" onclick="document.getElementById('universalNotifDetailModal').style.display='none'; window.openUniversalNotificationCenter();" class="btn btn-outline" style="font-size:0.85rem;padding:0.45rem 1.25rem;border-radius:8px;cursor:pointer;font-weight:600;">← All Notifications</button>
                <button type="button" onclick="window.closeUniversalNotificationCenter()" class="btn btn-primary" style="font-size:0.85rem;padding:0.45rem 1.5rem;border-radius:8px;cursor:pointer;font-weight:600;">Done</button>
            </div>
        </div>
    `;
    detailModal.style.display = 'flex';
};

// Global escape key listener to close notification modals
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        window.closeUniversalNotificationCenter();
    }
});


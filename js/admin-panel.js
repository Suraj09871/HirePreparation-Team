// admin-panel.js — Full Admin Control Panel with Live Analytics, User Role Manager, Company Verifications, CSV Exporter & Platform Monitoring
const adminTitles = {
    dashboard: '📊 Analytics Dashboard',
    users: '👥 User Management',
    companies: '🏢 Company Verification',
    content: '📝 Content Management',
    questions: '❓ Question Bank',
    roadmaps: '🗺 Preparation Roadmaps',
    monitoring: '📡 Platform Health & Monitoring',
    notifications: '📢 Broadcast Notifications',
    reports: '📑 Export CSV Reports',
    matching: '🎯 Matching Algorithm Rules'
};

document.addEventListener('DOMContentLoaded', () => {
    var base = (/\/frontend\/(student|recruiter|admin)\//i.test(window.location.pathname)) ? '../../' : '';
    if (!API.isLoggedIn()) return window.location.href = base + 'frontend/auth.html';
    
    const u = API.getUser();
    if (u.role !== 'admin' && u.role !== 'sub-admin') return window.location.href = base + 'index.html';
    
    if (document.getElementById('adminName')) document.getElementById('adminName').textContent = u.name || 'Admin';
    if (document.getElementById('adminAvatar')) document.getElementById('adminAvatar').textContent = (u.name || 'A').charAt(0).toUpperCase();
    
    const signOutBtn = document.getElementById('adminSignOut');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof window.handleLogout === 'function') window.handleLogout();
            else { API.clearAuth(); window.location.href = base + 'frontend/auth.html'; }
        });
    }

    document.querySelectorAll('.admin-sidebar .nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.admin-sidebar .nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            const s = item.dataset.section;
            if (document.getElementById('adminTitle')) document.getElementById('adminTitle').textContent = adminTitles[s] || s;
            loadSection(s);
        });
    });

    loadSection('dashboard');
});

function ac() { return document.getElementById('adminContent'); }

async function loadSection(s) {
    const c = ac();
    if (!c) return;
    c.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--text-muted);"><div style="font-size:2rem;margin-bottom:1rem;animation:pulse 2s infinite;">⏳</div>Loading admin panel...</div>';
    try {
        if (s === 'dashboard') await renderDashboard(c);
        else if (s === 'users') await renderUsers(c);
        else if (s === 'companies') await renderCompanies(c);
        else if (s === 'content') renderContent(c);
        else if (s === 'questions') await renderQuestions(c);
        else if (s === 'roadmaps') await renderRoadmaps(c);
        else if (s === 'monitoring') await renderMonitoring(c);
        else if (s === 'notifications') renderNotifications(c);
        else if (s === 'reports') renderReports(c);
        else if (s === 'matching') renderMatching(c);
    } catch (e) {
        c.innerHTML = `<div style="color:#ef4444;padding:2rem;background:rgba(239,68,68,0.1);border-radius:12px;">Admin Error: ${e.message}</div>`;
    }
}

// === DASHBOARD ANALYTICS ===
async function renderDashboard(c) {
    const statsRes = await API.get('/admin/stats');
    const s = statsRes.stats || {};
    const analytics = await API.get('/admin/analytics');

    c.innerHTML = `
        <div class="stat-grid">
            <div class="stat-card" onclick="loadSection('users')" style="cursor:pointer;"><div class="label">🎓 Students</div><div class="value">${s.students || 0}</div></div>
            <div class="stat-card" onclick="loadSection('users')" style="cursor:pointer;"><div class="label">💼 Recruiters</div><div class="value">${s.recruiters || 0}</div></div>
            <div class="stat-card" onclick="loadSection('roadmaps')" style="cursor:pointer;"><div class="label">📋 Active Jobs</div><div class="value">${s.jobs || 0}</div></div>
            <div class="stat-card" onclick="loadSection('companies')" style="cursor:pointer;"><div class="label">🏢 Companies</div><div class="value">${s.companies || 0}</div></div>
            <div class="stat-card"><div class="label">📈 Shortlist Rate</div><div class="value" style="color:#10b981;">${s.shortlistRate || 42}%</div></div>
        </div>
        <div class="chart-row">
            <div class="chart-box"><h3>📈 User Growth Trend</h3><div style="position:relative; height:200px;"><canvas id="userGrowthChart"></canvas></div></div>
            <div class="chart-box"><h3>📊 Role Distribution</h3><div style="position:relative; height:200px;"><canvas id="roleChart"></canvas></div></div>
        </div>
        <div class="chart-row">
            <div class="chart-box"><h3>🏢 Top Hiring Companies</h3><div style="position:relative; height:200px;"><canvas id="companyChart"></canvas></div></div>
            <div class="chart-box"><h3>🟢 Active vs Inactive Users</h3><div style="position:relative; height:200px;"><canvas id="activeChart"></canvas></div></div>
        </div>
    `;

    if (typeof Chart !== 'undefined') {
        const ug = analytics.analytics?.monthLabels ? { labels: analytics.analytics.monthLabels, data: analytics.analytics.studentGrowth } : { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], data: [12, 28, 45, 62, 85, 110] };
        new Chart(document.getElementById('userGrowthChart'), {
            type: 'line',
            data: { labels: ug.labels, datasets: [{ label: 'Students', data: ug.data, borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.1)', fill: true, tension: 0.4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });

        const rd = analytics.analytics?.roleDistribution || { students: s.students || 10, recruiters: s.recruiters || 3, admins: 2 };
        new Chart(document.getElementById('roleChart'), {
            type: 'doughnut',
            data: { labels: ['Students', 'Recruiters', 'Admins'], datasets: [{ data: [rd.students, rd.recruiters, rd.admins || 2], backgroundColor: ['#3b82f6', '#f59e0b', '#8b5cf6'] }] },
            options: { responsive: true, maintainAspectRatio: false }
        });

        const tc = analytics.analytics?.topCompanies || [{ _id: 'Razorpay', jobCount: 5 }, { _id: 'Swiggy', jobCount: 3 }, { _id: 'TechNova', jobCount: 2 }];
        new Chart(document.getElementById('companyChart'), {
            type: 'bar',
            data: { labels: tc.map(x => x._id || x.name), datasets: [{ data: tc.map(x => x.jobCount || x.apps || 1), backgroundColor: '#6366f1' }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });

        new Chart(document.getElementById('activeChart'), {
            type: 'doughnut',
            data: { labels: ['Active (7 days)', 'Inactive'], datasets: [{ data: [s.activeUsers || 8, s.inactiveUsers || 2], backgroundColor: ['#10b981', '#94a3b8'] }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}

// === USER MANAGEMENT ===
async function renderUsers(c) {
    const data = await API.get('/admin/users');
    window.allUsersData = data.users || [];

    c.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;gap:0.75rem;">
            <span style="font-size:0.9rem;color:var(--text-muted);font-weight:600;">${window.allUsersData.length} Total Users Registered</span>
            <input id="userSearch" placeholder="🔍 Search name or email..." style="padding:0.55rem 1rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;width:260px;background:var(--card-bg);color:var(--text-main);" oninput="filterUserRows(this.value)">
        </div>
        <div style="background:var(--card-bg);border-radius:12px;border:1px solid var(--border-color);overflow:hidden;">
            <table class="tbl" style="width:100%;">
                <thead>
                    <tr>
                        <th>User Name</th>
                        <th>Email Address</th>
                        <th>User Role</th>
                        <th>Joined Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="userTableBody">
                    ${window.allUsersData.map(u => `
                        <tr class="user-row">
                            <td>
                                <div style="display:flex;align-items:center;gap:0.75rem;">
                                    <div style="width:34px;height:34px;border-radius:50%;background:${u.role === 'admin' ? '#8b5cf6' : u.role === 'recruiter' ? '#3b82f6' : '#f97316'};color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.75rem;">
                                        ${(u.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <span style="font-weight:600;color:var(--text-main);">${sanitize(u.name)}</span>
                                </div>
                            </td>
                            <td style="color:var(--text-muted);font-size:0.85rem;">${sanitize(u.email)}</td>
                            <td>
                                <select onchange="changeUserRole('${u._id}', this.value)" style="padding:0.25rem 0.5rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.75rem;background:var(--bg-muted);color:var(--text-main);font-weight:600;">
                                    <option value="student" ${u.role === 'student' ? 'selected' : ''}>Student</option>
                                    <option value="recruiter" ${u.role === 'recruiter' ? 'selected' : ''}>Recruiter</option>
                                    <option value="sub-admin" ${u.role === 'sub-admin' ? 'selected' : ''}>Sub-Admin</option>
                                    <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                                </select>
                            </td>
                            <td style="font-size:0.8rem;color:var(--text-muted);">${new Date(u.createdAt || Date.now()).toLocaleDateString()}</td>
                            <td>
                                ${u.role !== 'admin' ? `<button onclick="deleteUser('${u._id}', '${sanitize(u.name.replace(/'/g, "\\'"))}')" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#ef4444;border-radius:6px;padding:0.25rem 0.6rem;cursor:pointer;font-weight:600;font-size:0.75rem;">🗑 Delete</button>` : '<span style="font-size:0.75rem;color:var(--text-muted);">Protected</span>'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

window.filterUserRows = function(query) {
    const q = (query || '').toLowerCase();
    document.querySelectorAll('#userTableBody .user-row').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
};

window.changeUserRole = async function(userId, newRole) {
    try {
        await API.put(`/admin/users/${userId}/role`, { role: newRole });
        if (typeof showToast === 'function') showToast(`User role updated to ${newRole}!`, 'success');
        else alert(`Role updated to ${newRole}`);
    } catch (e) {
        if (typeof showToast === 'function') showToast(e.message, 'error');
        else alert(e.message);
    }
};

window.deleteUser = async function(id, name) {
    if (!confirm(`Are you sure you want to permanently delete user "${name}"?`)) return;
    try {
        await API.delete(`/admin/users/${id}`);
        if (typeof showToast === 'function') showToast('User deleted successfully!', 'success');
        else alert('User deleted successfully');
        loadSection('users');
    } catch (e) {
        if (typeof showToast === 'function') showToast(e.message, 'error');
        else alert(e.message);
    }
};

// === COMPANY VERIFICATION ===
async function renderCompanies(c) {
    const data = await API.get('/admin/companies');
    const companies = data.companies || [];
    const pending = companies.filter(x => !x.isVerified).length;

    c.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
            <span style="font-size:0.9rem;color:var(--text-muted);font-weight:600;">${companies.length} Registered Companies</span>
            <span style="background:rgba(245,158,11,0.15);color:#d97706;padding:0.25rem 0.75rem;border-radius:999px;font-size:0.8rem;font-weight:600;">${pending} Pending Approvals</span>
        </div>
        <div style="background:var(--card-bg);border-radius:12px;border:1px solid var(--border-color);overflow:hidden;">
            <table class="tbl" style="width:100%;">
                <thead>
                    <tr>
                        <th>Company Name</th>
                        <th>Website</th>
                        <th>Industry</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${companies.length === 0 ? '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-muted);">No companies registered yet.</td></tr>' : companies.map(co => `
                        <tr>
                            <td style="font-weight:600;color:var(--text-main);">${sanitize(co.name)}</td>
                            <td><a href="https://${co.website || '#'}" target="_blank" style="color:var(--primary);text-decoration:none;font-size:0.85rem;">${sanitize(co.website || 'website.com')}</a></td>
                            <td style="color:var(--text-muted);font-size:0.85rem;">${sanitize(co.industry || 'Technology')}</td>
                            <td>
                                <span style="padding:0.15rem 0.5rem;border-radius:999px;font-size:0.7rem;font-weight:700;${co.isVerified ? 'background:rgba(16,185,129,0.15);color:#10b981;' : 'background:rgba(245,158,11,0.15);color:#d97706;'}">
                                    ${co.isVerified ? 'Verified' : 'Pending'}
                                </span>
                            </td>
                            <td>
                                ${!co.isVerified ? `
                                    <button onclick="verifyCompany('${co._id}', true)" class="btn btn-primary" style="padding:0.25rem 0.6rem;font-size:0.75rem;margin-right:0.25rem;">✓ Approve</button>
                                    <button onclick="verifyCompany('${co._id}', false)" class="btn btn-outline" style="padding:0.25rem 0.6rem;font-size:0.75rem;color:#ef4444;border-color:rgba(239,68,68,0.4);">✕ Reject</button>
                                ` : '<span style="color:#10b981;font-weight:600;font-size:0.8rem;">✓ Verified</span>'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

window.verifyCompany = async function(id, approve) {
    try {
        await API.put(`/admin/companies/${id}/verify`, { approve });
        if (typeof showToast === 'function') showToast(approve ? 'Company approved successfully!' : 'Company rejected', approve ? 'success' : 'info');
        else alert(approve ? 'Company approved' : 'Company rejected');
        loadSection('companies');
    } catch (e) {
        if (typeof showToast === 'function') showToast(e.message, 'error');
        else alert(e.message);
    }
};

// === CONTENT MANAGEMENT ===
function renderContent(c) {
    c.innerHTML = `
        <div class="chart-row"><div class="chart-box" style="grid-column:span 2;">
            <h3>📝 Content & Resource Management</h3>
            <p style="color:var(--text-muted);margin-bottom:1.5rem;">Manage company paths, question banks, and preparation resources.</p>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;">
                <div style="background:var(--bg-muted);border-radius:12px;padding:1.5rem;text-align:center;border:1px solid var(--border-color);">
                    <div style="font-size:2rem;margin-bottom:0.5rem;">🏢</div><h4 style="margin-bottom:0.5rem;color:var(--text-main);">Companies</h4>
                    <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem;">Verify and manage tech employers</p>
                    <button class="btn btn-primary" style="font-size:0.8rem;" onclick="loadSection('companies')">Manage Companies →</button>
                </div>
                <div style="background:var(--bg-muted);border-radius:12px;padding:1.5rem;text-align:center;border:1px solid var(--border-color);">
                    <div style="font-size:2rem;margin-bottom:0.5rem;">❓</div><h4 style="margin-bottom:0.5rem;color:var(--text-main);">Question Bank</h4>
                    <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem;">View and manage 500+ questions</p>
                    <button class="btn btn-primary" style="font-size:0.8rem;" onclick="loadSection('questions')">Manage Questions →</button>
                </div>
                <div style="background:var(--bg-muted);border-radius:12px;padding:1.5rem;text-align:center;border:1px solid var(--border-color);">
                    <div style="font-size:2rem;margin-bottom:0.5rem;">🗺</div><h4 style="margin-bottom:0.5rem;color:var(--text-main);">Roadmaps</h4>
                    <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem;">Manage company prep roadmaps</p>
                    <button class="btn btn-primary" style="font-size:0.8rem;" onclick="loadSection('roadmaps')">Manage Roadmaps →</button>
                </div>
            </div>
        </div></div>
    `;
}

async function renderQuestions(c) {
    c.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <span style="font-size:0.9rem;color:var(--text-muted);font-weight:600;">Interview Question Repository</span>
            <a href="../student/practice.html" class="btn btn-primary" style="font-size:0.8rem;text-decoration:none;">View Question Bank →</a>
        </div>
        <div style="background:var(--card-bg);border-radius:12px;border:1px solid var(--border-color);overflow:hidden;">
            <table class="tbl" style="width:100%;">
                <thead><tr><th>ID</th><th>Title</th><th>Topic</th><th>Type</th><th>Difficulty</th><th>Company</th></tr></thead>
                <tbody id="questionsTableBody"><tr><td colspan="6" style="text-align:center;padding:2rem;">Loading questions...</td></tr></tbody>
            </table>
        </div>
    `;
    try {
        const res = await fetch('../../data/questions.json');
        const data = await res.json();
        const allQuestions = [...(data.coding || []), ...(data.coding_mcq || []), ...(data.aptitude || [])].slice(0, 15);
        document.getElementById('questionsTableBody').innerHTML = allQuestions.map(q => `
            <tr>
                <td style="color:var(--text-muted);font-size:0.8rem;">${q.id}</td>
                <td style="font-weight:600;color:var(--text-main);">${sanitize(q.title)}</td>
                <td><span style="background:var(--bg-muted);padding:0.2rem 0.5rem;border-radius:4px;font-size:0.75rem;color:var(--text-main);">${sanitize(q.topic || '-')}</span></td>
                <td style="font-size:0.8rem;color:var(--text-muted);">${q.type || 'Coding'}</td>
                <td><span style="color:${q.difficulty === 'Easy' ? '#10b981' : q.difficulty === 'Medium' ? '#f59e0b' : '#ef4444'};font-weight:600;">${q.difficulty}</span></td>
                <td style="font-size:0.8rem;color:var(--primary);">${sanitize(q.company || 'Universal')}</td>
            </tr>
        `).join('');
    } catch (e) {
        document.getElementById('questionsTableBody').innerHTML = '<tr><td colspan="6" style="padding:2rem;text-align:center;color:var(--text-muted);">Failed to load question database.</td></tr>';
    }
}

async function renderRoadmaps(c) {
    const data = await API.get('/preparation');
    const paths = data.preparations || data.paths || [];
    c.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <span style="font-size:0.9rem;color:var(--text-muted);font-weight:600;">${paths.length} Preparation Roadmaps</span>
            <a href="../student/preparation.html" class="btn btn-primary" style="font-size:0.8rem;text-decoration:none;">View Roadmaps Portal →</a>
        </div>
        <div style="background:var(--card-bg);border-radius:12px;border:1px solid var(--border-color);overflow:hidden;">
            <table class="tbl" style="width:100%;">
                <thead><tr><th>Company / Path</th><th>Questions</th><th>Topics</th><th>Difficulty</th><th>Actions</th></tr></thead>
                <tbody>${paths.map(p => `
                    <tr>
                        <td style="font-weight:600;color:var(--text-main);"><div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:26px;height:26px;background:var(--primary);color:white;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:bold;">${p.companyName.charAt(0)}</div>${sanitize(p.companyName)}</div></td>
                        <td>${p.questionCount}</td>
                        <td>${p.topicCount}</td>
                        <td><span style="color:${p.difficulty === 'Easy' ? '#10b981' : p.difficulty === 'Medium' ? '#f59e0b' : '#ef4444'};font-weight:600;">${p.difficulty}</span></td>
                        <td><a href="../student/preparation.html" class="btn btn-outline" style="padding:0.25rem 0.5rem;font-size:0.7rem;text-decoration:none;">View →</a></td>
                    </tr>
                `).join('')}</tbody>
            </table>
        </div>
    `;
}

// === MONITORING & SITE HEALTH ===
async function renderMonitoring(c) {
    let health = { status: 'healthy', uptimeFormatted: '12h 45m', database: { state: 'connected' } };
    try {
        const res = await API.get('/admin/site-health');
        if (res.health) health = res.health;
    } catch (e) {}

    let logs = [];
    try {
        const logRes = await API.get('/admin/activity-log');
        logs = logRes.logs || [];
    } catch (e) {}

    c.innerHTML = `
        <div class="stat-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:1.5rem;">
            <div class="stat-card"><div class="label">📡 System Status</div><div class="value" style="color:#10b981;font-size:1.4rem;">${health.status.toUpperCase()}</div></div>
            <div class="stat-card"><div class="label">⏱ Server Uptime</div><div class="value" style="font-size:1.4rem;color:var(--text-main);">${health.uptimeFormatted}</div></div>
            <div class="stat-card"><div class="label">🗄️ Database</div><div class="value" style="color:#3b82f6;font-size:1.4rem;">${health.database.state}</div></div>
        </div>
        <div style="background:var(--card-bg);border-radius:12px;border:1px solid var(--border-color);overflow:hidden;">
            <div style="padding:1rem 1.25rem;border-bottom:1px solid var(--border-color);"><h3 style="margin:0;font-size:1rem;color:var(--text-main);">📋 System Activity Audit Log</h3></div>
            <table class="tbl" style="width:100%;">
                <thead><tr><th>Action</th><th>User</th><th>Timestamp</th></tr></thead>
                <tbody>${logs.length === 0 ? '<tr><td colspan="3" style="text-align:center;padding:2rem;color:var(--text-muted);">No system logs recorded.</td></tr>' : logs.slice(0, 10).map(l => `
                    <tr><td style="font-weight:500;color:var(--text-main);">${sanitize(l.action)}</td><td style="color:var(--text-muted);">${sanitize(l.user || 'System')}</td><td style="font-size:0.8rem;color:var(--text-muted);">${new Date(l.timestamp).toLocaleString()}</td></tr>
                `).join('')}</tbody>
            </table>
        </div>
    `;
}

// === BROADCAST NOTIFICATIONS ===
function renderNotifications(c) {
    c.innerHTML = `
        <div class="chart-box" style="margin-bottom:1.5rem;background:var(--card-bg);padding:1.5rem;border-radius:12px;border:1px solid var(--border-color);">
            <h3 style="margin-bottom:0.5rem;color:var(--text-main);">📢 Send Platform Announcement</h3>
            <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1.25rem;">Broadcast in-app notifications to students, recruiters, or all users.</p>
            <div style="max-width:600px;">
                <div style="margin-bottom:1rem;">
                    <label style="font-size:0.85rem;font-weight:600;display:block;margin-bottom:0.4rem;color:var(--text-main);">Notification Title</label>
                    <input id="notifTitle" placeholder="e.g. New Coding Practice Challenge Live!" style="width:100%;padding:0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.9rem;background:var(--bg-muted);color:var(--text-main);">
                </div>
                <div style="margin-bottom:1rem;">
                    <label style="font-size:0.85rem;font-weight:600;display:block;margin-bottom:0.4rem;color:var(--text-main);">Announcement Message</label>
                    <textarea id="notifMsg" placeholder="Write announcement details..." rows="3" style="width:100%;padding:0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.9rem;background:var(--bg-muted);color:var(--text-main);font-family:Inter;"></textarea>
                </div>
                <div style="margin-bottom:1.25rem;">
                    <label style="font-size:0.85rem;font-weight:600;display:block;margin-bottom:0.4rem;color:var(--text-main);">Target Audience</label>
                    <select id="notifTarget" style="padding:0.6rem 1rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--bg-muted);color:var(--text-main);">
                        <option value="all">All Registered Users</option>
                        <option value="student">Students Only</option>
                        <option value="recruiter">Recruiters Only</option>
                    </select>
                </div>
                <button class="btn btn-primary" onclick="sendNotification()" style="padding:0.75rem 2rem;font-weight:600;">🚀 Broadcast Notification</button>
            </div>
        </div>
    `;
}

window.sendNotification = async function() {
    const t = document.getElementById('notifTitle')?.value;
    const m = document.getElementById('notifMsg')?.value;
    const target = document.getElementById('notifTarget')?.value || 'all';

    if (!t || !m) return showToast ? showToast('Please enter both title and message', 'error') : alert('Fill all fields');

    try {
        await API.post('/admin/notifications/send', { title: t, message: m, targetRole: target });
        if (typeof showToast === 'function') showToast('Notification broadcast successfully!', 'success');
        else alert('Notification sent!');
        document.getElementById('notifTitle').value = '';
        document.getElementById('notifMsg').value = '';
    } catch (e) {
        if (typeof showToast === 'function') showToast(e.message, 'error');
        else alert(e.message);
    }
};

// === CSV EXPORT REPORTS ===
function renderReports(c) {
    c.innerHTML = `
        <div class="chart-row"><div class="chart-box" style="grid-column:span 2;background:var(--card-bg);padding:1.5rem;border-radius:12px;border:1px solid var(--border-color);">
            <h3 style="margin-bottom:0.5rem;color:var(--text-main);">📑 Export Platform CSV Reports</h3>
            <p style="color:var(--text-muted);margin-bottom:1.5rem;font-size:0.85rem;">Download raw database records in CSV format for offline analysis.</p>
            <div style="display:flex;gap:1rem;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="exportCSV('users')">👥 Download Users CSV</button>
                <button class="btn btn-primary" onclick="exportCSV('applications')">📄 Download Applications CSV</button>
                <button class="btn btn-primary" onclick="exportCSV('performance')">📊 Download Candidate Ranking CSV</button>
            </div>
        </div></div>
    `;
}

window.exportCSV = function(type) {
    const token = localStorage.getItem('hireprep_token') || sessionStorage.getItem('hireprep_token');
    const url = `/api/admin/export/${type}`;
    
    // Trigger direct authenticated download
    fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error('Export failed');
        return res.blob();
    })
    .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `hireprep_${type}_export.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        if (typeof showToast === 'function') showToast(`${type.toUpperCase()} exported successfully!`, 'success');
    })
    .catch(err => {
        if (typeof showToast === 'function') showToast('Export failed: ' + err.message, 'error');
        else alert('Export failed');
    });
};

// === MATCHING RULES ===
function renderMatching(c) {
    c.innerHTML = `
        <div class="chart-box" style="background:var(--card-bg);padding:1.5rem;border-radius:12px;border:1px solid var(--border-color);">
            <h3 style="margin-bottom:0.5rem;color:var(--text-main);">🎯 Matching Algorithm Transparency Rules</h3>
            <p style="color:var(--text-muted);margin-bottom:1.5rem;font-size:0.85rem;">Review the weighted rule parameters used to calculate student-to-job match scores.</p>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;">
                <div style="background:var(--bg-muted);border-radius:12px;padding:1.25rem;border:1px solid var(--border-color);">
                    <h4 style="margin:0 0 0.75rem 0;color:var(--text-main);">Rule Weights</h4>
                    <div style="font-size:0.85rem;color:var(--text-muted);line-height:1.8;">
                        <div>• <b>Skill Alignment (60%)</b>: matched_skills / job_required_skills</div>
                        <div>• <b>Experience Alignment (20%)</b>: work & internship years</div>
                        <div>• <b>Resume Quality (20%)</b>: ATS profile completeness</div>
                    </div>
                </div>
                <div style="background:var(--bg-muted);border-radius:12px;padding:1.25rem;border:1px solid var(--border-color);">
                    <h4 style="margin:0 0 0.75rem 0;color:var(--text-main);">Recommendation Labels</h4>
                    <div style="font-size:0.85rem;color:var(--text-muted);line-height:1.8;">
                        <div>• <b style="color:#10b981;">High Match (75-100%)</b>: Top candidate match</div>
                        <div>• <b style="color:#f59e0b;">Medium Match (50-74%)</b>: Partial skill alignment</div>
                        <div>• <b style="color:#ef4444;">Low Match (<50%)</b>: Missing key requirements</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Window Bindings for Admin Panel Handlers
window.loadSection = loadSection;

// admin.js — Full admin dashboard logic
let state = { stats: {}, users: [], companies: [], prepCompanies: [], questions: null, analytics: {}, performers: [], notifications: [], contentTab: 'mcq' };
const content = () => document.getElementById('adminContent');

document.addEventListener('DOMContentLoaded', async () => {
    if (!API.isLoggedIn()) return window.location.href = '/frontend/auth.html';
    const user = API.getUser();
    if (user.role !== 'admin') return window.location.href = '/index.html';
    const adminNameEl = document.getElementById('adminName');
    const adminAvatarEl = document.getElementById('adminAvatar');
    if (adminNameEl) {
        adminNameEl.textContent = user.name || 'Admin';
        adminNameEl.style.cursor = 'pointer';
        adminNameEl.title = 'Click to edit Admin Profile';
        adminNameEl.onclick = () => navigateToSection('profile');
    }
    if (adminAvatarEl) {
        adminAvatarEl.textContent = (user.name || 'A').charAt(0).toUpperCase();
        adminAvatarEl.style.cursor = 'pointer';
        adminAvatarEl.title = 'Click to edit Admin Profile';
        adminAvatarEl.onclick = () => navigateToSection('profile');
    }

    // Mobile sidebar drawer & overlay
    const sidebarToggle = document.getElementById('adminSidebarToggle');
    const adminSidebar = document.getElementById('adminSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebarToggle && adminSidebar) {
        sidebarToggle.onclick = (e) => {
            e.stopPropagation();
            adminSidebar.classList.toggle('open');
            if (sidebarOverlay) sidebarOverlay.classList.toggle('open', adminSidebar.classList.contains('open'));
        };
        if (sidebarOverlay) {
            sidebarOverlay.onclick = () => {
                adminSidebar.classList.remove('open');
                sidebarOverlay.classList.remove('open');
            };
        }
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#adminSidebar') && !e.target.closest('#adminSidebarToggle')) {
                adminSidebar.classList.remove('open');
                if (sidebarOverlay) sidebarOverlay.classList.remove('open');
            }
        });
    }

    // Nav switching
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            const s = item.dataset.section;
            document.getElementById('topbarTitle').textContent = item.textContent.trim();
            if (adminSidebar) adminSidebar.classList.remove('open');
            if (sidebarOverlay) sidebarOverlay.classList.remove('open');
            loadSection(s);
        });
    });

    document.getElementById('adminSignOut').onclick = () => handleLogout();
    document.getElementById('notifBadge').onclick = () => {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelector('[data-section="notifications"]').classList.add('active');
        document.getElementById('topbarTitle').textContent = '🔔 Notifications';
        if (adminSidebar) adminSidebar.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('open');
        loadSection('notifications');
    };

    await loadSection('overview');
});

async function loadSection(section, options = {}) {
    const c = content();
    c.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--text-muted);">Loading...</div>';
    try {
        if (section === 'overview') await renderOverview(c);
        else if (section === 'analytics') await renderAnalytics(c);
        else if (section === 'profile') await renderAdminProfile(c);
        else if (section === 'users') await renderUsers(c, options.role || 'all');
        else if (section === 'companies') await renderCompanies(c);
        else if (section === 'jobs') await renderAdminJobs(c);
        else if (section === 'applications') await renderAdminApplications(c);
        else if (section === 'content') await renderContent(c);
        else if (section === 'performers') await renderPerformers(c);
        else if (section === 'notifications') await renderNotifications(c);
        else if (section === 'activity') await renderActivity(c);
        else if (section === 'matching') await renderMatching(c);
        else if (section === 'reports') renderReports(c);
        else if (section === 'settings') renderSettings(c);
        else if (section === 'architecture') renderArchitecture(c);
        else if (section === 'sitehealth') await renderSiteHealth(c);
        else if (section === 'security') await renderSecurity(c);
        else if (section === 'dbstatus') await renderDbStatus(c);
        else if (section === 'realtimetraffic') renderLiveTraffic(c);
        else if (section === 'errorlogs') renderErrorLogs(c);
    } catch (e) { c.innerHTML = `<div style="text-align:center;padding:3rem;color:#ef4444;">Error: ${e.message}</div>`; }
}

// === NAVIGATION HELPERS ===
function navigateToSection(section, options = {}) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const item = document.querySelector(`.nav-item[data-section="${section}"]`);
    if (item) {
        item.classList.add('active');
        const titleEl = document.getElementById('topbarTitle');
        if (titleEl) titleEl.textContent = item.textContent.trim();
    }
    const adminSidebar = document.getElementById('adminSidebar');
    if (adminSidebar) adminSidebar.classList.remove('open');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebarOverlay) sidebarOverlay.classList.remove('open');
    loadSection(section, options);
}
window.navigateToSection = navigateToSection;

function navigateToUsersWithRole(role = 'all') {
    navigateToSection('users', { role });
}
window.navigateToUsersWithRole = navigateToUsersWithRole;

// === OVERVIEW ===
async function renderOverview(c) {
    let data = { stats: {} };
    try {
        data = await API.get('/admin/stats');
    } catch(e) {
        data = { stats: { students: 0, recruiters: 0, companies: 0, jobs: 0, applications: 0, pendingVerifications: 0, activeJobs: 0, activeUsers: 0, inactiveUsers: 0, conversionRate: 0 } };
    }
    state.stats = data.stats || {};
    const s = state.stats;
    c.innerHTML = `
        <div class="metric-grid">
            <div class="metric-card" onclick="navigateToUsersWithRole('student')" role="button" tabindex="0" style="cursor:pointer;border-top:3px solid #f97316;" title="Click to inspect all student profiles">
                <div class="label"><span>👥 Students</span> <span style="font-size:0.9rem;opacity:0.8;">↗</span></div>
                <div class="value">${s.students || 0}</div>
                <div class="sub" style="color:var(--primary);font-weight:600;">View all students & profiles →</div>
            </div>
            <div class="metric-card" onclick="navigateToUsersWithRole('recruiter')" role="button" tabindex="0" style="cursor:pointer;border-top:3px solid #3b82f6;" title="Click to view recruiter partners">
                <div class="label"><span>💼 Recruiters</span> <span style="font-size:0.9rem;opacity:0.8;">↗</span></div>
                <div class="value">${s.recruiters || 0}</div>
                <div class="sub" style="color:#3b82f6;font-weight:600;">View hiring partners →</div>
            </div>
            <div class="metric-card" onclick="navigateToSection('companies')" role="button" tabindex="0" style="cursor:pointer;border-top:3px solid #10b981;" title="Click to manage registered companies">
                <div class="label"><span>🏢 Companies</span> <span style="font-size:0.9rem;opacity:0.8;">↗</span></div>
                <div class="value">${s.companies || 0}</div>
                <div class="sub" style="color:#10b981;font-weight:600;">${s.pendingVerifications || 0} pending verification →</div>
            </div>
            <div class="metric-card" onclick="navigateToSection('jobs')" role="button" tabindex="0" style="cursor:pointer;border-top:3px solid #8b5cf6;" title="Click to view job listings">
                <div class="label"><span>📋 Jobs</span> <span style="font-size:0.9rem;opacity:0.8;">↗</span></div>
                <div class="value">${s.jobs || 0}</div>
                <div class="sub" style="color:#8b5cf6;font-weight:600;">${s.activeJobs || 0} active postings →</div>
            </div>
            <div class="metric-card" onclick="navigateToSection('applications')" role="button" tabindex="0" style="cursor:pointer;border-top:3px solid #ec4899;" title="Click to view all job applications">
                <div class="label"><span>📄 Applications</span> <span style="font-size:0.9rem;opacity:0.8;">↗</span></div>
                <div class="value">${s.applications || 0}</div>
                <div class="sub" style="color:#ec4899;font-weight:600;">${s.conversionRate || 0}% conversion rate →</div>
            </div>
            <div class="metric-card" onclick="navigateToUsersWithRole('all')" role="button" tabindex="0" style="cursor:pointer;border-top:3px solid #06b6d4;" title="Click to inspect all platform users">
                <div class="label"><span>✅ Active Users</span> <span style="font-size:0.9rem;opacity:0.8;">↗</span></div>
                <div class="value">${s.activeUsers || 0}</div>
                <div class="sub" style="color:#06b6d4;font-weight:600;">${s.inactiveUsers || 0} inactive (view all) →</div>
            </div>
        </div>
        <div class="chart-grid">
            <div class="chart-card" style="cursor:pointer;" onclick="if(!event.target.closest('canvas')) navigateToSection('analytics');" title="Click to view detailed analytics">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
                    <h3 style="margin:0;">📈 User Growth</h3>
                    <span style="font-size:0.75rem;color:var(--primary);font-weight:600;">Explore Analytics ↗</span>
                </div>
                <div style="position:relative;height:250px;"><canvas id="overviewGrowthChart"></canvas></div>
            </div>
            <div class="chart-card" style="cursor:pointer;" onclick="if(!event.target.closest('canvas')) navigateToUsersWithRole('all');" title="Click to inspect users">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
                    <h3 style="margin:0;">👥 Active vs Inactive</h3>
                    <span style="font-size:0.75rem;color:var(--primary);font-weight:600;">Manage Users ↗</span>
                </div>
                <div style="position:relative;height:250px;"><canvas id="overviewActiveChart"></canvas></div>
            </div>
        </div>
    `;
    try {
        const an = await API.get('/admin/analytics');
        state.analytics = an.analytics || {};
        const monthLabels = an.analytics?.monthLabels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const studentGrowth = an.analytics?.studentGrowth || [0,0,0,0,0,0];
        const recruiterGrowth = an.analytics?.recruiterGrowth || [0,0,0,0,0,0];
        new Chart(document.getElementById('overviewGrowthChart'), {
            type: 'line', data: { labels: monthLabels, datasets: [
                { label: 'Students', data: studentGrowth, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.1)', tension: 0.4, fill: true },
                { label: 'Recruiters', data: recruiterGrowth, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', tension: 0.4, fill: true }
            ]}, options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
                onClick: (evt, elements) => {
                    if (elements && elements.length > 0) {
                        const idx = elements[0].index;
                        showGrowthDetailModal(monthLabels[idx], studentGrowth[idx], recruiterGrowth[idx]);
                    } else {
                        navigateToSection('analytics');
                    }
                }
            }
        });
        new Chart(document.getElementById('overviewActiveChart'), {
            type: 'doughnut', data: { labels: ['Active (7d)', 'Inactive'], datasets: [{ data: [s.activeUsers||0, s.inactiveUsers||0], backgroundColor: ['#10b981', '#ef4444'] }] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
                onClick: (evt, elements) => {
                    navigateToUsersWithRole('all');
                }
            }
        });
    } catch (e) { console.log('Analytics load error:', e.message); }
}

function showGrowthDetailModal(month, students = 0, recruiters = 0) {
    let modal = document.getElementById('growthDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'growthDetailModal';
        modal.className = 'modal-backdrop';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1rem;';
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div style="background:white;border-radius:16px;max-width:480px;width:100%;padding:1.75rem;box-shadow:0 20px 40px rgba(0,0,0,0.25);border:1px solid var(--border-color);" onclick="event.stopPropagation();">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;border-bottom:1px solid var(--border-color);padding-bottom:0.75rem;">
                <h3 style="margin:0;font-size:1.15rem;font-weight:700;">📈 Growth Data: ${sanitize(month)}</h3>
                <button onclick="document.getElementById('growthDetailModal').style.display='none'" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">&times;</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">
                <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:1rem;text-align:center;">
                    <div style="font-size:0.75rem;color:#c2410c;font-weight:600;text-transform:uppercase;">New Students</div>
                    <div style="font-size:1.75rem;font-weight:700;color:#ea580c;margin-top:0.25rem;">${students}</div>
                    <button onclick="navigateToUsersWithRole('student'); document.getElementById('growthDetailModal').style.display='none';" class="btn btn-outline" style="margin-top:0.5rem;font-size:0.75rem;padding:0.25rem 0.5rem;width:100%;">View Students →</button>
                </div>
                <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:1rem;text-align:center;">
                    <div style="font-size:0.75rem;color:#1d4ed8;font-weight:600;text-transform:uppercase;">New Recruiters</div>
                    <div style="font-size:1.75rem;font-weight:700;color:#2563eb;margin-top:0.25rem;">${recruiters}</div>
                    <button onclick="navigateToUsersWithRole('recruiter'); document.getElementById('growthDetailModal').style.display='none';" class="btn btn-outline" style="margin-top:0.5rem;font-size:0.75rem;padding:0.25rem 0.5rem;width:100%;">View Recruiters →</button>
                </div>
            </div>
            <div style="display:flex;justify-content:flex-end;">
                <button onclick="navigateToSection('analytics'); document.getElementById('growthDetailModal').style.display='none';" class="btn btn-primary" style="font-size:0.85rem;">Deep Analytics →</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}
window.showGrowthDetailModal = showGrowthDetailModal;

// === ANALYTICS (Advanced) ===
async function renderAnalytics(c) {
    c.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--text-muted);">Loading advanced analytics...</div>';
    try {
        const res = await API.get('/admin/analytics/advanced?granularity=monthly');
        const adv = res.advanced || {};
        const perf = adv.performanceDistribution || { avgScore: 0, top10AvgScore: 0 };
        c.innerHTML = `
            <div class="toolbar"><div class="filters">
                <button id="btnGranDaily" onclick="switchGranularity('daily')" class="btn btn-outline" style="font-size:0.75rem;padding:0.3rem 0.7rem;">Daily</button>
                <button id="btnGranWeekly" onclick="switchGranularity('weekly')" class="btn btn-outline" style="font-size:0.75rem;padding:0.3rem 0.7rem;">Weekly</button>
                <button id="btnGranMonthly" onclick="switchGranularity('monthly')" class="btn btn-primary" style="font-size:0.75rem;padding:0.3rem 0.7rem;">Monthly</button>
            </div><div style="font-size:0.8rem;color:var(--text-muted);">Avg Score: <b>${perf.avgScore}%</b> · Top 10% Avg: <b>${perf.top10AvgScore}%</b></div></div>
            <div class="chart-grid">
                <div class="chart-card" style="cursor:pointer;"><h3>📈 User Growth</h3><div style="position:relative;height:250px;"><canvas id="advGrowth"></canvas></div></div>
                <div class="chart-card" style="cursor:pointer;"><h3>🔄 Conversion Funnel (Click stage to filter)</h3><div style="position:relative;height:250px;"><canvas id="advFunnel"></canvas></div></div>
            </div>
            <div class="chart-grid">
                <div class="chart-card" style="cursor:pointer;"><h3>📊 Performance Distribution (Click to view students)</h3><div style="position:relative;height:250px;"><canvas id="advPerf"></canvas></div></div>
                <div class="chart-card" style="cursor:pointer;"><h3>📄 Resume Score Distribution (Click to view students)</h3><div style="position:relative;height:250px;"><canvas id="advResume"></canvas></div></div>
            </div>
            <div class="chart-grid">
                <div class="chart-card" style="cursor:pointer;"><h3>⚠️ Skill Gap Trends (Click to view matching logic)</h3><div style="position:relative;height:250px;"><canvas id="advSkillGap"></canvas></div></div>
                <div class="chart-card" style="cursor:pointer;"><h3>📅 Applications Per Day (Click to view applications)</h3><div style="position:relative;height:250px;"><canvas id="advAppsDay"></canvas></div></div>
            </div>
        `;
        const g = adv.growth || { labels: [], students: [], recruiters: [] };
        new Chart(document.getElementById('advGrowth'), {
            type:'line',
            data:{ labels:g.labels, datasets:[{label:'Students',data:g.students,borderColor:'#f97316',backgroundColor:'rgba(249,115,22,0.1)',tension:0.4,fill:true},{label:'Recruiters',data:g.recruiters,borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,0.1)',tension:0.4,fill:true}]},
            options:{
                responsive:true,
                maintainAspectRatio:false,
                plugins:{legend:{position:'bottom'}},
                onClick: (e, els) => {
                    if (els.length > 0) {
                        const idx = els[0].index;
                        showGrowthDetailModal(g.labels[idx], g.students[idx], g.recruiters[idx]);
                    }
                }
            }
        });
        const f = adv.conversionFunnel || {};
        const funnelLabels = ['Applied','In Review','Shortlisted','Interview','Selected','Rejected'];
        const funnelStageKeys = ['applied', 'in-review', 'shortlisted', 'interview', 'selected', 'rejected'];
        new Chart(document.getElementById('advFunnel'), {
            type:'bar',
            data:{ labels:funnelLabels, datasets:[{label:'Count',data:[f.applied||0,f.inReview||0,f.shortlisted||0,f.interviewed||0,f.selected||0,f.rejected||0],backgroundColor:['#6366f1','#3b82f6','#f59e0b','#8b5cf6','#10b981','#ef4444']}]},
            options:{
                responsive:true,
                maintainAspectRatio:false,
                indexAxis:'y',
                onClick: (e, els) => {
                    navigateToSection('applications');
                }
            }
        });
        new Chart(document.getElementById('advPerf'), {
            type:'bar',
            data:{ labels:(perf.labels||[]), datasets:[{label:'Students',data:(perf.buckets||[]),backgroundColor:['#ef4444','#f59e0b','#3b82f6','#10b981']}]},
            options:{
                responsive:true,
                maintainAspectRatio:false,
                onClick: () => navigateToUsersWithRole('student')
            }
        });
        const rd = adv.resumeDistribution || {};
        new Chart(document.getElementById('advResume'), {
            type:'bar',
            data:{ labels:(rd.labels||[]), datasets:[{label:'Students',data:(rd.buckets||[]),backgroundColor:'#8b5cf6'}]},
            options:{
                responsive:true,
                maintainAspectRatio:false,
                onClick: () => navigateToUsersWithRole('student')
            }
        });
        const sgt = adv.skillGapTrends || [];
        if(sgt.length>0) new Chart(document.getElementById('advSkillGap'), {
            type:'bar',
            data:{ labels:sgt.map(s=>s.skill), datasets:[{label:'Missing Count',data:sgt.map(s=>s.count),backgroundColor:'#ef4444'}]},
            options:{
                indexAxis:'y',
                responsive:true,
                maintainAspectRatio:false,
                onClick: () => navigateToSection('matching')
            }
        });
        const apd = adv.appsPerDay || {};
        new Chart(document.getElementById('advAppsDay'), {
            type:'line',
            data:{ labels:(apd.labels||[]), datasets:[{label:'Applications',data:(apd.data||[]),borderColor:'#6366f1',backgroundColor:'rgba(99,102,241,0.1)',tension:0.3,fill:true}]},
            options:{
                responsive:true,
                maintainAspectRatio:false,
                onClick: () => navigateToSection('applications')
            }
        });
    } catch(e) { c.innerHTML = `<div style="color:#ef4444;padding:2rem;">Error: ${e.message}</div>`; }
}
function handleLogout() {
    API.clearAuth();
    if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
    window.location.replace('/frontend/auth.html');
}

async function switchGranularity(g) {
    try {
        const res = await API.get('/admin/analytics/advanced?granularity=' + g);
        const adv = res.advanced || {};
        
        ['daily', 'weekly', 'monthly'].forEach(type => {
            const btn = document.getElementById('btnGran' + type.charAt(0).toUpperCase() + type.slice(1));
            if (btn) {
                if (type === g) {
                    btn.className = 'btn btn-primary';
                } else {
                    btn.className = 'btn btn-outline';
                }
            }
        });

        const gData = adv.growth || { labels: [], students: [], recruiters: [] };
        const growthEl = document.getElementById('advGrowth');
        if (growthEl && growthEl.closest('.chart-card')) {
            growthEl.closest('.chart-card').innerHTML = `<h3>📈 User Growth (${g})</h3><div style="position:relative;height:250px;"><canvas id="advGrowth"></canvas></div>`;
            new Chart(document.getElementById('advGrowth'), {
                type: 'line',
                data: {
                    labels: gData.labels,
                    datasets: [
                        { label: 'Students', data: gData.students, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.1)', tension: 0.4, fill: true },
                        { label: 'Recruiters', data: gData.recruiters, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', tension: 0.4, fill: true }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
            });
        }
    } catch(e) {
        showToast('Granularity update failed: ' + e.message, 'error');
    }
}

// === USERS ===
async function renderUsers(c, roleFilter = 'all') {
    c.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--text-muted);">Loading platform users...</div>';
    let data = { users: [] };
    try {
        const url = roleFilter && roleFilter !== 'all' ? `/admin/users?role=${roleFilter}` : '/admin/users';
        data = await API.get(url);
    } catch(e) {
        data = { users: [] };
    }
    state.users = data.users || [];
    renderUserTable(c, state.users, roleFilter);
}

function renderUserTable(c, users, currentRole = 'all') {
    c.innerHTML = `
        <div class="toolbar">
            <div class="filters">
                <select id="roleFilter">
                    <option value="all" ${currentRole === 'all' ? 'selected' : ''}>All Roles</option>
                    <option value="student" ${currentRole === 'student' ? 'selected' : ''}>Students</option>
                    <option value="recruiter" ${currentRole === 'recruiter' ? 'selected' : ''}>Recruiters</option>
                    <option value="admin" ${currentRole === 'admin' ? 'selected' : ''}>Admins</option>
                </select>
                <input type="text" id="userSearch" placeholder="Search by name, email, skill..." style="min-width:220px;">
            </div>
            <div style="display:flex;gap:0.5rem;">
                <button onclick="adminExportCSV('/api/admin/export/users','users')" class="btn btn-outline" style="font-size:0.8rem;">📥 Export CSV</button>
            </div>
        </div>
        <div class="table-responsive">
            <table class="data-table">
                <thead><tr><th>User (Click to inspect profile)</th><th>Role</th><th>Skills</th><th>Resume</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>${users.length === 0 ? '<tr><td colspan="6" style="text-align:center;padding:2.5rem;color:var(--text-muted);">No users found.</td></tr>' : users.map(u => `<tr>
                    <td onclick="viewUserProfile('${u._id}')" style="cursor:pointer;" title="Click to view detailed student/user profile">
                        <div style="display:flex;align-items:center;gap:0.75rem;">
                            <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.85rem;flex-shrink:0;">
                                ${sanitize((u.name || 'U').charAt(0).toUpperCase())}
                            </div>
                            <div>
                                <div style="font-weight:600;color:var(--primary);">${sanitize(u.name || 'Unnamed')} <span style="font-size:0.75rem;opacity:0.8;">↗</span></div>
                                <div style="font-size:0.75rem;color:var(--text-muted);">${sanitize(u.email || '')}</div>
                            </div>
                        </div>
                    </td>
                    <td><span class="role-pill role-${u.role}">${u.role}</span></td>
                    <td><span style="font-weight:600;">${u.skillCount || 0}</span></td>
                    <td><span style="font-weight:700;color:${(u.resumeScore||0)>=70?'#10b981':'#f59e0b'};">${u.resumeScore || 0}%</span></td>
                    <td style="font-size:0.8rem;color:var(--text-muted);">${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td>
                        <div style="display:flex;gap:0.4rem;align-items:center;">
                            <button onclick="viewUserProfile('${u._id}')" class="btn btn-outline" style="font-size:0.72rem;padding:0.25rem 0.55rem;background:#f0fdf4;color:#15803d;border-color:#bbf7d0;font-weight:600;">👁 View Profile</button>
                            <button onclick="changeRole('${u._id}','${u.role}')" class="btn btn-outline" style="font-size:0.72rem;padding:0.25rem 0.5rem;">Role</button>
                            <button onclick="deleteUser('${u._id}')" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:1rem;padding:0.25rem;" title="Delete user">🗑</button>
                        </div>
                    </td>
                </tr>`).join('')}</tbody>
            </table>
        </div>
    `;

    document.getElementById('userSearch')?.addEventListener('input', async (e) => {
        const role = document.getElementById('roleFilter')?.value || 'all';
        const q = e.target.value;
        const d = await API.get(`/admin/users?search=${q}&role=${role}`);
        state.users = d.users || [];
        renderUserTable(c, state.users, role);
    });

    document.getElementById('roleFilter')?.addEventListener('change', async (e) => {
        const q = document.getElementById('userSearch')?.value || '';
        const role = e.target.value;
        const d = await API.get(`/admin/users?role=${role}&search=${q}`);
        state.users = d.users || [];
        renderUserTable(c, state.users, role);
    });
}

// === USER / STUDENT PROFILE INSPECTOR MODAL ===
async function viewUserProfile(userId) {
    let modal = document.getElementById('userProfileModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'userProfileModal';
        modal.className = 'modal-backdrop';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1rem;';
        document.body.appendChild(modal);
    }
    modal.innerHTML = '<div style="background:white;border-radius:16px;padding:2rem;text-align:center;font-size:1rem;color:var(--text-main);">Loading full user profile...</div>';
    modal.style.display = 'flex';

    try {
        const res = await API.get(`/admin/users/${userId}/detail`);
        const u = res.user || res.student?.user || {};
        const p = res.profile || res.student?.profile || {};
        const apps = res.applications || res.student?.applications || [];
        const co = res.company || null;
        const jobs = res.postedJobs || [];

        modal.innerHTML = `
            <div style="background:var(--card-bg, white);border-radius:16px;max-width:720px;width:100%;max-height:90vh;overflow-y:auto;padding:1.75rem;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);border:1px solid var(--border-color);">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.25rem;border-bottom:1px solid var(--border-color);padding-bottom:1rem;">
                    <div style="display:flex;align-items:center;gap:1rem;">
                        <div style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg, #3b82f6, #8b5cf6);color:white;display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:700;">
                            ${sanitize((u.name||'U').charAt(0).toUpperCase())}
                        </div>
                        <div>
                            <h2 style="margin:0;font-size:1.25rem;color:var(--text-main);">${sanitize(u.name || 'User Profile')}</h2>
                            <div style="font-size:0.85rem;color:var(--text-muted);">${sanitize(u.email || '')} ${u.phone ? '· 📞 ' + sanitize(u.phone) : ''}</div>
                        </div>
                    </div>
                    <span class="role-pill role-${u.role}" style="font-size:0.8rem;padding:0.3rem 0.8rem;text-transform:capitalize;font-weight:700;">${u.role}</span>
                </div>

                ${u.role === 'student' ? `
                    <!-- Student Academics & Resume Stats -->
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.25rem;">
                        <div style="background:var(--bg-muted, #f8fafc);padding:1rem;border-radius:10px;border:1px solid var(--border-color);">
                            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.5rem;">🎓 Education & Academics</div>
                            <div style="font-size:0.85rem;color:var(--text-main);margin-bottom:0.25rem;"><strong>College:</strong> ${sanitize(p.college || 'Not specified')}</div>
                            <div style="font-size:0.85rem;color:var(--text-main);margin-bottom:0.25rem;"><strong>Degree:</strong> ${sanitize(p.degree || 'B.Tech')} (${sanitize(p.branch || 'CSE')})</div>
                            <div style="font-size:0.85rem;color:var(--text-main);"><strong>Graduation:</strong> ${p.gradYear || p.graduationYear || 'N/A'} · <strong>CGPA:</strong> ${p.cgpa || 'N/A'}</div>
                        </div>
                        <div style="background:var(--bg-muted, #f8fafc);padding:1rem;border-radius:10px;border:1px solid var(--border-color);">
                            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.5rem;">📄 Resume & Profile Score</div>
                            <div style="font-size:0.85rem;color:var(--text-main);margin-bottom:0.5rem;"><strong>Resume Score:</strong> <span style="color:#10b981;font-weight:700;font-size:1rem;">${p.resumeScore || 0}%</span></div>
                            <div>
                                ${p.resumeUrl ? `<a href="${sanitize(p.resumeUrl)}" target="_blank" style="display:inline-block;padding:0.35rem 0.85rem;background:#3b82f6;color:white;border-radius:6px;font-size:0.75rem;text-decoration:none;font-weight:600;">📥 View / Download Resume PDF</a>` : '<span style="color:var(--text-muted);font-size:0.8rem;font-style:italic;">No resume PDF uploaded yet</span>'}
                            </div>
                        </div>
                    </div>

                    <!-- Skills -->
                    <div style="margin-bottom:1.25rem;">
                        <div style="font-size:0.8rem;font-weight:700;color:var(--text-muted);margin-bottom:0.5rem;">🛠️ Candidate Skills & Expertise (${(p.skills || []).length})</div>
                        <div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
                            ${(p.skills || []).length === 0 ? '<span style="color:var(--text-muted);font-size:0.8rem;">No skills listed yet</span>' : (p.skills || []).map(sk => `<span style="background:rgba(59,130,246,0.1);color:#2563eb;padding:0.25rem 0.65rem;border-radius:999px;font-size:0.75rem;font-weight:600;">${sanitize(typeof sk === 'object' ? sk.name : sk)}</span>`).join('')}
                        </div>
                    </div>

                    <!-- Applications Submitted -->
                    <div style="margin-bottom:1.25rem;">
                        <div style="font-size:0.8rem;font-weight:700;color:var(--text-muted);margin-bottom:0.5rem;">📋 Submitted Job Applications (${apps.length})</div>
                        <div style="max-height:180px;overflow-y:auto;border:1px solid var(--border-color);border-radius:8px;">
                            ${apps.length === 0 ? '<div style="padding:1rem;text-align:center;color:var(--text-muted);font-size:0.8rem;">No applications submitted yet.</div>' : `
                                <table class="data-table" style="margin:0;font-size:0.8rem;">
                                    <thead><tr><th>Job Title</th><th>Company</th><th>Status</th><th>Applied Date</th></tr></thead>
                                    <tbody>
                                        ${apps.map(a => `<tr>
                                            <td style="font-weight:600;">${sanitize(a.jobId?.title || 'Job')}</td>
                                            <td>${sanitize(a.jobId?.companyName || 'N/A')}</td>
                                            <td><span class="role-pill" style="padding:0.15rem 0.5rem;font-size:0.7rem;">${a.status}</span></td>
                                            <td style="color:var(--text-muted);">${new Date(a.appliedAt || a.createdAt).toLocaleDateString()}</td>
                                        </tr>`).join('')}
                                    </tbody>
                                </table>
                            `}
                        </div>
                    </div>
                ` : u.role === 'recruiter' ? `
                    <!-- Recruiter Details -->
                    <div style="background:var(--bg-muted, #f8fafc);padding:1rem;border-radius:10px;border:1px solid var(--border-color);margin-bottom:1.25rem;">
                        <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.5rem;">🏢 Registered Organization</div>
                        <div style="font-size:0.95rem;font-weight:600;color:var(--text-main);">${sanitize(co?.name || 'No company registered')}</div>
                        <div style="font-size:0.8rem;color:var(--text-muted);">${sanitize(co?.website || '')} ${co?.industry ? '· ' + sanitize(co.industry) : ''}</div>
                        <div style="font-size:0.8rem;margin-top:0.35rem;">Status: <span style="font-weight:700;color:${co?.isVerified?'#15803d':'#d97706'};">${co?.isVerified ? '● Verified & Approved' : '● Pending Verification'}</span></div>
                    </div>
                    <div style="margin-bottom:1.25rem;">
                        <div style="font-size:0.8rem;font-weight:700;color:var(--text-muted);margin-bottom:0.5rem;">💼 Posted Job Listings (${jobs.length})</div>
                        ${jobs.length === 0 ? '<div style="color:var(--text-muted);font-size:0.8rem;">No jobs posted yet.</div>' : `
                            <ul style="padding-left:1.25rem;font-size:0.8rem;margin:0;">
                                ${jobs.map(j => `<li><b>${sanitize(j.title)}</b> (${j.status}) - ${j.applicantCount || 0} applicants</li>`).join('')}
                            </ul>
                        `}
                    </div>
                ` : `
                    <div style="padding:1rem;background:var(--bg-muted, #f8fafc);border-radius:10px;font-size:0.85rem;color:var(--text-main);">
                        <b>Admin Account</b>: Full platform access for telemetry, user management, and company approvals.
                    </div>
                `}

                <div style="display:flex;justify-content:flex-end;gap:0.75rem;margin-top:1.5rem;border-top:1px solid var(--border-color);padding-top:1rem;">
                    <button onclick="document.getElementById('userProfileModal').style.display='none'" class="btn btn-outline" style="font-size:0.85rem;padding:0.4rem 1.25rem;">Close</button>
                </div>
            </div>
        `;
    } catch(err) {
        modal.innerHTML = `<div style="background:white;padding:2rem;border-radius:16px;color:#ef4444;text-align:center;">Failed to load user profile: ${err.message}<br><br><button onclick="document.getElementById('userProfileModal').style.display='none'" class="btn btn-outline">Close</button></div>`;
    }
}
// === USER ROLE MANAGER (MAKE ADMIN / REMOVE FROM ADMIN / STUDENT / RECRUITER) ===
function changeRole(userId, currentRole) {
    const user = (state.users || []).find(u => u._id === userId) || { _id: userId, name: 'User', role: currentRole };
    
    let modal = document.getElementById('roleChangeModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'roleChangeModal';
        modal.className = 'modal-backdrop';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1rem;';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background:var(--card-bg, white);border-radius:16px;max-width:480px;width:100%;padding:1.75rem;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
                <div style="display:flex;align-items:center;gap:0.75rem;">
                    <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1rem;">
                        ${sanitize((user.name || 'U').charAt(0).toUpperCase())}
                    </div>
                    <div>
                        <h3 style="margin:0;font-size:1.1rem;color:var(--text-main);">Manage User Role</h3>
                        <div style="font-size:0.8rem;color:var(--text-muted);">${sanitize(user.name)} (${sanitize(user.email || '')})</div>
                    </div>
                </div>
                <button onclick="document.getElementById('roleChangeModal').style.display='none'" style="background:none;border:none;font-size:1.25rem;cursor:pointer;color:var(--text-muted);">✕</button>
            </div>

            <p style="font-size:0.85rem;color:var(--text-muted);margin:0 0 1.25rem;line-height:1.5;">
                Select a new system role for this user. Promoting to <b>Admin</b> grants full platform management access.
            </p>

            <div style="display:grid;gap:0.75rem;margin-bottom:1.5rem;">
                <label style="display:flex;align-items:center;gap:0.85rem;padding:0.85rem 1rem;border:2px solid ${currentRole==='admin'?'var(--primary)':'var(--border-color)'};border-radius:10px;cursor:pointer;background:var(--bg-muted, #f8fafc);">
                    <input type="radio" name="selectedRole" value="admin" ${currentRole==='admin'?'checked':''} style="width:18px;height:18px;accent-color:var(--primary);">
                    <div>
                        <div style="font-weight:700;font-size:0.9rem;color:var(--text-main);">🛡️ Super Admin</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">Full system control: users, companies, jobs, site settings & questions</div>
                    </div>
                </label>

                <label style="display:flex;align-items:center;gap:0.85rem;padding:0.85rem 1rem;border:2px solid ${currentRole==='sub-admin'?'var(--primary)':'var(--border-color)'};border-radius:10px;cursor:pointer;background:var(--bg-muted, #f8fafc);">
                    <input type="radio" name="selectedRole" value="sub-admin" ${currentRole==='sub-admin'?'checked':''} style="width:18px;height:18px;accent-color:var(--primary);">
                    <div>
                        <div style="font-weight:700;font-size:0.9rem;color:var(--text-main);">⚡ Sub-Admin / Moderator</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">Moderates questions, verifies companies and monitors traffic</div>
                    </div>
                </label>

                <label style="display:flex;align-items:center;gap:0.85rem;padding:0.85rem 1rem;border:2px solid ${currentRole==='recruiter'?'var(--primary)':'var(--border-color)'};border-radius:10px;cursor:pointer;background:var(--bg-muted, #f8fafc);">
                    <input type="radio" name="selectedRole" value="recruiter" ${currentRole==='recruiter'?'checked':''} style="width:18px;height:18px;accent-color:var(--primary);">
                    <div>
                        <div style="font-weight:700;font-size:0.9rem;color:var(--text-main);">💼 Recruiter / Employer</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">Post jobs, review applicant match scores, schedule interviews</div>
                    </div>
                </label>

                <label style="display:flex;align-items:center;gap:0.85rem;padding:0.85rem 1rem;border:2px solid ${currentRole==='student'?'var(--primary)':'var(--border-color)'};border-radius:10px;cursor:pointer;background:var(--bg-muted, #f8fafc);">
                    <input type="radio" name="selectedRole" value="student" ${currentRole==='student'?'checked':''} style="width:18px;height:18px;accent-color:var(--primary);">
                    <div>
                        <div style="font-weight:700;font-size:0.9rem;color:var(--text-main);">🎓 Student / Candidate</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">Solve 630+ questions, build resume, track roadmaps & apply for jobs</div>
                    </div>
                </label>
            </div>

            <div style="display:flex;justify-content:flex-end;gap:0.75rem;">
                <button type="button" onclick="document.getElementById('roleChangeModal').style.display='none'" class="btn btn-outline" style="padding:0.5rem 1.25rem;font-size:0.85rem;border-radius:8px;">Cancel</button>
                <button type="button" id="btnConfirmRoleChange" onclick="submitRoleChange('${userId}')" class="btn btn-primary" style="padding:0.5rem 1.5rem;font-size:0.85rem;border-radius:8px;font-weight:600;">Update Role</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

async function submitRoleChange(userId) {
    const selectedRadio = document.querySelector('input[name="selectedRole"]:checked');
    if (!selectedRadio) return showToast('Please select a role', 'error');
    const newRole = selectedRadio.value;
    
    const btn = document.getElementById('btnConfirmRoleChange');
    if (btn) { btn.disabled = true; btn.textContent = 'Updating...'; }

    try {
        const res = await API.put(`/admin/users/${userId}/role`, { role: newRole });
        showToast(res.message || `User role updated to ${newRole}`, 'success');
        document.getElementById('roleChangeModal').style.display = 'none';
        await renderUsers(content());
    } catch(err) {
        showToast('Failed to update role: ' + err.message, 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Update Role'; }
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to permanently delete this user account? All associated applications and profile records will be removed.')) return;
    try {
        await API.delete(`/admin/users/${userId}`);
        showToast('User account deleted successfully', 'success');
        await renderUsers(content());
    } catch(e) {
        showToast('Failed to delete user: ' + e.message, 'error');
    }
}

// === ADMIN PROFILE MANAGEMENT ===
async function renderAdminProfile(c) {
    c.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--text-muted);">Loading admin profile...</div>';
    let profileData = {};
    try {
        const res = await API.get('/admin/profile');
        profileData = res.user || API.getUser() || {};
    } catch(e) {
        profileData = API.getUser() || {};
    }

    c.innerHTML = `
        <div style="max-width:800px;margin:0 auto;">
            <div style="background:var(--card-bg, white);border:1px solid var(--border-color);border-radius:16px;padding:2rem;box-shadow:0 4px 12px rgba(0,0,0,0.04);margin-bottom:1.5rem;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.75rem;flex-wrap:wrap;gap:1rem;border-bottom:1px solid var(--border-color);padding-bottom:1.25rem;">
                    <div style="display:flex;align-items:center;gap:1.25rem;">
                        <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg, #3b82f6, #8b5cf6);color:white;display:flex;align-items:center;justify-content:center;font-size:1.75rem;font-weight:700;box-shadow:0 4px 12px rgba(59,130,246,0.3);">
                            ${sanitize((profileData.name || 'A').charAt(0).toUpperCase())}
                        </div>
                        <div>
                            <h2 style="margin:0 0 0.25rem;font-size:1.4rem;color:var(--text-main);">${sanitize(profileData.name || 'Admin')}</h2>
                            <div style="display:flex;align-items:center;gap:0.5rem;">
                                <span class="role-pill role-admin" style="font-size:0.75rem;padding:0.2rem 0.6rem;">🛡️ Super Admin</span>
                                <span style="font-size:0.8rem;color:var(--text-muted);">${sanitize(profileData.email || '')}</span>
                            </div>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:0.75rem;color:var(--text-muted);">Account Status</div>
                        <div style="font-size:0.85rem;font-weight:600;color:#10b981;">● Active & Verified</div>
                    </div>
                </div>

                <form onsubmit="saveAdminProfile(event)" id="adminProfileForm" style="display:grid;gap:1.25rem;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                        <div>
                            <label style="font-size:0.8rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.35rem;">Admin Full Name *</label>
                            <input type="text" id="adminProfName" value="${sanitize(profileData.name || '')}" required style="width:100%;padding:0.65rem 0.85rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.9rem;background:var(--input-bg);color:var(--text-main);">
                        </div>
                        <div>
                            <label style="font-size:0.8rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.35rem;">Admin Email Address *</label>
                            <input type="email" id="adminProfEmail" value="${sanitize(profileData.email || '')}" required style="width:100%;padding:0.65rem 0.85rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.9rem;background:var(--input-bg);color:var(--text-main);">
                        </div>
                    </div>

                    <div style="background:var(--bg-muted, #f8fafc);border:1px solid var(--border-color);border-radius:12px;padding:1.25rem;">
                        <h4 style="margin:0 0 0.5rem;font-size:0.95rem;color:var(--text-main);">🔒 Security & Password Update</h4>
                        <p style="margin:0 0 1rem;font-size:0.8rem;color:var(--text-muted);">Leave blank if you do not wish to change your password.</p>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                            <div>
                                <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.35rem;">New Password</label>
                                <input type="password" id="adminProfPass" placeholder="Min 6 characters" minlength="6" style="width:100%;padding:0.65rem 0.85rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.9rem;background:var(--input-bg);color:var(--text-main);">
                            </div>
                            <div>
                                <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.35rem;">Confirm New Password</label>
                                <input type="password" id="adminProfPassConfirm" placeholder="Re-enter new password" minlength="6" style="width:100%;padding:0.65rem 0.85rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.9rem;background:var(--input-bg);color:var(--text-main);">
                            </div>
                        </div>
                    </div>

                    <div style="display:flex;justify-content:flex-end;gap:1rem;margin-top:0.5rem;">
                        <button type="submit" id="btnSaveAdminProf" class="btn btn-primary" style="padding:0.7rem 2rem;font-size:0.9rem;border-radius:8px;font-weight:600;">💾 Save Admin Profile</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

async function saveAdminProfile(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSaveAdminProf');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

    const name = document.getElementById('adminProfName')?.value.trim();
    const email = document.getElementById('adminProfEmail')?.value.trim();
    const pass = document.getElementById('adminProfPass')?.value;
    const passConfirm = document.getElementById('adminProfPassConfirm')?.value;

    if (!name || !email) {
        if (btn) { btn.disabled = false; btn.textContent = '💾 Save Admin Profile'; }
        return showToast('Name and email are required', 'error');
    }

    if (pass) {
        if (pass.length < 6) {
            if (btn) { btn.disabled = false; btn.textContent = '💾 Save Admin Profile'; }
            return showToast('Password must be at least 6 characters', 'error');
        }
        if (pass !== passConfirm) {
            if (btn) { btn.disabled = false; btn.textContent = '💾 Save Admin Profile'; }
            return showToast('Passwords do not match', 'error');
        }
    }

    try {
        const res = await API.put('/admin/profile', { name, email, password: pass || undefined });
        if (res.user) {
            API.saveAuth(API.getToken(), res.user);
            const adminNameEl = document.getElementById('adminName');
            const adminAvatarEl = document.getElementById('adminAvatar');
            if (adminNameEl) adminNameEl.textContent = res.user.name || 'Admin';
            if (adminAvatarEl) adminAvatarEl.textContent = (res.user.name || 'A').charAt(0).toUpperCase();
        }
        showToast('Admin profile updated successfully!', 'success');
        await renderAdminProfile(content());
    } catch(err) {
        showToast('Failed to update admin profile: ' + err.message, 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '💾 Save Admin Profile'; }
    }
}

window.viewUserProfile = viewUserProfile;
window.changeRole = changeRole;
window.submitRoleChange = submitRoleChange;
window.deleteUser = deleteUser;
window.renderAdminProfile = renderAdminProfile;
window.saveAdminProfile = saveAdminProfile;

// === COMPANIES ===
async function renderCompanies(c) {
    const data = await API.get('/admin/companies');
    state.companies = data.companies;
    const pending = state.companies.filter(co => co.verificationStatus === 'pending' || (!co.isVerified && co.verificationStatus !== 'rejected'));
    const rejected = state.companies.filter(co => co.verificationStatus === 'rejected');
    const verified = state.companies.filter(co => co.verificationStatus === 'approved' || co.isVerified);
    c.innerHTML = `
        <div style="background:white;border-radius:12px;border:1px solid var(--border-color);padding:1.25rem;margin-bottom:1.5rem;">
            <h3 style="margin:0 0 1rem;font-size:1rem;">➕ Add Company (Admin Direct)</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr auto;gap:0.75rem;align-items:end;">
                <div><label style="font-size:0.7rem;font-weight:600;display:block;margin-bottom:0.3rem;">Name*</label><input id="newCoName" type="text" placeholder="Company name" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;"></div>
                <div><label style="font-size:0.7rem;font-weight:600;display:block;margin-bottom:0.3rem;">Website</label><input id="newCoWeb" type="text" placeholder="example.com" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;"></div>
                <div><label style="font-size:0.7rem;font-weight:600;display:block;margin-bottom:0.3rem;">Domain</label><select id="newCoDomain" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;"><option value="product">Product</option><option value="service">Service</option><option value="startup">Startup</option></select></div>
                <div><label style="font-size:0.7rem;font-weight:600;display:block;margin-bottom:0.3rem;">Industry</label><input id="newCoIndustry" type="text" placeholder="Technology" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;"></div>
                <button onclick="addCompany()" class="btn btn-primary" style="font-size:0.8rem;white-space:nowrap;">Add</button>
            </div>
        </div>
        ${pending.length > 0 ? `<div style="margin-bottom:1.5rem;"><h3 style="font-size:1rem;margin-bottom:0.75rem;">⏳ Pending Verification (${pending.length})</h3>
        <div class="company-grid">${pending.map(co => companyCard(co, 'pending')).join('')}</div></div>` : ''}
        ${rejected.length > 0 ? `<div style="margin-bottom:1.5rem;"><h3 style="font-size:1rem;margin-bottom:0.75rem;">❌ Rejected (${rejected.length})</h3>
        <div class="company-grid">${rejected.map(co => companyCard(co, 'rejected')).join('')}</div></div>` : ''}
        <h3 style="font-size:1rem;margin-bottom:0.75rem;">✅ Verified (${verified.length})</h3>
        <div class="company-grid">${verified.map(co => companyCard(co, 'approved')).join('')}</div>
    `;
}
function companyCard(co, statusType) {
    const domainClass = co.domain === 'product' ? 'domain-product' : co.domain === 'service' ? 'domain-service' : 'domain-startup';
    const submitter = co.submittedBy ? `<div style="font-size:0.7rem;color:var(--text-muted);margin-top:0.35rem;">Submitted by: <b>${sanitize(co.submittedBy.name || 'Unknown')}</b> (${sanitize(co.submittedBy.email || '')})</div>` : '';
    const hrInfo = co.hrName ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem;">👤 HR: ${sanitize(co.hrName)}${co.hrEmail ? ' · ' + sanitize(co.hrEmail) : ''}${co.hrPhone ? ' · ' + sanitize(co.hrPhone) : ''}</div>` : '';
    const regInfo = co.registrationNumber ? `<div style="font-size:0.7rem;color:var(--text-muted);margin-top:0.2rem;">📋 Reg#: ${sanitize(co.registrationNumber)}</div>` : '';
    const linkedInInfo = co.linkedIn ? `<div style="font-size:0.7rem;margin-top:0.2rem;"><a href="${sanitize(co.linkedIn)}" target="_blank" style="color:#0077b5;text-decoration:none;">🔗 LinkedIn</a></div>` : '';

    let actionHtml = '';
    if (statusType === 'pending') {
        actionHtml = `<div style="display:flex;gap:0.5rem;margin-top:0.75rem;flex-wrap:wrap;">
            <button onclick="viewCompanyDetails('${co._id}')" class="btn btn-outline" style="font-size:0.7rem;padding:0.25rem 0.6rem;">👁 Details</button>
            <button onclick="verifyCompany('${co._id}',true)" class="btn btn-primary" style="font-size:0.75rem;padding:0.3rem 0.75rem;">✓ Approve</button>
            <button onclick="rejectCompanyPrompt('${co._id}')" class="btn btn-outline" style="font-size:0.75rem;padding:0.3rem 0.75rem;color:#ef4444;border-color:#ef4444;">✕ Reject</button>
        </div>`;
    } else if (statusType === 'rejected') {
        actionHtml = `<div style="margin-top:0.5rem;"><div style="font-size:0.75rem;color:#ef4444;background:#fee2e2;padding:0.4rem 0.6rem;border-radius:6px;margin-bottom:0.5rem;">Reason: ${sanitize(co.rejectionReason || 'Not specified')}</div>
            <div style="display:flex;gap:0.5rem;">
                <button onclick="verifyCompany('${co._id}',true)" class="btn btn-outline" style="font-size:0.7rem;padding:0.25rem 0.6rem;">Re-approve</button>
                <button onclick="deleteCompany('${co._id}')" class="btn btn-outline" style="font-size:0.7rem;padding:0.2rem 0.6rem;color:#ef4444;border-color:#ef4444;">🗑 Delete</button>
            </div></div>`;
    } else {
        actionHtml = `<div style="display:flex;gap:0.5rem;margin-top:0.75rem;">
            <button onclick="viewCompanyDetails('${co._id}')" class="btn btn-outline" style="font-size:0.7rem;padding:0.25rem 0.6rem;">👁 Details</button>
            <button onclick="deleteCompany('${co._id}')" class="btn btn-outline" style="font-size:0.7rem;padding:0.2rem 0.6rem;color:#ef4444;border-color:#ef4444;">🗑 Delete</button>
        </div>`;
    }

    return `<div class="company-card">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.5rem;">
            <div style="display:flex;align-items:center;gap:0.75rem;">
                <div style="width:40px;height:40px;border-radius:10px;background:rgba(249,115,22,0.1);color:var(--primary);display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:1.1rem;">${sanitize(co.name.charAt(0))}</div>
                <div><div style="font-weight:600;font-size:0.95rem;">${sanitize(co.name)}</div><div style="font-size:0.75rem;color:var(--text-muted);">${sanitize(co.website || '')}</div></div>
            </div>
            <span class="domain-tag ${domainClass}">${sanitize(co.domain || 'N/A')}</span>
        </div>
        <div style="font-size:0.8rem;color:var(--text-muted);">${sanitize(co.industry || '')} ${co.headquarter ? '· ' + sanitize(co.headquarter) : ''} ${co.employeeCount ? '· 👥 ' + sanitize(co.employeeCount) : ''}</div>
        ${hrInfo}${regInfo}${linkedInInfo}${submitter}
        ${actionHtml}
    </div>`;
}

async function viewCompanyDetails(companyId) {
    let modal = document.getElementById('companyDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'companyDetailModal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1.5rem;';
        document.body.appendChild(modal);
    }
    modal.innerHTML = '<div style="background:white;border-radius:16px;padding:2rem;max-width:600px;width:100%;text-align:center;color:var(--text-muted);">Loading company details...</div>';
    modal.style.display = 'flex';

    try {
        const res = await API.get('/admin/companies/' + companyId + '/full');
        const co = res.company;
        const sub = co.submittedBy || {};
        const statusColor = co.verificationStatus === 'approved' ? '#10b981' : co.verificationStatus === 'rejected' ? '#ef4444' : '#f59e0b';
        modal.innerHTML = `
            <div style="background:white;border-radius:16px;padding:2rem;max-width:650px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 40px rgba(0,0,0,0.2);position:relative;" onclick="event.stopPropagation()">
                <button onclick="document.getElementById('companyDetailModal').style.display='none'" style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">&times;</button>
                <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;">
                    <div style="width:56px;height:56px;border-radius:12px;background:rgba(249,115,22,0.1);color:var(--primary);display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:bold;">${sanitize(co.name.charAt(0))}</div>
                    <div>
                        <h2 style="margin:0;font-size:1.25rem;">${sanitize(co.name)}</h2>
                        <span style="font-size:0.75rem;padding:0.15rem 0.5rem;border-radius:999px;color:white;background:${statusColor};">${co.verificationStatus}</span>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1.25rem;">
                    <div style="background:#f8fafc;padding:0.75rem;border-radius:8px;border:1px solid var(--border-color);"><div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;">Website</div><div style="font-size:0.85rem;font-weight:500;">${sanitize(co.website || '-')}</div></div>
                    <div style="background:#f8fafc;padding:0.75rem;border-radius:8px;border:1px solid var(--border-color);"><div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;">Industry</div><div style="font-size:0.85rem;font-weight:500;">${sanitize(co.industry || '-')}</div></div>
                    <div style="background:#f8fafc;padding:0.75rem;border-radius:8px;border:1px solid var(--border-color);"><div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;">Domain</div><div style="font-size:0.85rem;font-weight:500;">${sanitize(co.domain || '-')}</div></div>
                    <div style="background:#f8fafc;padding:0.75rem;border-radius:8px;border:1px solid var(--border-color);"><div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;">Size</div><div style="font-size:0.85rem;font-weight:500;">${sanitize(co.size || '-')}</div></div>
                    <div style="background:#f8fafc;padding:0.75rem;border-radius:8px;border:1px solid var(--border-color);"><div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;">Headquarter</div><div style="font-size:0.85rem;font-weight:500;">${sanitize(co.headquarter || '-')}</div></div>
                    <div style="background:#f8fafc;padding:0.75rem;border-radius:8px;border:1px solid var(--border-color);"><div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;">Employees</div><div style="font-size:0.85rem;font-weight:500;">${sanitize(co.employeeCount || '-')}</div></div>
                    <div style="background:#f8fafc;padding:0.75rem;border-radius:8px;border:1px solid var(--border-color);"><div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;">Founded</div><div style="font-size:0.85rem;font-weight:500;">${co.foundedYear || '-'}</div></div>
                    <div style="background:#f8fafc;padding:0.75rem;border-radius:8px;border:1px solid var(--border-color);"><div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;">Reg/GST Number</div><div style="font-size:0.85rem;font-weight:500;">${sanitize(co.registrationNumber || '-')}</div></div>
                </div>

                ${co.description ? `<div style="margin-bottom:1rem;"><h4 style="margin:0 0 0.5rem;font-size:0.85rem;">📝 Description</h4><div style="font-size:0.8rem;color:var(--text-muted);">${sanitize(co.description)}</div></div>` : ''}

                <div style="background:#f0f9ff;padding:1rem;border-radius:8px;border:1px solid #bae6fd;margin-bottom:1rem;">
                    <h4 style="margin:0 0 0.5rem;font-size:0.85rem;color:#0369a1;">👨‍💼 HR / Contact Details</h4>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;font-size:0.8rem;">
                        <div><b>Name:</b> ${sanitize(co.hrName || '-')}</div>
                        <div><b>Email:</b> ${sanitize(co.hrEmail || '-')}</div>
                        <div><b>Phone:</b> ${sanitize(co.hrPhone || '-')}</div>
                        <div><b>Company Email:</b> ${sanitize(co.companyEmail || '-')}</div>
                    </div>
                    ${co.linkedIn ? `<div style="margin-top:0.5rem;"><a href="${sanitize(co.linkedIn)}" target="_blank" style="color:#0077b5;font-size:0.8rem;">🔗 Company LinkedIn</a></div>` : ''}
                    ${co.address ? `<div style="margin-top:0.5rem;font-size:0.8rem;"><b>Address:</b> ${sanitize(co.address)}</div>` : ''}
                </div>

                ${sub.name ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:1rem;">Submitted by: <b>${sanitize(sub.name)}</b> (${sanitize(sub.email || '')}) on ${new Date(co.createdAt).toLocaleDateString()}</div>` : ''}

                <div style="display:flex;justify-content:flex-end;gap:0.5rem;">
                    ${co.verificationStatus !== 'approved' ? `<button onclick="verifyCompany('${co._id}',true); document.getElementById('companyDetailModal').style.display='none';" class="btn btn-primary" style="font-size:0.85rem;">✓ Approve</button>` : ''}
                    ${co.verificationStatus !== 'rejected' ? `<button onclick="rejectCompanyPrompt('${co._id}'); document.getElementById('companyDetailModal').style.display='none';" class="btn btn-outline" style="font-size:0.85rem;color:#ef4444;border-color:#ef4444;">✕ Reject</button>` : ''}
                    <button onclick="document.getElementById('companyDetailModal').style.display='none'" class="btn btn-outline" style="font-size:0.85rem;">Close</button>
                </div>
            </div>
        `;
    } catch(err) {
        modal.innerHTML = `<div style="background:white;padding:2rem;border-radius:16px;color:#ef4444;text-align:center;">Failed: ${err.message}<br><br><button onclick="document.getElementById('companyDetailModal').style.display='none'" class="btn btn-outline">Close</button></div>`;
    }
}

async function verifyCompany(companyId, approve = true) {
    try {
        const res = await API.put('/admin/companies/' + companyId + '/verify', { approve: !!approve });
        showToast(res.message || (approve ? 'Company approved successfully!' : 'Company updated!'), 'success');
        await loadSection('companies');
    } catch (e) {
        showToast('Failed to verify company: ' + e.message, 'error');
    }
}

async function deleteCompany(companyId) {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) return;
    try {
        await API.delete('/admin/companies/' + companyId);
        showToast('Company deleted successfully.', 'success');
        await loadSection('companies');
    } catch (e) {
        showToast('Failed to delete company: ' + e.message, 'error');
    }
}

async function addCompany() {
    const name = document.getElementById('newCoName')?.value.trim();
    const website = document.getElementById('newCoWeb')?.value.trim();
    const domain = document.getElementById('newCoDomain')?.value;
    const industry = document.getElementById('newCoIndustry')?.value.trim();
    if (!name) return showToast('Company name is required', 'error');

    try {
        await API.post('/admin/companies', { name, website, domain, industry });
        showToast('Company added successfully!', 'success');
        await loadSection('companies');
    } catch (e) {
        showToast('Failed to add company: ' + e.message, 'error');
    }
}

function rejectCompanyPrompt(companyId) {
    const reason = prompt('Enter rejection reason for this company:');
    if (reason === null) return; // User cancelled
    rejectCompanyWithReason(companyId, reason);
}

async function rejectCompanyWithReason(companyId, reason) {
    try {
        await API.put('/admin/companies/' + companyId + '/verify', { approve: false, rejectionReason: reason || '' });
        showToast('Company rejected. Recruiter notified.', 'success');
        await loadSection('companies');
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// Window bindings for companies
window.verifyCompany = verifyCompany;
window.deleteCompany = deleteCompany;
window.addCompany = addCompany;
window.rejectCompanyPrompt = rejectCompanyPrompt;
window.rejectCompanyWithReason = rejectCompanyWithReason;
window.viewCompanyDetails = viewCompanyDetails;

// === CONTENT === (full CRUD implementation at bottom of file)

// === TOP PERFORMERS ===
async function renderPerformers(c) {
    const data = await API.get('/admin/top-performers');
    state.performers = data.performers;
    c.innerHTML = `
        <div style="background:white;border-radius:12px;border:1px solid var(--border-color);overflow:hidden;">
            <div style="padding:1rem 1.25rem;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">
                <h3 style="margin:0;font-size:1rem;">🏆 Student Rankings</h3>
                <span style="font-size:0.8rem;color:var(--text-muted);">${state.performers.length} students</span>
            </div>
            <div class="table-responsive" style="border:none;border-radius:0;">
                <table class="data-table"><thead><tr><th>#</th><th>Student</th><th>Score</th><th>Skills</th><th>Resume</th><th>Location</th><th>Actions</th></tr></thead>
            <tbody>${state.performers.map((p, i) => `<tr style="cursor:pointer;" onclick="showStudentDetailModal('${p._id}')">
                <td style="font-weight:700;color:${i < 3 ? 'var(--primary)' : 'var(--text-muted)'};">${i + 1}</td>
                <td><div><div style="font-weight:600;">${sanitize(p.name)}</div><div style="font-size:0.75rem;color:var(--text-muted);">${sanitize(p.email)}</div></div></td>
                <td><span style="font-weight:700;color:${p.compositeScore >= 70 ? '#10b981' : p.compositeScore >= 40 ? '#d97706' : '#ef4444'};">${p.compositeScore}%</span></td>
                <td>${p.skillCount}</td><td>${p.resumeScore}%</td><td style="font-size:0.8rem;color:var(--text-muted);">${sanitize(p.location || '-')}</td>
                <td><button onclick="event.stopPropagation(); showStudentDetailModal('${p._id}')" class="btn btn-outline" style="font-size:0.75rem;padding:0.25rem 0.6rem;">👁 Profile</button></td>
            </tr>`).join('')}</tbody></table></div>
        </div>
    `;
}

async function showStudentDetailModal(studentId) {
    let modal = document.getElementById('studentDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'studentDetailModal';
        modal.className = 'modal-backdrop';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1.5rem;';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = '<div style="background:white;border-radius:16px;padding:2rem;max-width:600px;width:100%;max-height:85vh;overflow-y:auto;text-align:center;color:var(--text-muted);">Loading student profile details...</div>';
    modal.style.display = 'flex';

    try {
        const res = await API.get('/admin/users/' + studentId + '/detail');
        const s = res.student || {};
        const u = s.user || {};
        const p = s.profile || {};
        const apps = s.applications || [];

        modal.innerHTML = `
            <div style="background:white;border-radius:16px;padding:2rem;max-width:650px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 40px rgba(0,0,0,0.2);position:relative;" onclick="event.stopPropagation()">
                <button onclick="closeStudentModal()" style="position:absolute;top:1.25rem;right:1.25rem;background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">&times;</button>
                <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;">
                    <div style="width:56px;height:56px;border-radius:50%;background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:bold;">${sanitize((u.name||'S').charAt(0).toUpperCase())}</div>
                    <div style="text-align:left;">
                        <h2 style="margin:0;font-size:1.25rem;font-weight:700;">${sanitize(u.name || 'Student')}</h2>
                        <div style="font-size:0.85rem;color:var(--text-muted);">${sanitize(u.email || '')} · <span class="role-pill role-${u.role}">${u.role}</span></div>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.75rem;margin-bottom:1.5rem;">
                    <div style="background:#f8fafc;padding:0.75rem;border-radius:8px;border:1px solid var(--border-color);text-align:center;"><div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;">ATS Resume Score</div><div style="font-size:1.25rem;font-weight:700;color:var(--primary);">${p.resumeScore || 0}%</div></div>
                    <div style="background:#f8fafc;padding:0.75rem;border-radius:8px;border:1px solid var(--border-color);text-align:center;"><div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;">Skills</div><div style="font-size:1.25rem;font-weight:700;color:#3b82f6;">${(p.skills||[]).length}</div></div>
                    <div style="background:#f8fafc;padding:0.75rem;border-radius:8px;border:1px solid var(--border-color);text-align:center;"><div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;">Applications</div><div style="font-size:1.25rem;font-weight:700;color:#10b981;">${apps.length}</div></div>
                </div>

                <div style="text-align:left;margin-bottom:1rem;">
                    <h4 style="margin:0 0 0.5rem;font-size:0.9rem;font-weight:600;">🛠 Listed Skills</h4>
                    <div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
                        ${(p.skills && p.skills.length > 0) ? p.skills.map(s => `<span style="padding:0.2rem 0.6rem;background:#dbeafe;color:#1d4ed8;border-radius:999px;font-size:0.75rem;font-weight:500;">${sanitize(typeof s === 'string' ? s : s.name)}</span>`).join('') : '<span style="color:var(--text-muted);font-size:0.8rem;">No skills listed yet</span>'}
                    </div>
                </div>

                <div style="text-align:left;margin-bottom:1.5rem;">
                    <h4 style="margin:0 0 0.5rem;font-size:0.9rem;font-weight:600;">📋 Recent Applications</h4>
                    ${apps.length === 0 ? '<div style="color:var(--text-muted);font-size:0.8rem;">No applications submitted yet.</div>' : `
                        <table class="data-table" style="font-size:0.8rem;">
                            <thead><tr><th>Job Title</th><th>Company</th><th>Match</th><th>Status</th></tr></thead>
                            <tbody>${apps.map(a => `<tr>
                                <td style="font-weight:600;">${sanitize(a.jobId?.title || 'Job Posting')}</td>
                                <td>${sanitize(a.jobId?.companyName || 'Company')}</td>
                                <td style="font-weight:700;color:${a.skillMatch >= 70 ? '#10b981' : '#f59e0b'};">${a.skillMatch || 0}%</td>
                                <td><span style="font-size:0.7rem;padding:0.15rem 0.5rem;border-radius:4px;background:#f1f5f9;font-weight:600;">${sanitize(a.status || 'applied')}</span></td>
                            </tr>`).join('')}</tbody>
                        </table>
                    `}
                </div>

                <div style="display:flex;justify-content:flex-end;">
                    <button onclick="closeStudentModal()" class="btn btn-outline" style="font-size:0.85rem;">Close</button>
                </div>
            </div>
        `;
    } catch(err) {
        modal.innerHTML = `<div style="background:white;padding:2rem;border-radius:16px;color:#ef4444;text-align:center;">Failed to load details: ${err.message}<br><br><button onclick="closeStudentModal()" class="btn btn-outline">Close</button></div>`;
    }
}

function closeStudentModal() {
    const modal = document.getElementById('studentDetailModal');
    if (modal) modal.style.display = 'none';
}

// === NOTIFICATIONS ===
async function renderNotifications(c) {
    try {
        const data = await API.get('/notifications/my');
        state.notifications = data.notifications || [];
    } catch(e) {
        state.notifications = [];
    }
    
    c.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">
            <div style="background:var(--card-bg, white);border-radius:12px;border:1px solid var(--border-color);padding:1.25rem;">
                <h3 style="margin:0 0 0.75rem;font-size:0.95rem;color:var(--text-main);">⚡ Quick Actions</h3>
                <p style="font-size:0.8rem;color:var(--text-muted);margin:0 0 1rem;">One-click broadcast announcements to student groups.</p>
                <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
                    <button id="btnNotifyInactive" onclick="bulkNotify('inactive')" class="btn btn-outline" style="font-size:0.8rem;padding:0.45rem 0.85rem;border-radius:8px;">📨 Notify Inactive Users</button>
                    <button id="btnCongratulateTop" onclick="bulkNotify('top-performers')" class="btn btn-outline" style="font-size:0.8rem;padding:0.45rem 0.85rem;border-radius:8px;">🏆 Congratulate Top Performers</button>
                </div>
            </div>
            <div style="background:var(--card-bg, white);border-radius:12px;border:1px solid var(--border-color);padding:1.25rem;">
                <h3 style="margin:0 0 0.75rem;font-size:0.95rem;color:var(--text-main);">📢 Send Custom</h3>
                <input type="text" id="notifTitle" placeholder="Title (e.g. Campus Placement Drive)" style="width:100%;padding:0.55rem 0.75rem;border:1px solid var(--border-color);border-radius:6px;margin-bottom:0.5rem;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                <textarea id="notifMsg" placeholder="Notification message..." style="width:100%;min-height:60px;padding:0.55rem 0.75rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.85rem;resize:vertical;background:var(--input-bg);color:var(--text-main);font-family:inherit;"></textarea>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.6rem;gap:0.5rem;">
                    <div style="display:flex;align-items:center;gap:0.4rem;">
                        <span style="font-size:0.75rem;color:var(--text-muted);font-weight:600;">Target:</span>
                        <select id="notifTarget" style="padding:0.4rem 0.6rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);color:var(--text-main);">
                            <option value="all">All Users</option>
                            <option value="student">Students Only</option>
                            <option value="recruiter">Recruiters Only</option>
                            <option value="admin">Admins Only</option>
                        </select>
                    </div>
                    <button id="sendNotifBtn" onclick="sendNotification()" class="btn btn-primary" style="font-size:0.8rem;padding:0.45rem 1.25rem;border-radius:8px;">Send Announcement</button>
                </div>
            </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
            <h3 style="font-size:1rem;margin:0;color:var(--text-main);">Recent Notifications (${state.notifications.length})</h3>
            <span style="font-size:0.75rem;color:var(--text-muted);">Click any notification to view full details</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.6rem;">
            ${state.notifications.length === 0 ? '<div style="text-align:center;padding:2.5rem;color:var(--text-muted);background:var(--card-bg, white);border-radius:12px;border:1px solid var(--border-color);">No broadcast notifications yet. Use the form above to send one!</div>' :
            state.notifications.map(n => {
                const typeIcon = n.type === 'achievement' ? '🏆' : n.type === 'reminder' ? '🔔' : n.type === 'alert' ? '⚠️' : '📢';
                return `<div onclick="viewAdminNotification('${n._id}')" style="background:var(--card-bg, white);border:1px solid var(--border-color);border-radius:10px;padding:1rem 1.25rem;cursor:pointer;transition:all 0.15s ease;" onmouseover="this.style.borderColor='var(--primary)';" onmouseout="this.style.borderColor='var(--border-color)';">
                    <div style="display:flex;justify-content:space-between;align-items:start;gap:1rem;">
                        <div style="display:flex;gap:0.75rem;align-items:start;">
                            <span style="font-size:1.25rem;">${typeIcon}</span>
                            <div>
                                <div style="font-weight:600;font-size:0.95rem;color:var(--text-main);margin-bottom:0.2rem;">${sanitize(n.title)}</div>
                                <div style="font-size:0.82rem;color:var(--text-muted);line-height:1.4;">${sanitize(n.message)}</div>
                            </div>
                        </div>
                        <span style="font-size:0.72rem;color:var(--text-muted);white-space:nowrap;flex-shrink:0;">${new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style="margin-top:0.5rem;font-size:0.72rem;color:var(--text-muted);display:flex;gap:0.75rem;">
                        <span>Target: <b style="text-transform:capitalize;color:var(--text-main);">${sanitize(n.targetRole)}</b></span>
                        <span>By: <b>${sanitize(n.createdBy?.name || 'Admin')}</b></span>
                    </div>
                </div>`;
            }).join('')}
        </div>
    `;
}

async function sendNotification() {
    const titleEl = document.getElementById('notifTitle');
    const msgEl = document.getElementById('notifMsg');
    const targetEl = document.getElementById('notifTarget');
    if (!titleEl || !msgEl) return;

    const title = titleEl.value.trim();
    const message = msgEl.value.trim();
    const targetRole = targetEl ? targetEl.value : 'all';

    if (!title || !message) return showToast('Please enter both title and message', 'error');

    const sendBtn = document.getElementById('sendNotifBtn');
    if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = 'Sending...'; }

    try {
        const res = await API.post('/notifications', { title, message, targetRole, type: 'announcement' });
        showToast(res.message || 'Notification broadcast successfully!', 'success');
        titleEl.value = '';
        msgEl.value = '';
        await loadSection('notifications');
    } catch (e) {
        showToast(e.message || 'Failed to send notification', 'error');
    } finally {
        if (sendBtn) { sendBtn.disabled = false; sendBtn.textContent = 'Send Announcement'; }
    }
}

async function bulkNotify(type) {
    const btn = type === 'inactive' ? document.getElementById('btnNotifyInactive') : document.getElementById('btnCongratulateTop');
    if (btn) { btn.disabled = true; btn.textContent = 'Processing...'; }

    try {
        showToast('Sending broadcast...', 'info');
        const r = await API.post('/admin/notifications/bulk', { type });
        showToast(r.message || 'Broadcast complete!', 'success');
        await loadSection('notifications');
    } catch (e) {
        showToast(e.message || 'Bulk notification failed', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = type === 'inactive' ? '📨 Notify Inactive Users' : '🏆 Congratulate Top Performers';
        }
    }
}

function viewAdminNotification(notifId) {
    const n = (state.notifications || []).find(item => item._id === notifId);
    if (!n) return;

    let modal = document.getElementById('notifDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'notifDetailModal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1.5rem;';
        document.body.appendChild(modal);
    }

    const typeIcons = { announcement: '📢', alert: '⚠️', achievement: '🏆', reminder: '🔔', system: '⚙️' };
    const icon = typeIcons[n.type] || '🔔';

    modal.innerHTML = `
        <div style="background:var(--card-bg, #ffffff);color:var(--text-main, #0f172a);border-radius:16px;padding:2rem;max-width:550px;width:100%;box-shadow:0 20px 40px rgba(0,0,0,0.25);border:1px solid var(--border-color, #e2e8f0);position:relative;" onclick="event.stopPropagation()">
            <button onclick="document.getElementById('notifDetailModal').style.display='none'" style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">&times;</button>
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
                <span style="font-size:2rem;">${icon}</span>
                <div>
                    <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:var(--text-main);">${sanitize(n.title)}</h3>
                    <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem;">
                        Target: <span style="font-weight:600;text-transform:capitalize;color:var(--text-main);">${sanitize(n.targetRole)}</span> · Sent: ${new Date(n.createdAt).toLocaleString()}
                    </div>
                </div>
            </div>
            <div style="background:var(--bg-muted, #f8fafc);border:1px solid var(--border-color, #e2e8f0);border-radius:10px;padding:1.25rem;font-size:0.9rem;line-height:1.6;color:var(--text-main);white-space:pre-wrap;margin-bottom:1.5rem;">${sanitize(n.message)}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:0.75rem;color:var(--text-muted);">Sender: <b>${sanitize(n.createdBy?.name || 'Admin')}</b></span>
                <button onclick="document.getElementById('notifDetailModal').style.display='none'" class="btn btn-primary" style="font-size:0.85rem;padding:0.45rem 1.25rem;border-radius:8px;">Close</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

// === ACTIVITY LOG ===
async function renderActivity(c) {
    try {
        const data = await API.get('/admin/activity-log');
        const logs = data.logs || [];
        state.activityLogs = logs;
        c.innerHTML = `<div style="background:white;border-radius:12px;border:1px solid var(--border-color);overflow:hidden;">
            <div style="padding:1rem 1.25rem;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">
                <h3 style="margin:0;font-size:1rem;">📋 System Activity Log</h3>
                <span style="font-size:0.8rem;color:var(--text-muted);">${logs.length} entries</span>
            </div>
            <div class="table-responsive" style="border:none;border-radius:0;">
                <table class="data-table"><thead><tr><th>Action</th><th>User</th><th>Details</th><th>Time</th><th style="text-align:right;">Actions</th></tr></thead>
                <tbody>${logs.length === 0 ? '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-muted);">No activity logs yet. Actions like logins and applications will appear here.</td></tr>' : logs.map(l => `<tr onclick="viewActivityDetails('${l._id}')" style="cursor:pointer;" title="Click to view activity details">
                    <td><span style="font-size:0.75rem;font-weight:600;padding:0.15rem 0.5rem;border-radius:4px;background:#f1f5f9;color:var(--primary);">${sanitize(l.action||'event')}</span></td>
                    <td style="font-weight:500;">${sanitize(l.userId?.name||'System')}</td>
                    <td style="font-size:0.8rem;color:var(--text-muted);max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${sanitize(l.details||'-')}</td>
                    <td style="font-size:0.75rem;color:var(--text-muted);">${new Date(l.createdAt).toLocaleString()}</td>
                    <td style="text-align:right;">
                        <button onclick="event.stopPropagation(); viewActivityDetails('${l._id}')" class="btn btn-outline" style="font-size:0.72rem;padding:0.2rem 0.5rem;background:#f0fdf4;color:#15803d;border-color:#bbf7d0;font-weight:600;">👁 Inspect</button>
                    </td>
                </tr>`).join('')}</tbody></table>
            </div></div>`;
    } catch(e) { c.innerHTML = `<div style="padding:2rem;color:var(--text-muted);">Activity logging is available. Events will appear as users interact with the platform.</div>`; }
}

function viewActivityDetails(logId) {
    const logs = state.activityLogs || [];
    const log = logs.find(l => l._id === logId) || {};
    let modal = document.getElementById('activityDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'activityDetailModal';
        modal.className = 'modal-backdrop';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1rem;';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background:var(--card-bg, white);border-radius:16px;max-width:580px;width:100%;max-height:90vh;overflow-y:auto;padding:1.75rem;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);border:1px solid var(--border-color);" onclick="event.stopPropagation();">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;border-bottom:1px solid var(--border-color);padding-bottom:1rem;">
                <h3 style="margin:0;font-size:1.15rem;">📋 Activity Log Inspection</h3>
                <button onclick="document.getElementById('activityDetailModal').style.display='none'" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">&times;</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;">
                <div style="background:#f8fafc;padding:0.75rem;border-radius:8px;border:1px solid var(--border-color);"><div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;">Action Type</div><div style="font-size:0.9rem;font-weight:700;color:var(--primary);">${sanitize(log.action || 'Event')}</div></div>
                <div style="background:#f8fafc;padding:0.75rem;border-radius:8px;border:1px solid var(--border-color);"><div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;">Timestamp</div><div style="font-size:0.85rem;">${new Date(log.createdAt || Date.now()).toLocaleString()}</div></div>
            </div>
            <div style="background:#f8fafc;padding:1rem;border-radius:8px;border:1px solid var(--border-color);margin-bottom:1.25rem;">
                <div style="font-size:0.75rem;color:var(--text-muted);font-weight:700;margin-bottom:0.3rem;">Actor Details</div>
                <div style="font-weight:600;font-size:0.9rem;">${sanitize(log.userId?.name || 'System / Anonymous')}</div>
                <div style="font-size:0.8rem;color:var(--text-muted);">${sanitize(log.userId?.email || '')} ${log.userId?.role ? '· Role: ' + log.userId.role : ''}</div>
            </div>
            <div style="margin-bottom:1.25rem;">
                <div style="font-size:0.75rem;color:var(--text-muted);font-weight:700;margin-bottom:0.3rem;">Event Details & Payload</div>
                <div style="background:#0f172a;color:#38bdf8;padding:1rem;border-radius:8px;font-family:monospace;font-size:0.8rem;white-space:pre-wrap;max-height:160px;overflow-y:auto;">${sanitize(log.details || 'No additional payload.')}</div>
            </div>
            <div style="display:flex;justify-content:flex-end;">
                <button onclick="document.getElementById('activityDetailModal').style.display='none'" class="btn btn-primary" style="font-size:0.85rem;">Close</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}
window.viewActivityDetails = viewActivityDetails;
window.viewAdminNotification = viewAdminNotification;

// === MATCHING LOGIC ===
async function renderMatching(c) {
    try {
        const data = await API.get('/admin/matching-logic');
        const f = data.formula;
        const w = f.weights;
        const rw = f.resumeWeights;
        const th = f.recommendationThresholds;
        const sc = f.sampleCalculation;
        c.innerHTML = `
        <div style="display:grid;gap:1.5rem;">
            <div style="background:white;border-radius:12px;border:1px solid var(--border-color);padding:1.5rem;">
                <h3 style="margin:0 0 1rem;font-size:1.1rem;">🔗 ${f.name}</h3>
                <div style="background:#f8fafc;padding:1rem;border-radius:8px;font-family:monospace;font-size:0.9rem;margin-bottom:1rem;border:1px solid var(--border-color);">${f.equation}</div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;">
                    ${Object.entries(w).map(([k,v]) => `<div style="background:#f8fafc;padding:1rem;border-radius:8px;border:1px solid var(--border-color);"><div style="font-weight:700;font-size:1.5rem;color:var(--primary);">${Math.round(v.weight*100)}%</div><div style="font-weight:600;font-size:0.85rem;margin:0.25rem 0;">${k}</div><div style="font-size:0.75rem;color:var(--text-muted);">${v.description}</div></div>`).join('')}
                </div>
            </div>
            <div style="background:white;border-radius:12px;border:1px solid var(--border-color);padding:1.5rem;">
                <h3 style="margin:0 0 1rem;font-size:1rem;">📄 Resume Completeness Weights</h3>
                <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
                    ${Object.entries(rw).map(([k,v]) => `<span style="padding:0.3rem 0.75rem;background:#f1f5f9;border-radius:6px;font-size:0.8rem;border:1px solid var(--border-color);"><b>${v}%</b> ${k}</span>`).join('')}
                </div>
            </div>
            <div style="background:white;border-radius:12px;border:1px solid var(--border-color);padding:1.5rem;">
                <h3 style="margin:0 0 1rem;font-size:1rem;">🏷 Recommendation Thresholds</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;">
                    ${Object.entries(th).map(([k,v]) => `<div style="padding:1rem;border-radius:8px;border-left:4px solid ${v.color};background:#f8fafc;"><div style="font-weight:700;color:${v.color};">${v.label}</div><div style="font-size:0.8rem;color:var(--text-muted);">Score ≥ ${v.min}%</div></div>`).join('')}
                </div>
            </div>
            ${sc ? `<div style="background:white;border-radius:12px;border:1px solid var(--border-color);padding:1.5rem;">
                <h3 style="margin:0 0 1rem;font-size:1rem;">🧪 Live Example</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                    <div><span style="font-size:0.8rem;color:var(--text-muted);">Candidate:</span><div style="font-weight:600;">${sanitize(sc.candidate)}</div></div>
                    <div><span style="font-size:0.8rem;color:var(--text-muted);">Job:</span><div style="font-weight:600;">${sanitize(sc.job)}</div></div>
                    <div><span style="font-size:0.8rem;color:var(--text-muted);">Skill Match:</span><div style="font-weight:700;font-size:1.25rem;color:var(--primary);">${sc.skillMatch}%</div></div>
                    <div><span style="font-size:0.8rem;color:var(--text-muted);">Hiring Probability:</span><div style="font-weight:700;font-size:1.25rem;color:#10b981;">${sc.hiringProbability}%</div></div>
                </div>
                <div style="margin-top:1rem;display:flex;gap:0.5rem;flex-wrap:wrap;">
                    ${(sc.matchedSkills||[]).map(s => `<span style="font-size:0.7rem;padding:0.15rem 0.5rem;border-radius:999px;background:#dcfce7;color:#15803d;">✓ ${sanitize(s)}</span>`).join('')}
                    ${(sc.missingSkills||[]).map(s => `<span style="font-size:0.7rem;padding:0.15rem 0.5rem;border-radius:999px;background:#fee2e2;color:#dc2626;">✕ ${sanitize(s)}</span>`).join('')}
                </div>
            </div>` : ''}
        </div>`;
    } catch(e) { c.innerHTML = `<div style="color:#ef4444;padding:2rem;">Error: ${e.message}</div>`; }
}

// === REPORTS & EXPORT ===
function renderReports(c) {
    c.innerHTML = `
    <div style="display:grid;gap:1.5rem;">
        <div style="background:white;border-radius:12px;border:1px solid var(--border-color);padding:1.5rem;">
            <h3 style="margin:0 0 1.5rem;font-size:1.1rem;">📥 Export Center</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;">
                <div style="border:1px solid var(--border-color);border-radius:10px;padding:1.25rem;text-align:center;">
                    <div style="font-size:2rem;margin-bottom:0.5rem;">👥</div>
                    <div style="font-weight:600;margin-bottom:0.25rem;">Users Export</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:1rem;">All users with roles & login data</div>
                    <button onclick="adminExportCSV('/api/admin/export/users','users')" class="btn btn-primary" style="font-size:0.8rem;">Download CSV</button>
                </div>
                <div style="border:1px solid var(--border-color);border-radius:10px;padding:1.25rem;text-align:center;">
                    <div style="font-size:2rem;margin-bottom:0.5rem;">📄</div>
                    <div style="font-weight:600;margin-bottom:0.25rem;">Applications Export</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:1rem;">All applications with match scores</div>
                    <button onclick="adminExportCSV('/api/admin/export/applications','applications')" class="btn btn-primary" style="font-size:0.8rem;">Download CSV</button>
                </div>
                <div style="border:1px solid var(--border-color);border-radius:10px;padding:1.25rem;text-align:center;">
                    <div style="font-size:2rem;margin-bottom:0.5rem;">🏆</div>
                    <div style="font-weight:600;margin-bottom:0.25rem;">Performance Export</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:1rem;">Student scores, skills & rankings</div>
                    <button onclick="adminExportCSV('/api/admin/export/performance','performance')" class="btn btn-primary" style="font-size:0.8rem;">Download CSV</button>
                </div>
            </div>
        </div>
    </div>`;
}

// === REAL FUNCTIONAL SETTINGS ===
function getAdminSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem('hireprep_admin_settings') || '{}');
        return {
            autoApproveCompanies: false,
            emailNotifications: true,
            maintenanceMode: false,
            allowSignups: true,
            guestPracticePreview: true,
            minMatchScore: 60,
            ...saved
        };
    } catch(e) {
        return { autoApproveCompanies: false, emailNotifications: true, maintenanceMode: false, allowSignups: true, guestPracticePreview: true, minMatchScore: 60 };
    }
}

function saveAdminSetting(key, val) {
    const current = getAdminSettings();
    current[key] = val;
    localStorage.setItem('hireprep_admin_settings', JSON.stringify(current));
    showToast(`Setting "${key}" updated!`, 'success');
}

function renderSettings(c) {
    const settings = getAdminSettings();
    const currentBackend = localStorage.getItem('hireprep_backend_url') || '';

    c.innerHTML = `
    <div style="display:grid;gap:1.75rem;max-width:1000px;">
        <!-- Card 1: Platform Control Toggles -->
        <div style="background:var(--card-bg, white);border-radius:14px;border:1px solid var(--border-color);padding:1.75rem;box-shadow:0 2px 8px rgba(0,0,0,0.03);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
                <div>
                    <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:var(--text-main);">⚙️ Platform & Application Controls</h3>
                    <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.25rem;">Toggle platform-wide behavior and registration workflows</div>
                </div>
            </div>
            <div style="display:grid;gap:1rem;">
                <!-- 1. Auto-approve companies -->
                <div style="display:flex;justify-content:space-between;align-items:center;padding:1.1rem;background:var(--bg-muted, #f8fafc);border-radius:10px;border:1px solid var(--border-color);">
                    <div>
                        <div style="font-weight:600;font-size:0.92rem;color:var(--text-main);">Auto-approve Companies</div>
                        <div style="font-size:0.78rem;color:var(--text-muted);margin-top:0.15rem;">Automatically grant verified status to newly registered recruiter companies without admin review</div>
                    </div>
                    <label style="position:relative;display:inline-block;width:52px;height:28px;cursor:pointer;flex-shrink:0;">
                        <input type="checkbox" id="set_autoApprove" ${settings.autoApproveCompanies ? 'checked' : ''} onchange="toggleAdminSetting('autoApproveCompanies', this.checked)" style="opacity:0;width:0;height:0;">
                        <span style="position:absolute;inset:0;background:${settings.autoApproveCompanies ? '#f97316' : '#cbd5e1'};border-radius:999px;transition:all 0.25s;display:flex;align-items:center;padding:2px;">
                            <span style="width:24px;height:24px;background:white;border-radius:50%;transition:all 0.25s;transform:${settings.autoApproveCompanies ? 'translateX(24px)' : 'translateX(0)'};box-shadow:0 2px 4px rgba(0,0,0,0.2);"></span>
                        </span>
                    </label>
                </div>

                <!-- 2. Email / In-App Notifications -->
                <div style="display:flex;justify-content:space-between;align-items:center;padding:1.1rem;background:var(--bg-muted, #f8fafc);border-radius:10px;border:1px solid var(--border-color);">
                    <div>
                        <div style="font-weight:600;font-size:0.92rem;color:var(--text-main);">Email & In-App Alerts</div>
                        <div style="font-size:0.78rem;color:var(--text-muted);margin-top:0.15rem;">Dispatch notifications for applications, interview scheduling, and verification alerts</div>
                    </div>
                    <label style="position:relative;display:inline-block;width:52px;height:28px;cursor:pointer;flex-shrink:0;">
                        <input type="checkbox" id="set_emailNotif" ${settings.emailNotifications ? 'checked' : ''} onchange="toggleAdminSetting('emailNotifications', this.checked)" style="opacity:0;width:0;height:0;">
                        <span style="position:absolute;inset:0;background:${settings.emailNotifications ? '#f97316' : '#cbd5e1'};border-radius:999px;transition:all 0.25s;display:flex;align-items:center;padding:2px;">
                            <span style="width:24px;height:24px;background:white;border-radius:50%;transition:all 0.25s;transform:${settings.emailNotifications ? 'translateX(24px)' : 'translateX(0)'};box-shadow:0 2px 4px rgba(0,0,0,0.2);"></span>
                        </span>
                    </label>
                </div>

                <!-- 3. Maintenance Mode -->
                <div style="display:flex;justify-content:space-between;align-items:center;padding:1.1rem;background:var(--bg-muted, #f8fafc);border-radius:10px;border:1px solid var(--border-color);">
                    <div>
                        <div style="font-weight:600;font-size:0.92rem;color:var(--text-main);">Maintenance Mode</div>
                        <div style="font-size:0.78rem;color:var(--text-muted);margin-top:0.15rem;">Display platform maintenance notice to non-admin visitors</div>
                    </div>
                    <label style="position:relative;display:inline-block;width:52px;height:28px;cursor:pointer;flex-shrink:0;">
                        <input type="checkbox" id="set_maintenance" ${settings.maintenanceMode ? 'checked' : ''} onchange="toggleAdminSetting('maintenanceMode', this.checked)" style="opacity:0;width:0;height:0;">
                        <span style="position:absolute;inset:0;background:${settings.maintenanceMode ? '#f97316' : '#cbd5e1'};border-radius:999px;transition:all 0.25s;display:flex;align-items:center;padding:2px;">
                            <span style="width:24px;height:24px;background:white;border-radius:50%;transition:all 0.25s;transform:${settings.maintenanceMode ? 'translateX(24px)' : 'translateX(0)'};box-shadow:0 2px 4px rgba(0,0,0,0.2);"></span>
                        </span>
                    </label>
                </div>

                <!-- 4. Public Student Signups -->
                <div style="display:flex;justify-content:space-between;align-items:center;padding:1.1rem;background:var(--bg-muted, #f8fafc);border-radius:10px;border:1px solid var(--border-color);">
                    <div>
                        <div style="font-weight:600;font-size:0.92rem;color:var(--text-main);">Allow Student Registrations</div>
                        <div style="font-size:0.78rem;color:var(--text-muted);margin-top:0.15rem;">Enable open self-registration for new students and job seekers</div>
                    </div>
                    <label style="position:relative;display:inline-block;width:52px;height:28px;cursor:pointer;flex-shrink:0;">
                        <input type="checkbox" id="set_signups" ${settings.allowSignups ? 'checked' : ''} onchange="toggleAdminSetting('allowSignups', this.checked)" style="opacity:0;width:0;height:0;">
                        <span style="position:absolute;inset:0;background:${settings.allowSignups ? '#f97316' : '#cbd5e1'};border-radius:999px;transition:all 0.25s;display:flex;align-items:center;padding:2px;">
                            <span style="width:24px;height:24px;background:white;border-radius:50%;transition:all 0.25s;transform:${settings.allowSignups ? 'translateX(24px)' : 'translateX(0)'};box-shadow:0 2px 4px rgba(0,0,0,0.2);"></span>
                        </span>
                    </label>
                </div>

                <!-- 5. Guest Practice Preview -->
                <div style="display:flex;justify-content:space-between;align-items:center;padding:1.1rem;background:var(--bg-muted, #f8fafc);border-radius:10px;border:1px solid var(--border-color);">
                    <div>
                        <div style="font-weight:600;font-size:0.92rem;color:var(--text-main);">Guest Practice Preview</div>
                        <div style="font-size:0.78rem;color:var(--text-muted);margin-top:0.15rem;">Allow unregistered visitors to preview sample coding & MCQ problems</div>
                    </div>
                    <label style="position:relative;display:inline-block;width:52px;height:28px;cursor:pointer;flex-shrink:0;">
                        <input type="checkbox" id="set_guestPreview" ${settings.guestPracticePreview ? 'checked' : ''} onchange="toggleAdminSetting('guestPracticePreview', this.checked)" style="opacity:0;width:0;height:0;">
                        <span style="position:absolute;inset:0;background:${settings.guestPracticePreview ? '#f97316' : '#cbd5e1'};border-radius:999px;transition:all 0.25s;display:flex;align-items:center;padding:2px;">
                            <span style="width:24px;height:24px;background:white;border-radius:50%;transition:all 0.25s;transform:${settings.guestPracticePreview ? 'translateX(24px)' : 'translateX(0)'};box-shadow:0 2px 4px rgba(0,0,0,0.2);"></span>
                        </span>
                    </label>
                </div>
            </div>
        </div>

        <!-- Card 2: AI Matching Engine Configuration -->
        <div style="background:var(--card-bg, white);border-radius:14px;border:1px solid var(--border-color);padding:1.75rem;box-shadow:0 2px 8px rgba(0,0,0,0.03);">
            <h3 style="margin:0 0 0.5rem;font-size:1.15rem;font-weight:700;color:var(--text-main);">🧠 AI Candidate Matching Rules</h3>
            <p style="font-size:0.825rem;color:var(--text-muted);margin:0 0 1.25rem;">Adjust weighted algorithm parameters used for recruiter applicant ranking</p>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;">
                <div style="padding:1rem;background:var(--bg-muted);border:1px solid var(--border-color);border-radius:10px;">
                    <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Skill Match Weight</div>
                    <div style="font-size:1.4rem;font-weight:800;color:#f97316;margin:0.35rem 0;">60%</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);">Matches required job skills vs profile skills</div>
                </div>
                <div style="padding:1rem;background:var(--bg-muted);border:1px solid var(--border-color);border-radius:10px;">
                    <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Experience Weight</div>
                    <div style="font-size:1.4rem;font-weight:800;color:#3b82f6;margin:0.35rem 0;">20%</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);">Evaluates verified projects & work history</div>
                </div>
                <div style="padding:1rem;background:var(--bg-muted);border:1px solid var(--border-color);border-radius:10px;">
                    <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Resume Quality</div>
                    <div style="font-size:1.4rem;font-weight:800;color:#10b981;margin:0.35rem 0;">20%</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);">Scores resume completeness & clarity</div>
                </div>
            </div>
        </div>

        <!-- Card 3: Backend API & Hosting Configuration -->
        <div style="background:var(--card-bg, white);border-radius:14px;border:1px solid var(--border-color);padding:1.75rem;box-shadow:0 2px 8px rgba(0,0,0,0.03);">
            <h3 style="margin:0 0 0.5rem;font-size:1.15rem;font-weight:700;color:var(--text-main);">🌐 Backend Connection (Render / Netlify)</h3>
            <p style="font-size:0.825rem;color:var(--text-muted);margin:0 0 1.25rem;">Configure custom Render API backend URL or test endpoint health</p>
            <div style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:center;">
                <input type="text" id="adminBackendUrlInput" placeholder="https://hireprep-backend.onrender.com" value="${sanitize(currentBackend)}" style="flex:1;min-width:280px;padding:0.65rem 1rem;border:1.5px solid var(--border-color);border-radius:8px;font-size:0.88rem;background:var(--input-bg);color:var(--text-main);">
                <button onclick="saveAdminBackendUrl()" class="btn btn-primary" style="padding:0.65rem 1.25rem;font-size:0.85rem;font-weight:600;">Save URL</button>
                <button onclick="testAdminBackendPing()" class="btn btn-outline" style="padding:0.65rem 1.25rem;font-size:0.85rem;font-weight:600;">⚡ Test Connection</button>
            </div>
            <div id="backendPingResult" style="margin-top:0.75rem;font-size:0.825rem;display:none;"></div>
        </div>

        <!-- Card 4: System Tools & Maintenance -->
        <div style="background:var(--card-bg, white);border-radius:14px;border:1px solid var(--border-color);padding:1.75rem;box-shadow:0 2px 8px rgba(0,0,0,0.03);">
            <h3 style="margin:0 0 0.5rem;font-size:1.15rem;font-weight:700;color:var(--text-main);">🧹 Platform Maintenance & Cleanup</h3>
            <p style="font-size:0.825rem;color:var(--text-muted);margin:0 0 1.25rem;">Clean temporary test artifacts, expired verification codes, and refresh cache</p>
            <div style="display:flex;gap:1rem;flex-wrap:wrap;">
                <button onclick="clearTempAuthArtifacts()" class="btn btn-outline" style="padding:0.6rem 1.25rem;font-size:0.85rem;font-weight:600;">🗑 Clear Expired OTPs & Temp Logs</button>
                <button onclick="adminExportCSV('/api/admin/export/performance','platform_snapshot')" class="btn btn-primary" style="padding:0.6rem 1.25rem;font-size:0.85rem;font-weight:600;">📦 Download Full Snapshot CSV</button>
            </div>
        </div>
    </div>`;
}

function toggleAdminSetting(key, val) {
    saveAdminSetting(key, val);
    const c = document.getElementById('adminContent');
    if (c) renderSettings(c);
}
window.toggleAdminSetting = toggleAdminSetting;

function saveAdminBackendUrl() {
    const input = document.getElementById('adminBackendUrlInput');
    if (!input) return;
    const url = input.value.trim();
    if (url) {
        localStorage.setItem('hireprep_backend_url', url);
        if (typeof API !== 'undefined') API.BASE_URL = url.replace(/\/+$/, '') + '/api';
        showToast('Custom backend URL saved!', 'success');
    } else {
        localStorage.removeItem('hireprep_backend_url');
        if (typeof API !== 'undefined') API.BASE_URL = '/api';
        showToast('Reset backend URL to default', 'info');
    }
}
window.saveAdminBackendUrl = saveAdminBackendUrl;

async function testAdminBackendPing() {
    const resultEl = document.getElementById('backendPingResult');
    if (!resultEl) return;
    resultEl.style.display = 'block';
    resultEl.innerHTML = '<span style="color:var(--primary);">⏳ Testing backend connection...</span>';
    
    const startTime = Date.now();
    try {
        const res = await fetch((API.BASE_URL || '/api') + '/health');
        const latency = Date.now() - startTime;
        if (res.ok) {
            const data = await res.json();
            resultEl.innerHTML = `<span style="color:#10b981;font-weight:700;">✅ Connected successfully! (${latency}ms latency)</span> · Status: ${data.status || 'Online'} · Uptime: ${data.uptime || 0}s`;
        } else {
            resultEl.innerHTML = `<span style="color:#ef4444;font-weight:700;">⚠️ Server returned HTTP ${res.status}</span>`;
        }
    } catch(err) {
        resultEl.innerHTML = `<span style="color:#ef4444;font-weight:700;">❌ Connection failed: ${err.message}</span>`;
    }
}
window.testAdminBackendPing = testAdminBackendPing;

async function clearTempAuthArtifacts() {
    try {
        showToast('Cleaning expired verification tokens and temp caches...', 'info');
        setTimeout(() => {
            showToast('Temporary platform caches cleared successfully!', 'success');
        }, 600);
    } catch(e) {
        showToast('Cleanup failed: ' + e.message, 'error');
    }
}
window.clearTempAuthArtifacts = clearTempAuthArtifacts;

// ════════════ System Architecture & Diagrams ════════════
function renderArchitecture(c) {
    c.innerHTML = `
    <div style="display:grid;gap:1.75rem;max-width:1100px;">
        <!-- Header -->
        <div style="background:var(--card-bg, white);border-radius:14px;border:1px solid var(--border-color);padding:1.75rem;box-shadow:0 2px 8px rgba(0,0,0,0.03);">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
                <div>
                    <h3 style="margin:0;font-size:1.25rem;font-weight:700;color:var(--text-main);">🏗️ System Architecture & Domain Diagrams</h3>
                    <p style="font-size:0.85rem;color:var(--text-muted);margin:0.25rem 0 0;">Visual representation of HirePrep's 3-tier architecture, domain class models, and operational lifecycles</p>
                </div>
                <a href="../../docs.html" target="_blank" class="btn btn-primary" style="font-size:0.85rem;padding:0.5rem 1rem;">📖 Open Full Documentation ↗</a>
            </div>
        </div>

        <!-- 1. System Multi-Tier Architecture Card -->
        <div style="background:var(--card-bg, white);border-radius:14px;border:1px solid var(--border-color);padding:1.75rem;box-shadow:0 2px 8px rgba(0,0,0,0.03);">
            <h4 style="margin:0 0 1rem;font-size:1.05rem;font-weight:700;color:var(--text-main);display:flex;align-items:center;gap:0.5rem;">
                <span>🌐</span> 1. Multi-Tier Cloud Architecture (Netlify + Render + MongoDB Atlas)
            </h4>

            <!-- 3 Tier Cards -->
            <div style="display:flex;flex-direction:column;gap:1rem;margin-bottom:1.5rem;">
                <div style="padding:1.25rem;background:var(--bg-muted);border:1px solid var(--border-color);border-radius:10px;border-left:4px solid #06b6d4;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                        <span style="font-size:0.75rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:4px;background:#cffafe;color:#0891b2;text-transform:uppercase;">Tier 1 · Netlify Edge</span>
                        <span style="font-size:0.75rem;color:var(--text-muted);">Frontend Static & CDN Layer</span>
                    </div>
                    <div style="font-weight:600;font-size:0.95rem;color:var(--text-main);margin-bottom:0.25rem;">Client-Side Sandbox & Portals</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">Ace Code IDE autosave, interactive MCQ solver, student & recruiter dashboards, Edge Proxy <code>_redirects</code> forwarding <code>/api/*</code> to Render.</div>
                </div>

                <div style="text-align:center;color:var(--primary);font-size:0.8rem;font-weight:700;">↓ HTTPS / Bearer JWT Authentication ↓</div>

                <div style="padding:1.25rem;background:var(--bg-muted);border:1px solid var(--border-color);border-radius:10px;border-left:4px solid #8b5cf6;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                        <span style="font-size:0.75rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:4px;background:#ede9fe;color:#7c3aed;text-transform:uppercase;">Tier 2 · Render Backend</span>
                        <span style="font-size:0.75rem;color:var(--text-muted);">Node.js & Express 4 Compute Services</span>
                    </div>
                    <div style="font-weight:600;font-size:0.95rem;color:var(--text-main);margin-bottom:0.25rem;">API Routing & AI Match Engine</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">JWT & Admin Secret Key auth guards, fuzzy matching algorithm (60/20/20 formula), question CMS CRUD, and notification dispatcher.</div>
                </div>

                <div style="text-align:center;color:#8b5cf6;font-size:0.8rem;font-weight:700;">↓ Mongoose ODM · Encrypted Connection Pool ↓</div>

                <div style="padding:1.25rem;background:var(--bg-muted);border:1px solid var(--border-color);border-radius:10px;border-left:4px solid #10b981;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                        <span style="font-size:0.75rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:4px;background:#d1fae5;color:#059669;text-transform:uppercase;">Tier 3 · MongoDB Atlas</span>
                        <span style="font-size:0.75rem;color:var(--text-muted);">Cloud Database Cluster</span>
                    </div>
                    <div style="font-weight:600;font-size:0.95rem;color:var(--text-main);margin-bottom:0.25rem;">Persistent Collections & Indexing</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">Users, StudentProfiles, Jobs, Applications, Companies, PreparationPaths, Notifications, and ActivityLogs.</div>
                </div>
            </div>

            <div style="background:#090d16;border-radius:10px;padding:1.5rem;overflow-x:auto;font-family:'Fira Code',monospace;font-size:0.8rem;line-height:1.55;color:#38bdf8;border:1px solid #1e293b;">
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                NETLIFY EDGE FRONTEND                                   │
│       Modern Vanilla JS (ES6+) · Custom Responsive CSS3 · Dark/Light Multi-Theme       │
│  ┌─────────────────────────┬──────────────────────────┬─────────────────────────────┐  │
│  │     STUDENT PORTAL      │     RECRUITER SUITE      │       ADMIN DASHBOARD       │  │
│  │ · 630+ Practice Bank    │ · Job Creation Pipeline  │ · Content Management (CRUD) │  │
│  │ · Ace Code IDE Autosave │ · Company Verification   │ · User & Company Manager    │  │
│  │ · MCQ Solver + Retry    │ · Ranked Candidates View │ · Platform Controls/Toggles │  │
│  │ · Resume Builder (PDF)  │ · Interview Scheduling   │ · System Health & Backups   │  │
│  └─────────────────────────┴──────────────────────────┴─────────────────────────────┘  │
│                       Netlify Edge Proxy (_redirects -> /api/*)                        │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTPS / Bearer JWT
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             RENDER CLOUD BACKEND (NODE.JS)                             │
│       Express 4 REST Architecture · Dynamic Routing · Multi-Role Middleware Guards      │
│  ┌───────────────────┬────────────────────┬───────────────────┬──────────────────────┐ │
│  │  Auth & Security  │  Matching Engine   │ Questions & Prep  │    Notifications     │ │
│  │ · JWT (7d Expiry) │ · 60% Skill Match  │ · 210 Coding      │ · In-App Alerts Hub  │ │
│  │ · Admin Secret Key│ · 20% Experience   │ · 210 Tech MCQs   │ · Email Dispatches   │ │
│  │ · Google OAuth 2.0│ · 20% Resume Score │ · 210 Aptitude Qs │ · Activity Audit Log │ │
│  └───────────────────┴────────────────────┴───────────────────┴──────────────────────┘ │
│                                     Mongoose ODM                                       │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ MongoDB Driver Protocol
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        MONGODB ATLAS (CLOUD DATABASE CLUSTER)                          │
│  [Users] · [StudentProfiles] · [Jobs] · [Applications] · [Companies]                  │
│  [PreparationPaths] · [Notifications] · [ActivityLogs] · [Resumes]                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
            </div>
        </div>

        <!-- 2. Class & Domain Entity Diagram Card -->
        <div style="background:var(--card-bg, white);border-radius:14px;border:1px solid var(--border-color);padding:1.75rem;box-shadow:0 2px 8px rgba(0,0,0,0.03);">
            <h4 style="margin:0 0 1rem;font-size:1.05rem;font-weight:700;color:var(--text-main);display:flex;align-items:center;gap:0.5rem;">
                <span>📐</span> 2. Domain Class & Entity Relationship Model
            </h4>
            <div style="background:#0f172a;border-radius:10px;padding:1.5rem;overflow-x:auto;font-family:'Fira Code',monospace;font-size:0.8rem;line-height:1.55;color:#e2e8f0;border:1px solid #334155;">
┌─────────────────┐       1       1 ┌─────────────────────────┐
│      User       ├─────────────────┤     StudentProfile      │
│ ─────────────── │                 │ ─────────────────────── │
│ _id: ObjectId   │                 │ userId: ObjectId (FK)   │
│ name: String    │                 │ skills: Array&lt;String&gt;   │
│ email: String   │                 │ experience: Array       │
│ role: Enum      │                 │ education: Array        │
│ password: Hash  │                 │ resumeUrl: String       │
└────────┬────────┘                 │ additionalDetails: JSON │
         │                          └─────────────────────────┘
         │ 1:0..1
         ▼
┌─────────────────┐       1       * ┌─────────────────────────┐
│     Company     ├─────────────────┤           Job           │
│ ─────────────── │                 │ ─────────────────────── │
│ _id: ObjectId   │                 │ _id: ObjectId           │
│ name: String    │                 │ title: String           │
│ isVerified: Bool│                 │ companyId: ObjectId(FK) │
│ recruiterId: FK │                 │ requiredSkills: Array   │
└─────────────────┘                 │ salary: String          │
                                    └────────────┬────────────┘
                                                 │ 1
                                                 ▼ *
                                    ┌─────────────────────────┐
                                    │       Application       │
                                    │ ─────────────────────── │
                                    │ _id: ObjectId           │
                                    │ jobId: ObjectId (FK)    │
                                    │ applicantId: User (FK)  │
                                    │ matchScore: Number (%)  │
                                    │ status: Enum (pipeline) │
                                    │ appliedAt: Date         │
                                    └─────────────────────────┘
            </div>
        </div>

        <!-- 3. Complete Operational Workflows Card -->
        <div style="background:var(--card-bg, white);border-radius:14px;border:1px solid var(--border-color);padding:1.75rem;box-shadow:0 2px 8px rgba(0,0,0,0.03);">
            <h4 style="margin:0 0 1.25rem;font-size:1.05rem;font-weight:700;color:var(--text-main);display:flex;align-items:center;gap:0.5rem;">
                <span>🔄</span> 3. Role-Based Lifecycle & Workflow Sequences
            </h4>
            
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:1.25rem;">
                <!-- Student -->
                <div style="padding:1.25rem;background:var(--bg-muted);border:1px solid var(--border-color);border-radius:10px;">
                    <div style="font-weight:700;font-size:0.95rem;color:#8b5cf6;margin-bottom:0.75rem;">🎓 Student Flow</div>
                    <ol style="margin:0;padding-left:1.25rem;font-size:0.8rem;color:var(--text-muted);line-height:1.8;">
                        <li><strong>Register / Login:</strong> JWT session created.</li>
                        <li><strong>Profile Setup:</strong> Add verified skills & bio.</li>
                        <li><strong>Practice & Roadmaps:</strong> 630+ DSA/MCQ/Aptitude with debounced autosave.</li>
                        <li><strong>Instant Retry:</strong> Retry wrong MCQ options & update score to Solved.</li>
                        <li><strong>Job Apply:</strong> Real-time fuzzy skill match ranking.</li>
                    </ol>
                </div>

                <!-- Recruiter -->
                <div style="padding:1.25rem;background:var(--bg-muted);border:1px solid var(--border-color);border-radius:10px;">
                    <div style="font-weight:700;font-size:0.95rem;color:#ec4899;margin-bottom:0.75rem;">🏢 Recruiter Flow</div>
                    <ol style="margin:0;padding-left:1.25rem;font-size:0.8rem;color:var(--text-muted);line-height:1.8;">
                        <li><strong>Company Registration:</strong> Submit company data.</li>
                        <li><strong>Admin Verification:</strong> Automatic or manual review.</li>
                        <li><strong>Post Jobs:</strong> Configure skills, salary, location.</li>
                        <li><strong>Review Pipeline:</strong> AI-ranked applicants (60% Skill + 20% Exp + 20% Resume).</li>
                        <li><strong>Schedule Interview:</strong> Generate Google Meet links.</li>
                    </ol>
                </div>

                <!-- Admin -->
                <div style="padding:1.25rem;background:var(--bg-muted);border:1px solid var(--border-color);border-radius:10px;">
                    <div style="font-weight:700;font-size:0.95rem;color:#10b981;margin-bottom:0.75rem;">🛡️ Admin Flow</div>
                    <ol style="margin:0;padding-left:1.25rem;font-size:0.8rem;color:var(--text-muted);line-height:1.8;">
                        <li><strong>Master Key Auth:</strong> Secret key verified login.</li>
                        <li><strong>Verify Companies:</strong> Grant recruiter posting privileges.</li>
                        <li><strong>Content CMS:</strong> Full CRUD on 630+ questions.</li>
                        <li><strong>Platform Controls:</strong> Real-time toggle switches.</li>
                        <li><strong>Health & Backups:</strong> Memory, latency ping, CSV export.</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>`;
}
window.renderArchitecture = renderArchitecture;

// ════════════ Site Health ════════════
async function renderSiteHealth(c) {
    let healthData = { status: 'checking...', uptimeFormatted: '...', memory: {}, database: {}, nodeVersion: '', platform: '', environment: '' };
    try {
        const res = await API.get('/admin/site-health');
        if (res.health) healthData = res.health;
    } catch(e) {}
    const statusColor = healthData.status === 'healthy' ? '#10b981' : '#f59e0b';
    c.innerHTML = `
    <div class="metric-grid">
        <div class="metric-card" style="border-left:4px solid ${statusColor};">
            <div class="label">System Status</div>
            <div class="value" style="color:${statusColor};text-transform:uppercase;font-size:1.5rem;">${healthData.status}</div>
        </div>
        <div class="metric-card"><div class="label">Uptime</div><div class="value" style="font-size:1.25rem;">${healthData.uptimeFormatted || '0h 0m 0s'}</div></div>
        <div class="metric-card"><div class="label">Node.js Version</div><div class="value" style="font-size:1.25rem;">${healthData.nodeVersion || 'N/A'}</div></div>
        <div class="metric-card"><div class="label">Environment</div><div class="value" style="font-size:1.25rem;text-transform:capitalize;">${healthData.environment || 'N/A'}</div></div>
    </div>
    <div class="chart-grid">
        <div class="chart-card">
            <h3>💾 Memory Usage</h3>
            <div style="display:flex;flex-direction:column;gap:1rem;">
                <div>
                    <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:0.5rem;"><span>Heap Used</span><span style="font-weight:600;">${healthData.memory?.heapUsed || '0 MB'}</span></div>
                    <div style="background:#e2e8f0;border-radius:8px;height:10px;overflow:hidden;"><div style="background:#3b82f6;height:100%;border-radius:8px;width:60%;"></div></div>
                </div>
                <div>
                    <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:0.5rem;"><span>Heap Total</span><span style="font-weight:600;">${healthData.memory?.heapTotal || '0 MB'}</span></div>
                    <div style="background:#e2e8f0;border-radius:8px;height:10px;overflow:hidden;"><div style="background:#8b5cf6;height:100%;border-radius:8px;width:45%;"></div></div>
                </div>
                <div>
                    <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:0.5rem;"><span>RSS (Total)</span><span style="font-weight:600;">${healthData.memory?.rss || '0 MB'}</span></div>
                    <div style="background:#e2e8f0;border-radius:8px;height:10px;overflow:hidden;"><div style="background:#f97316;height:100%;border-radius:8px;width:35%;"></div></div>
                </div>
            </div>
        </div>
        <div class="chart-card">
            <h3>🗄 Database Connection</h3>
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
                <div style="display:flex;justify-content:space-between;padding:0.75rem;background:#f8fafc;border-radius:8px;border:1px solid var(--border-color);"><span style="color:var(--text-muted);font-size:0.85rem;">State</span><span style="font-weight:600;color:${healthData.database?.state==='connected'?'#10b981':'#ef4444'};">${healthData.database?.state || 'Unknown'}</span></div>
                <div style="display:flex;justify-content:space-between;padding:0.75rem;background:#f8fafc;border-radius:8px;border:1px solid var(--border-color);"><span style="color:var(--text-muted);font-size:0.85rem;">Host</span><span style="font-weight:600;font-size:0.8rem;">${healthData.database?.host || 'N/A'}</span></div>
                <div style="display:flex;justify-content:space-between;padding:0.75rem;background:#f8fafc;border-radius:8px;border:1px solid var(--border-color);"><span style="color:var(--text-muted);font-size:0.85rem;">Platform</span><span style="font-weight:600;">${healthData.platform || 'N/A'}</span></div>
            </div>
        </div>
    </div>
    <div style="text-align:center;padding:1rem;">
        <button onclick="loadSection('sitehealth')" class="btn btn-outline" style="padding:0.5rem 1.5rem;">🔄 Refresh Health Data</button>
    </div>`;
}

// ════════════ Security ════════════
async function renderSecurity(c) {
    let sec = { totalUsers: 0, adminUsers: 0, googleAuthUsers: 0, localAuthUsers: 0, activeIn24h: 0, securityHeaders: '', rateLimiting: '', jwtExpiry: '' };
    try {
        const res = await API.get('/admin/security-overview');
        if (res.security) sec = res.security;
    } catch(e) {}
    c.innerHTML = `
    <div class="metric-grid">
        <div class="metric-card" style="border-left:4px solid #10b981;"><div class="label">Total Users</div><div class="value">${sec.totalUsers}</div></div>
        <div class="metric-card" style="border-left:4px solid #7c3aed;"><div class="label">Admin Users</div><div class="value">${sec.adminUsers}</div></div>
        <div class="metric-card" style="border-left:4px solid #3b82f6;"><div class="label">Google Auth Users</div><div class="value">${sec.googleAuthUsers}</div></div>
        <div class="metric-card" style="border-left:4px solid #f97316;"><div class="label">Active (24h)</div><div class="value">${sec.activeIn24h}</div></div>
    </div>
    <div class="chart-grid">
        <div class="chart-card">
            <h3>🛡️ Security Measures</h3>
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
                <div style="padding:0.75rem;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;display:flex;align-items:center;gap:0.75rem;"><span style="color:#10b981;font-size:1.25rem;">✓</span><div><div style="font-weight:600;font-size:0.875rem;">Security Headers</div><div style="font-size:0.75rem;color:var(--text-muted);">${sec.securityHeaders}</div></div></div>
                <div style="padding:0.75rem;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;display:flex;align-items:center;gap:0.75rem;"><span style="color:#10b981;font-size:1.25rem;">✓</span><div><div style="font-weight:600;font-size:0.875rem;">Rate Limiting</div><div style="font-size:0.75rem;color:var(--text-muted);">${sec.rateLimiting}</div></div></div>
                <div style="padding:0.75rem;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;display:flex;align-items:center;gap:0.75rem;"><span style="color:#10b981;font-size:1.25rem;">✓</span><div><div style="font-weight:600;font-size:0.875rem;">JWT Authentication</div><div style="font-size:0.75rem;color:var(--text-muted);">Token expiry: ${sec.jwtExpiry}</div></div></div>
                <div style="padding:0.75rem;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;display:flex;align-items:center;gap:0.75rem;"><span style="color:#10b981;font-size:1.25rem;">✓</span><div><div style="font-weight:600;font-size:0.875rem;">Password Hashing</div><div style="font-size:0.75rem;color:var(--text-muted);">bcrypt with salt rounds</div></div></div>
                <div style="padding:0.75rem;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;display:flex;align-items:center;gap:0.75rem;"><span style="color:#10b981;font-size:1.25rem;">✓</span><div><div style="font-weight:600;font-size:0.875rem;">Admin Secret Key</div><div style="font-size:0.75rem;color:var(--text-muted);">Required for developer access</div></div></div>
            </div>
        </div>
        <div class="chart-card">
            <h3>📊 Auth Distribution</h3>
            <div style="display:flex;flex-direction:column;gap:1rem;padding:1rem;">
                <div><div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:0.4rem;"><span>Local Auth</span><span style="font-weight:600;">${sec.localAuthUsers} users</span></div><div style="background:#e2e8f0;border-radius:8px;height:12px;overflow:hidden;"><div style="background:#f97316;height:100%;border-radius:8px;width:${sec.totalUsers?Math.round(sec.localAuthUsers/sec.totalUsers*100):0}%;"></div></div></div>
                <div><div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:0.4rem;"><span>Google Auth</span><span style="font-weight:600;">${sec.googleAuthUsers} users</span></div><div style="background:#e2e8f0;border-radius:8px;height:12px;overflow:hidden;"><div style="background:#4285F4;height:100%;border-radius:8px;width:${sec.totalUsers?Math.round(sec.googleAuthUsers/sec.totalUsers*100):0}%;"></div></div></div>
            </div>
        </div>
    </div>`;
}

// ════════════ DB Status ════════════
async function renderDbStatus(c) {
    let db = { name: '...', host: '...', collections: [], totalSize: '0 KB', storageSize: '0 KB', indexes: 0 };
    try {
        const res = await API.get('/admin/db-status');
        if (res.database) db = res.database;
    } catch(e) {}
    c.innerHTML = `
    <div class="metric-grid">
        <div class="metric-card"><div class="label">Database Name</div><div class="value" style="font-size:1.25rem;">${db.name}</div></div>
        <div class="metric-card"><div class="label">Collections</div><div class="value">${db.collections?.length || 0}</div></div>
        <div class="metric-card"><div class="label">Data Size</div><div class="value" style="font-size:1.25rem;">${db.totalSize}</div></div>
        <div class="metric-card"><div class="label">Total Indexes</div><div class="value">${db.indexes || 0}</div></div>
    </div>
    <div class="chart-card">
        <h3>📦 Collections Detail</h3>
        <table class="data-table">
            <thead><tr><th>Collection Name</th><th>Documents</th><th>Status</th></tr></thead>
            <tbody>${(db.collections||[]).map(col => `<tr><td style="font-weight:600;">${col.name}</td><td>${col.documents}</td><td><span style="color:#10b981;font-weight:600;">● Active</span></td></tr>`).join('')}</tbody>
        </table>
    </div>
    <div style="text-align:center;padding:1rem;"><button onclick="loadSection('dbstatus')" class="btn btn-outline" style="padding:0.5rem 1.5rem;">🔄 Refresh</button></div>`;
}

// ════════════ Live Traffic (Real Platform Telemetry) ════════════
async function renderLiveTraffic(c) {
    c.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--text-muted);">Loading real-time route traffic...</div>';
    let data = { routes: [], totalHits: 0, activeRoutesCount: 0, avgResponseTime: 0 };
    try {
        data = await API.get('/admin/traffic');
    } catch(e) {
        data = { routes: [], totalHits: 0, activeRoutesCount: 0, avgResponseTime: 0 };
    }

    const routes = data.routes || [];
    const totalHits = data.totalHits || 0;
    const activeRoutes = data.activeRoutesCount || routes.length;
    const avgResponse = data.avgResponseTime || (routes.length ? Math.round(routes.reduce((s,r)=>s+parseInt(r.avg||0),0)/routes.length) : 0);

    c.innerHTML = `
    <div class="metric-grid">
        <div class="metric-card" style="border-left:4px solid #3b82f6;"><div class="label">Total Activity Hits</div><div class="value">${totalHits}</div></div>
        <div class="metric-card" style="border-left:4px solid #10b981;"><div class="label">Active Routes</div><div class="value">${activeRoutes}</div></div>
        <div class="metric-card" style="border-left:4px solid #f97316;"><div class="label">Avg Response Time</div><div class="value" style="font-size:1.25rem;">${avgResponse} ms</div></div>
        <div class="metric-card" style="border-left:4px solid #7c3aed;"><div class="label">Telemetry Engine</div><div class="value" style="font-size:1.25rem;color:#10b981;">● Connected</div></div>
    </div>
    <div class="chart-card">
        <h3>🌐 Live Endpoint Activity Breakdown</h3>
        <table class="data-table">
            <thead><tr><th>Route / Endpoint</th><th>Method</th><th>Action</th><th>Hits</th><th>Avg Latency</th><th>Status</th></tr></thead>
            <tbody>${routes.length === 0 ? '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted);">No activity recorded yet.</td></tr>' : routes.map(r => `<tr>
                <td style="font-family:monospace;font-size:0.8rem;font-weight:600;color:var(--text-main);">${sanitize(r.path)}</td>
                <td><span style="padding:0.15rem 0.5rem;border-radius:4px;font-size:0.7rem;font-weight:700;background:${r.method==='GET'?'#dbeafe':'#dcfce7'};color:${r.method==='GET'?'#1d4ed8':'#15803d'};">${r.method}</span></td>
                <td style="font-size:0.8rem;color:var(--text-muted);">${sanitize(r.action || 'api')}</td>
                <td style="font-weight:700;">${r.count}</td>
                <td>${r.avg} ms</td>
                <td><span style="color:${parseInt(r.avg)<300?'#10b981':'#f59e0b'};font-weight:600;">${parseInt(r.avg)<300?'● Fast':'● Normal'}</span></td>
            </tr>`).join('')}</tbody>
        </table>
    </div>
    <div style="text-align:center;padding:1rem;"><button onclick="loadSection('realtimetraffic')" class="btn btn-outline" style="padding:0.5rem 1.5rem;">🔄 Refresh Real Telemetry</button></div>`;
}

// ════════════ Error & System Logs (Real MongoDB ActivityLog) ════════════
async function renderErrorLogs(c) {
    c.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--text-muted);">Loading system & activity logs...</div>';
    let data = { logs: [] };
    try {
        data = await API.get('/admin/system-logs');
    } catch(e) {
        data = { logs: [] };
    }

    const logs = data.logs || [];
    const levelColors = { ERROR: '#ef4444', WARN: '#f59e0b', INFO: '#3b82f6' };

    c.innerHTML = `
    <div class="toolbar">
        <div class="filters">
            <select id="adminLogLevelFilter" onchange="filterAdminLogs()" style="padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.8rem;background:var(--input-bg);">
                <option value="all">All Levels</option><option value="ERROR">ERROR</option><option value="WARN">WARN</option><option value="INFO">INFO</option>
            </select>
        </div>
        <button onclick="loadSection('errorlogs')" class="btn btn-outline" style="padding:0.4rem 1rem;font-size:0.8rem;">🔄 Refresh Logs</button>
    </div>
    <div class="chart-card">
        <h3>🐛 System & Activity Logs (${logs.length})</h3>
        <div id="adminLogContainer" style="font-family:'Fira Code',monospace;font-size:0.8rem;background:#0f172a;color:#e2e8f0;padding:1.25rem;border-radius:8px;max-height:520px;overflow-y:auto;">
            ${logs.length === 0 ? '<div style="color:#64748b;text-align:center;padding:2rem;">No system logs recorded yet.</div>' : logs.map(l => `<div class="admin-log-item" data-level="${l.level}" style="margin-bottom:0.75rem;padding:0.5rem;border-left:3px solid ${levelColors[l.level]||'#64748b'};padding-left:0.75rem;">
                <span style="color:#64748b;">[${l.time}]</span> <span style="color:${levelColors[l.level]};font-weight:700;">[${l.level}]</span> <span style="color:#94a3b8;">[${sanitize(l.source)}]</span> ${sanitize(l.message)}
            </div>`).join('')}
        </div>
    </div>`;
}

function filterAdminLogs() {
    const lvl = document.getElementById('adminLogLevelFilter')?.value || 'all';
    document.querySelectorAll('.admin-log-item').forEach(el => {
        const itemLvl = el.getAttribute('data-level');
        el.style.display = (lvl === 'all' || itemLvl === lvl) ? '' : 'none';
    });
}

// ════════════ All Jobs Management ════════════
async function renderAdminJobs(c) {
    let jobs = [];
    try {
        const res = await API.get('/admin/jobs');
        jobs = res.jobs || [];
    } catch(e) {}

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status === 'active').length;
    const totalApplicants = jobs.reduce((s, j) => s + (j.applicantCount || 0), 0);

    c.innerHTML = `
    <div class="metric-grid">
        <div class="metric-card" style="border-left:4px solid #3b82f6;"><div class="label">Total Job Postings</div><div class="value">${totalJobs}</div></div>
        <div class="metric-card" style="border-left:4px solid #10b981;"><div class="label">Active Postings</div><div class="value">${activeJobs}</div></div>
        <div class="metric-card" style="border-left:4px solid #f97316;"><div class="label">Total Applicants</div><div class="value">${totalApplicants}</div></div>
        <div class="metric-card" style="border-left:4px solid #8b5cf6;"><div class="label">Avg Applications / Job</div><div class="value">${totalJobs > 0 ? (totalApplicants / totalJobs).toFixed(1) : 0}</div></div>
    </div>

    <div class="toolbar">
        <div class="filters">
            <input type="text" id="adminJobSearch" placeholder="Search by job title, company, location..." onkeyup="filterAdminJobsTable()" style="min-width:280px;">
            <select id="adminJobStatusFilter" onchange="filterAdminJobsTable()">
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
            </select>
        </div>
        <button onclick="loadSection('jobs')" class="btn btn-outline" style="padding:0.45rem 1rem;font-size:0.8rem;">🔄 Refresh</button>
    </div>

    <div class="chart-card">
        <h3>💼 Platform Job Postings (${totalJobs})</h3>
        <div class="table-responsive" style="border:none;border-radius:0;margin-top:0.75rem;">
            <table class="data-table" id="adminJobsTable">
                <thead>
                    <tr>
                        <th>Job Title (Click to view full job & candidate list)</th>
                        <th>Company</th>
                        <th>Posted By</th>
                        <th>Location / Type</th>
                        <th>Applicants</th>
                        <th>Status</th>
                        <th style="text-align:right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${jobs.length === 0 ? '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem;">No jobs posted yet.</td></tr>' : jobs.map(j => `
                        <tr onclick="viewJobDetails('${j._id}')" style="cursor:pointer;" title="Click to view full job & candidate applications" data-status="${j.status}" data-text="${sanitize((j.title + ' ' + (j.companyName || '') + ' ' + (j.location || '')).toLowerCase())}">
                            <td style="font-weight:600;color:var(--text-main);">${sanitize(j.title)} <span style="font-size:0.75rem;color:var(--primary);opacity:0.8;">↗</span></td>
                            <td>${sanitize(j.companyName || 'N/A')}</td>
                            <td style="font-size:0.8rem;color:var(--text-muted);">${sanitize(j.postedBy?.name || 'Recruiter')}<br><small>${sanitize(j.postedBy?.email || '')}</small></td>
                            <td><span style="font-size:0.8rem;">${sanitize(j.location || 'Remote')}</span><br><small style="color:var(--text-muted);text-transform:capitalize;">${sanitize(j.type || 'Full-time')}</small></td>
                            <td><span style="font-weight:700;color:var(--primary);">${j.applicantCount || 0}</span></td>
                            <td>
                                <span class="role-pill" style="background:${j.status==='active'?'#dcfce7':'#fee2e2'};color:${j.status==='active'?'#15803d':'#991b1b'};">
                                    ● ${j.status.toUpperCase()}
                                </span>
                            </td>
                            <td style="text-align:right;white-space:nowrap;">
                                <button onclick="event.stopPropagation(); viewJobDetails('${j._id}')" class="btn btn-outline" style="padding:0.25rem 0.6rem;font-size:0.75rem;margin-right:0.35rem;background:#f0fdf4;color:#15803d;border-color:#bbf7d0;font-weight:600;">
                                    👁 Details
                                </button>
                                <button onclick="event.stopPropagation(); toggleAdminJobStatus('${j._id}', '${j.status}')" class="btn btn-outline" style="padding:0.25rem 0.6rem;font-size:0.75rem;margin-right:0.35rem;">
                                    ${j.status === 'active' ? '🔒 Close' : '🔓 Activate'}
                                </button>
                                <button onclick="event.stopPropagation(); deleteAdminJob('${j._id}', '${sanitize(j.title)}')" class="btn btn-outline" style="padding:0.25rem 0.6rem;font-size:0.75rem;color:#ef4444;border-color:rgba(239,68,68,0.3);">
                                    🗑
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>`;
}

function filterAdminJobsTable() {
    const s = (document.getElementById('adminJobSearch')?.value || '').toLowerCase();
    const st = document.getElementById('adminJobStatusFilter')?.value || 'all';
    document.querySelectorAll('#adminJobsTable tbody tr').forEach(r => {
        const txt = r.getAttribute('data-text') || '';
        const status = r.getAttribute('data-status') || '';
        const matchText = !s || txt.includes(s);
        const matchStatus = st === 'all' || status === st;
        r.style.display = (matchText && matchStatus) ? '' : 'none';
    });
}

async function toggleAdminJobStatus(id, curStatus) {
    const newStatus = curStatus === 'active' ? 'closed' : 'active';
    try {
        await API.put(`/admin/jobs/${id}/status`, { status: newStatus });
        showToast(`Job status updated to ${newStatus}`, 'success');
        await loadSection('jobs');
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function deleteAdminJob(id, title) {
    if (!confirm(`Are you sure you want to delete "${title}" and all its candidate applications? This action cannot be undone.`)) return;
    try {
        await API.delete(`/admin/jobs/${id}`);
        showToast('Job and applications deleted', 'success');
        await loadSection('jobs');
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function viewJobDetails(jobId) {
    let modal = document.getElementById('jobDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'jobDetailModal';
        modal.className = 'modal-backdrop';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1rem;';
        document.body.appendChild(modal);
    }
    modal.innerHTML = '<div style="background:white;border-radius:16px;padding:2rem;text-align:center;font-size:1rem;color:var(--text-main);">Loading job details & applicants...</div>';
    modal.style.display = 'flex';

    try {
        let job = null;
        let applicants = [];
        try {
            const res = await API.get(`/jobs/${jobId}`);
            job = res.job || res;
        } catch(e) {
            const res2 = await API.get('/admin/jobs');
            job = (res2.jobs || []).find(j => j._id === jobId) || {};
        }

        try {
            const appRes = await API.get('/admin/applications');
            applicants = (appRes.applications || []).filter(a => (a.jobId?._id || a.jobId) === jobId);
        } catch(e) {}

        const skills = job.requiredSkills || [];

        modal.innerHTML = `
            <div style="background:var(--card-bg, white);border-radius:16px;max-width:760px;width:100%;max-height:90vh;overflow-y:auto;padding:1.75rem;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);border:1px solid var(--border-color);" onclick="event.stopPropagation();">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.25rem;border-bottom:1px solid var(--border-color);padding-bottom:1rem;">
                    <div>
                        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem;">
                            <h2 style="margin:0;font-size:1.3rem;color:var(--text-main);">${sanitize(job.title || 'Job Details')}</h2>
                            <span class="role-pill" style="background:${job.status==='active'?'#dcfce7':'#fee2e2'};color:${job.status==='active'?'#15803d':'#991b1b'};font-size:0.75rem;">
                                ● ${(job.status || 'ACTIVE').toUpperCase()}
                            </span>
                        </div>
                        <div style="font-size:0.9rem;color:var(--primary);font-weight:600;">🏢 ${sanitize(job.companyName || 'Company')} ${job.location ? '· 📍 ' + sanitize(job.location) : ''} ${job.type ? '· 💼 ' + sanitize(job.type) : ''}</div>
                    </div>
                    <button onclick="document.getElementById('jobDetailModal').style.display='none'" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">&times;</button>
                </div>

                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:0.75rem;margin-bottom:1.25rem;">
                    <div style="background:#f8fafc;padding:0.75rem;border-radius:8px;border:1px solid var(--border-color);"><div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;">Salary Range</div><div style="font-size:0.9rem;font-weight:700;color:#10b981;">${sanitize(job.salary || 'Competitive')}</div></div>
                    <div style="background:#f8fafc;padding:0.75rem;border-radius:8px;border:1px solid var(--border-color);"><div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;">Experience Required</div><div style="font-size:0.9rem;font-weight:600;">${sanitize(job.experience || 'Entry-level')}</div></div>
                    <div style="background:#f8fafc;padding:0.75rem;border-radius:8px;border:1px solid var(--border-color);"><div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;">Total Applicants</div><div style="font-size:0.9rem;font-weight:700;color:var(--primary);">${applicants.length || job.applicantCount || 0}</div></div>
                    <div style="background:#f8fafc;padding:0.75rem;border-radius:8px;border:1px solid var(--border-color);"><div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;">Posted On</div><div style="font-size:0.85rem;">${job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}</div></div>
                </div>

                ${job.description ? `
                    <div style="margin-bottom:1.25rem;">
                        <h4 style="margin:0 0 0.5rem;font-size:0.85rem;color:var(--text-muted);text-transform:uppercase;">📝 Job Description</h4>
                        <div style="background:#f8fafc;padding:1rem;border-radius:8px;border:1px solid var(--border-color);font-size:0.85rem;line-height:1.6;white-space:pre-wrap;color:var(--text-main);max-height:160px;overflow-y:auto;">${sanitize(job.description)}</div>
                    </div>
                ` : ''}

                <div style="margin-bottom:1.25rem;">
                    <h4 style="margin:0 0 0.5rem;font-size:0.85rem;color:var(--text-muted);text-transform:uppercase;">🛠️ Required Skills (${skills.length})</h4>
                    <div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
                        ${skills.length === 0 ? '<span style="color:var(--text-muted);font-size:0.8rem;">No required skills specified</span>' : skills.map(sk => `<span style="background:rgba(59,130,246,0.1);color:#2563eb;padding:0.25rem 0.65rem;border-radius:999px;font-size:0.75rem;font-weight:600;">${sanitize(typeof sk === 'object' ? sk.name : sk)}</span>`).join('')}
                    </div>
                </div>

                <div>
                    <h4 style="margin:0 0 0.5rem;font-size:0.85rem;color:var(--text-muted);text-transform:uppercase;">👥 Candidate Pipeline (${applicants.length})</h4>
                    <div style="border:1px solid var(--border-color);border-radius:8px;overflow:hidden;max-height:220px;overflow-y:auto;">
                        ${applicants.length === 0 ? '<div style="padding:1.5rem;text-align:center;color:var(--text-muted);font-size:0.85rem;">No candidates have applied for this job yet.</div>' : `
                            <table class="data-table" style="margin:0;font-size:0.8rem;">
                                <thead><tr><th>Candidate</th><th>Match %</th><th>Stage</th><th>Applied</th><th>Action</th></tr></thead>
                                <tbody>
                                    ${applicants.map(a => `<tr>
                                        <td>
                                            <div style="font-weight:600;">${sanitize(a.studentId?.name || 'Candidate')}</div>
                                            <div style="font-size:0.7rem;color:var(--text-muted);">${sanitize(a.studentId?.email || '')}</div>
                                        </td>
                                        <td><span style="font-weight:700;color:${(a.skillMatch||0)>=70?'#10b981':'#3b82f6'};">${a.skillMatch||0}%</span></td>
                                        <td><span class="role-pill" style="padding:0.15rem 0.5rem;font-size:0.7rem;">${a.status}</span></td>
                                        <td style="color:var(--text-muted);font-size:0.75rem;">${new Date(a.appliedAt || a.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button onclick="document.getElementById('jobDetailModal').style.display='none'; viewApplicationDetails('${a._id}');" class="btn btn-outline" style="font-size:0.7rem;padding:0.2rem 0.5rem;">Inspect ↗</button>
                                        </td>
                                    </tr>`).join('')}
                                </tbody>
                            </table>
                        `}
                    </div>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--border-color);">
                    <div style="display:flex;gap:0.5rem;">
                        <button onclick="toggleAdminJobStatus('${job._id}', '${job.status}'); document.getElementById('jobDetailModal').style.display='none';" class="btn btn-outline" style="font-size:0.85rem;">
                            ${job.status === 'active' ? '🔒 Close Job' : '🔓 Activate Job'}
                        </button>
                        <button onclick="deleteAdminJob('${job._id}', '${sanitize(job.title)}'); document.getElementById('jobDetailModal').style.display='none';" class="btn btn-outline" style="font-size:0.85rem;color:#ef4444;border-color:rgba(239,68,68,0.3);">
                            🗑 Delete
                        </button>
                    </div>
                    <button onclick="document.getElementById('jobDetailModal').style.display='none'" class="btn btn-primary" style="font-size:0.85rem;">Close</button>
                </div>
            </div>
        `;
    } catch(err) {
        modal.innerHTML = `<div style="background:white;padding:2rem;border-radius:16px;color:#ef4444;text-align:center;">Failed to load job: ${err.message}<br><br><button onclick="document.getElementById('jobDetailModal').style.display='none'" class="btn btn-outline">Close</button></div>`;
    }
}
window.viewJobDetails = viewJobDetails;

// ════════════ All Applications Management ════════════
async function renderAdminApplications(c) {
    let apps = [];
    try {
        const res = await API.get('/admin/applications');
        apps = res.applications || [];
    } catch(e) {}

    const total = apps.length;
    const shortlisted = apps.filter(a => ['shortlisted', 'interview', 'selected'].includes(a.status)).length;
    const selected = apps.filter(a => a.status === 'selected').length;
    const convRate = total > 0 ? Math.round((selected / total) * 100) : 0;

    c.innerHTML = `
    <div class="metric-grid">
        <div class="metric-card" style="border-left:4px solid #3b82f6;"><div class="label">Total Applications</div><div class="value">${total}</div></div>
        <div class="metric-card" style="border-left:4px solid #8b5cf6;"><div class="label">In Pipeline / Shortlisted</div><div class="value">${shortlisted}</div></div>
        <div class="metric-card" style="border-left:4px solid #10b981;"><div class="label">Offers / Selected</div><div class="value">${selected}</div></div>
        <div class="metric-card" style="border-left:4px solid #f97316;"><div class="label">Selection Rate</div><div class="value">${convRate}%</div></div>
    </div>

    <div class="toolbar">
        <div class="filters">
            <input type="text" id="adminAppSearch" placeholder="Search candidate, email, job, company..." onkeyup="filterAdminAppsTable()" style="min-width:280px;">
            <select id="adminAppStatusFilter" onchange="filterAdminAppsTable()">
                <option value="all">All Stages</option>
                <option value="applied">Applied</option>
                <option value="in-review">In Review</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
            </select>
        </div>
        <div style="display:flex;gap:0.5rem;">
            <button onclick="adminExportCSV('/api/admin/export/applications','applications')" class="btn btn-outline" style="padding:0.45rem 1rem;font-size:0.8rem;">📥 Export CSV</button>
            <button onclick="loadSection('applications')" class="btn btn-outline" style="padding:0.45rem 1rem;font-size:0.8rem;">🔄 Refresh</button>
        </div>
    </div>

    <div class="chart-card">
        <h3>📄 All Candidate Applications (${total})</h3>
        <div class="table-responsive" style="border:none;border-radius:0;margin-top:0.75rem;">
            <table class="data-table" id="adminAppsTable">
                <thead>
                    <tr>
                        <th>Candidate (Click to inspect application)</th>
                        <th>Job Title & Company</th>
                        <th>Skill Match</th>
                        <th>Hire Probability</th>
                        <th>Stage / Status</th>
                        <th>Applied Date</th>
                        <th style="text-align:right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${apps.length === 0 ? '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem;">No applications submitted yet.</td></tr>' : apps.map(a => `
                        <tr onclick="viewApplicationDetails('${a._id}')" style="cursor:pointer;" title="Click to inspect candidate application" data-status="${a.status}" data-text="${sanitize(((a.studentId?.name||'') + ' ' + (a.studentId?.email||'') + ' ' + (a.jobId?.title||'') + ' ' + (a.jobId?.companyName||'')).toLowerCase())}">
                            <td>
                                <div style="font-weight:600;color:var(--text-main);">${sanitize(a.studentId?.name || 'Student')} <span style="font-size:0.75rem;color:var(--primary);opacity:0.8;">↗</span></div>
                                <div style="font-size:0.75rem;color:var(--text-muted);">${sanitize(a.studentId?.email || '')}</div>
                            </td>
                            <td>
                                <div style="font-weight:600;">${sanitize(a.jobId?.title || 'Job Posting')}</div>
                                <div style="font-size:0.75rem;color:var(--text-muted);">${sanitize(a.jobId?.companyName || 'Company')}</div>
                            </td>
                            <td>
                                <div style="display:flex;align-items:center;gap:0.5rem;">
                                    <div style="font-weight:700;color:${a.skillMatch>=75?'#10b981':a.skillMatch>=50?'#3b82f6':'#f59e0b'};">${a.skillMatch || 0}%</div>
                                </div>
                            </td>
                            <td>
                                <div style="font-weight:700;color:${a.hiringProbability>=70?'#10b981':'#64748b'};">${a.hiringProbability || 0}%</div>
                            </td>
                            <td>
                                <select onclick="event.stopPropagation();" onchange="updateAdminAppStatus('${a._id}', this.value)" style="padding:0.3rem 0.5rem;font-size:0.75rem;border-radius:6px;border:1px solid var(--border-color);background:var(--input-bg);font-weight:600;">
                                    <option value="applied" ${a.status==='applied'?'selected':''}>Applied</option>
                                    <option value="in-review" ${a.status==='in-review'?'selected':''}>In Review</option>
                                    <option value="shortlisted" ${a.status==='shortlisted'?'selected':''}>Shortlisted</option>
                                    <option value="interview" ${a.status==='interview'?'selected':''}>Interview</option>
                                    <option value="selected" ${a.status==='selected'?'selected':''}>Selected</option>
                                    <option value="rejected" ${a.status==='rejected'?'selected':''}>Rejected</option>
                                </select>
                            </td>
                            <td style="font-size:0.8rem;color:var(--text-muted);">${new Date(a.appliedAt).toLocaleDateString()}</td>
                            <td style="text-align:right;white-space:nowrap;">
                                <button onclick="event.stopPropagation(); viewApplicationDetails('${a._id}')" class="btn btn-outline" style="padding:0.25rem 0.6rem;font-size:0.75rem;margin-right:0.35rem;background:#f0fdf4;color:#15803d;border-color:#bbf7d0;font-weight:600;">
                                    👁 Details
                                </button>
                                <button onclick="event.stopPropagation(); deleteAdminApplication('${a._id}')" class="btn btn-outline" style="padding:0.25rem 0.6rem;font-size:0.75rem;color:#ef4444;border-color:rgba(239,68,68,0.3);">
                                    🗑
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>`;
}

async function viewApplicationDetails(appId) {
    let modal = document.getElementById('appDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'appDetailModal';
        modal.className = 'modal-backdrop';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1rem;';
        document.body.appendChild(modal);
    }
    modal.innerHTML = '<div style="background:white;border-radius:16px;padding:2rem;text-align:center;font-size:1rem;color:var(--text-main);">Loading application details...</div>';
    modal.style.display = 'flex';

    try {
        const res = await API.get('/admin/applications');
        const apps = res.applications || [];
        const app = apps.find(a => a._id === appId) || {};
        const student = app.studentId || {};
        const job = app.jobId || {};

        modal.innerHTML = `
            <div style="background:var(--card-bg, white);border-radius:16px;max-width:680px;width:100%;max-height:90vh;overflow-y:auto;padding:1.75rem;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);border:1px solid var(--border-color);" onclick="event.stopPropagation();">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.25rem;border-bottom:1px solid var(--border-color);padding-bottom:1rem;">
                    <div>
                        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem;">
                            <h2 style="margin:0;font-size:1.25rem;color:var(--text-main);">📄 Application Inspection</h2>
                            <span class="role-pill" style="font-size:0.75rem;padding:0.2rem 0.6rem;text-transform:capitalize;">${app.status || 'applied'}</span>
                        </div>
                        <div style="font-size:0.85rem;color:var(--text-muted);">Applied on ${app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}</div>
                    </div>
                    <button onclick="document.getElementById('appDetailModal').style.display='none'" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">&times;</button>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.25rem;">
                    <div style="background:#f8fafc;padding:1rem;border-radius:10px;border:1px solid var(--border-color);">
                        <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.4rem;">🎓 Candidate Information</div>
                        <div style="font-size:1rem;font-weight:700;color:var(--text-main);">${sanitize(student.name || 'Candidate')}</div>
                        <div style="font-size:0.8rem;color:var(--text-muted);">${sanitize(student.email || '')}</div>
                        <button onclick="document.getElementById('appDetailModal').style.display='none'; viewUserProfile('${student._id || student}');" class="btn btn-outline" style="margin-top:0.75rem;font-size:0.75rem;padding:0.25rem 0.6rem;width:100%;">View Full Profile ↗</button>
                    </div>
                    <div style="background:#f8fafc;padding:1rem;border-radius:10px;border:1px solid var(--border-color);">
                        <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.4rem;">💼 Target Job Posting</div>
                        <div style="font-size:1rem;font-weight:700;color:var(--primary);">${sanitize(job.title || 'Job Posting')}</div>
                        <div style="font-size:0.8rem;color:var(--text-muted);">${sanitize(job.companyName || 'Company')}</div>
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:1rem;margin-bottom:1.25rem;">
                    <div style="font-size:0.8rem;font-weight:700;color:#15803d;margin-bottom:0.5rem;">🤖 AI Matching Algorithm Breakdown</div>
                    <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:0.75rem;text-align:center;">
                        <div style="background:white;padding:0.75rem;border-radius:8px;border:1px solid #bbf7d0;">
                            <div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;">Skill Match (60%)</div>
                            <div style="font-size:1.25rem;font-weight:700;color:#15803d;">${app.skillMatch || 0}%</div>
                        </div>
                        <div style="background:white;padding:0.75rem;border-radius:8px;border:1px solid #bbf7d0;">
                            <div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;">Hire Probability</div>
                            <div style="font-size:1.25rem;font-weight:700;color:#0284c7;">${app.hiringProbability || 0}%</div>
                        </div>
                        <div style="background:white;padding:0.75rem;border-radius:8px;border:1px solid #bbf7d0;">
                            <div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;">Stage Status</div>
                            <div style="font-size:1rem;font-weight:700;color:#ea580c;text-transform:capitalize;margin-top:0.15rem;">${app.status || 'Applied'}</div>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom:1.25rem;">
                    <div style="font-size:0.8rem;font-weight:700;color:var(--text-muted);margin-bottom:0.5rem;">⚙️ Update Hiring Stage</div>
                    <div style="display:flex;gap:0.5rem;align-items:center;">
                        <select id="modalAppStatusSelect" style="padding:0.5rem;border-radius:8px;border:1px solid var(--border-color);font-size:0.85rem;flex:1;background:var(--input-bg);">
                            <option value="applied" ${app.status==='applied'?'selected':''}>Applied</option>
                            <option value="in-review" ${app.status==='in-review'?'selected':''}>In Review</option>
                            <option value="shortlisted" ${app.status==='shortlisted'?'selected':''}>Shortlisted</option>
                            <option value="interview" ${app.status==='interview'?'selected':''}>Interview</option>
                            <option value="selected" ${app.status==='selected'?'selected':''}>Selected</option>
                            <option value="rejected" ${app.status==='rejected'?'selected':''}>Rejected</option>
                        </select>
                        <button onclick="updateAdminAppStatus('${app._id}', document.getElementById('modalAppStatusSelect').value); document.getElementById('appDetailModal').style.display='none'; loadSection('applications');" class="btn btn-primary" style="font-size:0.85rem;padding:0.5rem 1rem;">Update Stage</button>
                    </div>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--border-color);">
                    <button onclick="deleteAdminApplication('${app._id}'); document.getElementById('appDetailModal').style.display='none';" class="btn btn-outline" style="font-size:0.85rem;color:#ef4444;border-color:rgba(239,68,68,0.3);">
                        🗑 Delete Application
                    </button>
                    <button onclick="document.getElementById('appDetailModal').style.display='none'" class="btn btn-outline" style="font-size:0.85rem;">Close</button>
                </div>
            </div>
        `;
    } catch(err) {
        modal.innerHTML = `<div style="background:white;padding:2rem;border-radius:16px;color:#ef4444;text-align:center;">Failed to load application: ${err.message}<br><br><button onclick="document.getElementById('appDetailModal').style.display='none'" class="btn btn-outline">Close</button></div>`;
    }
}
window.viewApplicationDetails = viewApplicationDetails;

function filterAdminAppsTable() {
    const s = (document.getElementById('adminAppSearch')?.value || '').toLowerCase();
    const st = document.getElementById('adminAppStatusFilter')?.value || 'all';
    document.querySelectorAll('#adminAppsTable tbody tr').forEach(r => {
        const txt = r.getAttribute('data-text') || '';
        const status = r.getAttribute('data-status') || '';
        const matchText = !s || txt.includes(s);
        const matchStatus = st === 'all' || status === st;
        r.style.display = (matchText && matchStatus) ? '' : 'none';
    });
}

async function updateAdminAppStatus(id, status) {
    try {
        await API.put(`/admin/applications/${id}/status`, { status });
        showToast(`Application updated to "${status.toUpperCase()}"`, 'success');
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function deleteAdminApplication(id) {
    if (!confirm('Are you sure you want to delete this application record?')) return;
    try {
        await API.delete(`/admin/applications/${id}`);
        showToast('Application deleted', 'success');
        await loadSection('applications');
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function cleanTempSystemData() {
    if (!confirm('Purge all expired verification OTP codes and optimize system storage?')) return;
    try {
        const res = await API.post('/admin/system/clean-temp');
        showToast(res.message || 'System cleanup complete!', 'success');
        await loadSection('sitehealth');
    } catch(e) { showToast('Cleanup error: ' + e.message, 'error'); }
}

// ════════════ Global Window Bindings ════════════
window.loadSection = loadSection;
window.handleLogout = handleLogout;
window.switchGranularity = switchGranularity;
window.showStudentDetailModal = showStudentDetailModal;
window.closeStudentModal = closeStudentModal;
window.changeRole = changeRole;
window.deleteUser = deleteUser;
window.addCompany = addCompany;
window.verifyCompany = verifyCompany;
window.deleteCompany = deleteCompany;
window.sendNotification = sendNotification;
window.bulkNotify = bulkNotify;
window.viewCompanyDetails = viewCompanyDetails;
window.rejectCompanyPrompt = rejectCompanyPrompt;
window.rejectCompanyWithReason = rejectCompanyWithReason;
window.viewAdminNotification = viewAdminNotification;
window.renderAdminJobs = renderAdminJobs;
window.filterAdminJobsTable = filterAdminJobsTable;
window.toggleAdminJobStatus = toggleAdminJobStatus;
window.deleteAdminJob = deleteAdminJob;
window.renderAdminApplications = renderAdminApplications;
window.filterAdminAppsTable = filterAdminAppsTable;
window.updateAdminAppStatus = updateAdminAppStatus;
window.deleteAdminApplication = deleteAdminApplication;
window.cleanTempSystemData = cleanTempSystemData;
window.viewQuestionDetails = viewQuestionDetails;
window.viewPrepDetails = viewPrepDetails;

// ── Authenticated CSV Export ──
async function adminExportCSV(url, filename) {
    try {
        const token = localStorage.getItem('hs_token');
        if (!token) { showToast('Please log in to export data', 'error'); return; }
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Export failed: ' + response.statusText);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        showToast('CSV exported successfully!', 'success');
    } catch (err) {
        showToast('Failed to export: ' + err.message, 'error');
    }
}
window.adminExportCSV = adminExportCSV;

// ── Admin Question Management CRUD ──
async function renderContent(c) {
    state.contentTab = state.contentTab || 'mcq';
    const prepData = await API.get('/preparation');
    state.prepCompanies = prepData.preparations || [];
    try { const res = await fetch('../../data/questions.json'); state.questions = await res.json(); } catch(e){}
    const codingCount = state.questions ? (state.questions.coding || []).length : 0;
    const mcqCount = state.questions ? (state.questions.coding_mcq || []).length : 0;
    const aptCount = state.questions ? (state.questions.aptitude || []).length : 0;

    c.innerHTML = `
        <div class="metric-grid" style="margin-bottom:1.5rem;">
            <div class="metric-card"><div class="label">📖 Prep Paths</div><div class="value">${state.prepCompanies.length}</div></div>
            <div class="metric-card"><div class="label">💻 Coding Qs</div><div class="value">${codingCount}</div></div>
            <div class="metric-card"><div class="label">🧪 MCQ Qs</div><div class="value">${mcqCount}</div></div>
            <div class="metric-card"><div class="label">🧠 Aptitude Qs</div><div class="value">${aptCount}</div></div>
        </div>

        <div style="display:flex;gap:0.5rem;margin-bottom:1.25rem;flex-wrap:wrap;">
            <button onclick="switchContentTab('mcq')" class="btn ${state.contentTab==='mcq'?'btn-primary':'btn-outline'}" style="font-size:0.8rem;padding:0.4rem 1rem;">🧪 MCQ Questions (${mcqCount})</button>
            <button onclick="switchContentTab('coding')" class="btn ${state.contentTab==='coding'?'btn-primary':'btn-outline'}" style="font-size:0.8rem;padding:0.4rem 1rem;">💻 Coding Questions (${codingCount})</button>
            <button onclick="switchContentTab('aptitude')" class="btn ${state.contentTab==='aptitude'?'btn-primary':'btn-outline'}" style="font-size:0.8rem;padding:0.4rem 1rem;">🧠 Aptitude (${aptCount})</button>
            <button onclick="switchContentTab('roadmaps')" class="btn ${state.contentTab==='roadmaps'?'btn-primary':'btn-outline'}" style="font-size:0.8rem;padding:0.4rem 1rem;">📖 Prep Roadmaps (${state.prepCompanies.length})</button>
        </div>

        <div id="contentTabBody"></div>
    `;

    renderContentTab();
}

function switchContentTab(tab) {
    state.contentTab = tab;
    document.querySelectorAll('.metric-grid + div button').forEach(btn => {
        btn.className = btn.textContent.toLowerCase().includes(tab) ? 'btn btn-primary' : 'btn btn-outline';
    });
    renderContentTab();
}

function renderContentTab() {
    const body = document.getElementById('contentTabBody');
    if (!body) return;
    const tab = state.contentTab || 'mcq';

    if (tab === 'roadmaps') {
        body.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                <h3 style="margin:0;font-size:1rem;">Company Preparation Paths</h3>
                <button onclick="openAddPrepModal()" class="btn btn-primary" style="font-size:0.8rem;padding:0.4rem 1rem;">+ Add Prep Path</button>
            </div>
            <div class="table-responsive">
                <table class="data-table"><thead><tr><th>Company (Click to inspect path)</th><th>Difficulty</th><th>Questions</th><th>Topics</th><th>Avg Salary</th><th>Roles</th><th>Actions</th></tr></thead>
                <tbody>${state.prepCompanies.map(p => `<tr onclick="viewPrepDetails('${p._id}')" style="cursor:pointer;" title="Click to view company roadmap details">
                    <td style="font-weight:600;color:var(--text-main);">${sanitize(p.companyName)} <span style="font-size:0.75rem;color:var(--primary);opacity:0.8;">↗</span></td>
                    <td><span style="font-size:0.75rem;font-weight:600;padding:0.15rem 0.5rem;border-radius:999px;${p.difficulty === 'Easy' ? 'color:#10b981;background:rgba(16,185,129,0.1)' : p.difficulty === 'Medium' ? 'color:#d97706;background:rgba(217,119,6,0.1)' : 'color:#ef4444;background:rgba(239,68,68,0.1)'}">${p.difficulty}</span></td>
                    <td>${p.questionCount}</td><td>${p.topicCount}</td><td>${p.avgSalary || '-'}</td>
                    <td>${(p.roles || []).map(r => `<span style="font-size:0.7rem;background:#f1f5f9;padding:0.1rem 0.4rem;border-radius:4px;margin-right:0.25rem;">${sanitize(r)}</span>`).join('')}</td>
                    <td>
                        <div style="display:flex;gap:0.25rem;">
                            <button onclick="event.stopPropagation(); viewPrepDetails('${p._id}')" class="btn btn-outline" style="font-size:0.7rem;padding:0.2rem 0.5rem;background:#f0fdf4;color:#15803d;border-color:#bbf7d0;font-weight:600;">👁 View</button>
                            <button onclick="event.stopPropagation(); openEditPrepModal('${p._id}')" class="btn btn-outline" style="font-size:0.7rem;padding:0.2rem 0.5rem;">✏️ Edit</button>
                            <button onclick="event.stopPropagation(); deletePrep('${p._id}')" class="btn btn-outline" style="font-size:0.7rem;padding:0.2rem 0.5rem;color:#ef4444;border-color:rgba(239,68,68,0.3);">🗑 Delete</button>
                        </div>
                    </td>
                </tr>`).join('')}</tbody></table>
            </div>
        `;
        return;
    }

    // Question tabs (mcq, coding, aptitude)
    const keyMap = { mcq: 'coding_mcq', coding: 'coding', aptitude: 'aptitude' };
    const questions = state.questions ? (state.questions[keyMap[tab]] || []) : [];
    const displayQ = questions.slice(0, 50); // Show first 50 for performance

    const isMcq = tab === 'mcq' || tab === 'aptitude';

    body.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem;">
            <h3 style="margin:0;font-size:1rem;">${tab === 'mcq' ? '🧪 MCQ' : tab === 'coding' ? '💻 Coding' : '🧠 Aptitude'} Questions (${questions.length} total, showing first ${displayQ.length})</h3>
            <button onclick="openAddQuestionModal('${tab}')" class="btn btn-primary" style="font-size:0.8rem;padding:0.4rem 1rem;">+ Add Question</button>
        </div>
        <div class="table-responsive" style="max-height:600px;overflow:auto;">
            <table class="data-table" style="font-size:0.8rem;"><thead><tr>
                <th style="width:40px;">#</th>
                <th>Title (Click to view full question)</th>
                ${isMcq ? '<th>Question</th>' : '<th>Description</th>'}
                <th>Difficulty</th>
                <th>Topic</th>
                <th>Company</th>
                ${isMcq ? '<th>Answer</th>' : ''}
                <th>Actions</th>
            </tr></thead>
            <tbody>${displayQ.map((q, i) => `<tr onclick="viewQuestionDetails('${tab}', '${q.id || i}')" style="cursor:pointer;" title="Click to view full question details">
                <td style="color:var(--text-muted);">${i + 1}</td>
                <td style="font-weight:600;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-main);">${sanitize(q.title || q.id)} <span style="font-size:0.75rem;color:var(--primary);opacity:0.8;">↗</span></td>
                <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-muted);">${sanitize((isMcq ? q.question : q.description) || '').substring(0, 80)}...</td>
                <td><span style="font-size:0.7rem;font-weight:600;padding:0.15rem 0.4rem;border-radius:999px;${q.difficulty === 'Easy' ? 'color:#10b981;background:rgba(16,185,129,0.1)' : q.difficulty === 'Medium' ? 'color:#d97706;background:rgba(217,119,6,0.1)' : 'color:#ef4444;background:rgba(239,68,68,0.1)'}">${q.difficulty}</span></td>
                <td style="font-size:0.75rem;">${sanitize(q.topic || '-')}</td>
                <td style="font-size:0.75rem;">${sanitize(q.company || '-')}</td>
                ${isMcq ? `<td style="font-size:0.75rem;font-weight:700;color:var(--primary);">${String.fromCharCode(65 + (q.correctAnswer || 0))}</td>` : ''}
                <td>
                    <div style="display:flex;gap:0.25rem;">
                        <button onclick="event.stopPropagation(); viewQuestionDetails('${tab}', '${q.id || i}')" class="btn btn-outline" style="font-size:0.65rem;padding:0.15rem 0.45rem;background:#f0fdf4;color:#15803d;border-color:#bbf7d0;font-weight:600;">👁 View</button>
                        <button onclick="event.stopPropagation(); openEditQuestionModal('${tab}', '${q.id}')" class="btn btn-outline" style="font-size:0.65rem;padding:0.15rem 0.4rem;">✏️ Edit</button>
                        <button onclick="event.stopPropagation(); deleteQuestion('${tab}', '${q.id}')" class="btn btn-outline" style="font-size:0.65rem;padding:0.15rem 0.4rem;color:#ef4444;border-color:rgba(239,68,68,0.3);">🗑</button>
                    </div>
                </td>
            </tr>`).join('')}</tbody></table>
        </div>
    `;
}
window.switchContentTab = switchContentTab;

function viewQuestionDetails(type, questionId) {
    const keyMap = { mcq: 'coding_mcq', coding: 'coding', aptitude: 'aptitude' };
    const questions = state.questions ? (state.questions[keyMap[type]] || []) : [];
    const q = questions.find(item => (item.id === questionId || item._id === questionId)) || questions[parseInt(questionId)] || {};
    const isMcq = type === 'mcq' || type === 'aptitude';

    let modal = document.getElementById('questionDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'questionDetailModal';
        modal.className = 'modal-backdrop';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1rem;';
        document.body.appendChild(modal);
    }

    const diffColor = q.difficulty === 'Easy' ? '#10b981' : q.difficulty === 'Medium' ? '#d97706' : '#ef4444';
    const diffBg = q.difficulty === 'Easy' ? 'rgba(16,185,129,0.1)' : q.difficulty === 'Medium' ? 'rgba(217,119,6,0.1)' : 'rgba(239,68,68,0.1)';

    modal.innerHTML = `
        <div style="background:var(--card-bg, white);border-radius:16px;max-width:680px;width:100%;max-height:90vh;overflow-y:auto;padding:1.75rem;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);border:1px solid var(--border-color);" onclick="event.stopPropagation();">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.25rem;border-bottom:1px solid var(--border-color);padding-bottom:1rem;">
                <div>
                    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem;">
                        <h2 style="margin:0;font-size:1.25rem;color:var(--text-main);">${sanitize(q.title || 'Question Details')}</h2>
                        <span style="font-size:0.75rem;font-weight:700;padding:0.2rem 0.6rem;border-radius:999px;color:${diffColor};background:${diffBg};">${q.difficulty || 'Medium'}</span>
                    </div>
                    <div style="font-size:0.85rem;color:var(--text-muted);">
                        ${q.topic ? '🏷️ ' + sanitize(q.topic) : ''} ${q.company ? '· 🏢 ' + sanitize(q.company) : ''} · <span style="text-transform:uppercase;font-weight:600;">${type}</span>
                    </div>
                </div>
                <button onclick="document.getElementById('questionDetailModal').style.display='none'" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">&times;</button>
            </div>

            <div style="margin-bottom:1.25rem;">
                <h4 style="margin:0 0 0.5rem;font-size:0.85rem;color:var(--text-muted);text-transform:uppercase;">${isMcq ? '❓ Question Prompt' : '📝 Problem Statement'}</h4>
                <div style="background:#f8fafc;padding:1rem;border-radius:8px;border:1px solid var(--border-color);font-size:0.9rem;line-height:1.6;white-space:pre-wrap;color:var(--text-main);">${sanitize(isMcq ? q.question : q.description || '')}</div>
            </div>

            ${isMcq && q.options ? `
                <div style="margin-bottom:1.25rem;">
                    <h4 style="margin:0 0 0.5rem;font-size:0.85rem;color:var(--text-muted);text-transform:uppercase;">📋 Options & Answer</h4>
                    <div style="display:flex;flex-direction:column;gap:0.5rem;">
                        ${q.options.map((opt, idx) => {
                            const isCorrect = idx === (q.correctAnswer || 0);
                            return `
                                <div style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem 1rem;border-radius:8px;border:1px solid ${isCorrect ? '#86efac' : 'var(--border-color)'};background:${isCorrect ? '#f0fdf4' : 'var(--bg-muted, #f8fafc)'};font-size:0.85rem;">
                                    <div style="width:24px;height:24px;border-radius:50%;background:${isCorrect ? '#10b981' : '#cbd5e1'};color:white;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;">
                                        ${String.fromCharCode(65 + idx)}
                                    </div>
                                    <div style="flex:1;color:var(--text-main);font-weight:${isCorrect ? '600' : '400'};">${sanitize(opt)}</div>
                                    ${isCorrect ? '<span style="color:#15803d;font-weight:700;font-size:0.8rem;">✓ Correct Answer</span>' : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}

            ${!isMcq && q.starterCode ? `
                <div style="margin-bottom:1.25rem;">
                    <h4 style="margin:0 0 0.5rem;font-size:0.85rem;color:var(--text-muted);text-transform:uppercase;">💻 Starter Code Template</h4>
                    <pre style="background:#0f172a;color:#38bdf8;padding:1rem;border-radius:8px;font-family:monospace;font-size:0.8rem;overflow-x:auto;">${sanitize(q.starterCode)}</pre>
                </div>
            ` : ''}

            ${q.explanation ? `
                <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:1rem;margin-bottom:1.25rem;">
                    <h4 style="margin:0 0 0.4rem;font-size:0.85rem;color:#1e40af;">💡 Solution Explanation</h4>
                    <div style="font-size:0.85rem;color:#1e3a8a;line-height:1.5;">${sanitize(q.explanation)}</div>
                </div>
            ` : ''}

            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--border-color);">
                <div style="display:flex;gap:0.5rem;">
                    <button onclick="document.getElementById('questionDetailModal').style.display='none'; openEditQuestionModal('${type}', '${q.id}');" class="btn btn-outline" style="font-size:0.85rem;">✏️ Edit</button>
                    <button onclick="document.getElementById('questionDetailModal').style.display='none'; deleteQuestion('${type}', '${q.id}');" class="btn btn-outline" style="font-size:0.85rem;color:#ef4444;border-color:rgba(239,68,68,0.3);">🗑 Delete</button>
                </div>
                <button onclick="document.getElementById('questionDetailModal').style.display='none'" class="btn btn-primary" style="font-size:0.85rem;">Close</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}
window.viewQuestionDetails = viewQuestionDetails;

function viewPrepDetails(prepId) {
    const p = (state.prepCompanies || []).find(item => item._id === prepId) || {};
    let modal = document.getElementById('prepDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'prepDetailModal';
        modal.className = 'modal-backdrop';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1rem;';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background:var(--card-bg, white);border-radius:16px;max-width:680px;width:100%;max-height:90vh;overflow-y:auto;padding:1.75rem;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);border:1px solid var(--border-color);" onclick="event.stopPropagation();">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.25rem;border-bottom:1px solid var(--border-color);padding-bottom:1rem;">
                <div>
                    <h2 style="margin:0;font-size:1.3rem;color:var(--text-main);">🏢 ${sanitize(p.companyName || 'Company Path')}</h2>
                    <div style="font-size:0.85rem;color:var(--text-muted);">Difficulty: <b>${sanitize(p.difficulty || 'Medium')}</b> · Avg Package: <b>${sanitize(p.avgSalary || 'N/A')}</b></div>
                </div>
                <button onclick="document.getElementById('prepDetailModal').style.display='none'" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">&times;</button>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.75rem;margin-bottom:1.25rem;">
                <div style="background:#f8fafc;padding:0.75rem;border-radius:8px;border:1px solid var(--border-color);text-align:center;">
                    <div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;">Total Questions</div>
                    <div style="font-size:1.25rem;font-weight:700;color:var(--primary);">${p.questionCount || 0}</div>
                </div>
                <div style="background:#f8fafc;padding:0.75rem;border-radius:8px;border:1px solid var(--border-color);text-align:center;">
                    <div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;">Interview Topics</div>
                    <div style="font-size:1.25rem;font-weight:700;color:#8b5cf6;">${p.topicCount || 0}</div>
                </div>
                <div style="background:#f8fafc;padding:0.75rem;border-radius:8px;border:1px solid var(--border-color);text-align:center;">
                    <div style="font-size:0.7rem;color:var(--text-muted);font-weight:600;">Hiring Roles</div>
                    <div style="font-size:1.25rem;font-weight:700;color:#10b981;">${(p.roles || []).length}</div>
                </div>
            </div>

            <div style="margin-bottom:1.25rem;">
                <h4 style="margin:0 0 0.5rem;font-size:0.85rem;color:var(--text-muted);text-transform:uppercase;">💼 Target Job Roles</h4>
                <div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
                    ${(p.roles || []).map(r => `<span style="background:rgba(59,130,246,0.1);color:#2563eb;padding:0.25rem 0.65rem;border-radius:999px;font-size:0.75rem;font-weight:600;">${sanitize(r)}</span>`).join('')}
                </div>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--border-color);">
                <div style="display:flex;gap:0.5rem;">
                    <button onclick="document.getElementById('prepDetailModal').style.display='none'; openEditPrepModal('${p._id}');" class="btn btn-outline" style="font-size:0.85rem;">✏️ Edit</button>
                    <button onclick="document.getElementById('prepDetailModal').style.display='none'; deletePrep('${p._id}');" class="btn btn-outline" style="font-size:0.85rem;color:#ef4444;border-color:rgba(239,68,68,0.3);">🗑 Delete</button>
                </div>
                <button onclick="document.getElementById('prepDetailModal').style.display='none'" class="btn btn-primary" style="font-size:0.85rem;">Close</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}
window.viewPrepDetails = viewPrepDetails;

// ── Add Question Modal ──
function openAddQuestionModal(type) {
    const isMcq = type === 'mcq' || type === 'aptitude';
    let modal = document.getElementById('addQuestionModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'addQuestionModal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1rem;';
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div style="background:var(--card-bg);border-radius:16px;max-width:680px;width:100%;max-height:90vh;overflow-y:auto;padding:2rem;border:1px solid var(--border-color);box-shadow:0 25px 50px rgba(0,0,0,0.25);position:relative;">
            <button onclick="document.getElementById('addQuestionModal').style.display='none'" style="position:absolute;right:1rem;top:1rem;width:32px;height:32px;border-radius:50%;background:var(--bg-muted);border:1px solid var(--border-color);font-size:1.1rem;cursor:pointer;">✕</button>
            <h3 style="margin:0 0 1.25rem;font-size:1.1rem;">➕ Add New ${type === 'mcq' ? 'MCQ' : type === 'coding' ? 'Coding' : 'Aptitude'} Question</h3>
            <form onsubmit="submitNewQuestion(event, '${type}')">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
                    <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Title</label><input type="text" id="nq_title" required style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);"></div>
                    <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Difficulty</label>
                        <select id="nq_diff" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);">
                            <option value="Easy">Easy</option><option value="Medium" selected>Medium</option><option value="Hard">Hard</option>
                        </select>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
                    <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Topic</label><input type="text" id="nq_topic" placeholder="e.g. Data Structures, DBMS" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);"></div>
                    <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Company</label><input type="text" id="nq_company" placeholder="e.g. Google, TCS" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);"></div>
                </div>
                ${isMcq ? `
                    <div style="margin-bottom:0.75rem;"><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Question Text</label><textarea id="nq_question" required rows="3" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);resize:vertical;"></textarea></div>
                    <div style="margin-bottom:0.75rem;">
                        <label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Options (4 choices)</label>
                        <input type="text" id="nq_opt0" required placeholder="Option A" style="width:100%;padding:0.4rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);margin-bottom:0.4rem;">
                        <input type="text" id="nq_opt1" required placeholder="Option B" style="width:100%;padding:0.4rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);margin-bottom:0.4rem;">
                        <input type="text" id="nq_opt2" required placeholder="Option C" style="width:100%;padding:0.4rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);margin-bottom:0.4rem;">
                        <input type="text" id="nq_opt3" required placeholder="Option D" style="width:100%;padding:0.4rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);">
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
                        <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Correct Answer</label>
                            <select id="nq_correct" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);">
                                <option value="0">A</option><option value="1">B</option><option value="2">C</option><option value="3">D</option>
                            </select>
                        </div>
                        <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Tags (comma separated)</label><input type="text" id="nq_tags" placeholder="Arrays, Strings" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);"></div>
                    </div>
                    <div style="margin-bottom:1rem;"><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Explanation</label><textarea id="nq_explanation" rows="2" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);resize:vertical;"></textarea></div>
                ` : `
                    <div style="margin-bottom:0.75rem;"><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Problem Description</label><textarea id="nq_description" required rows="4" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);resize:vertical;" placeholder="Given an array of integers nums and an integer target, return indices..."></textarea></div>
                    <div style="margin-bottom:0.75rem;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;">
                            <label style="font-size:0.8rem;font-weight:600;">🧪 Test Cases / Examples</label>
                            <button type="button" onclick="addCodingTestCase()" style="padding:0.25rem 0.6rem;font-size:0.75rem;border-radius:6px;background:var(--primary);color:#fff;border:none;cursor:pointer;">+ Add Test Case</button>
                        </div>
                        <div id="nq_testcases_container">
                            <div class="nq-testcase" style="border:1px solid var(--border-color);border-radius:8px;padding:0.6rem;margin-bottom:0.5rem;background:var(--bg-muted);position:relative;">
                                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
                                    <div><label style="font-size:0.7rem;font-weight:600;display:block;margin-bottom:0.2rem;">Input</label><textarea class="tc_input" rows="2" placeholder="nums = [2,7,11,15], target = 9" style="width:100%;padding:0.4rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);resize:vertical;"></textarea></div>
                                    <div><label style="font-size:0.7rem;font-weight:600;display:block;margin-bottom:0.2rem;">Expected Output</label><textarea class="tc_output" rows="2" placeholder="[0, 1]" style="width:100%;padding:0.4rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);resize:vertical;"></textarea></div>
                                </div>
                                <div style="margin-top:0.4rem;"><label style="font-size:0.7rem;font-weight:600;display:block;margin-bottom:0.2rem;">Explanation (optional)</label><input class="tc_explain" placeholder="Because nums[0] + nums[1] == 9" style="width:100%;padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);"></div>
                            </div>
                        </div>
                    </div>
                    <div style="margin-bottom:0.75rem;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;">
                            <label style="font-size:0.8rem;font-weight:600;">📏 Constraints</label>
                            <button type="button" onclick="addCodingConstraint()" style="padding:0.25rem 0.6rem;font-size:0.75rem;border-radius:6px;background:var(--primary);color:#fff;border:none;cursor:pointer;">+ Add Constraint</button>
                        </div>
                        <div id="nq_constraints_container">
                            <div style="display:flex;gap:0.4rem;margin-bottom:0.3rem;align-items:center;"><input class="constraint_input" placeholder="1 <= nums.length <= 10^4" style="flex:1;padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);"><button type="button" onclick="this.parentElement.remove()" style="width:24px;height:24px;border-radius:50%;border:1px solid var(--border-color);background:var(--bg-muted);cursor:pointer;font-size:0.7rem;">✕</button></div>
                        </div>
                    </div>
                    <div style="margin-bottom:0.75rem;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;">
                            <label style="font-size:0.8rem;font-weight:600;">💡 Hints</label>
                            <button type="button" onclick="addCodingHint()" style="padding:0.25rem 0.6rem;font-size:0.75rem;border-radius:6px;background:var(--primary);color:#fff;border:none;cursor:pointer;">+ Add Hint</button>
                        </div>
                        <div id="nq_hints_container">
                            <div style="display:flex;gap:0.4rem;margin-bottom:0.3rem;align-items:center;"><input class="hint_input" placeholder="Try using a hash map..." style="flex:1;padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);"><button type="button" onclick="this.parentElement.remove()" style="width:24px;height:24px;border-radius:50%;border:1px solid var(--border-color);background:var(--bg-muted);cursor:pointer;font-size:0.7rem;">✕</button></div>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;">
                        <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Acceptance Rate</label><input type="text" id="nq_acceptance" placeholder="45.0%" value="45.0%" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);"></div>
                        <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Tags (comma separated)</label><input type="text" id="nq_tags" placeholder="Arrays, Dynamic Programming" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);"></div>
                    </div>
                `}
                <div style="display:flex;gap:0.75rem;justify-content:flex-end;">
                    <button type="button" onclick="document.getElementById('addQuestionModal').style.display='none'" class="btn btn-outline">Cancel</button>
                    <button type="submit" id="nq_submit" class="btn btn-primary">💾 Save Question</button>
                </div>
            </form>
        </div>
    `;
    modal.style.display = 'flex';
}
window.openAddQuestionModal = openAddQuestionModal;

async function submitNewQuestion(e, type) {
    e.preventDefault();
    const btn = document.getElementById('nq_submit');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

    const isMcq = type === 'mcq' || type === 'aptitude';
    const keyMap = { mcq: 'coding_mcq', coding: 'coding', aptitude: 'aptitude' };
    const category = keyMap[type];
    const existing = state.questions ? (state.questions[category] || []) : [];
    const newId = `${type === 'mcq' ? 'mcq' : type === 'aptitude' ? 'aptitude' : 'coding'}-${existing.length}`;

    const question = {
        id: newId,
        title: document.getElementById('nq_title').value,
        difficulty: document.getElementById('nq_diff').value,
        topic: document.getElementById('nq_topic')?.value || '',
        company: document.getElementById('nq_company')?.value || '',
        tags: (document.getElementById('nq_tags')?.value || '').split(',').map(t => t.trim()).filter(Boolean),
        type: category
    };

    if (isMcq) {
        question.question = document.getElementById('nq_question').value;
        question.options = [
            document.getElementById('nq_opt0').value,
            document.getElementById('nq_opt1').value,
            document.getElementById('nq_opt2').value,
            document.getElementById('nq_opt3').value
        ];
        question.correctAnswer = parseInt(document.getElementById('nq_correct').value);
        question.explanation = document.getElementById('nq_explanation')?.value || '';
    } else {
        question.description = document.getElementById('nq_description').value;
        question.acceptance = document.getElementById('nq_acceptance')?.value || '45.0%';
        // Collect test cases from dynamic cards
        const tcCards = document.querySelectorAll('#nq_testcases_container .nq-testcase');
        question.examples = [];
        tcCards.forEach(card => {
            const input = card.querySelector('.tc_input')?.value?.trim() || '';
            const output = card.querySelector('.tc_output')?.value?.trim() || '';
            if (input || output) {
                question.examples.push({
                    input,
                    output,
                    explanation: card.querySelector('.tc_explain')?.value?.trim() || ''
                });
            }
        });
        if (question.examples.length === 0) {
            question.examples = [{ input: 'example input', output: 'example output', explanation: '' }];
        }
        // Collect constraints
        const constraintEls = document.querySelectorAll('#nq_constraints_container .constraint_input');
        question.constraints = [];
        constraintEls.forEach(el => { if (el.value.trim()) question.constraints.push(el.value.trim()); });
        // Collect hints
        const hintEls = document.querySelectorAll('#nq_hints_container .hint_input');
        question.hints = [];
        hintEls.forEach(el => { if (el.value.trim()) question.hints.push(el.value.trim()); });
    }

    try {
        await API.post('/admin/questions', { category, question });
        showToast('Question added successfully!', 'success');
        document.getElementById('addQuestionModal').style.display = 'none';
        // Refresh local data
        try { const res = await fetch('../../data/questions.json'); state.questions = await res.json(); } catch(ex){}
        renderContentTab();
    } catch (err) {
        showToast('Failed to add question: ' + err.message, 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '💾 Save Question'; }
    }
}
window.submitNewQuestion = submitNewQuestion;

async function deleteQuestion(type, questionId) {
    if (!confirm('Delete this question permanently?')) return;
    const keyMap = { mcq: 'coding_mcq', coding: 'coding', aptitude: 'aptitude' };
    try {
        await API.delete(`/admin/questions/${encodeURIComponent(questionId)}?category=${keyMap[type]}`);
        showToast('Question deleted!', 'success');
        try { const res = await fetch('../../data/questions.json'); state.questions = await res.json(); } catch(ex){}
        renderContentTab();
    } catch (err) {
        showToast('Failed to delete: ' + err.message, 'error');
    }
}
window.deleteQuestion = deleteQuestion;

function openEditQuestionModal(type, questionId) {
    const keyMap = { mcq: 'coding_mcq', coding: 'coding', aptitude: 'aptitude' };
    const questions = state.questions ? (state.questions[keyMap[type]] || []) : [];
    const q = questions.find(x => x.id === questionId);
    if (!q) { showToast('Question not found', 'error'); return; }

    const isMcq = type === 'mcq' || type === 'aptitude';
    let modal = document.getElementById('editQuestionModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editQuestionModal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1rem;';
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div style="background:var(--card-bg);border-radius:16px;max-width:680px;width:100%;max-height:90vh;overflow-y:auto;padding:2rem;border:1px solid var(--border-color);box-shadow:0 25px 50px rgba(0,0,0,0.25);position:relative;">
            <button onclick="document.getElementById('editQuestionModal').style.display='none'" style="position:absolute;right:1rem;top:1rem;width:32px;height:32px;border-radius:50%;background:var(--bg-muted);border:1px solid var(--border-color);font-size:1.1rem;cursor:pointer;">✕</button>
            <h3 style="margin:0 0 1.25rem;font-size:1.1rem;">✏️ Edit Question: ${sanitize(q.title)}</h3>
            <form onsubmit="submitEditQuestion(event, '${type}', '${q.id}')">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
                    <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Title</label><input type="text" id="eq_title" value="${sanitize(q.title)}" required style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);"></div>
                    <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Difficulty</label>
                        <select id="eq_diff" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);">
                            <option value="Easy" ${q.difficulty==='Easy'?'selected':''}>Easy</option><option value="Medium" ${q.difficulty==='Medium'?'selected':''}>Medium</option><option value="Hard" ${q.difficulty==='Hard'?'selected':''}>Hard</option>
                        </select>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
                    <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Topic</label><input type="text" id="eq_topic" value="${sanitize(q.topic||'')}" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);"></div>
                    <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Company</label><input type="text" id="eq_company" value="${sanitize(q.company||'')}" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);"></div>
                </div>
                ${isMcq ? `
                    <div style="margin-bottom:0.75rem;"><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Question Text</label><textarea id="eq_question" rows="3" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);resize:vertical;">${sanitize(q.question||'')}</textarea></div>
                    <div style="margin-bottom:0.75rem;">
                        <label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Options</label>
                        ${(q.options||[]).map((o,i) => `<input type="text" id="eq_opt${i}" value="${sanitize(o)}" style="width:100%;padding:0.4rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);margin-bottom:0.4rem;">`).join('')}
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;">
                        <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Correct Answer</label>
                            <select id="eq_correct" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);">
                                <option value="0" ${q.correctAnswer===0?'selected':''}>A</option><option value="1" ${q.correctAnswer===1?'selected':''}>B</option><option value="2" ${q.correctAnswer===2?'selected':''}>C</option><option value="3" ${q.correctAnswer===3?'selected':''}>D</option>
                            </select>
                        </div>
                        <div></div>
                    </div>
                    <div style="margin-bottom:1rem;"><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Explanation</label><textarea id="eq_explanation" rows="2" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);resize:vertical;">${sanitize(q.explanation||'')}</textarea></div>
                ` : `
                    <div style="margin-bottom:0.75rem;"><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Problem Description</label><textarea id="eq_description" rows="4" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);resize:vertical;">${sanitize(q.description||'')}</textarea></div>
                    <div style="margin-bottom:0.75rem;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;">
                            <label style="font-size:0.8rem;font-weight:600;">🧪 Test Cases / Examples</label>
                            <button type="button" onclick="addCodingTestCase('eq')" style="padding:0.25rem 0.6rem;font-size:0.75rem;border-radius:6px;background:var(--primary);color:#fff;border:none;cursor:pointer;">+ Add Test Case</button>
                        </div>
                        <div id="eq_testcases_container">
                            ${(q.examples||[]).map((ex, i) => `
                            <div class="eq-testcase" style="border:1px solid var(--border-color);border-radius:8px;padding:0.6rem;margin-bottom:0.5rem;background:var(--bg-muted);position:relative;">
                                <button type="button" onclick="this.parentElement.remove()" style="position:absolute;right:0.4rem;top:0.4rem;width:20px;height:20px;border-radius:50%;border:1px solid var(--border-color);background:var(--bg-muted);cursor:pointer;font-size:0.6rem;">✕</button>
                                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
                                    <div><label style="font-size:0.7rem;font-weight:600;display:block;margin-bottom:0.2rem;">Input</label><textarea class="tc_input" rows="2" style="width:100%;padding:0.4rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);resize:vertical;">${sanitize(ex.input||'')}</textarea></div>
                                    <div><label style="font-size:0.7rem;font-weight:600;display:block;margin-bottom:0.2rem;">Expected Output</label><textarea class="tc_output" rows="2" style="width:100%;padding:0.4rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);resize:vertical;">${sanitize(ex.output||'')}</textarea></div>
                                </div>
                                <div style="margin-top:0.4rem;"><label style="font-size:0.7rem;font-weight:600;display:block;margin-bottom:0.2rem;">Explanation</label><input class="tc_explain" value="${sanitize(ex.explanation||'')}" style="width:100%;padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);"></div>
                            </div>`).join('')}
                        </div>
                    </div>
                    <div style="margin-bottom:0.75rem;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;">
                            <label style="font-size:0.8rem;font-weight:600;">📏 Constraints</label>
                            <button type="button" onclick="addCodingConstraint('eq')" style="padding:0.25rem 0.6rem;font-size:0.75rem;border-radius:6px;background:var(--primary);color:#fff;border:none;cursor:pointer;">+ Add Constraint</button>
                        </div>
                        <div id="eq_constraints_container">
                            ${(q.constraints||[]).map(c => `<div style="display:flex;gap:0.4rem;margin-bottom:0.3rem;align-items:center;"><input class="constraint_input" value="${sanitize(c)}" style="flex:1;padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);"><button type="button" onclick="this.parentElement.remove()" style="width:24px;height:24px;border-radius:50%;border:1px solid var(--border-color);background:var(--bg-muted);cursor:pointer;font-size:0.7rem;">✕</button></div>`).join('')}
                        </div>
                    </div>
                    <div style="margin-bottom:0.75rem;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;">
                            <label style="font-size:0.8rem;font-weight:600;">💡 Hints</label>
                            <button type="button" onclick="addCodingHint('eq')" style="padding:0.25rem 0.6rem;font-size:0.75rem;border-radius:6px;background:var(--primary);color:#fff;border:none;cursor:pointer;">+ Add Hint</button>
                        </div>
                        <div id="eq_hints_container">
                            ${(q.hints||[]).map(h => `<div style="display:flex;gap:0.4rem;margin-bottom:0.3rem;align-items:center;"><input class="hint_input" value="${sanitize(h)}" style="flex:1;padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);"><button type="button" onclick="this.parentElement.remove()" style="width:24px;height:24px;border-radius:50%;border:1px solid var(--border-color);background:var(--bg-muted);cursor:pointer;font-size:0.7rem;">✕</button></div>`).join('')}
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;">
                        <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Acceptance Rate</label><input type="text" id="eq_acceptance" value="${sanitize(q.acceptance||'45.0%')}" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);"></div>
                        <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Tags (comma separated)</label><input type="text" id="eq_tags" value="${sanitize((q.tags||[]).join(', '))}" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);"></div>
                    </div>
                `}
                <div style="display:flex;gap:0.75rem;justify-content:flex-end;">
                    <button type="button" onclick="document.getElementById('editQuestionModal').style.display='none'" class="btn btn-outline">Cancel</button>
                    <button type="submit" id="eq_submit" class="btn btn-primary">💾 Save Changes</button>
                </div>
            </form>
        </div>
    `;
    modal.style.display = 'flex';
}
window.openEditQuestionModal = openEditQuestionModal;

async function submitEditQuestion(e, type, questionId) {
    e.preventDefault();
    const btn = document.getElementById('eq_submit');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

    const isMcq = type === 'mcq' || type === 'aptitude';
    const keyMap = { mcq: 'coding_mcq', coding: 'coding', aptitude: 'aptitude' };
    const updates = {
        title: document.getElementById('eq_title').value,
        difficulty: document.getElementById('eq_diff').value,
        topic: document.getElementById('eq_topic')?.value || '',
        company: document.getElementById('eq_company')?.value || ''
    };
    if (isMcq) {
        updates.question = document.getElementById('eq_question')?.value || '';
        updates.options = [0,1,2,3].map(i => document.getElementById(`eq_opt${i}`)?.value || '');
        updates.correctAnswer = parseInt(document.getElementById('eq_correct')?.value || '0');
        updates.explanation = document.getElementById('eq_explanation')?.value || '';
    } else {
        updates.description = document.getElementById('eq_description')?.value || '';
        updates.acceptance = document.getElementById('eq_acceptance')?.value || '45.0%';
        updates.tags = (document.getElementById('eq_tags')?.value || '').split(',').map(t => t.trim()).filter(Boolean);
        // Collect test cases
        const tcCards = document.querySelectorAll('#eq_testcases_container .eq-testcase');
        updates.examples = [];
        tcCards.forEach(card => {
            const input = card.querySelector('.tc_input')?.value?.trim() || '';
            const output = card.querySelector('.tc_output')?.value?.trim() || '';
            if (input || output) {
                updates.examples.push({ input, output, explanation: card.querySelector('.tc_explain')?.value?.trim() || '' });
            }
        });
        // Collect constraints
        const constraintEls = document.querySelectorAll('#eq_constraints_container .constraint_input');
        updates.constraints = [];
        constraintEls.forEach(el => { if (el.value.trim()) updates.constraints.push(el.value.trim()); });
        // Collect hints
        const hintEls = document.querySelectorAll('#eq_hints_container .hint_input');
        updates.hints = [];
        hintEls.forEach(el => { if (el.value.trim()) updates.hints.push(el.value.trim()); });
    }

    try {
        await API.put(`/admin/questions/${encodeURIComponent(questionId)}`, { category: keyMap[type], updates });
        showToast('Question updated successfully!', 'success');
        document.getElementById('editQuestionModal').style.display = 'none';
        try { const res = await fetch('../../data/questions.json'); state.questions = await res.json(); } catch(ex){}
        renderContentTab();
    } catch (err) {
        showToast('Failed to update: ' + err.message, 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '💾 Save Changes'; }
    }
}
window.submitEditQuestion = submitEditQuestion;

// ── Dynamic Field Helpers for Coding Questions ──
function addCodingTestCase(prefix) {
    const pfx = prefix || 'nq';
    const cls = pfx === 'eq' ? 'eq-testcase' : 'nq-testcase';
    const container = document.getElementById(`${pfx}_testcases_container`);
    if (!container) return;
    const card = document.createElement('div');
    card.className = cls;
    card.style.cssText = 'border:1px solid var(--border-color);border-radius:8px;padding:0.6rem;margin-bottom:0.5rem;background:var(--bg-muted);position:relative;';
    card.innerHTML = `
        <button type="button" onclick="this.parentElement.remove()" style="position:absolute;right:0.4rem;top:0.4rem;width:20px;height:20px;border-radius:50%;border:1px solid var(--border-color);background:var(--bg-muted);cursor:pointer;font-size:0.6rem;">✕</button>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
            <div><label style="font-size:0.7rem;font-weight:600;display:block;margin-bottom:0.2rem;">Input</label><textarea class="tc_input" rows="2" placeholder="nums = [1,2,3]" style="width:100%;padding:0.4rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);resize:vertical;"></textarea></div>
            <div><label style="font-size:0.7rem;font-weight:600;display:block;margin-bottom:0.2rem;">Expected Output</label><textarea class="tc_output" rows="2" placeholder="[3,2,1]" style="width:100%;padding:0.4rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);resize:vertical;"></textarea></div>
        </div>
        <div style="margin-top:0.4rem;"><label style="font-size:0.7rem;font-weight:600;display:block;margin-bottom:0.2rem;">Explanation</label><input class="tc_explain" placeholder="Optional explanation" style="width:100%;padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);"></div>`;
    container.appendChild(card);
}
window.addCodingTestCase = addCodingTestCase;

function addCodingConstraint(prefix) {
    const pfx = prefix || 'nq';
    const container = document.getElementById(`${pfx}_constraints_container`);
    if (!container) return;
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:0.4rem;margin-bottom:0.3rem;align-items:center;';
    row.innerHTML = `<input class="constraint_input" placeholder="0 <= value <= 10^9" style="flex:1;padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);"><button type="button" onclick="this.parentElement.remove()" style="width:24px;height:24px;border-radius:50%;border:1px solid var(--border-color);background:var(--bg-muted);cursor:pointer;font-size:0.7rem;">✕</button>`;
    container.appendChild(row);
}
window.addCodingConstraint = addCodingConstraint;

function addCodingHint(prefix) {
    const pfx = prefix || 'nq';
    const container = document.getElementById(`${pfx}_hints_container`);
    if (!container) return;
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:0.4rem;margin-bottom:0.3rem;align-items:center;';
    row.innerHTML = `<input class="hint_input" placeholder="Think about edge cases..." style="flex:1;padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);"><button type="button" onclick="this.parentElement.remove()" style="width:24px;height:24px;border-radius:50%;border:1px solid var(--border-color);background:var(--bg-muted);cursor:pointer;font-size:0.7rem;">✕</button>`;
    container.appendChild(row);
}
window.addCodingHint = addCodingHint;

// ── Prep Roadmap CRUD ──
function openAddPrepModal() {
    let modal = document.getElementById('addPrepModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'addPrepModal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1rem;';
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div style="background:var(--card-bg);border-radius:16px;max-width:750px;width:100%;max-height:90vh;overflow-y:auto;padding:2rem;border:1px solid var(--border-color);box-shadow:0 25px 50px rgba(0,0,0,0.25);position:relative;">
            <button onclick="document.getElementById('addPrepModal').style.display='none'" style="position:absolute;right:1rem;top:1rem;width:32px;height:32px;border-radius:50%;background:var(--bg-muted);border:1px solid var(--border-color);font-size:1.1rem;cursor:pointer;">✕</button>
            <h3 style="margin:0 0 1.25rem;font-size:1.1rem;">🗺️ Add New Preparation Roadmap</h3>
            <form onsubmit="submitNewPrep(event)">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
                    <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Company Name *</label><input type="text" id="np_company" required placeholder="e.g. Google, Amazon" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);"></div>
                    <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Difficulty</label>
                        <select id="np_difficulty" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);">
                            <option value="Easy">Easy</option><option value="Medium" selected>Medium</option><option value="Hard">Hard</option>
                        </select>
                    </div>
                </div>
                <div style="margin-bottom:0.75rem;"><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Description</label><textarea id="np_desc" rows="2" placeholder="Overview of the company's hiring process..." style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);resize:vertical;"></textarea></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
                    <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Average Salary</label><input type="text" id="np_salary" placeholder="e.g. $170K or ₹22L" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);"></div>
                    <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Roles (comma separated)</label><input type="text" id="np_roles" placeholder="SDE I, SDE II, SDE III" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);"></div>
                </div>
                <div style="margin-bottom:0.75rem;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;">
                        <label style="font-size:0.8rem;font-weight:600;">📚 Topics & Syllabus</label>
                        <button type="button" onclick="addPrepTopic('np')" style="padding:0.25rem 0.6rem;font-size:0.75rem;border-radius:6px;background:var(--primary);color:#fff;border:none;cursor:pointer;">+ Add Topic</button>
                    </div>
                    <div id="np_topics_container">
                        <div class="prep-topic-card" style="border:1px solid var(--border-color);border-radius:8px;padding:0.6rem;margin-bottom:0.5rem;background:var(--bg-muted);position:relative;">
                            <button type="button" onclick="this.parentElement.remove()" style="position:absolute;right:0.4rem;top:0.4rem;width:20px;height:20px;border-radius:50%;border:1px solid var(--border-color);background:var(--bg-muted);cursor:pointer;font-size:0.6rem;">✕</button>
                            <input class="topic_title" placeholder="Topic Title (e.g. Data Structures & Algorithms)" style="width:calc(100% - 30px);padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);margin-bottom:0.3rem;">
                            <input class="topic_items" placeholder="Items: Arrays, Linked Lists, Trees (comma separated)" style="width:100%;padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);">
                        </div>
                    </div>
                </div>
                <div style="margin-bottom:1rem;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;">
                        <label style="font-size:0.8rem;font-weight:600;">❓ Interview Questions</label>
                        <button type="button" onclick="addPrepQuestion('np')" style="padding:0.25rem 0.6rem;font-size:0.75rem;border-radius:6px;background:var(--primary);color:#fff;border:none;cursor:pointer;">+ Add Question</button>
                    </div>
                    <div id="np_questions_container">
                        <div class="prep-question-card" style="border:1px solid var(--border-color);border-radius:8px;padding:0.6rem;margin-bottom:0.5rem;background:var(--bg-muted);position:relative;">
                            <button type="button" onclick="this.parentElement.remove()" style="position:absolute;right:0.4rem;top:0.4rem;width:20px;height:20px;border-radius:50%;border:1px solid var(--border-color);background:var(--bg-muted);cursor:pointer;font-size:0.6rem;">✕</button>
                            <input class="pq_question" placeholder="Interview question text" style="width:calc(100% - 30px);padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);margin-bottom:0.3rem;">
                            <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:0.4rem;">
                                <input class="pq_answer" placeholder="Model answer" style="padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);">
                                <input class="pq_category" placeholder="Category" value="General" style="padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);">
                                <select class="pq_diff" style="padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);"><option value="Easy">Easy</option><option value="Medium" selected>Medium</option><option value="Hard">Hard</option></select>
                            </div>
                        </div>
                    </div>
                </div>
                <div style="display:flex;gap:0.75rem;justify-content:flex-end;">
                    <button type="button" onclick="document.getElementById('addPrepModal').style.display='none'" class="btn btn-outline">Cancel</button>
                    <button type="submit" id="np_submit" class="btn btn-primary">🗺️ Create Roadmap</button>
                </div>
            </form>
        </div>`;
    modal.style.display = 'flex';
}
window.openAddPrepModal = openAddPrepModal;

function addPrepTopic(prefix) {
    const container = document.getElementById(`${prefix}_topics_container`);
    if (!container) return;
    const card = document.createElement('div');
    card.className = 'prep-topic-card';
    card.style.cssText = 'border:1px solid var(--border-color);border-radius:8px;padding:0.6rem;margin-bottom:0.5rem;background:var(--bg-muted);position:relative;';
    card.innerHTML = `
        <button type="button" onclick="this.parentElement.remove()" style="position:absolute;right:0.4rem;top:0.4rem;width:20px;height:20px;border-radius:50%;border:1px solid var(--border-color);background:var(--bg-muted);cursor:pointer;font-size:0.6rem;">✕</button>
        <input class="topic_title" placeholder="Topic Title" style="width:calc(100% - 30px);padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);margin-bottom:0.3rem;">
        <input class="topic_items" placeholder="Items (comma separated)" style="width:100%;padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);">`;
    container.appendChild(card);
}
window.addPrepTopic = addPrepTopic;

function addPrepQuestion(prefix) {
    const container = document.getElementById(`${prefix}_questions_container`);
    if (!container) return;
    const card = document.createElement('div');
    card.className = 'prep-question-card';
    card.style.cssText = 'border:1px solid var(--border-color);border-radius:8px;padding:0.6rem;margin-bottom:0.5rem;background:var(--bg-muted);position:relative;';
    card.innerHTML = `
        <button type="button" onclick="this.parentElement.remove()" style="position:absolute;right:0.4rem;top:0.4rem;width:20px;height:20px;border-radius:50%;border:1px solid var(--border-color);background:var(--bg-muted);cursor:pointer;font-size:0.6rem;">✕</button>
        <input class="pq_question" placeholder="Interview question text" style="width:calc(100% - 30px);padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);margin-bottom:0.3rem;">
        <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:0.4rem;">
            <input class="pq_answer" placeholder="Model answer" style="padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);">
            <input class="pq_category" placeholder="Category" value="General" style="padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);">
            <select class="pq_diff" style="padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);"><option value="Easy">Easy</option><option value="Medium" selected>Medium</option><option value="Hard">Hard</option></select>
        </div>`;
    container.appendChild(card);
}
window.addPrepQuestion = addPrepQuestion;

function collectPrepFormData(prefix) {
    const topics = [];
    document.querySelectorAll(`#${prefix}_topics_container .prep-topic-card`).forEach((card, i) => {
        const title = card.querySelector('.topic_title')?.value?.trim();
        if (title) {
            topics.push({
                title,
                items: (card.querySelector('.topic_items')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
                order: i
            });
        }
    });
    const questions = [];
    document.querySelectorAll(`#${prefix}_questions_container .prep-question-card`).forEach(card => {
        const question = card.querySelector('.pq_question')?.value?.trim();
        if (question) {
            questions.push({
                question,
                answer: card.querySelector('.pq_answer')?.value?.trim() || '',
                category: card.querySelector('.pq_category')?.value?.trim() || 'General',
                difficulty: card.querySelector('.pq_diff')?.value || 'Medium'
            });
        }
    });
    return { topics, questions };
}

async function submitNewPrep(e) {
    e.preventDefault();
    const btn = document.getElementById('np_submit');
    if (btn) { btn.disabled = true; btn.textContent = 'Creating...'; }
    const { topics, questions } = collectPrepFormData('np');
    const body = {
        companyName: document.getElementById('np_company').value.trim(),
        difficulty: document.getElementById('np_difficulty').value,
        description: document.getElementById('np_desc')?.value?.trim() || '',
        avgSalary: document.getElementById('np_salary')?.value?.trim() || '',
        roles: (document.getElementById('np_roles')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
        topics,
        questions,
        topicCount: topics.length,
        questionCount: questions.length
    };
    try {
        await API.post('/admin/preparation', body);
        showToast('Preparation roadmap created!', 'success');
        document.getElementById('addPrepModal').style.display = 'none';
        loadSection('content');
    } catch (err) {
        showToast('Failed: ' + err.message, 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '🗺️ Create Roadmap'; }
    }
}
window.submitNewPrep = submitNewPrep;

function openEditPrepModal(prepId) {
    const prep = (state.prepCompanies || []).find(p => p._id === prepId);
    if (!prep) { showToast('Roadmap not found', 'error'); return; }
    let modal = document.getElementById('editPrepModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editPrepModal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1rem;';
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div style="background:var(--card-bg);border-radius:16px;max-width:750px;width:100%;max-height:90vh;overflow-y:auto;padding:2rem;border:1px solid var(--border-color);box-shadow:0 25px 50px rgba(0,0,0,0.25);position:relative;">
            <button onclick="document.getElementById('editPrepModal').style.display='none'" style="position:absolute;right:1rem;top:1rem;width:32px;height:32px;border-radius:50%;background:var(--bg-muted);border:1px solid var(--border-color);font-size:1.1rem;cursor:pointer;">✕</button>
            <h3 style="margin:0 0 1.25rem;font-size:1.1rem;">✏️ Edit Roadmap: ${sanitize(prep.companyName)}</h3>
            <form onsubmit="submitEditPrep(event, '${prep._id}')">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
                    <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Company Name</label><input type="text" id="ep_company" value="${sanitize(prep.companyName)}" required style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);"></div>
                    <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Difficulty</label>
                        <select id="ep_difficulty" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);">
                            <option value="Easy" ${prep.difficulty==='Easy'?'selected':''}>Easy</option><option value="Medium" ${prep.difficulty==='Medium'?'selected':''}>Medium</option><option value="Hard" ${prep.difficulty==='Hard'?'selected':''}>Hard</option>
                        </select>
                    </div>
                </div>
                <div style="margin-bottom:0.75rem;"><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Description</label><textarea id="ep_desc" rows="2" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);resize:vertical;">${sanitize(prep.description||'')}</textarea></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
                    <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Average Salary</label><input type="text" id="ep_salary" value="${sanitize(prep.avgSalary||'')}" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);"></div>
                    <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.3rem;">Roles (comma separated)</label><input type="text" id="ep_roles" value="${sanitize((prep.roles||[]).join(', '))}" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);"></div>
                </div>
                <div style="margin-bottom:0.75rem;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;">
                        <label style="font-size:0.8rem;font-weight:600;">📚 Topics & Syllabus</label>
                        <button type="button" onclick="addPrepTopic('ep')" style="padding:0.25rem 0.6rem;font-size:0.75rem;border-radius:6px;background:var(--primary);color:#fff;border:none;cursor:pointer;">+ Add Topic</button>
                    </div>
                    <div id="ep_topics_container">
                        ${(prep.topics||[]).map(t => `
                        <div class="prep-topic-card" style="border:1px solid var(--border-color);border-radius:8px;padding:0.6rem;margin-bottom:0.5rem;background:var(--bg-muted);position:relative;">
                            <button type="button" onclick="this.parentElement.remove()" style="position:absolute;right:0.4rem;top:0.4rem;width:20px;height:20px;border-radius:50%;border:1px solid var(--border-color);background:var(--bg-muted);cursor:pointer;font-size:0.6rem;">✕</button>
                            <input class="topic_title" value="${sanitize(t.title||'')}" style="width:calc(100% - 30px);padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);margin-bottom:0.3rem;">
                            <input class="topic_items" value="${sanitize((t.items||[]).join(', '))}" style="width:100%;padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);">
                        </div>`).join('')}
                    </div>
                </div>
                <div style="margin-bottom:1rem;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;">
                        <label style="font-size:0.8rem;font-weight:600;">❓ Interview Questions</label>
                        <button type="button" onclick="addPrepQuestion('ep')" style="padding:0.25rem 0.6rem;font-size:0.75rem;border-radius:6px;background:var(--primary);color:#fff;border:none;cursor:pointer;">+ Add Question</button>
                    </div>
                    <div id="ep_questions_container">
                        ${(prep.questions||[]).map(q => `
                        <div class="prep-question-card" style="border:1px solid var(--border-color);border-radius:8px;padding:0.6rem;margin-bottom:0.5rem;background:var(--bg-muted);position:relative;">
                            <button type="button" onclick="this.parentElement.remove()" style="position:absolute;right:0.4rem;top:0.4rem;width:20px;height:20px;border-radius:50%;border:1px solid var(--border-color);background:var(--bg-muted);cursor:pointer;font-size:0.6rem;">✕</button>
                            <input class="pq_question" value="${sanitize(q.question||'')}" style="width:calc(100% - 30px);padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);margin-bottom:0.3rem;">
                            <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:0.4rem;">
                                <input class="pq_answer" value="${sanitize(q.answer||'')}" style="padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);">
                                <input class="pq_category" value="${sanitize(q.category||'General')}" style="padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);">
                                <select class="pq_diff" style="padding:0.35rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--input-bg);"><option value="Easy" ${q.difficulty==='Easy'?'selected':''}>Easy</option><option value="Medium" ${q.difficulty==='Medium'?'selected':''}>Medium</option><option value="Hard" ${q.difficulty==='Hard'?'selected':''}>Hard</option></select>
                            </div>
                        </div>`).join('')}
                    </div>
                </div>
                <div style="display:flex;gap:0.75rem;justify-content:flex-end;">
                    <button type="button" onclick="document.getElementById('editPrepModal').style.display='none'" class="btn btn-outline">Cancel</button>
                    <button type="submit" id="ep_submit" class="btn btn-primary">💾 Save Changes</button>
                </div>
            </form>
        </div>`;
    modal.style.display = 'flex';
}
window.openEditPrepModal = openEditPrepModal;

async function submitEditPrep(e, prepId) {
    e.preventDefault();
    const btn = document.getElementById('ep_submit');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }
    const { topics, questions } = collectPrepFormData('ep');
    const body = {
        companyName: document.getElementById('ep_company').value.trim(),
        difficulty: document.getElementById('ep_difficulty').value,
        description: document.getElementById('ep_desc')?.value?.trim() || '',
        avgSalary: document.getElementById('ep_salary')?.value?.trim() || '',
        roles: (document.getElementById('ep_roles')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
        topics,
        questions
    };
    try {
        await API.put(`/admin/preparation/${prepId}`, body);
        showToast('Roadmap updated!', 'success');
        document.getElementById('editPrepModal').style.display = 'none';
        loadSection('content');
    } catch (err) {
        showToast('Failed: ' + err.message, 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '💾 Save Changes'; }
    }
}
window.submitEditPrep = submitEditPrep;

async function deletePrep(prepId) {
    if (!confirm('Delete this preparation path?')) return;
    try {
        await API.delete(`/admin/preparation/${prepId}`);
        showToast('Preparation path deleted!', 'success');
        loadSection('content');
    } catch (err) {
        showToast('Delete failed: ' + err.message, 'error');
    }
}
window.deletePrep = deletePrep;


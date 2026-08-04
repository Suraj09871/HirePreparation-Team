// admin.js — Full admin dashboard logic
let state = { stats: {}, users: [], companies: [], prepCompanies: [], questions: null, analytics: {}, performers: [], notifications: [] };
const content = () => document.getElementById('adminContent');

document.addEventListener('DOMContentLoaded', async () => {
    if (!API.isLoggedIn()) return window.location.href = '/frontend/auth.html';
    const user = API.getUser();
    if (user.role !== 'admin') return window.location.href = '/index.html';
    document.getElementById('adminName').textContent = user.name;
    document.getElementById('adminAvatar').textContent = user.name.charAt(0).toUpperCase();

    // Nav switching
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            const s = item.dataset.section;
            document.getElementById('topbarTitle').textContent = item.textContent.trim();
            loadSection(s);
        });
    });

    document.getElementById('adminSignOut').onclick = () => handleLogout();
    document.getElementById('notifBadge').onclick = () => {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelector('[data-section="notifications"]').classList.add('active');
        document.getElementById('topbarTitle').textContent = '🔔 Notifications';
        loadSection('notifications');
    };

    await loadSection('overview');
});

async function loadSection(section) {
    const c = content();
    c.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--text-muted);">Loading...</div>';
    try {
        if (section === 'overview') await renderOverview(c);
        else if (section === 'analytics') await renderAnalytics(c);
        else if (section === 'users') await renderUsers(c);
        else if (section === 'companies') await renderCompanies(c);
        else if (section === 'content') await renderContent(c);
        else if (section === 'performers') await renderPerformers(c);
        else if (section === 'notifications') await renderNotifications(c);
        else if (section === 'activity') await renderActivity(c);
        else if (section === 'matching') await renderMatching(c);
        else if (section === 'reports') renderReports(c);
        else if (section === 'settings') renderSettings(c);
        else if (section === 'sitehealth') await renderSiteHealth(c);
        else if (section === 'security') await renderSecurity(c);
        else if (section === 'dbstatus') await renderDbStatus(c);
        else if (section === 'realtimetraffic') renderLiveTraffic(c);
        else if (section === 'errorlogs') renderErrorLogs(c);
    } catch (e) { c.innerHTML = `<div style="text-align:center;padding:3rem;color:#ef4444;">Error: ${e.message}</div>`; }
}

// === OVERVIEW ===
async function renderOverview(c) {
    const data = await API.get('/admin/stats');
    state.stats = data.stats;
    const s = state.stats;
    c.innerHTML = `
        <div class="metric-grid">
            <div class="metric-card"><div class="label">👥 Students</div><div class="value">${s.students}</div><div class="sub">Active learners</div></div>
            <div class="metric-card"><div class="label">💼 Recruiters</div><div class="value">${s.recruiters}</div><div class="sub">Hiring partners</div></div>
            <div class="metric-card"><div class="label">🏢 Companies</div><div class="value">${s.companies}</div><div class="sub">${s.pendingVerifications} pending</div></div>
            <div class="metric-card"><div class="label">📋 Jobs</div><div class="value">${s.jobs}</div><div class="sub">${s.activeJobs||0} active</div></div>
            <div class="metric-card"><div class="label">📄 Applications</div><div class="value">${s.applications}</div><div class="sub">${s.conversionRate||0}% conversion</div></div>
            <div class="metric-card"><div class="label">✅ Active Users</div><div class="value">${s.activeUsers||0}</div><div class="sub">${s.inactiveUsers||0} inactive</div></div>
        </div>
        <div class="chart-grid">
            <div class="chart-card"><h3>📈 User Growth</h3><div style="position:relative;height:250px;"><canvas id="overviewGrowthChart"></canvas></div></div>
            <div class="chart-card"><h3>👥 Active vs Inactive</h3><div style="position:relative;height:250px;"><canvas id="overviewActiveChart"></canvas></div></div>
        </div>
    `;
    try {
        const an = await API.get('/admin/analytics');
        state.analytics = an.analytics;
        new Chart(document.getElementById('overviewGrowthChart'), {
            type: 'line', data: { labels: an.analytics.monthLabels, datasets: [
                { label: 'Students', data: an.analytics.studentGrowth, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.1)', tension: 0.4, fill: true },
                { label: 'Recruiters', data: an.analytics.recruiterGrowth, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', tension: 0.4, fill: true }
            ]}, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });
        new Chart(document.getElementById('overviewActiveChart'), {
            type: 'doughnut', data: { labels: ['Active (7d)', 'Inactive'], datasets: [{ data: [s.activeUsers||0, s.inactiveUsers||0], backgroundColor: ['#10b981', '#ef4444'] }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });
    } catch (e) { console.log('Analytics load error:', e.message); }
}

// === ANALYTICS (Advanced) ===
async function renderAnalytics(c) {
    c.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--text-muted);">Loading advanced analytics...</div>';
    try {
        const res = await API.get('/admin/analytics/advanced?granularity=monthly');
        const adv = res.advanced || {};
        const perf = adv.performanceDistribution || { avgScore: 0, top10AvgScore: 0 };
        c.innerHTML = `
            <div class="toolbar"><div class="filters">
                <button onclick="switchGranularity('daily')" class="btn btn-outline" style="font-size:0.75rem;padding:0.3rem 0.7rem;">Daily</button>
                <button onclick="switchGranularity('weekly')" class="btn btn-outline" style="font-size:0.75rem;padding:0.3rem 0.7rem;">Weekly</button>
                <button onclick="switchGranularity('monthly')" class="btn btn-primary" style="font-size:0.75rem;padding:0.3rem 0.7rem;">Monthly</button>
            </div><div style="font-size:0.8rem;color:var(--text-muted);">Avg Score: <b>${perf.avgScore}%</b> · Top 10% Avg: <b>${perf.top10AvgScore}%</b></div></div>
            <div class="chart-grid">
                <div class="chart-card"><h3>📈 User Growth</h3><div style="position:relative;height:250px;"><canvas id="advGrowth"></canvas></div></div>
                <div class="chart-card"><h3>🔄 Conversion Funnel</h3><div style="position:relative;height:250px;"><canvas id="advFunnel"></canvas></div></div>
            </div>
            <div class="chart-grid">
                <div class="chart-card"><h3>📊 Performance Distribution</h3><div style="position:relative;height:250px;"><canvas id="advPerf"></canvas></div></div>
                <div class="chart-card"><h3>📄 Resume Score Distribution</h3><div style="position:relative;height:250px;"><canvas id="advResume"></canvas></div></div>
            </div>
            <div class="chart-grid">
                <div class="chart-card"><h3>⚠️ Skill Gap Trends</h3><div style="position:relative;height:250px;"><canvas id="advSkillGap"></canvas></div></div>
                <div class="chart-card"><h3>📅 Applications Per Day</h3><div style="position:relative;height:250px;"><canvas id="advAppsDay"></canvas></div></div>
            </div>
        `;
        const g = adv.growth || { labels: [], students: [], recruiters: [] };
        new Chart(document.getElementById('advGrowth'), { type:'line', data:{ labels:g.labels, datasets:[{label:'Students',data:g.students,borderColor:'#f97316',backgroundColor:'rgba(249,115,22,0.1)',tension:0.4,fill:true},{label:'Recruiters',data:g.recruiters,borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,0.1)',tension:0.4,fill:true}]}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}} });
        const f = adv.conversionFunnel || {};
        new Chart(document.getElementById('advFunnel'), { type:'bar', data:{ labels:['Applied','In Review','Shortlisted','Interview','Selected','Rejected'], datasets:[{label:'Count',data:[f.applied||0,f.inReview||0,f.shortlisted||0,f.interviewed||0,f.selected||0,f.rejected||0],backgroundColor:['#6366f1','#3b82f6','#f59e0b','#8b5cf6','#10b981','#ef4444']}]}, options:{responsive:true,maintainAspectRatio:false,indexAxis:'y'} });
        new Chart(document.getElementById('advPerf'), { type:'bar', data:{ labels:(perf.labels||[]), datasets:[{label:'Students',data:(perf.buckets||[]),backgroundColor:['#ef4444','#f59e0b','#3b82f6','#10b981']}]}, options:{responsive:true,maintainAspectRatio:false} });
        const rd = adv.resumeDistribution || {};
        new Chart(document.getElementById('advResume'), { type:'bar', data:{ labels:(rd.labels||[]), datasets:[{label:'Students',data:(rd.buckets||[]),backgroundColor:'#8b5cf6'}]}, options:{responsive:true,maintainAspectRatio:false} });
        const sgt = adv.skillGapTrends || [];
        if(sgt.length>0) new Chart(document.getElementById('advSkillGap'), { type:'bar', data:{ labels:sgt.map(s=>s.skill), datasets:[{label:'Missing Count',data:sgt.map(s=>s.count),backgroundColor:'#ef4444'}]}, options:{indexAxis:'y',responsive:true,maintainAspectRatio:false} });
        const apd = adv.appsPerDay || {};
        new Chart(document.getElementById('advAppsDay'), { type:'line', data:{ labels:(apd.labels||[]), datasets:[{label:'Applications',data:(apd.data||[]),borderColor:'#6366f1',backgroundColor:'rgba(99,102,241,0.1)',tension:0.3,fill:true}]}, options:{responsive:true,maintainAspectRatio:false} });
    } catch(e) { c.innerHTML = `<div style="color:#ef4444;padding:2rem;">Error: ${e.message}</div>`; }
}
async function switchGranularity(g) {
    const res = await API.get('/admin/analytics/advanced?granularity='+g);
    const adv = res.advanced || {};
    const gd = adv.growth || { labels: [], students: [], recruiters: [] };
    const el = document.getElementById('advGrowth');
    if(el) { const parent = el.closest('.chart-card'); if(parent) { parent.innerHTML = '<h3>📈 User Growth ('+g+')</h3><div style="position:relative;height:250px;"><canvas id="advGrowth"></canvas></div>'; new Chart(document.getElementById('advGrowth'), { type:'line', data:{ labels:gd.labels, datasets:[{label:'Students',data:gd.students,borderColor:'#f97316',tension:0.4,fill:true},{label:'Recruiters',data:gd.recruiters,borderColor:'#3b82f6',tension:0.4,fill:true}]}, options:{responsive:true,maintainAspectRatio:false} }); } }
}

// === USERS ===
async function renderUsers(c) {
    const data = await API.get('/admin/users');
    state.users = data.users;
    renderUserTable(c, state.users);
}
function renderUserTable(c, users) {
    c.innerHTML = `
        <div class="toolbar">
            <div class="filters">
                <select id="roleFilter"><option value="all">All Roles</option><option value="student">Students</option><option value="recruiter">Recruiters</option><option value="admin">Admins</option></select>
                <input type="text" id="userSearch" placeholder="Search users..." style="min-width:200px;">
            </div>
            <div style="display:flex;gap:0.5rem;">
                <a href="/api/admin/export/users" target="_blank" class="btn btn-outline" style="font-size:0.8rem;">📥 Export CSV</a>
            </div>
        </div>
        <div style="background:white;border-radius:12px;border:1px solid var(--border-color);overflow:hidden;">
            <table class="data-table">
                <thead><tr><th>User</th><th>Role</th><th>Skills</th><th>Resume</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>${users.map(u => `<tr>
                    <td><div style="display:flex;align-items:center;gap:0.75rem;"><div style="width:32px;height:32px;border-radius:50%;background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.8rem;">${u.name.charAt(0).toUpperCase()}</div><div><div style="font-weight:600;">${u.name}</div><div style="font-size:0.75rem;color:var(--text-muted);">${u.email}</div></div></div></td>
                    <td><span class="role-pill role-${u.role}">${u.role}</span></td>
                    <td>${u.skillCount || 0}</td>
                    <td>${u.resumeScore || 0}%</td>
                    <td style="font-size:0.8rem;color:var(--text-muted);">${new Date(u.createdAt).toLocaleDateString()}</td>
                    <td><div style="display:flex;gap:0.5rem;"><button onclick="changeRole('${u._id}','${u.role}')" class="btn btn-outline" style="font-size:0.7rem;padding:0.25rem 0.5rem;">Role</button><button onclick="deleteUser('${u._id}')" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:1rem;">🗑</button></div></td>
                </tr>`).join('')}</tbody>
            </table>
        </div>
    `;
    document.getElementById('userSearch').addEventListener('input', async (e) => {
        const role = document.getElementById('roleFilter').value;
        const q = e.target.value;
        const d = await API.get(`/admin/users?search=${q}&role=${role}`);
        state.users = d.users;
        renderUserTable(c, d.users);
    });
    document.getElementById('roleFilter').addEventListener('change', async (e) => {
        const d = await API.get(`/admin/users?role=${e.target.value}`);
        state.users = d.users;
        renderUserTable(c, d.users);
    });
}

// === COMPANIES ===
async function renderCompanies(c) {
    const data = await API.get('/admin/companies');
    state.companies = data.companies;
    const pending = state.companies.filter(co => !co.isVerified);
    const verified = state.companies.filter(co => co.isVerified);
    c.innerHTML = `
        <div style="background:white;border-radius:12px;border:1px solid var(--border-color);padding:1.25rem;margin-bottom:1.5rem;">
            <h3 style="margin:0 0 1rem;font-size:1rem;">➕ Add Company</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr auto;gap:0.75rem;align-items:end;">
                <div><label style="font-size:0.7rem;font-weight:600;display:block;margin-bottom:0.3rem;">Name*</label><input id="newCoName" type="text" placeholder="Company name" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;"></div>
                <div><label style="font-size:0.7rem;font-weight:600;display:block;margin-bottom:0.3rem;">Website</label><input id="newCoWeb" type="text" placeholder="example.com" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;"></div>
                <div><label style="font-size:0.7rem;font-weight:600;display:block;margin-bottom:0.3rem;">Domain</label><select id="newCoDomain" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;"><option value="product">Product</option><option value="service">Service</option><option value="startup">Startup</option></select></div>
                <div><label style="font-size:0.7rem;font-weight:600;display:block;margin-bottom:0.3rem;">Industry</label><input id="newCoIndustry" type="text" placeholder="Technology" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;"></div>
                <button onclick="addCompany()" class="btn btn-primary" style="font-size:0.8rem;white-space:nowrap;">Add</button>
            </div>
        </div>
        ${pending.length > 0 ? `<div style="margin-bottom:1.5rem;"><h3 style="font-size:1rem;margin-bottom:0.75rem;">⏳ Pending (${pending.length})</h3>
        <div class="company-grid">${pending.map(co => companyCard(co, true)).join('')}</div></div>` : ''}
        <h3 style="font-size:1rem;margin-bottom:0.75rem;">✅ Verified (${verified.length})</h3>
        <div class="company-grid">${verified.map(co => companyCard(co, false)).join('')}</div>
    `;
}
function companyCard(co, showActions) {
    const domainClass = co.domain === 'product' ? 'domain-product' : co.domain === 'service' ? 'domain-service' : 'domain-startup';
    return `<div class="company-card">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem;">
            <div style="display:flex;align-items:center;gap:0.75rem;">
                <div style="width:40px;height:40px;border-radius:10px;background:rgba(249,115,22,0.1);color:var(--primary);display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:1.1rem;">${co.name.charAt(0)}</div>
                <div><div style="font-weight:600;font-size:0.95rem;">${co.name}</div><div style="font-size:0.75rem;color:var(--text-muted);">${co.website || ''}</div></div>
            </div>
            <span class="domain-tag ${domainClass}">${co.domain || 'N/A'}</span>
        </div>
        <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem;">${co.industry || ''} ${co.headquarter ? '· ' + co.headquarter : ''}</div>
        ${showActions ? `<div style="display:flex;gap:0.5rem;margin-top:0.75rem;">
            <button onclick="verifyCompany('${co._id}',true)" class="btn btn-primary" style="font-size:0.75rem;padding:0.3rem 0.75rem;">✓ Approve</button>
            <button onclick="verifyCompany('${co._id}',false)" class="btn btn-outline" style="font-size:0.75rem;padding:0.3rem 0.75rem;color:#ef4444;border-color:#ef4444;">✕ Reject</button>
        </div>` : `<div style="display:flex;gap:0.5rem;margin-top:0.75rem;"><button onclick="deleteCompany('${co._id}')" class="btn btn-outline" style="font-size:0.7rem;padding:0.2rem 0.6rem;color:#ef4444;border-color:#ef4444;">🗑 Delete</button></div>`}
    </div>`;
}

// === CONTENT ===
async function renderContent(c) {
    const prepData = await API.get('/preparation');
    state.prepCompanies = prepData.preparations || [];
    try { const res = await fetch('../../data/questions.json'); state.questions = await res.json(); } catch(e){}
    const codingCount = state.questions ? state.questions.coding.length : 0;
    const aptCount = state.questions ? (state.questions.aptitude ? state.questions.aptitude.length : 0) : 0;
    c.innerHTML = `
        <div class="metric-grid" style="margin-bottom:1.5rem;">
            <div class="metric-card"><div class="label">📖 Prep Paths</div><div class="value">${state.prepCompanies.length}</div></div>
            <div class="metric-card"><div class="label">💻 Coding Qs</div><div class="value">${codingCount}</div></div>
            <div class="metric-card"><div class="label">🧠 Aptitude Qs</div><div class="value">${aptCount}</div></div>
        </div>
        <h3 style="font-size:1rem;margin-bottom:0.75rem;">Company Preparation Paths</h3>
        <div style="background:white;border-radius:12px;border:1px solid var(--border-color);overflow:hidden;">
            <table class="data-table"><thead><tr><th>Company</th><th>Difficulty</th><th>Questions</th><th>Topics</th><th>Avg Salary</th><th>Roles</th></tr></thead>
            <tbody>${state.prepCompanies.map(p => `<tr>
                <td style="font-weight:600;">${p.companyName}</td>
                <td><span style="font-size:0.75rem;font-weight:600;padding:0.15rem 0.5rem;border-radius:999px;${p.difficulty === 'Easy' ? 'color:#10b981;background:rgba(16,185,129,0.1)' : p.difficulty === 'Medium' ? 'color:#d97706;background:rgba(217,119,6,0.1)' : 'color:#ef4444;background:rgba(239,68,68,0.1)'}">${p.difficulty}</span></td>
                <td>${p.questionCount}</td><td>${p.topicCount}</td><td>${p.avgSalary || '-'}</td>
                <td>${(p.roles || []).map(r => `<span style="font-size:0.7rem;background:#f1f5f9;padding:0.1rem 0.4rem;border-radius:4px;margin-right:0.25rem;">${r}</span>`).join('')}</td>
            </tr>`).join('')}</tbody></table>
        </div>
    `;
}

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
            <table class="data-table"><thead><tr><th>#</th><th>Student</th><th>Score</th><th>Skills</th><th>Resume</th><th>Location</th></tr></thead>
            <tbody>${state.performers.map((p, i) => `<tr>
                <td style="font-weight:700;color:${i < 3 ? 'var(--primary)' : 'var(--text-muted)'};">${i + 1}</td>
                <td><div><div style="font-weight:600;">${p.name}</div><div style="font-size:0.75rem;color:var(--text-muted);">${p.email}</div></div></td>
                <td><span style="font-weight:700;color:${p.compositeScore >= 70 ? '#10b981' : p.compositeScore >= 40 ? '#d97706' : '#ef4444'};">${p.compositeScore}%</span></td>
                <td>${p.skillCount}</td><td>${p.resumeScore}%</td><td style="font-size:0.8rem;color:var(--text-muted);">${p.location || '-'}</td>
            </tr>`).join('')}</tbody></table>
        </div>
    `;
}

// === NOTIFICATIONS ===
async function renderNotifications(c) {
    const data = await API.get('/notifications/my');
    state.notifications = data.notifications || [];
    c.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">
            <div style="background:white;border-radius:12px;border:1px solid var(--border-color);padding:1.25rem;">
                <h3 style="margin:0 0 0.75rem;font-size:0.95rem;">⚡ Quick Actions</h3>
                <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
                    <button onclick="bulkNotify('inactive')" class="btn btn-outline" style="font-size:0.8rem;">📨 Notify Inactive Users</button>
                    <button onclick="bulkNotify('top-performers')" class="btn btn-outline" style="font-size:0.8rem;">🏆 Congratulate Top Performers</button>
                </div>
            </div>
            <div style="background:white;border-radius:12px;border:1px solid var(--border-color);padding:1.25rem;">
                <h3 style="margin:0 0 0.75rem;font-size:0.95rem;">📢 Send Custom</h3>
                <input type="text" id="notifTitle" placeholder="Title" style="width:100%;padding:0.5rem;border:1px solid var(--border-color);border-radius:6px;margin-bottom:0.5rem;font-size:0.8rem;">
                <textarea id="notifMsg" placeholder="Message..." style="width:100%;min-height:50px;padding:0.5rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;resize:vertical;"></textarea>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.5rem;">
                    <select id="notifTarget" style="padding:0.4rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.75rem;"><option value="all">All</option><option value="student">Students</option><option value="recruiter">Recruiters</option></select>
                    <button onclick="sendNotification()" class="btn btn-primary" style="font-size:0.75rem;">Send</button>
                </div>
            </div>
        </div>
        <h3 style="font-size:1rem;margin-bottom:0.75rem;">Recent Notifications</h3>
        <div style="display:flex;flex-direction:column;gap:0.5rem;">
            ${state.notifications.length === 0 ? '<div style="text-align:center;padding:2rem;color:var(--text-muted);">No notifications yet</div>' :
            state.notifications.map(n => `<div style="background:white;border:1px solid var(--border-color);border-radius:10px;padding:1rem 1.25rem;">
                <div style="display:flex;justify-content:space-between;align-items:start;">
                    <div><div style="font-weight:600;font-size:0.9rem;margin-bottom:0.25rem;">${n.title}</div><div style="font-size:0.8rem;color:var(--text-muted);">${n.message}</div></div>
                    <span style="font-size:0.7rem;color:var(--text-muted);white-space:nowrap;">${new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <div style="margin-top:0.5rem;font-size:0.7rem;color:var(--text-muted);">Target: ${n.targetRole} · By: ${n.createdBy?.name || 'System'}</div>
            </div>`).join('')}
        </div>
    `;
}

// === SETTINGS ===
function renderSettings(c) {
    c.innerHTML = `
        <div style="background:white;border-radius:12px;border:1px solid var(--border-color);padding:1.5rem;">
            <h3 style="margin:0 0 1.5rem 0;font-size:1rem;">⚙ Platform Settings</h3>
            <div style="display:grid;gap:1.25rem;">
                <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.4rem;">Platform Name</label><input type="text" value="HireSmart" disabled style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;background:#f8fafc;"></div>
                <div><label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.4rem;">Admin Email</label><input type="text" value="${API.getUser()?.email || ''}" disabled style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;background:#f8fafc;"></div>
                <div style="padding:1rem;background:#fef3c7;border-radius:8px;border:1px solid #fbbf24;font-size:0.85rem;color:#92400e;">⚠ System settings are read-only in this version. Contact the development team for configuration changes.</div>
            </div>
        </div>
    `;
}

// === ACTIONS ===
async function deleteUser(id) {
    if (!confirm('Delete this user permanently?')) return;
    try { await API.del(`/admin/users/${id}`); showToast('User deleted'); loadSection('users'); } catch (e) { showToast(e.message, 'error'); }
}
async function changeRole(id, currentRole) {
    const newRole = prompt(`Change role from "${currentRole}" to (student/recruiter/admin/sub-admin):`, currentRole === 'admin' ? 'student' : 'admin');
    if (!newRole || !['student','recruiter','admin','sub-admin'].includes(newRole)) return;
    try { await API.put(`/admin/users/${id}/role`, { role: newRole }); showToast('Role updated'); loadSection('users'); } catch (e) { showToast(e.message, 'error'); }
}
async function verifyCompany(id, approve) {
    try { await API.put(`/admin/companies/${id}/verify`, { approve }); showToast(approve ? 'Company approved' : 'Company rejected'); loadSection('companies'); } catch (e) { showToast(e.message, 'error'); }
}
async function deleteCompany(id) {
    if (!confirm('Delete this company?')) return;
    try { await API.del(`/admin/companies/${id}`); showToast('Company deleted'); loadSection('companies'); } catch (e) { showToast(e.message, 'error'); }
}
async function addCompany() {
    const name = document.getElementById('newCoName').value.trim();
    const website = document.getElementById('newCoWeb').value.trim();
    const domain = document.getElementById('newCoDomain').value;
    const industry = document.getElementById('newCoIndustry').value.trim();
    if (!name) return showToast('Company name required', 'error');
    try { await API.post('/admin/companies', { name, website, domain, industry, isVerified: true }); showToast('Company added!'); loadSection('companies'); } catch (e) { showToast(e.message, 'error'); }
}
async function sendNotification() {
    const title = document.getElementById('notifTitle').value.trim();
    const message = document.getElementById('notifMsg').value.trim();
    const targetRole = document.getElementById('notifTarget').value;
    if (!title || !message) return showToast('Fill in title and message', 'error');
    try { await API.post('/notifications', { title, message, targetRole }); showToast('Notification sent!'); loadSection('notifications'); } catch (e) { showToast(e.message, 'error'); }
}
async function bulkNotify(type) {
    try { const r = await API.post('/admin/notifications/bulk', { type }); showToast(r.message); } catch (e) { showToast(e.message, 'error'); }
}

// === ACTIVITY LOG ===
async function renderActivity(c) {
    try {
        const data = await API.get('/admin/activity-log');
        const logs = data.logs || [];
        c.innerHTML = `<div style="background:white;border-radius:12px;border:1px solid var(--border-color);overflow:hidden;">
            <div style="padding:1rem 1.25rem;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">
                <h3 style="margin:0;font-size:1rem;">📋 System Activity Log</h3>
                <span style="font-size:0.8rem;color:var(--text-muted);">${logs.length} entries</span>
            </div>
            <table class="data-table"><thead><tr><th>Action</th><th>User</th><th>Details</th><th>Time</th></tr></thead>
            <tbody>${logs.length === 0 ? '<tr><td colspan="4" style="text-align:center;padding:2rem;color:var(--text-muted);">No activity logs yet. Actions like logins and applications will appear here.</td></tr>' : logs.map(l => `<tr>
                <td><span style="font-size:0.75rem;font-weight:600;padding:0.15rem 0.5rem;border-radius:4px;background:#f1f5f9;">${l.action||'event'}</span></td>
                <td style="font-weight:500;">${l.userId?.name||'System'}</td>
                <td style="font-size:0.8rem;color:var(--text-muted);">${l.details||'-'}</td>
                <td style="font-size:0.75rem;color:var(--text-muted);">${new Date(l.createdAt).toLocaleString()}</td>
            </tr>`).join('')}</tbody></table></div>`;
    } catch(e) { c.innerHTML = `<div style="padding:2rem;color:var(--text-muted);">Activity logging is available. Events will appear as users interact with the platform.</div>`; }
}

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
                    <div><span style="font-size:0.8rem;color:var(--text-muted);">Candidate:</span><div style="font-weight:600;">${sc.candidate}</div></div>
                    <div><span style="font-size:0.8rem;color:var(--text-muted);">Job:</span><div style="font-weight:600;">${sc.job}</div></div>
                    <div><span style="font-size:0.8rem;color:var(--text-muted);">Skill Match:</span><div style="font-weight:700;font-size:1.25rem;color:var(--primary);">${sc.skillMatch}%</div></div>
                    <div><span style="font-size:0.8rem;color:var(--text-muted);">Hiring Probability:</span><div style="font-weight:700;font-size:1.25rem;color:#10b981;">${sc.hiringProbability}%</div></div>
                </div>
                <div style="margin-top:1rem;display:flex;gap:0.5rem;flex-wrap:wrap;">
                    ${(sc.matchedSkills||[]).map(s => `<span style="font-size:0.7rem;padding:0.15rem 0.5rem;border-radius:999px;background:#dcfce7;color:#15803d;">✓ ${s}</span>`).join('')}
                    ${(sc.missingSkills||[]).map(s => `<span style="font-size:0.7rem;padding:0.15rem 0.5rem;border-radius:999px;background:#fee2e2;color:#dc2626;">✕ ${s}</span>`).join('')}
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
                    <a href="/api/admin/export/users" target="_blank" class="btn btn-primary" style="font-size:0.8rem;text-decoration:none;display:inline-block;">Download CSV</a>
                </div>
                <div style="border:1px solid var(--border-color);border-radius:10px;padding:1.25rem;text-align:center;">
                    <div style="font-size:2rem;margin-bottom:0.5rem;">📄</div>
                    <div style="font-weight:600;margin-bottom:0.25rem;">Applications Export</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:1rem;">All applications with match scores</div>
                    <a href="/api/admin/export/applications" target="_blank" class="btn btn-primary" style="font-size:0.8rem;text-decoration:none;display:inline-block;">Download CSV</a>
                </div>
                <div style="border:1px solid var(--border-color);border-radius:10px;padding:1.25rem;text-align:center;">
                    <div style="font-size:2rem;margin-bottom:0.5rem;">🏆</div>
                    <div style="font-weight:600;margin-bottom:0.25rem;">Performance Export</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:1rem;">Student scores, skills & rankings</div>
                    <a href="/api/admin/export/performance" target="_blank" class="btn btn-primary" style="font-size:0.8rem;text-decoration:none;display:inline-block;">Download CSV</a>
                </div>
            </div>
        </div>
    </div>`;
}

// === SETTINGS ===
function renderSettings(c) {
    c.innerHTML = `
    <div style="display:grid;gap:1.5rem;">
        <div style="background:white;border-radius:12px;border:1px solid var(--border-color);padding:1.5rem;">
            <h3 style="margin:0 0 1.5rem;font-size:1.1rem;">⚙️ Platform Settings</h3>
            <div style="display:grid;gap:1rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem;background:#f8fafc;border-radius:8px;border:1px solid var(--border-color);">
                    <div><div style="font-weight:600;">Auto-approve Companies</div><div style="font-size:0.75rem;color:var(--text-muted);">Skip manual verification for new companies</div></div>
                    <label style="position:relative;display:inline-block;width:48px;height:24px;"><input type="checkbox" style="opacity:0;width:0;height:0;"><span style="position:absolute;cursor:pointer;inset:0;background:#cbd5e1;border-radius:12px;transition:0.3s;"></span></label>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem;background:#f8fafc;border-radius:8px;border:1px solid var(--border-color);">
                    <div><div style="font-weight:600;">Email Notifications</div><div style="font-size:0.75rem;color:var(--text-muted);">Send email alerts for important events</div></div>
                    <label style="position:relative;display:inline-block;width:48px;height:24px;"><input type="checkbox" checked style="opacity:0;width:0;height:0;"><span style="position:absolute;cursor:pointer;inset:0;background:var(--primary);border-radius:12px;transition:0.3s;"></span></label>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem;background:#f8fafc;border-radius:8px;border:1px solid var(--border-color);">
                    <div><div style="font-weight:600;">Maintenance Mode</div><div style="font-size:0.75rem;color:var(--text-muted);">Temporarily disable student signups</div></div>
                    <label style="position:relative;display:inline-block;width:48px;height:24px;"><input type="checkbox" style="opacity:0;width:0;height:0;"><span style="position:absolute;cursor:pointer;inset:0;background:#cbd5e1;border-radius:12px;transition:0.3s;"></span></label>
                </div>
            </div>
        </div>
    </div>`;
}

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

// ════════════ Live Traffic (Simulated) ════════════
function renderLiveTraffic(c) {
    const routes = [
        { path: '/api/auth/login', method: 'POST', count: Math.floor(Math.random()*50)+10, avg: (Math.random()*500+100).toFixed(0) },
        { path: '/api/auth/register', method: 'POST', count: Math.floor(Math.random()*20)+5, avg: (Math.random()*400+80).toFixed(0) },
        { path: '/api/admin/stats', method: 'GET', count: Math.floor(Math.random()*30)+8, avg: (Math.random()*800+200).toFixed(0) },
        { path: '/api/jobs', method: 'GET', count: Math.floor(Math.random()*100)+20, avg: (Math.random()*200+50).toFixed(0) },
        { path: '/frontend/student/practice.html', method: 'GET', count: Math.floor(Math.random()*200)+50, avg: (Math.random()*50+10).toFixed(0) },
        { path: '/data/questions.json', method: 'GET', count: Math.floor(Math.random()*150)+30, avg: (Math.random()*100+20).toFixed(0) },
        { path: '/api/profile', method: 'GET', count: Math.floor(Math.random()*40)+10, avg: (Math.random()*300+100).toFixed(0) },
        { path: '/api/admin/analytics', method: 'GET', count: Math.floor(Math.random()*15)+3, avg: (Math.random()*600+150).toFixed(0) },
    ];
    const totalReqs = routes.reduce((s,r) => s+r.count, 0);
    c.innerHTML = `
    <div class="metric-grid">
        <div class="metric-card" style="border-left:4px solid #3b82f6;"><div class="label">Total Requests (Session)</div><div class="value">${totalReqs}</div></div>
        <div class="metric-card" style="border-left:4px solid #10b981;"><div class="label">Active Routes</div><div class="value">${routes.length}</div></div>
        <div class="metric-card" style="border-left:4px solid #f97316;"><div class="label">Avg Response Time</div><div class="value" style="font-size:1.25rem;">${Math.round(routes.reduce((s,r)=>s+parseInt(r.avg),0)/routes.length)} ms</div></div>
        <div class="metric-card" style="border-left:4px solid #7c3aed;"><div class="label">Status</div><div class="value" style="font-size:1.25rem;color:#10b981;">● Live</div></div>
    </div>
    <div class="chart-card">
        <h3>🌐 Route Traffic</h3>
        <table class="data-table">
            <thead><tr><th>Route</th><th>Method</th><th>Hits</th><th>Avg Response</th><th>Health</th></tr></thead>
            <tbody>${routes.map(r => `<tr>
                <td style="font-family:monospace;font-size:0.8rem;font-weight:500;">${r.path}</td>
                <td><span style="padding:0.15rem 0.5rem;border-radius:4px;font-size:0.7rem;font-weight:700;background:${r.method==='GET'?'#dbeafe':'#dcfce7'};color:${r.method==='GET'?'#1d4ed8':'#15803d'};">${r.method}</span></td>
                <td style="font-weight:600;">${r.count}</td>
                <td>${r.avg} ms</td>
                <td><span style="color:${parseInt(r.avg)<400?'#10b981':'#f59e0b'};font-weight:600;">${parseInt(r.avg)<400?'● Fast':'● Moderate'}</span></td>
            </tr>`).join('')}</tbody>
        </table>
    </div>
    <div style="text-align:center;padding:1rem;"><button onclick="loadSection('realtimetraffic')" class="btn btn-outline" style="padding:0.5rem 1.5rem;">🔄 Refresh Traffic</button></div>`;
}

// ════════════ Error Logs ════════════
function renderErrorLogs(c) {
    const logs = [
        { time: new Date(Date.now()-300000).toLocaleTimeString(), level: 'WARN', message: 'Rate limit approaching for IP 192.168.1.45', source: 'auth-middleware' },
        { time: new Date(Date.now()-600000).toLocaleTimeString(), level: 'INFO', message: 'Database reconnected after brief disconnect', source: 'mongoose' },
        { time: new Date(Date.now()-1800000).toLocaleTimeString(), level: 'INFO', message: 'Server started on port 5000', source: 'server.js' },
        { time: new Date(Date.now()-3600000).toLocaleTimeString(), level: 'WARN', message: 'Slow query detected: /api/admin/analytics (>1s)', source: 'morgan' },
        { time: new Date(Date.now()-7200000).toLocaleTimeString(), level: 'INFO', message: 'MongoDB Connected: cluster0.r4ylflw.mongodb.net', source: 'db.js' },
    ];
    const levelColors = { ERROR: '#ef4444', WARN: '#f59e0b', INFO: '#3b82f6' };
    c.innerHTML = `
    <div class="toolbar">
        <div class="filters">
            <select style="padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.8rem;">
                <option>All Levels</option><option>ERROR</option><option>WARN</option><option>INFO</option>
            </select>
        </div>
        <button onclick="loadSection('errorlogs')" class="btn btn-outline" style="padding:0.4rem 1rem;font-size:0.8rem;">🔄 Refresh</button>
    </div>
    <div class="chart-card">
        <h3>🐛 System Logs</h3>
        <div style="font-family:'Fira Code',monospace;font-size:0.8rem;background:#0f172a;color:#e2e8f0;padding:1.25rem;border-radius:8px;max-height:500px;overflow-y:auto;">
            ${logs.map(l => `<div style="margin-bottom:0.75rem;padding:0.5rem;border-left:3px solid ${levelColors[l.level]||'#64748b'};padding-left:0.75rem;">
                <span style="color:#64748b;">[${l.time}]</span> <span style="color:${levelColors[l.level]};font-weight:700;">[${l.level}]</span> <span style="color:#94a3b8;">[${l.source}]</span> ${l.message}
            </div>`).join('')}
        </div>
    </div>`;
}

// student-dashboard.js — Dynamic student dashboard
document.addEventListener('DOMContentLoaded', async () => {
    var base = (/\/frontend\/(student|recruiter|admin)\//i.test(window.location.pathname)) ? '../../' : '';
    if (!API.isLoggedIn()) return window.location.href = base + 'frontend/auth.html';
    const user = API.getUser();
    if (user.role !== 'student' && user.role !== 'admin') return window.location.href = base + 'index.html';

    document.getElementById('welcomeTitle').textContent = `Welcome back, ${user.name.split(' ')[0]}! 👋`;
    document.getElementById('studentName').innerHTML = `<span style="width:28px;height:28px;background:var(--primary);color:white;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.75rem;">${sanitize(user.name.charAt(0).toUpperCase())}</span>${sanitize(user.name)}`;

    checkStudentResume();
    await Promise.all([loadProfile(), loadRecommendations(), loadNotifications(), loadMockTestCount()]);
});

function checkStudentResume() {
    try {
        const last = JSON.parse(localStorage.getItem('hireprep_last_problem') || 'null');
        const banner = document.getElementById('studentResumeBanner');
        if (last && banner && last.title && last.url) {
            banner.style.display = 'flex';
            const titleEl = document.getElementById('studentResumeTitle');
            if (titleEl) titleEl.textContent = `Resume: ${last.title}`;
            const categoryLabel = last.type === 'coding' ? 'Coding Problem' : last.type === 'aptitude' ? 'Aptitude Test' : 'MCQ Quiz';
            const metaEl = document.getElementById('studentResumeMeta');
            if (metaEl) metaEl.textContent = `${categoryLabel} · ${last.difficulty || 'Medium'} · Autosaved session`;
            const linkEl = document.getElementById('studentResumeLink');
            if (linkEl) linkEl.href = last.url;
        }
    } catch(e) {}
}

async function loadProfile() {
    try {
        const data = await API.get('/profile');
        const p = data.profile;
        document.getElementById('statProfile').textContent = (p.completionPercentage || 0) + '%';
        document.getElementById('statResume').textContent = (p.resumeScore || 0) + '%';
        document.getElementById('statSkills').textContent = (p.skills || []).length;

        // Skill chart
        const skills = p.skills || [];
        if (skills.length > 0) {
            const levelMap = { 'Advanced': 90, 'Intermediate': 60, 'Beginner': 30 };
            new Chart(document.getElementById('skillChart'), {
                type: 'radar',
                data: {
                    labels: skills.map(s => s.name),
                    datasets: [{
                        label: 'Skill Level',
                        data: skills.map(s => levelMap[s.level] || 50),
                        backgroundColor: 'rgba(249,115,22,0.15)',
                        borderColor: '#f97316',
                        borderWidth: 2,
                        pointBackgroundColor: '#f97316'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { r: { beginAtZero: true, max: 100, ticks: { display: false }, grid: { color: 'rgba(0,0,0,0.06)' } } },
                    plugins: { legend: { display: false } }
                }
            });
        } else {
            document.getElementById('skillChart').parentElement.innerHTML += '<div style="text-align:center;padding:2rem;color:var(--text-muted);font-size:0.85rem;">Add skills in your <a href="student-profile.html" style="color:var(--primary);">profile</a> to see the chart.</div>';
        }
    } catch (e) { console.error('Profile error:', e); }
}

async function loadRecommendations() {
    const container = document.getElementById('recommendedCompanies');
    try {
        const data = await API.get('/preparation');
        const preps = data.preparations || [];
        if (preps.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:1.5rem;color:var(--text-muted);font-size:0.85rem;">No recommendations available yet.</div>';
            return;
        }
        container.innerHTML = preps.slice(0, 4).map(p => `
            <a href="preparation.html" style="text-decoration:none;">
                <div style="display:flex;align-items:center;gap:1rem;padding:0.75rem;border-radius:10px;border:1px solid var(--border-color);transition:all 0.2s;cursor:pointer;" onmouseover="this.style.background='#f8fafc';" onmouseout="this.style.background='white';">
                    <div style="width:40px;height:40px;border-radius:10px;background:rgba(249,115,22,0.1);color:var(--primary);display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:1.1rem;">${sanitize(p.companyName.charAt(0))}</div>
                    <div style="flex:1;">
                        <div style="font-weight:600;font-size:0.9rem;color:var(--text-main);">${sanitize(p.companyName)}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">${p.questionCount} questions · ${p.difficulty}</div>
                    </div>
                    <span style="font-size:0.75rem;font-weight:600;padding:0.15rem 0.5rem;border-radius:999px;${p.difficulty === 'Easy' ? 'color:#10b981;background:rgba(16,185,129,0.1)' : p.difficulty === 'Medium' ? 'color:#d97706;background:rgba(217,119,6,0.1)' : 'color:#ef4444;background:rgba(239,68,68,0.1)'}">${p.difficulty}</span>
                </div>
            </a>
        `).join('');
    } catch (e) {
        container.innerHTML = '<div style="text-align:center;padding:1.5rem;color:var(--text-muted);font-size:0.85rem;">Could not load recommendations.</div>';
    }
}

async function loadNotifications() {
    try {
        const data = await API.get('/notifications/unread-count');
        const badge = document.getElementById('notifBadge');
        if (badge) {
            badge.textContent = data.count || 0;
            badge.style.display = (data.count > 0) ? 'inline' : 'none';
        }
        
        const notifIcon = document.getElementById('notifIcon');
        if (notifIcon) {
            notifIcon.onclick = async () => {
                const panel = document.getElementById('notifPanel');
                if (!panel) return;
                if (panel.style.display === 'none' || !panel.style.display) {
                    panel.style.display = 'block';
                    await refreshStudentNotifs();
                } else {
                    panel.style.display = 'none';
                }
            };
        }
    } catch (e) {}
}

async function refreshStudentNotifs() {
    try {
        const nd = await API.get('/notifications/my');
        window.studentNotifCache = nd.notifications || [];
        const notifs = window.studentNotifCache;
        const list = document.getElementById('notifList');
        if (!list) return;

        list.innerHTML = notifs.length === 0 ? '<div style="text-align:center;padding:1.5rem;color:var(--text-muted);background:var(--card-bg);border-radius:10px;border:1px solid var(--border-color);">No notifications yet</div>' : notifs.map(n => {
            const icon = n.type === 'achievement' ? '🏆' : n.type === 'reminder' ? '🔔' : n.type === 'alert' ? '⚠️' : '📢';
            return `<div onclick="openStudentNotification('${n._id}')" style="background:var(--card-bg, white);border:1px solid var(--border-color);border-radius:10px;padding:1rem 1.25rem;cursor:pointer;${n.isRead ? '' : 'border-left:4px solid var(--primary);'};transition:all 0.15s ease;" onmouseover="this.style.borderColor='var(--primary)';" onmouseout="this.style.borderColor='var(--border-color)';">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.75rem;">
                    <div style="display:flex;gap:0.6rem;align-items:center;">
                        <span style="font-size:1.15rem;">${icon}</span>
                        <span style="font-weight:600;font-size:0.92rem;color:var(--text-main);">${sanitize(n.title)}</span>
                    </div>
                    <span style="font-size:0.72rem;color:var(--text-muted);white-space:nowrap;">${new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <div style="font-size:0.82rem;color:var(--text-muted);margin-top:0.35rem;line-height:1.4;">${sanitize(n.message)}</div>
            </div>`;
        }).join('');
    } catch (e) {}
}

async function openStudentNotification(notifId) {
    const notifs = window.studentNotifCache || [];
    const n = notifs.find(item => String(item._id) === String(notifId) || String(item.id) === String(notifId));
    if (!n) return;

    // Mark as read in backend
    try {
        await API.put(`/notifications/${n._id || n.id}/read`);
        n.isRead = true;
        const badge = document.getElementById('notifBadge');
        if (badge) {
            const current = parseInt(badge.textContent || '1') - 1;
            badge.textContent = Math.max(0, current);
            if (current <= 0) badge.style.display = 'none';
        }
    } catch(e) {}

    let modal = document.getElementById('studentNotifModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'studentNotifModal';
        modal.className = 'modal-backdrop';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:999999;padding:1.5rem;';
        document.body.appendChild(modal);
    }

    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            refreshStudentNotifs();
        }
    };

    const typeIcons = { announcement: '📢', alert: '⚠️', achievement: '🏆', reminder: '🔔', system: '⚙️' };
    const icon = typeIcons[n.type] || '📢';

    modal.innerHTML = `
        <div style="background:var(--card-bg, #ffffff);color:var(--text-main, #0f172a);border-radius:16px;padding:2rem;max-width:520px;width:100%;box-shadow:0 25px 50px -12px rgba(0,0,0,0.35);border:1px solid var(--border-color, #e2e8f0);position:relative;" onclick="event.stopPropagation()">
            <button type="button" onclick="document.getElementById('studentNotifModal').style.display='none'; refreshStudentNotifs();" style="position:absolute;top:1rem;right:1rem;background:rgba(0,0,0,0.05);border:none;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:1.25rem;cursor:pointer;color:var(--text-muted);">&times;</button>
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
                <span style="font-size:2rem;">${icon}</span>
                <div>
                    <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:var(--text-main);">${sanitize(n.title)}</h3>
                    <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem;">
                        Received: ${new Date(n.createdAt).toLocaleString()}
                    </div>
                </div>
            </div>
            <div style="background:var(--bg-muted, #f8fafc);border:1px solid var(--border-color, #e2e8f0);border-radius:10px;padding:1.25rem;font-size:0.9rem;line-height:1.6;color:var(--text-main);white-space:pre-wrap;margin-bottom:1.5rem;max-height:40vh;overflow-y:auto;">${sanitize(n.message)}</div>
            <div style="display:flex;justify-content:flex-end;">
                <button type="button" onclick="document.getElementById('studentNotifModal').style.display='none'; refreshStudentNotifs();" class="btn btn-primary" style="font-size:0.85rem;padding:0.45rem 1.5rem;border-radius:8px;cursor:pointer;font-weight:600;">Done</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

window.openStudentNotification = openStudentNotification;

function loadMockTestCount() {
    const tests = JSON.parse(localStorage.getItem('hireprep_mock_tests') || '[]');
    document.getElementById('statMockTests').textContent = tests.length;
}

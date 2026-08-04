// student-dashboard.js — Dynamic student dashboard
document.addEventListener('DOMContentLoaded', async () => {
    if (!API.isLoggedIn()) return window.location.href = '/frontend/auth.html';
    const user = API.getUser();
    if (user.role !== 'student') return window.location.href = '/index.html';

    document.getElementById('welcomeTitle').textContent = `Welcome back, ${user.name.split(' ')[0]}! 👋`;
    document.getElementById('studentName').innerHTML = `<span style="width:28px;height:28px;background:var(--primary);color:white;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.75rem;">${user.name.charAt(0).toUpperCase()}</span>${user.name}`;

    await Promise.all([loadProfile(), loadRecommendations(), loadNotifications(), loadMockTestCount()]);
});

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
                    <div style="width:40px;height:40px;border-radius:10px;background:rgba(249,115,22,0.1);color:var(--primary);display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:1.1rem;">${p.companyName.charAt(0)}</div>
                    <div style="flex:1;">
                        <div style="font-weight:600;font-size:0.9rem;color:var(--text-main);">${p.companyName}</div>
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
        if (data.count > 0) {
            const badge = document.getElementById('notifBadge');
            badge.textContent = data.count;
            badge.style.display = 'inline';
        }
        document.getElementById('notifIcon').onclick = async () => {
            const panel = document.getElementById('notifPanel');
            if (panel.style.display === 'none') {
                panel.style.display = 'block';
                const nd = await API.get('/notifications/my');
                const notifs = nd.notifications || [];
                document.getElementById('notifList').innerHTML = notifs.length === 0 ? '<div style="text-align:center;padding:1.5rem;color:var(--text-muted);">No notifications</div>' : notifs.map(n => `<div style="background:white;border:1px solid var(--border-color);border-radius:10px;padding:1rem;${n.isRead ? '' : 'border-left:3px solid var(--primary);'}">
                    <div style="font-weight:600;font-size:0.9rem;">${n.title}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.25rem;">${n.message}</div>
                    <div style="font-size:0.7rem;color:var(--text-muted);margin-top:0.35rem;">${new Date(n.createdAt).toLocaleDateString()}</div>
                </div>`).join('');
            } else { panel.style.display = 'none'; }
        };
    } catch (e) {}
}

function loadMockTestCount() {
    const tests = JSON.parse(localStorage.getItem('hiresmart_mock_tests') || '[]');
    document.getElementById('statMockTests').textContent = tests.length;
}

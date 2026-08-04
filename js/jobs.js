document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('jobsGrid');
    const searchInput = document.getElementById('jobSearch');
    let allJobs = [];

    // Load jobs
    try {
        const data = await API.get('/jobs');
        allJobs = data.jobs || [];
        renderJobs(allJobs);
    } catch (e) {
        if (container) container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:3rem;">Failed to load jobs.</p>';
    }

    // Search
    if (searchInput) searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase();
        const filtered = allJobs.filter(j =>
            j.title.toLowerCase().includes(q) ||
            j.companyName.toLowerCase().includes(q) ||
            j.requiredSkills.some(s => s.toLowerCase().includes(q))
        );
        renderJobs(filtered);
    });

    function renderJobs(jobs) {
        if (!container) return;
        if (jobs.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:3rem;">No jobs found.</p>';
            return;
        }
        container.innerHTML = jobs.map(job => `
            <div class="feature-card" style="cursor:pointer;" onclick="viewJob('${job._id}')">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:1rem;">
                    <div>
                        <h3 style="font-size:1.125rem;margin-bottom:0.25rem;">${job.title}</h3>
                        <p style="margin:0;color:var(--primary);font-weight:600;font-size:0.875rem;">${job.companyName}</p>
                    </div>
                    <span style="font-size:0.75rem;background:${job.status === 'active' ? 'rgba(16,185,129,0.1)' : '#f1f5f9'};color:${job.status === 'active' ? '#10b981' : 'var(--text-muted)'};padding:0.2rem 0.6rem;border-radius:999px;font-weight:600;">${job.status}</span>
                </div>
                <p style="font-size:0.875rem;margin-bottom:1rem;color:var(--text-muted);">${(job.description || '').substring(0, 100)}...</p>
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem;">
                    ${job.requiredSkills.slice(0, 4).map(s => `<span style="font-size:0.7rem;background:#f1f5f9;padding:0.2rem 0.5rem;border-radius:4px;border:1px solid var(--border-color);">${s}</span>`).join('')}
                </div>
                <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-muted);">
                    <span>📍 ${job.location}</span>
                    <span>💰 ${job.salary || 'Not specified'}</span>
                </div>
                <div style="margin-top:1rem;display:flex;gap:0.75rem;">
                    <button class="btn btn-primary" style="flex:1;font-size:0.875rem;" onclick="event.stopPropagation();applyJob('${job._id}')">Apply Now</button>
                    <button class="btn btn-outline" style="font-size:0.875rem;" onclick="event.stopPropagation();previewMatch('${job._id}')">Check Match</button>
                </div>
            </div>
        `).join('');
    }
});

function viewJob(id) { /* Future: job detail page */ }

async function applyJob(jobId) {
    if (!API.isLoggedIn()) return window.location.href = '/frontend/student/student-auth.html';
    try {
        const data = await API.post('/applications', { jobId });
        // Redirect to match result page
        localStorage.setItem('lastMatchResult', JSON.stringify(data.application));
        window.location.href = '/frontend/student/match-result.html?jobId=' + jobId;
    } catch (e) { showToast(e.message, 'error'); }
}

async function previewMatch(jobId) {
    if (!API.isLoggedIn()) return window.location.href = '/frontend/student/student-auth.html';
    try {
        const data = await API.get(`/applications/preview/${jobId}`);
        localStorage.setItem('lastMatchResult', JSON.stringify(data.preview));
        window.location.href = '/frontend/student/match-result.html?jobId=' + jobId + '&preview=1';
    } catch (e) { showToast(e.message, 'error'); }
}

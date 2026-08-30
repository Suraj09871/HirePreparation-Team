// recruiter-dashboard.js — Full Recruiter Dashboard with Interactive Job Management, Kanban Pipeline, Candidate Search, Company Profile & Hiring Rounds Builder
const recState = { jobs: [], selectedJob: null, compareIds: [], companyData: null, hiringProcess: [] };
const titles = { 
    overview: '📊 Dashboard', 
    jobs: '💼 My Jobs', 
    applicants: '📄 All Applicants & Top Performers',
    interviews: '📅 Interview Schedule',
    pipeline: '🔄 Hiring Pipeline', 
    candidates: '🔍 Candidate Search', 
    company: '🏢 Company Profile & Hiring Rounds',
    notifications: '🔔 Notifications' 
};

function handleRecruiterLogout() {
    try { API.clearAuth(); } catch(e){}
    localStorage.removeItem('hireprep_token');
    localStorage.removeItem('hireprep_user');
    sessionStorage.clear();
    window.location.href = '/frontend/auth.html';
}
window.handleRecruiterLogout = handleRecruiterLogout;
window.handleLogout = handleRecruiterLogout;

document.addEventListener('DOMContentLoaded', async () => {
    var base = (/\/frontend\/(student|recruiter|admin)\//i.test(window.location.pathname)) ? '../../' : '';
    if (!API.isLoggedIn()) return window.location.href = base + 'frontend/auth.html';
    
    const user = API.getUser();
    if (user.role !== 'recruiter' && user.role !== 'admin') return window.location.href = base + 'index.html';
    
    const recNameEl = document.getElementById('recName');
    const recAvatarEl = document.getElementById('recAvatar');
    if (recNameEl) {
        recNameEl.textContent = user.name || 'Recruiter';
        recNameEl.style.cursor = 'pointer';
        recNameEl.title = 'Click to edit HR Profile';
        recNameEl.addEventListener('click', openHrProfileModal);
    }
    if (recAvatarEl) {
        recAvatarEl.textContent = (user.name || 'R').charAt(0).toUpperCase();
        recAvatarEl.style.cursor = 'pointer';
        recAvatarEl.title = 'Click to edit HR Profile';
        recAvatarEl.addEventListener('click', openHrProfileModal);
    }
    
    document.querySelectorAll('#recSignOut, #recTopSignOut').forEach(btn => {
        if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); handleRecruiterLogout(); });
    });

    const themeToggleBtn = document.getElementById('recThemeToggle');
    if (themeToggleBtn) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        themeToggleBtn.textContent = isDark ? '🌙' : '☀️';
        themeToggleBtn.addEventListener('click', () => {
            if (typeof toggleTheme === 'function') toggleTheme();
            const nowDark = document.documentElement.getAttribute('data-theme') === 'dark';
            themeToggleBtn.textContent = nowDark ? '🌙' : '☀️';
        });
    }

    document.querySelectorAll('.rec-sidebar .nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.rec-sidebar .nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            const section = item.dataset.section;
            if (document.getElementById('topbarTitle')) document.getElementById('topbarTitle').textContent = titles[section] || section;
            loadRecSection(section);
        });
    });

    // Check company verification status and show banner
    try {
        const statusRes = await API.get('/auth/company-status');
        recState.companyStatus = statusRes.status || 'no_company';
        recState.companyData = statusRes.company || {};
        showVerificationBanner(recState.companyStatus, recState.companyData);
    } catch(e) {
        recState.companyStatus = 'unknown';
    }

    loadRecSection('overview');
});

function showVerificationBanner(status, companyData) {
    const existing = document.getElementById('recruiterCompanyStatusBanner');
    if (existing) existing.remove();

    if (status === 'approved' || status === 'verified' || companyData?.isVerified) return; // Verified recruiters don't need a warning

    const banner = document.createElement('div');
    banner.id = 'recruiterCompanyStatusBanner';

    if (status === 'pending' || companyData?.verificationStatus === 'pending') {
        banner.style.cssText = 'background:#fef3c7;border:1px solid #fcd34d;border-radius:12px;padding:1rem 1.25rem;margin-bottom:1.25rem;display:flex;align-items:center;gap:0.75rem;';
        banner.innerHTML = `
            <div style="font-size:1.5rem;">⏳</div>
            <div style="flex:1;">
                <div style="font-weight:600;color:#92400e;font-size:0.95rem;">Company Verification Pending</div>
                <div style="font-size:0.8rem;color:#92400e;opacity:0.85;">Your company <strong>"${sanitize(companyData?.name || 'Your Company')}"</strong> registration is under review by our Admin team. Job postings will go live once verified.</div>
            </div>
            <div style="display:flex;gap:0.5rem;align-items:center;">
                <span style="background:#f59e0b;color:white;font-size:0.75rem;font-weight:700;padding:0.25rem 0.6rem;border-radius:999px;">Pending Approval</span>
                <button onclick="navigateToCompanySection()" class="btn btn-outline" style="font-size:0.75rem;padding:0.3rem 0.75rem;color:#92400e;border-color:#fcd34d;">Review Details</button>
            </div>
        `;
    } else if (status === 'rejected' || companyData?.verificationStatus === 'rejected') {
        banner.style.cssText = 'background:#fee2e2;border:1px solid #fca5a5;border-radius:12px;padding:1rem 1.25rem;margin-bottom:1.25rem;display:flex;align-items:center;gap:0.75rem;';
        banner.innerHTML = `
            <div style="font-size:1.5rem;">⚠️</div>
            <div style="flex:1;">
                <div style="font-weight:600;color:#991b1b;font-size:0.95rem;">Company Registration Rejected</div>
                <div style="font-size:0.8rem;color:#991b1b;opacity:0.85;">Reason: <em>${sanitize(companyData?.rejectionReason || 'Please update your company documents.')}</em>. Please update your details and submit for re-verification.</div>
            </div>
            <button onclick="navigateToCompanySection()" class="btn btn-primary" style="font-size:0.75rem;padding:0.35rem 0.85rem;background:#ef4444;border-color:#ef4444;color:white;">Edit & Resubmit →</button>
        `;
    } else {
        banner.style.cssText = 'background:#dbeafe;border:1px solid #93c5fd;border-radius:12px;padding:1rem 1.25rem;margin-bottom:1.25rem;display:flex;align-items:center;gap:0.75rem;';
        banner.innerHTML = `
            <div style="font-size:1.5rem;">🏢</div>
            <div style="flex:1;">
                <div style="font-weight:600;color:#1e40af;font-size:0.95rem;">No Company Registered</div>
                <div style="font-size:0.8rem;color:#1e40af;opacity:0.85;">To post jobs, please configure your company profile, HR contact details, and hiring process rounds for admin verification.</div>
            </div>
            <button onclick="navigateToCompanySection()" class="btn btn-primary" style="font-size:0.8rem;padding:0.45rem 1rem;white-space:nowrap;cursor:pointer;">🏢 Register Company →</button>
        `;
    }

    const content = document.getElementById('recContent');
    if (content && content.parentNode) {
        content.parentNode.insertBefore(banner, content);
    }
}

function navigateToCompanySection() {
    document.querySelectorAll('.rec-sidebar .nav-item').forEach(n => n.classList.remove('active'));
    const item = document.querySelector('.rec-sidebar .nav-item[data-section="company"]');
    if (item) item.classList.add('active');
    if (document.getElementById('topbarTitle')) document.getElementById('topbarTitle').textContent = titles.company || '🏢 Company Profile & Hiring Rounds';
    loadRecSection('company');
}
window.navigateToCompanySection = navigateToCompanySection;

function rc() { return document.getElementById('recContent'); }

async function loadRecSection(section) {
    const c = rc();
    if (!c) return;
    c.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--text-muted);"><div style="font-size:2rem;margin-bottom:1rem;animation:pulse 2s infinite;">⏳</div>Loading section data...</div>';
    try {
        if (section === 'overview') await renderRecOverview(c);
        else if (section === 'jobs') await renderRecJobs(c);
        else if (section === 'applicants') await renderRecApplicants(c);
        else if (section === 'interviews') await renderRecInterviews(c);
        else if (section === 'pipeline') await renderRecPipeline(c);
        else if (section === 'candidates') await renderRecCandidates(c);
        else if (section === 'company') await renderRecCompany(c);
        else if (section === 'notifications') await renderRecNotifs(c);
    } catch (e) {
        c.innerHTML = `<div style="color:#ef4444;padding:2rem;background:rgba(239,68,68,0.1);border-radius:12px;">Error: ${e.message}</div>`;
    }
}

// === OVERVIEW ===
async function renderRecOverview(c) {
    const data = await API.get('/jobs/recruiter/my');
    recState.jobs = data.jobs || [];
    const jobs = recState.jobs;
    const totalApps = jobs.reduce((s, j) => s + (j.applicantCount || 0), 0);
    const activeJobs = jobs.filter(j => j.status === 'active').length;

    let perfData = null;
    try { perfData = await API.get('/admin/top-performers'); } catch (e) {}
    const highMatch = perfData ? (perfData.performers || []).filter(p => p.compositeScore >= 70).length : 0;

    c.innerHTML = `
        <div class="metric-grid">
            <div class="metric-card" onclick="loadRecSection('jobs')" style="cursor:pointer;"><div class="label">💼 Total Jobs</div><div class="value">${jobs.length}</div></div>
            <div class="metric-card" onclick="loadRecSection('pipeline')" style="cursor:pointer;"><div class="label">📄 Applicants</div><div class="value">${totalApps}</div></div>
            <div class="metric-card" onclick="loadRecSection('jobs')" style="cursor:pointer;"><div class="label">✅ Active Jobs</div><div class="value" style="color:#10b981;">${activeJobs}</div></div>
            <div class="metric-card" onclick="loadRecSection('candidates')" style="cursor:pointer;"><div class="label">⭐ High Match Candidates</div><div class="value" style="color:var(--primary);">${highMatch}</div><div style="font-size:0.7rem;color:var(--text-muted);">Score > 70%</div></div>
        </div>
        <div class="chart-grid">
            <div class="chart-card"><h3>📊 Applicants Per Job</h3><div style="position:relative; height:200px;"><canvas id="recAppsChart"></canvas></div></div>
            <div class="chart-card"><h3>🏆 Top Candidates</h3><div id="recTopList" style="max-height:280px;overflow-y:auto;"></div></div>
        </div>
        <div style="background:var(--card-bg);border-radius:12px;border:1px solid var(--border-color);overflow:hidden;">
            <div style="padding:1rem 1.25rem;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">
                <h3 style="margin:0;font-size:1rem;color:var(--text-main);">Recent Jobs</h3>
                <a href="job-posting.html" class="btn btn-primary" style="font-size:0.75rem;text-decoration:none;">+ Post New Job</a>
            </div>
            <table class="data-table">
                <thead><tr><th>Job Role</th><th>Status</th><th>Applicants</th><th>Posted Date</th><th>Actions</th></tr></thead>
                <tbody>
                    ${jobs.length === 0 ? '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-muted);">No jobs posted yet. <a href="job-posting.html" style="color:var(--primary);">Post your first job →</a></td></tr>' : jobs.slice(0, 5).map(j => `
                        <tr>
                            <td><div style="font-weight:600;color:var(--text-main);">${sanitize(j.title)}</div><div style="font-size:0.75rem;color:var(--text-muted);">${sanitize(j.companyName)} • 📍 ${sanitize(j.location || 'Remote')}</div></td>
                            <td><span style="padding:0.15rem 0.5rem;border-radius:999px;font-size:0.7rem;font-weight:600;${j.status === 'active' ? 'background:rgba(16,185,129,0.15);color:#10b981;' : 'background:rgba(239,68,68,0.15);color:#ef4444;'}">${j.status}</span></td>
                            <td style="font-weight:600;color:var(--text-main);">${j.applicantCount || 0}</td>
                            <td style="font-size:0.8rem;color:var(--text-muted);">${new Date(j.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button onclick="viewJobPipeline('${j._id}')" class="btn btn-outline" style="font-size:0.7rem;padding:0.25rem 0.5rem;">Pipeline →</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    if (jobs.length > 0 && typeof Chart !== 'undefined') {
        const ctx = document.getElementById('recAppsChart');
        if (ctx) {
            new Chart(ctx, {
                type: 'bar',
                data: { labels: jobs.slice(0, 8).map(j => j.title.substring(0, 18)), datasets: [{ label: 'Applicants', data: jobs.slice(0, 8).map(j => j.applicantCount || 0), backgroundColor: '#3b82f6' }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });
        }
    }

    if (perfData && document.getElementById('recTopList')) {
        const top = (perfData.performers || []).slice(0, 6);
        document.getElementById('recTopList').innerHTML = top.map((p, i) => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:0.6rem 0;${i < top.length - 1 ? 'border-bottom:1px solid var(--border-color);' : ''}">
                <div style="display:flex;align-items:center;gap:0.6rem;">
                    <div style="width:30px;height:30px;border-radius:50%;background:${i < 3 ? 'var(--primary)' : 'var(--bg-muted)'};color:${i < 3 ? 'white' : 'var(--text-main)'};display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.7rem;">${sanitize(p.name.charAt(0))}</div>
                    <div><div style="font-weight:600;font-size:0.85rem;color:var(--text-main);">${sanitize(p.name)}</div><div style="font-size:0.7rem;color:var(--text-muted);">${sanitize((p.skills || []).slice(0, 3).join(', '))}</div></div>
                </div>
                <span style="font-weight:700;color:${p.compositeScore >= 70 ? '#10b981' : p.compositeScore >= 40 ? '#f59e0b' : '#ef4444'};">${p.compositeScore}%</span>
            </div>
        `).join('');
    }
}

// === MY JOBS VIEW ===
async function renderRecJobs(c) {
    const data = await API.get('/jobs/recruiter/my');
    recState.jobs = data.jobs || [];
    const canPost = recState.companyStatus === 'approved';
    const postBtnHtml = canPost
        ? `<a href="job-posting.html" class="btn btn-primary" style="font-size:0.8rem;text-decoration:none;">+ Post New Job</a>`
        : `<span style="font-size:0.75rem;padding:0.4rem 0.8rem;background:#fef3c7;color:#92400e;border-radius:8px;border:1px solid #fbbf24;">⏳ Company verification required to post jobs</span>`;
    c.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
            <span style="font-size:0.9rem;color:var(--text-muted);">${recState.jobs.length} Job Postings</span>
            ${postBtnHtml}
        </div>
        <div style="display:grid;gap:1rem;">
            ${recState.jobs.length === 0 ? `<div style="background:var(--card-bg);padding:3rem;text-align:center;border-radius:12px;border:1px solid var(--border-color);"><p style="color:var(--text-muted);">${canPost ? 'No job postings found. Create one now!' : 'Your company must be verified by admin before you can post jobs.'}</p>${canPost ? '<a href="job-posting.html" class="btn btn-primary" style="text-decoration:none;">Post Job →</a>' : ''}</div>` : recState.jobs.map(j => `
                <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;padding:1.25rem;display:flex;justify-content:space-between;align-items:center;gap:1rem;">
                    <div>
                        <div style="font-weight:600;font-size:1rem;color:var(--text-main);">${sanitize(j.title)}</div>
                        <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.2rem;">${sanitize(j.companyName)} • 📍 ${sanitize(j.location || 'Remote')} • 💰 ${j.salary || 'Competitive'}</div>
                        <div style="display:flex;gap:0.35rem;margin-top:0.5rem;flex-wrap:wrap;">
                            ${(j.requiredSkills || []).map(s => `<span style="font-size:0.7rem;padding:0.15rem 0.45rem;border-radius:4px;background:var(--bg-muted);border:1px solid var(--border-color);color:var(--text-main);">${sanitize(s)}</span>`).join('')}
                        </div>
                    </div>
                    <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:0.4rem;flex-shrink:0;">
                        <span style="padding:0.15rem 0.5rem;border-radius:999px;font-size:0.7rem;font-weight:600;${j.status === 'active' ? 'background:rgba(16,185,129,0.15);color:#10b981;' : 'background:rgba(239,68,68,0.15);color:#ef4444;'}">${j.status}</span>
                        <div style="font-weight:700;font-size:1.2rem;color:var(--text-main);">${j.applicantCount || 0} <span style="font-size:0.7rem;color:var(--text-muted);font-weight:normal;">applicants</span></div>
                        <div style="display:flex;gap:0.4rem;margin-top:0.2rem;">
                            <button onclick="viewJobPipeline('${j._id}')" class="btn btn-primary" style="font-size:0.75rem;padding:0.3rem 0.75rem;">View Pipeline →</button>
                            <button onclick="deleteJobPosting('${j._id}', '${sanitize(j.title.replace(/'/g, "\\'"))}')" class="btn" style="font-size:0.75rem;padding:0.3rem 0.6rem;background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.3);" title="Delete Job">🗑</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function viewJobPipeline(jobId) {
    recState.selectedJob = jobId;
    document.querySelectorAll('.rec-sidebar .nav-item').forEach(n => {
        n.classList.toggle('active', n.dataset.section === 'pipeline');
    });
    if (document.getElementById('topbarTitle')) document.getElementById('topbarTitle').textContent = titles.pipeline;
    loadRecSection('pipeline');
}

async function deleteJobPosting(jobId, title) {
    if (!confirm(`Are you sure you want to delete the job posting for "${title}"?`)) return;
    try {
        await API.delete(`/jobs/${jobId}`);
        if (typeof showToast === 'function') showToast('Job posting deleted successfully!', 'success');
        else alert('Job posting deleted!');
        loadRecSection('jobs');
    } catch (e) {
        if (typeof showToast === 'function') showToast(e.message, 'error');
        else alert(e.message);
    }
}

// === KANBAN PIPELINE VIEW ===
async function renderRecPipeline(c) {
    if (!recState.selectedJob && recState.jobs.length > 0) recState.selectedJob = recState.jobs[0]._id;
    if (!recState.selectedJob) {
        const d = await API.get('/jobs/recruiter/my');
        recState.jobs = d.jobs || [];
        if (recState.jobs.length > 0) recState.selectedJob = recState.jobs[0]._id;
        else {
            c.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--text-muted);"><p>No jobs found. Create your first job posting to view pipeline.</p><a href="job-posting.html" class="btn btn-primary" style="text-decoration:none;">+ Post Job</a></div>';
            return;
        }
    }

    let allApps = [];
    try {
        const appsRes = await API.get(`/applications/job/${recState.selectedJob}`);
        allApps = appsRes.applications || [];
    } catch (e) {
        console.warn('Pipeline fetch warning:', e.message);
    }

    const stages = ['new', 'in-review', 'shortlisted', 'interview', 'selected', 'rejected'];
    const stageLabels = { 'new': '📥 New', 'in-review': '👁 In Review', 'shortlisted': '⭐ Shortlisted', 'interview': '🎙 Interview', 'selected': '✅ Selected', 'rejected': '❌ Rejected' };
    const stageColors = { 'new': '#6366f1', 'in-review': '#3b82f6', 'shortlisted': '#f59e0b', 'interview': '#8b5cf6', 'selected': '#10b981', 'rejected': '#ef4444' };

    if (recState.jobs.length === 0) {
        const d = await API.get('/jobs/recruiter/my');
        recState.jobs = d.jobs || [];
    }

    c.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;gap:0.75rem;">
            <div style="display:flex;align-items:center;gap:0.75rem;">
                <label style="font-size:0.85rem;font-weight:600;color:var(--text-main);">Select Job:</label>
                <select id="pipelineJobSelect" onchange="recState.selectedJob=this.value;loadRecSection('pipeline');" style="padding:0.5rem 0.85rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--card-bg);color:var(--text-main);">
                    ${recState.jobs.map(j => `<option value="${j._id}" ${j._id === recState.selectedJob ? 'selected' : ''}>${sanitize(j.title)} — ${sanitize(j.companyName)}</option>`).join('')}
                </select>
            </div>
            <span style="font-size:0.85rem;color:var(--text-muted);font-weight:600;">${allApps.length} Total Applicants</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0.85rem;overflow-x:auto;">
            ${stages.map(st => {
                const cards = allApps.filter(a => a.status === st);
                return `
                    <div style="background:var(--bg-muted);border:1px solid var(--border-color);border-radius:10px;padding:0.75rem;min-height:380px;display:flex;flex-direction:column;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;padding-bottom:0.5rem;border-bottom:2px solid ${stageColors[st]};">
                            <span style="font-size:0.85rem;font-weight:700;color:var(--text-main);">${stageLabels[st]}</span>
                            <span style="background:${stageColors[st]};color:white;font-size:0.7rem;padding:0.1rem 0.5rem;border-radius:999px;font-weight:700;">${cards.length}</span>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:0.6rem;flex:1;overflow-y:auto;">
                            ${cards.length === 0 ? '<div style="font-size:0.75rem;color:var(--text-muted);text-align:center;padding:1.5rem 0;">Empty</div>' : cards.map(a => `
                                <div onclick="showCandidateDetail('${a._id}')" style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:8px;padding:0.75rem;cursor:pointer;transition:all 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.05);" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border-color)'">
                                    <div style="font-weight:600;font-size:0.85rem;color:var(--text-main);margin-bottom:0.2rem;">${sanitize(a.studentId?.name || 'Candidate')}</div>
                                    <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted);margin-bottom:0.35rem;">
                                        <span>Match: <b style="color:${a.skillMatch >= 70 ? '#10b981' : '#f59e0b'}">${a.skillMatch}%</b></span>
                                        <span>Prob: <b>${a.hiringProbability}%</b></span>
                                    </div>
                                    <div style="display:flex;gap:0.25rem;flex-wrap:wrap;">
                                        ${(a.matchedSkills || []).slice(0, 2).map(s => `<span style="font-size:0.6rem;padding:0.1rem 0.35rem;border-radius:3px;background:rgba(16,185,129,0.15);color:#10b981;">✓ ${sanitize(s)}</span>`).join('')}
                                    </div>
                                    <div style="display:flex;gap:0.25rem;margin-top:0.6rem;flex-wrap:wrap;border-top:1px solid var(--border-color);padding-top:0.4rem;">
                                        ${stages.filter(s => s !== st).slice(0, 3).map(s => `
                                            <button onclick="event.stopPropagation();movePipeline('${a._id}','${s}')" style="font-size:0.6rem;padding:0.15rem 0.35rem;border:1px solid var(--border-color);border-radius:4px;background:var(--bg-muted);color:var(--text-main);cursor:pointer;" onmouseover="this.style.background='var(--primary)';this.style.color='white';" onmouseout="this.style.background='var(--bg-muted)';this.style.color='var(--text-main)';">
                                                → ${stageLabels[s].split(' ')[1] || stageLabels[s]}
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

async function movePipeline(appId, status) {
    try {
        await API.put(`/applications/${appId}/status`, { status });
        if (typeof showToast === 'function') showToast(`Status updated to ${status}!`, 'success');
        loadRecSection('pipeline');
    } catch (e) {
        if (typeof showToast === 'function') showToast(e.message, 'error');
        else alert(e.message);
    }
}

// ── Interactive Candidate Detail Modal ──
window.showCandidateDetail = async function(appId) {
    let app = null;
    try {
        const res = await API.get(`/applications/detail/${appId}`);
        app = res.application || null;
    } catch (e) {
        console.warn('Failed to fetch candidate detail:', e.message);
    }

    // Modal Container
    let modal = document.getElementById('candidateModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'candidateModal';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:10050;padding:1rem;';
        document.body.appendChild(modal);
    }

    if (!app) {
        modal.innerHTML = `
            <div style="background:var(--card-bg);border-radius:16px;max-width:420px;width:100%;padding:2rem;text-align:center;border:1px solid var(--border-color);box-shadow:0 20px 40px rgba(0,0,0,0.4);">
                <div style="font-size:2.5rem;margin-bottom:1rem;">⚠️</div>
                <h3 style="margin:0 0 0.5rem;">Application Not Found</h3>
                <p style="color:var(--text-muted);font-size:0.875rem;margin-bottom:1.25rem;">This application may have been withdrawn or the candidate account was removed.</p>
                <button onclick="document.getElementById('candidateModal').style.display='none'" class="btn btn-primary" style="padding:0.5rem 1.5rem;">Close</button>
            </div>
        `;
        modal.style.display = 'flex';
        return;
    }

    const candName = app.studentId?.name || 'Unknown Candidate';
    const candEmail = app.studentId?.email || 'N/A';
    const matchScore = app.skillMatch || 0;
    const probScore = app.hiringProbability || 0;
    const matched = app.matchedSkills || [];
    const missing = app.missingSkills || [];

    modal.innerHTML = `
        <div style="background:var(--card-bg);border-radius:16px;max-width:620px;width:100%;padding:2rem;border:1px solid var(--border-color);box-shadow:0 20px 40px rgba(0,0,0,0.4);position:relative;">
            <button onclick="document.getElementById('candidateModal').style.display='none'" style="position:absolute;right:1.25rem;top:1.25rem;width:32px;height:32px;border-radius:50%;background:var(--bg-muted);border:1px solid var(--border-color);color:var(--text-main);font-size:1.2rem;cursor:pointer;">✕</button>

            <div style="display:flex;align-items:center;gap:1.25rem;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid var(--border-color);">
                <div style="width:54px;height:54px;border-radius:50%;background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:1.5rem;">
                    ${candName.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 style="font-size:1.3rem;margin:0 0 0.2rem;color:var(--text-main);">${sanitize(candName)}</h2>
                    <div style="font-size:0.85rem;color:var(--text-muted);">${sanitize(candEmail)}</div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">
                <div style="background:var(--bg-muted);padding:1rem;border-radius:10px;text-align:center;">
                    <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;">SKILL MATCH</div>
                    <div style="font-size:1.75rem;font-weight:800;color:#10b981;margin-top:0.2rem;">${matchScore}%</div>
                </div>
                <div style="background:var(--bg-muted);padding:1rem;border-radius:10px;text-align:center;">
                    <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;">HIRING PROBABILITY</div>
                    <div style="font-size:1.75rem;font-weight:800;color:var(--primary);margin-top:0.2rem;">${probScore}%</div>
                </div>
            </div>

            <div style="margin-bottom:1.25rem;">
                <div style="font-size:0.85rem;font-weight:700;color:#10b981;margin-bottom:0.4rem;">✓ Matched Skills</div>
                <div style="display:flex;gap:0.35rem;flex-wrap:wrap;">
                    ${matched.map(s => `<span style="font-size:0.75rem;background:rgba(16,185,129,0.15);color:#10b981;padding:0.2rem 0.5rem;border-radius:4px;font-weight:600;">✓ ${sanitize(s)}</span>`).join('')}
                </div>
            </div>

            <div style="margin-bottom:1.5rem;">
                <div style="font-size:0.85rem;font-weight:700;color:#f97316;margin-bottom:0.4rem;">⚠️ Missing Skills</div>
                <div style="display:flex;gap:0.35rem;flex-wrap:wrap;">
                    ${missing.map(s => `<span style="font-size:0.75rem;background:rgba(249,115,22,0.15);color:#f97316;padding:0.2rem 0.5rem;border-radius:4px;font-weight:600;">+ ${sanitize(s)}</span>`).join('')}
                </div>
            </div>

            <div style="display:flex;gap:0.75rem;justify-content:flex-end;border-top:1px solid var(--border-color);padding-top:1.25rem;">
                <button onclick="document.getElementById('candidateModal').style.display='none'" class="btn btn-outline">Close</button>
                <button onclick="movePipeline('${appId}','shortlisted');document.getElementById('candidateModal').style.display='none';" class="btn btn-primary">⭐ Shortlist Candidate</button>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
};

// === CANDIDATE SEARCH & COMPARISON VIEW ===
async function renderRecCandidates(c) {
    if (recState.jobs.length === 0) {
        const d = await API.get('/jobs/recruiter/my');
        recState.jobs = d.jobs || [];
    }
    if (recState.jobs.length === 0) {
        c.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--text-muted);"><p>Post a job first to search & compare candidates.</p><a href="job-posting.html" class="btn btn-primary" style="text-decoration:none;">+ Post Job</a></div>';
        return;
    }
    const jobId = recState.selectedJob || recState.jobs[0]._id;
    let allApps = [];
    try {
        const apps = await API.get(`/applications/job/${jobId}`);
        allApps = apps.applications || [];
    } catch (e) {}

    let recData = null;
    try { recData = await API.get(`/applications/job/${jobId}/recommended`); } catch (e) {}

    c.innerHTML = `
        <div style="display:flex;gap:0.75rem;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;">
            <label style="font-size:0.85rem;font-weight:600;color:var(--text-main);">Filter by Job:</label>
            <select id="candJobSelect" onchange="recState.selectedJob=this.value;loadRecSection('candidates');" style="padding:0.5rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--card-bg);color:var(--text-main);">
                ${recState.jobs.map(j => `<option value="${j._id}" ${j._id === jobId ? 'selected' : ''}>${sanitize(j.title)}</option>`).join('')}
            </select>
            <input id="recCandSearch" placeholder="🔍 Search candidate name or skill..." style="padding:0.5rem 0.85rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;min-width:240px;background:var(--card-bg);color:var(--text-main);" oninput="filterCandidateRows(this.value)">
            <button id="compareBtn" onclick="compareSelected()" class="btn btn-outline" style="font-size:0.8rem;margin-left:auto;" disabled>Compare Selected (0)</button>
        </div>

        ${recData && recData.recommended && recData.recommended.length > 0 ? `
        <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;padding:1.25rem;margin-bottom:1.5rem;">
            <h3 style="margin:0 0 0.75rem;font-size:0.95rem;color:var(--text-main);">🤖 Top Recommended Talent Pool</h3>
            <div style="display:flex;gap:0.75rem;overflow-x:auto;">
                ${recData.recommended.slice(0, 5).map(r => `
                    <div style="min-width:200px;background:var(--bg-muted);border-radius:10px;padding:1rem;border:1px solid var(--border-color);">
                        <div style="font-weight:600;font-size:0.85rem;color:var(--text-main);">${sanitize(r.name)}</div>
                        <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:0.5rem;">${sanitize(r.education || 'CS Graduate')}</div>
                        <div style="font-size:1.3rem;font-weight:800;color:${r.hiringProbability >= 85 ? '#10b981' : '#f59e0b'};margin-bottom:0.25rem;">${r.hiringProbability}% Match</div>
                        <div style="font-size:0.65rem;color:var(--text-muted);">Skills: ${(r.skills || []).slice(0, 3).join(', ')}</div>
                    </div>
                `).join('')}
            </div>
        </div>` : ''}

        <div style="background:var(--card-bg);border-radius:12px;border:1px solid var(--border-color);overflow:hidden;">
            <table class="data-table" style="width:100%;">
                <thead>
                    <tr>
                        <th style="width:30px;"><input type="checkbox" onchange="toggleAllCompare(this)"></th>
                        <th>Candidate</th>
                        <th>Match Score</th>
                        <th>Hiring Probability</th>
                        <th>Skills Alignment</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="candidateTableBody">
                    ${allApps.length === 0 ? '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted);">No candidates have applied for this job yet.</td></tr>' : allApps.map(a => `
                        <tr class="cand-row">
                            <td><input type="checkbox" class="compare-cb" value="${a._id}" onchange="updateCompareBtn()"></td>
                            <td>
                                <div style="font-weight:600;color:var(--text-main);cursor:pointer;" onclick="showCandidateDetail('${a._id}')">${sanitize(a.studentId?.name || 'Candidate')}</div>
                                <div style="font-size:0.7rem;color:var(--text-muted);">${sanitize(a.studentId?.email || '')}</div>
                            </td>
                            <td><span style="font-weight:700;color:${a.skillMatch >= 70 ? '#10b981' : '#f59e0b'};">${a.skillMatch}%</span></td>
                            <td><span style="font-weight:700;color:var(--primary);">${a.hiringProbability}%</span></td>
                            <td>
                                <div style="display:flex;flex-wrap:wrap;gap:0.2rem;">
                                    ${(a.matchedSkills || []).slice(0, 3).map(s => `<span style="font-size:0.6rem;padding:0.1rem 0.3rem;background:rgba(16,185,129,0.15);color:#10b981;border-radius:3px;">✓${sanitize(s)}</span>`).join('')}
                                </div>
                            </td>
                            <td><span style="padding:0.15rem 0.5rem;border-radius:999px;font-size:0.65rem;font-weight:600;background:var(--bg-muted);color:var(--text-main);">${a.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

window.filterCandidateRows = function(query) {
    const q = (query || '').toLowerCase();
    document.querySelectorAll('#candidateTableBody .cand-row').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
    });
};

function updateCompareBtn() {
    const checked = document.querySelectorAll('.compare-cb:checked');
    const btn = document.getElementById('compareBtn');
    if (!btn) return;
    btn.textContent = `Compare Selected (${checked.length})`;
    btn.disabled = checked.length < 2 || checked.length > 3;
}

function toggleAllCompare(master) {
    document.querySelectorAll('.compare-cb').forEach(cb => { cb.checked = master.checked; });
    updateCompareBtn();
}

async function compareSelected() {
    const ids = Array.from(document.querySelectorAll('.compare-cb:checked')).map(cb => cb.value);
    if (ids.length < 2 || ids.length > 3) return alert('Please select 2 or 3 candidates to compare');

    try {
        const data = await API.post('/applications/compare', { applicationIds: ids });
        const cands = data.candidates || [];
        
        let modal = document.getElementById('compareModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'compareModal';
            modal.className = 'modal-overlay';
            modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:10050;padding:1rem;';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div style="background:var(--card-bg);border-radius:16px;max-width:900px;width:95%;max-height:90vh;overflow-y:auto;padding:2rem;border:1px solid var(--border-color);box-shadow:0 20px 40px rgba(0,0,0,0.4);position:relative;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;border-bottom:1px solid var(--border-color);padding-bottom:1rem;">
                    <h2 style="margin:0;font-size:1.3rem;color:var(--text-main);">🔍 Candidate Side-by-Side Comparison</h2>
                    <button onclick="document.getElementById('compareModal').style.display='none'" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-main);">✕</button>
                </div>
                <div style="display:grid;grid-template-columns:repeat(${cands.length}, 1fr);gap:1.25rem;">
                    ${cands.map(ca => `
                        <div style="border:1px solid var(--border-color);border-radius:12px;padding:1.25rem;background:var(--bg-muted);">
                            <div style="text-align:center;margin-bottom:1rem;">
                                <div style="width:48px;height:48px;border-radius:50%;background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:1.2rem;margin:0 auto 0.5rem;">${sanitize((ca.name||'C').charAt(0))}</div>
                                <div style="font-weight:700;font-size:1rem;color:var(--text-main);">${sanitize(ca.name)}</div>
                                <div style="font-size:0.75rem;color:var(--text-muted);">${sanitize(ca.email)}</div>
                            </div>
                            <div style="display:grid;gap:0.75rem;">
                                <div style="text-align:center;padding:0.75rem;background:var(--card-bg);border-radius:8px;border:1px solid var(--border-color);">
                                    <div style="font-size:1.5rem;font-weight:800;color:${ca.hiringProbability >= 70 ? '#10b981' : '#f59e0b'};">${ca.hiringProbability}%</div>
                                    <div style="font-size:0.7rem;color:var(--text-muted);">Hiring Probability</div>
                                </div>
                                <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-main);"><span>Skill Match</span><b>${ca.skillMatch}%</b></div>
                                <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-main);"><span>Matched Skills</span><b>${(ca.matchedSkills||[]).length}</b></div>
                                <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-main);"><span>Missing Skills</span><b>${(ca.missingSkills||[]).length}</b></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        modal.style.display = 'flex';
    } catch (e) {
        alert('Compare error: ' + e.message);
    }
}

// === NOTIFICATIONS ===
async function renderRecNotifs(c) {
    try {
        const data = await API.get('/notifications/my');
        window.recNotifCache = data.notifications || [];
        const notifs = window.recNotifCache;
        c.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                <h3 style="font-size:1.1rem;margin:0;color:var(--text-main);">Notifications (${notifs.length})</h3>
                <span style="font-size:0.75rem;color:var(--text-muted);">Click any notification to open</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
                ${notifs.length === 0 ? '<div style="text-align:center;padding:3rem;color:var(--text-muted);background:var(--card-bg);border-radius:12px;border:1px solid var(--border-color);">No notifications available right now.</div>' : notifs.map(n => {
                    const icon = n.type === 'achievement' ? '🏆' : n.type === 'reminder' ? '🔔' : n.type === 'alert' ? '⚠️' : '📢';
                    return `
                    <div onclick="openRecNotification('${n._id}')" style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:10px;padding:1rem 1.25rem;cursor:pointer;${n.isRead ? '' : 'border-left:4px solid var(--primary);'};transition:all 0.15s ease;" onmouseover="this.style.borderColor='var(--primary)';" onmouseout="this.style.borderColor='var(--border-color)';">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.75rem;">
                            <div style="display:flex;gap:0.6rem;align-items:center;">
                                <span style="font-size:1.15rem;">${icon}</span>
                                <span style="font-weight:600;font-size:0.92rem;color:var(--text-main);">${sanitize(n.title)}</span>
                            </div>
                            <span style="font-size:0.72rem;color:var(--text-muted);white-space:nowrap;">${new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div style="font-size:0.82rem;color:var(--text-muted);margin-top:0.35rem;line-height:1.4;">${sanitize(n.message)}</div>
                    </div>`;
                }).join('')}
            </div>
        `;
    } catch (e) {
        c.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted);">Could not load notifications</div>';
    }
}

async function openRecNotification(notifId) {
    const notifs = window.recNotifCache || [];
    const n = notifs.find(item => item._id === notifId);
    if (!n) return;

    try {
        await API.put(`/notifications/${notifId}/read`);
        n.isRead = true;
    } catch(e) {}

    let modal = document.getElementById('recNotifModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'recNotifModal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1.5rem;';
        document.body.appendChild(modal);
    }

    const typeIcons = { announcement: '📢', alert: '⚠️', achievement: '🏆', reminder: '🔔', system: '⚙️' };
    const icon = typeIcons[n.type] || '🔔';

    modal.innerHTML = `
        <div style="background:var(--card-bg, #ffffff);color:var(--text-main, #0f172a);border-radius:16px;padding:2rem;max-width:520px;width:100%;box-shadow:0 20px 40px rgba(0,0,0,0.25);border:1px solid var(--border-color, #e2e8f0);position:relative;" onclick="event.stopPropagation()">
            <button onclick="document.getElementById('recNotifModal').style.display='none'; renderRecNotifs(rc());" style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">&times;</button>
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
                <span style="font-size:2rem;">${icon}</span>
                <div>
                    <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:var(--text-main);">${sanitize(n.title)}</h3>
                    <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem;">
                        Received: ${new Date(n.createdAt).toLocaleString()}
                    </div>
                </div>
            </div>
            <div style="background:var(--bg-muted, #f8fafc);border:1px solid var(--border-color, #e2e8f0);border-radius:10px;padding:1.25rem;font-size:0.9rem;line-height:1.6;color:var(--text-main);white-space:pre-wrap;margin-bottom:1.5rem;">${sanitize(n.message)}</div>
            <div style="display:flex;justify-content:flex-end;">
                <button onclick="document.getElementById('recNotifModal').style.display='none'; renderRecNotifs(rc());" class="btn btn-primary" style="font-size:0.85rem;padding:0.45rem 1.25rem;border-radius:8px;">Done</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

// === COMPANY PROFILE & HIRING PROCESS MANAGER ===
async function renderRecCompany(c) {
    try {
        const res = await API.get('/companies/my-company');
        recState.companyData = res.company || {};
        recState.hiringProcess = recState.companyData.hiringProcess || [
            { roundNumber: 1, roundName: 'Online Assessment', roundType: 'online_assessment', description: 'MCQs on DSA, Aptitude & 2 Coding Problems', durationMinutes: 60, cutoffScore: '70%', mode: 'online' },
            { roundNumber: 2, roundName: 'Technical Interview', roundType: 'technical_interview', description: 'Deep dive into DSA, System Design & Projects', durationMinutes: 45, cutoffScore: 'Pass', mode: 'online' },
            { roundNumber: 3, roundName: 'HR & Culture Discussion', roundType: 'hr_discussion', description: 'Behavioral, values alignment & compensation', durationMinutes: 30, cutoffScore: 'Fit', mode: 'online' }
        ];
    } catch (e) {
        recState.companyData = {};
        recState.hiringProcess = [];
    }

    const co = recState.companyData || {};
    const crit = co.hiringCriteria || {};
    const isApproved = co.verificationStatus === 'approved' || co.isVerified;
    const statusBadge = isApproved 
        ? '<span style="background:#dcfce7;color:#15803d;padding:0.25rem 0.6rem;border-radius:6px;font-size:0.75rem;font-weight:700;">● Verified & Approved</span>'
        : co.verificationStatus === 'rejected'
        ? '<span style="background:#fee2e2;color:#991b1b;padding:0.25rem 0.6rem;border-radius:6px;font-size:0.75rem;font-weight:700;">● Verification Rejected</span>'
        : '<span style="background:#fef3c7;color:#92400e;padding:0.25rem 0.6rem;border-radius:6px;font-size:0.75rem;font-weight:700;">● Verification Pending</span>';

    const saveBtnText = isApproved ? '💾 Save All Changes' : '🚀 Save & Submit for Verification';

    c.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
            <div>
                <h2 style="font-size:1.3rem;margin:0 0 0.25rem;color:var(--text-main);">🏢 Company Profile & Hiring Process</h2>
                <p style="font-size:0.85rem;color:var(--text-muted);margin:0;">Configure your organization details, HR verification credentials, and recruitment rounds for admin approval.</p>
            </div>
            <div style="display:flex;align-items:center;gap:1rem;">
                ${statusBadge}
                <button onclick="saveCompanyProfileAndRounds()" id="btnSaveCompany" class="btn btn-primary" style="padding:0.6rem 1.5rem;font-size:0.9rem;border-radius:8px;font-weight:600;">${saveBtnText}</button>
            </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1.5rem;">
            <!-- 1. Company Information -->
            <div style="background:var(--card-bg, white);border:1px solid var(--border-color);border-radius:14px;padding:1.5rem;">
                <h3 style="margin:0 0 1rem;font-size:1rem;color:var(--text-main);display:flex;align-items:center;gap:0.5rem;">🏢 Company Details</h3>
                <div style="display:grid;gap:0.85rem;">
                    <div>
                        <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">Company Name *</label>
                        <input type="text" id="coName" value="${sanitize(co.name || '')}" placeholder="e.g. Acme Technologies" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
                        <div>
                            <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">Website</label>
                            <input type="url" id="coWeb" value="${sanitize(co.website || '')}" placeholder="https://acme.com" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                        </div>
                        <div>
                            <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">Domain Type</label>
                            <select id="coDomain" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                                <option value="product" ${co.domain==='product'?'selected':''}>Product-Based</option>
                                <option value="service" ${co.domain==='service'?'selected':''}>Service-Based</option>
                                <option value="startup" ${co.domain==='startup'?'selected':''}>High-Growth Startup</option>
                            </select>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
                        <div>
                            <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">Industry</label>
                            <input type="text" id="coIndustry" value="${sanitize(co.industry || 'Technology')}" placeholder="Technology, FinTech, E-Commerce" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                        </div>
                        <div>
                            <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">Company Size</label>
                            <select id="coSize" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                                <option value="startup" ${co.size==='startup'?'selected':''}>Startup (1-50 employees)</option>
                                <option value="mid" ${co.size==='mid'?'selected':''}>Mid-sized (50-500 employees)</option>
                                <option value="enterprise" ${co.size==='enterprise'?'selected':''}>Enterprise (500+ employees)</option>
                            </select>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
                        <div>
                            <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">Headquarter City</label>
                            <input type="text" id="coHQ" value="${sanitize(co.headquarter || '')}" placeholder="Bengaluru, Hyderabad, Remote" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                        </div>
                        <div>
                            <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">Founded Year</label>
                            <input type="number" id="coFounded" value="${co.foundedYear || ''}" placeholder="2018" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                        </div>
                    </div>
                    <div>
                        <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">About Company</label>
                        <textarea id="coDesc" rows="3" placeholder="Brief summary of company culture, products, and tech stack..." style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);resize:vertical;">${sanitize(co.description || '')}</textarea>
                    </div>
                </div>
            </div>

            <!-- 2. HR Contact & Official Verification -->
            <div style="background:var(--card-bg, white);border:1px solid var(--border-color);border-radius:14px;padding:1.5rem;">
                <h3 style="margin:0 0 1rem;font-size:1rem;color:var(--text-main);display:flex;align-items:center;gap:0.5rem;">👨‍💼 HR & Verification Details</h3>
                <div style="display:grid;gap:0.85rem;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
                        <div>
                            <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">HR / Recruiter Name *</label>
                            <input type="text" id="coHrName" value="${sanitize(co.hrName || '')}" placeholder="HR Lead Full Name" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                        </div>
                        <div>
                            <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">HR Email</label>
                            <input type="email" id="coHrEmail" value="${sanitize(co.hrEmail || '')}" placeholder="hr@acme.com" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
                        <div>
                            <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">HR Contact Phone</label>
                            <input type="tel" id="coHrPhone" value="${sanitize(co.hrPhone || '')}" placeholder="+91 98765 43210" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                        </div>
                        <div>
                            <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">Official Company Email</label>
                            <input type="email" id="coOfficialEmail" value="${sanitize(co.companyEmail || '')}" placeholder="careers@acme.com" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
                        <div>
                            <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">GST / CIN Registration No.</label>
                            <input type="text" id="coRegNum" value="${sanitize(co.registrationNumber || '')}" placeholder="e.g. 29AAAAA0000A1Z5" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                        </div>
                        <div>
                            <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">Company LinkedIn URL</label>
                            <input type="url" id="coLinkedIn" value="${sanitize(co.linkedIn || '')}" placeholder="https://linkedin.com/company/acme" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                        </div>
                    </div>
                    <div>
                        <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">Office / Registered Address</label>
                        <textarea id="coAddress" rows="3" placeholder="Full office address for corporate verification..." style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);resize:vertical;">${sanitize(co.address || '')}</textarea>
                    </div>
                </div>
            </div>
        </div>

        <!-- 3. Hiring Process & Selection Rounds -->
        <div style="background:var(--card-bg, white);border:1px solid var(--border-color);border-radius:14px;padding:1.5rem;margin-bottom:1.5rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:0.75rem;">
                <div>
                    <h3 style="margin:0 0 0.25rem;font-size:1.05rem;color:var(--text-main);display:flex;align-items:center;gap:0.5rem;">🎯 Selection Rounds & Hiring Process</h3>
                    <p style="font-size:0.8rem;color:var(--text-muted);margin:0;">Define the exact interview rounds, duration, and evaluation criteria candidates will go through.</p>
                </div>
                <button type="button" onclick="addHiringRound()" class="btn btn-outline" style="padding:0.45rem 1rem;font-size:0.85rem;border-radius:8px;font-weight:600;">+ Add Selection Round</button>
            </div>

            <div id="roundsContainer" style="display:flex;flex-direction:column;gap:1rem;">
                ${renderHiringRoundsHtml(recState.hiringProcess)}
            </div>
        </div>

        <!-- 4. Eligibility & General Hiring Criteria -->
        <div style="background:var(--card-bg, white);border:1px solid var(--border-color);border-radius:14px;padding:1.5rem;margin-bottom:1.5rem;">
            <h3 style="margin:0 0 1rem;font-size:1.05rem;color:var(--text-main);display:flex;align-items:center;gap:0.5rem;">📋 Eligibility & Screening Criteria</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:1rem;">
                <div>
                    <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">Minimum CGPA / Percentage</label>
                    <input type="number" step="0.1" id="critCgpa" value="${crit.minCgpa || 6.0}" placeholder="6.0" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                </div>
                <div>
                    <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">Max Allowed Backlogs</label>
                    <input type="number" id="critBacklogs" value="${crit.allowedBacklogs !== undefined ? crit.allowedBacklogs : 0}" placeholder="0" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                </div>
                <div>
                    <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">Experience Target</label>
                    <input type="text" id="critExp" value="${sanitize(crit.experienceRange || 'Freshers (0-2 Yrs)')}" placeholder="Freshers (0-2 Yrs)" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                </div>
            </div>
            <div style="margin-top:1rem;">
                <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">Key Focus Technical Skills (Comma-separated)</label>
                <input type="text" id="critSkills" value="${sanitize((crit.keyFocusSkills || []).join(', '))}" placeholder="Data Structures, Algorithms, JavaScript, System Design, SQL" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
            </div>
        </div>
    `;
}

function renderHiringRoundsHtml(rounds) {
    if (!rounds || rounds.length === 0) {
        return '<div style="text-align:center;padding:2rem;color:var(--text-muted);background:var(--bg-muted);border-radius:10px;">No hiring rounds defined yet. Click "+ Add Selection Round" above.</div>';
    }

    return rounds.map((r, i) => `
        <div class="round-card" data-index="${i}" style="border:1px solid var(--border-color);border-radius:12px;padding:1.25rem;background:var(--bg-muted, #f8fafc);position:relative;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.85rem;flex-wrap:wrap;gap:0.5rem;">
                <div style="display:flex;align-items:center;gap:0.6rem;">
                    <span style="width:28px;height:28px;background:var(--primary);color:white;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;">${i + 1}</span>
                    <span style="font-weight:700;font-size:0.95rem;color:var(--text-main);">Round ${i + 1}</span>
                </div>
                <button type="button" onclick="removeHiringRound(${i})" style="background:none;border:none;color:#ef4444;font-size:0.8rem;cursor:pointer;font-weight:600;">🗑 Remove Round</button>
            </div>
            <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
                <div>
                    <label style="font-size:0.72rem;color:var(--text-muted);display:block;margin-bottom:0.2rem;font-weight:600;">Round Name</label>
                    <input type="text" class="round-name" value="${sanitize(r.roundName || '')}" placeholder="e.g. Technical Assessment" style="width:100%;padding:0.5rem 0.65rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                </div>
                <div>
                    <label style="font-size:0.72rem;color:var(--text-muted);display:block;margin-bottom:0.2rem;font-weight:600;">Round Type</label>
                    <select class="round-type" style="width:100%;padding:0.5rem 0.65rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                        <option value="online_assessment" ${r.roundType==='online_assessment'?'selected':''}>Online Assessment</option>
                        <option value="technical_interview" ${r.roundType==='technical_interview'?'selected':''}>Technical Interview</option>
                        <option value="system_design" ${r.roundType==='system_design'?'selected':''}>System Design</option>
                        <option value="managerial" ${r.roundType==='managerial'?'selected':''}>Managerial Round</option>
                        <option value="hr_discussion" ${r.roundType==='hr_discussion'?'selected':''}>HR Discussion</option>
                        <option value="group_discussion" ${r.roundType==='group_discussion'?'selected':''}>Group Discussion</option>
                        <option value="other" ${r.roundType==='other'?'selected':''}>Other</option>
                    </select>
                </div>
                <div>
                    <label style="font-size:0.72rem;color:var(--text-muted);display:block;margin-bottom:0.2rem;font-weight:600;">Duration (Mins)</label>
                    <input type="number" class="round-duration" value="${r.durationMinutes || 45}" placeholder="45" style="width:100%;padding:0.5rem 0.65rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                </div>
                <div>
                    <label style="font-size:0.72rem;color:var(--text-muted);display:block;margin-bottom:0.2rem;font-weight:600;">Mode</label>
                    <select class="round-mode" style="width:100%;padding:0.5rem 0.65rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                        <option value="online" ${r.mode==='online'?'selected':''}>Online</option>
                        <option value="offline" ${r.mode==='offline'?'selected':''}>Onsite / In-Person</option>
                        <option value="hybrid" ${r.mode==='hybrid'?'selected':''}>Hybrid</option>
                    </select>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:3fr 1fr;gap:0.75rem;">
                <div>
                    <label style="font-size:0.72rem;color:var(--text-muted);display:block;margin-bottom:0.2rem;font-weight:600;">Round Description / Syllabus</label>
                    <input type="text" class="round-desc" value="${sanitize(r.description || '')}" placeholder="Key topics tested, number of coding problems, system design focus..." style="width:100%;padding:0.5rem 0.65rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                </div>
                <div>
                    <label style="font-size:0.72rem;color:var(--text-muted);display:block;margin-bottom:0.2rem;font-weight:600;">Cutoff / Criteria</label>
                    <input type="text" class="round-cutoff" value="${sanitize(r.cutoffScore || '')}" placeholder="e.g. 75% or 2/2 solved" style="width:100%;padding:0.5rem 0.65rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                </div>
            </div>
        </div>
    `).join('');
}

function syncCurrentRoundsFromDOM() {
    const cards = document.querySelectorAll('.round-card');
    const updated = [];
    cards.forEach((card, idx) => {
        const name = card.querySelector('.round-name')?.value || `Round ${idx + 1}`;
        const type = card.querySelector('.round-type')?.value || 'technical_interview';
        const dur = parseInt(card.querySelector('.round-duration')?.value || '45');
        const mode = card.querySelector('.round-mode')?.value || 'online';
        const desc = card.querySelector('.round-desc')?.value || '';
        const cutoff = card.querySelector('.round-cutoff')?.value || '';
        updated.push({
            roundNumber: idx + 1,
            roundName: name,
            roundType: type,
            durationMinutes: dur,
            mode: mode,
            description: desc,
            cutoffScore: cutoff
        });
    });
    recState.hiringProcess = updated;
    return updated;
}

function addHiringRound() {
    syncCurrentRoundsFromDOM();
    const count = (recState.hiringProcess || []).length;
    recState.hiringProcess.push({
        roundNumber: count + 1,
        roundName: `Round ${count + 1}`,
        roundType: 'technical_interview',
        durationMinutes: 45,
        cutoffScore: 'Pass',
        mode: 'online',
        description: 'Technical evaluation'
    });
    const container = document.getElementById('roundsContainer');
    if (container) container.innerHTML = renderHiringRoundsHtml(recState.hiringProcess);
}

function removeHiringRound(idx) {
    syncCurrentRoundsFromDOM();
    recState.hiringProcess.splice(idx, 1);
    const container = document.getElementById('roundsContainer');
    if (container) container.innerHTML = renderHiringRoundsHtml(recState.hiringProcess);
}

async function saveCompanyProfileAndRounds() {
    const btn = document.getElementById('btnSaveCompany');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

    const hiringRounds = syncCurrentRoundsFromDOM();
    const skillsRaw = document.getElementById('critSkills')?.value || '';
    const skillsArr = skillsRaw.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
        name: document.getElementById('coName')?.value.trim() || '',
        website: document.getElementById('coWeb')?.value.trim() || '',
        domain: document.getElementById('coDomain')?.value || 'product',
        industry: document.getElementById('coIndustry')?.value.trim() || 'Technology',
        size: document.getElementById('coSize')?.value || 'startup',
        headquarter: document.getElementById('coHQ')?.value.trim() || '',
        foundedYear: document.getElementById('coFounded')?.value || null,
        description: document.getElementById('coDesc')?.value.trim() || '',
        hrName: document.getElementById('coHrName')?.value.trim() || '',
        hrEmail: document.getElementById('coHrEmail')?.value.trim() || '',
        hrPhone: document.getElementById('coHrPhone')?.value.trim() || '',
        companyEmail: document.getElementById('coOfficialEmail')?.value.trim() || '',
        registrationNumber: document.getElementById('coRegNum')?.value.trim() || '',
        linkedIn: document.getElementById('coLinkedIn')?.value.trim() || '',
        address: document.getElementById('coAddress')?.value.trim() || '',
        hiringProcess: hiringRounds,
        hiringCriteria: {
            minCgpa: parseFloat(document.getElementById('critCgpa')?.value || '0') || 0,
            allowedBacklogs: parseInt(document.getElementById('critBacklogs')?.value || '0') || 0,
            experienceRange: document.getElementById('critExp')?.value.trim() || 'Freshers (0-2 Yrs)',
            keyFocusSkills: skillsArr
        }
    };

    if (!payload.name) {
        if (btn) { btn.disabled = false; btn.textContent = '🚀 Save & Submit for Verification'; }
        return showToast('Company name is required', 'error');
    }

    try {
        const res = await API.put('/companies/my-company', payload);
        recState.companyData = res.company;
        recState.companyStatus = res.company.verificationStatus;
        if (res.user) {
            API.saveAuth(API.getToken(), res.user);
            const userDisplay = res.user.name || 'Recruiter';
            const recNameEl = document.getElementById('recName');
            const recAvatarEl = document.getElementById('recAvatar');
            if (recNameEl) recNameEl.textContent = userDisplay;
            if (recAvatarEl) recAvatarEl.textContent = userDisplay.charAt(0).toUpperCase();
        }
        showVerificationBanner(recState.companyStatus, recState.companyData);
        showToast('Company profile & HR details saved successfully!', 'success');
        await loadRecSection('company');
    } catch (e) {
        showToast('Failed to save company: ' + e.message, 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '🚀 Save & Submit for Verification'; }
    }
}

// === HR / RECRUITER PROFILE MODAL ===
function openHrProfileModal() {
    let modal = document.getElementById('hrProfileModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'hrProfileModal';
        modal.className = 'modal-backdrop';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1rem;';
        document.body.appendChild(modal);
    }
    const user = API.getUser() || {};
    const co = recState.companyData || {};
    
    modal.innerHTML = `
        <div style="background:var(--card-bg, white);border-radius:16px;max-width:500px;width:100%;padding:2rem;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
                <div style="display:flex;align-items:center;gap:0.75rem;">
                    <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg, #3b82f6, #8b5cf6);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1rem;">
                        ${(user.name || 'R').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 style="margin:0;font-size:1.1rem;color:var(--text-main);">👨‍💼 HR / Recruiter Profile</h3>
                        <div style="font-size:0.75rem;color:var(--text-muted);">Manage your account credentials & contact info</div>
                    </div>
                </div>
                <button onclick="document.getElementById('hrProfileModal').style.display='none'" style="background:none;border:none;font-size:1.25rem;cursor:pointer;color:var(--text-muted);">✕</button>
            </div>
            <form id="hrProfileForm" onsubmit="saveHrProfileDirect(event)" style="display:grid;gap:1rem;">
                <div>
                    <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">Full Name / HR Name *</label>
                    <input type="text" id="hrModalName" value="${sanitize(user.name || co.hrName || '')}" required style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                </div>
                <div>
                    <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">Work Email *</label>
                    <input type="email" id="hrModalEmail" value="${sanitize(user.email || co.hrEmail || '')}" required style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                </div>
                <div>
                    <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">Contact Phone</label>
                    <input type="tel" id="hrModalPhone" value="${sanitize(co.hrPhone || '')}" placeholder="+91 98765 43210" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                </div>
                <div>
                    <label style="font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:0.25rem;">New Password (Optional, leave blank to keep current)</label>
                    <input type="password" id="hrModalPassword" placeholder="••••••••" minlength="6" style="width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                </div>
                <div style="display:flex;justify-content:flex-end;gap:0.75rem;margin-top:0.5rem;">
                    <button type="button" onclick="document.getElementById('hrProfileModal').style.display='none'" class="btn btn-outline" style="padding:0.5rem 1.25rem;font-size:0.85rem;border-radius:8px;">Cancel</button>
                    <button type="submit" id="btnSaveHrModal" class="btn btn-primary" style="padding:0.5rem 1.5rem;font-size:0.85rem;border-radius:8px;font-weight:600;">Save Profile</button>
                </div>
            </form>
        </div>
    `;
    modal.style.display = 'flex';
}

async function saveHrProfileDirect(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSaveHrModal');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }
    const name = document.getElementById('hrModalName')?.value.trim();
    const email = document.getElementById('hrModalEmail')?.value.trim();
    const phone = document.getElementById('hrModalPhone')?.value.trim();
    const password = document.getElementById('hrModalPassword')?.value;
    
    if (!name || !email) {
        if (btn) { btn.disabled = false; btn.textContent = 'Save Profile'; }
        return showToast('Name and email are required', 'error');
    }

    try {
        const res = await API.put('/companies/hr-profile', { name, email, phone, password: password || undefined });
        if (res.user) {
            API.saveAuth(API.getToken(), res.user);
            const userDisplay = res.user.name || 'Recruiter';
            const recNameEl = document.getElementById('recName');
            const recAvatarEl = document.getElementById('recAvatar');
            if (recNameEl) recNameEl.textContent = userDisplay;
            if (recAvatarEl) recAvatarEl.textContent = userDisplay.charAt(0).toUpperCase();
        }
        showToast('HR Profile updated successfully!', 'success');
        document.getElementById('hrProfileModal').style.display = 'none';
        const coHrName = document.getElementById('coHrName');
        const coHrEmail = document.getElementById('coHrEmail');
        const coHrPhone = document.getElementById('coHrPhone');
        if (coHrName) coHrName.value = name;
        if (coHrEmail) coHrEmail.value = email;
        if (coHrPhone && phone) coHrPhone.value = phone;
    } catch(err) {
        showToast('Failed to update HR profile: ' + err.message, 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Save Profile'; }
    }
}

// ══════════════ 📄 Applicants & Top Performers ══════════════
let recApplicantsCache = [];

async function renderRecApplicants(c) {
    let data = { applications: [], jobs: [], stats: {} };
    try {
        data = await API.get('/applications/recruiter/all');
    } catch(e) {
        data = { applications: [], jobs: [], stats: {} };
    }

    recApplicantsCache = data.applications || [];
    const apps = recApplicantsCache;
    const jobs = data.jobs || [];
    const stats = data.stats || {};
    const topPerformers = apps.filter(a => a.isTopPerformer);

    c.innerHTML = `
    <div class="metric-grid">
        <div class="metric-card" style="border-left:4px solid #3b82f6;">
            <div class="label">Total Applicants</div>
            <div class="value">${stats.totalApplicants || apps.length}</div>
        </div>
        <div class="metric-card" style="border-left:4px solid #f59e0b;">
            <div class="label">🏆 Top Performers</div>
            <div class="value">${topPerformers.length}</div>
        </div>
        <div class="metric-card" style="border-left:4px solid #8b5cf6;">
            <div class="label">🎯 Shortlisted</div>
            <div class="value">${stats.shortlistedCount || 0}</div>
        </div>
        <div class="metric-card" style="border-left:4px solid #10b981;">
            <div class="label">📅 Interviews Scheduled</div>
            <div class="value">${stats.interviewCount || 0}</div>
        </div>
    </div>

    <!-- ⭐ Top Performer Spotlight Card -->
    ${topPerformers.length > 0 ? `
    <div style="background:linear-gradient(135deg, rgba(245,158,11,0.08), rgba(249,115,22,0.08));border:1px solid rgba(245,158,11,0.3);border-radius:14px;padding:1.5rem;margin-bottom:1.5rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem;">
            <div>
                <h3 style="margin:0;font-size:1.1rem;color:#b45309;display:flex;align-items:center;gap:0.5rem;">
                    <span>🏆</span> Top Performer Candidates Spotlight (${topPerformers.length})
                </h3>
                <small style="color:var(--text-muted);">AI-ranked high composite match candidates recommended for immediate interviews.</small>
            </div>
            <span style="font-size:0.75rem;background:#fef3c7;color:#92400e;padding:0.25rem 0.6rem;border-radius:999px;font-weight:700;border:1px solid #fde68a;">⭐ High Priority</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;">
            ${topPerformers.slice(0, 3).map(tp => `
                <div style="background:var(--card-bg, #ffffff);border:1px solid rgba(245,158,11,0.25);border-radius:10px;padding:1rem;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 2px 8px rgba(0,0,0,0.03);">
                    <div>
                        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.5rem;">
                            <div>
                                <strong style="font-size:0.95rem;color:var(--text-main);">${sanitize(tp.studentId?.name || 'Candidate')}</strong>
                                <div style="font-size:0.75rem;color:var(--text-muted);">${sanitize(tp.jobId?.title || 'Job')}</div>
                            </div>
                            <span style="font-size:0.75rem;background:#dcfce7;color:#15803d;padding:0.15rem 0.5rem;border-radius:6px;font-weight:700;">${tp.skillMatch}% Match</span>
                        </div>
                        <div style="display:flex;gap:0.35rem;flex-wrap:wrap;margin-bottom:0.75rem;">
                            ${(tp.badges || []).map(b => `<span style="font-size:0.65rem;background:rgba(245,158,11,0.15);color:#b45309;padding:0.15rem 0.4rem;border-radius:4px;font-weight:600;">${b}</span>`).join('')}
                        </div>
                        <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.75rem;">
                            ${tp.profile?.education ? `🎓 ${sanitize(tp.profile.education)}<br>` : ''}
                            ${tp.profile?.skills ? `🛠️ ${sanitize(tp.profile.skills.slice(0, 4).map(s=>s.name||s).join(', '))}` : ''}
                        </div>
                    </div>
                    <div style="display:flex;gap:0.5rem;margin-top:0.5rem;">
                        <button onclick="inspectApplicantModal('${tp._id}')" class="btn btn-outline" style="flex:1;padding:0.35rem;font-size:0.75rem;">👁️ Profile</button>
                        <button onclick="openScheduleInterviewModal('${tp._id}', '${sanitize(tp.studentId?.name||'Candidate')}', '${sanitize(tp.jobId?.title||'Job')}')" class="btn btn-primary" style="flex:1;padding:0.35rem;font-size:0.75rem;background:#f59e0b;border-color:#f59e0b;color:white;">⚡ Fast-Track</button>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}

    <!-- Search & Filter Toolbar -->
    <div style="display:flex;gap:0.75rem;align-items:center;justify-content:space-between;margin-bottom:1.25rem;flex-wrap:wrap;">
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;flex:1;">
            <input type="text" id="recAppSearch" placeholder="Search candidate, email, skills, college..." onkeyup="filterRecApplicantsTable()" style="min-width:240px;padding:0.5rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);">
            <select id="recAppJobFilter" onchange="filterRecApplicantsTable()" style="padding:0.5rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);">
                <option value="all">All My Job Postings</option>
                ${jobs.map(j => `<option value="${j._id}">${sanitize(j.title)}</option>`).join('')}
            </select>
            <select id="recAppStageFilter" onchange="filterRecApplicantsTable()" style="padding:0.5rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);">
                <option value="all">All Stages</option>
                <option value="new">New</option>
                <option value="in-review">In Review</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
                <option value="selected">Selected / Offer</option>
                <option value="rejected">Rejected</option>
            </select>
            <select id="recAppMatchFilter" onchange="filterRecApplicantsTable()" style="padding:0.5rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);">
                <option value="0">Min Match: Any</option>
                <option value="50">Min Match: 50%+</option>
                <option value="75">Min Match: 75%+</option>
                <option value="85">Min Match: 85%+</option>
            </select>
        </div>
        <div style="display:flex;gap:0.5rem;">
            <button onclick="exportRecruiterCSV()" class="btn btn-outline" style="padding:0.5rem 1rem;font-size:0.8rem;">📥 Export CSV</button>
            <button onclick="loadRecSection('applicants')" class="btn btn-outline" style="padding:0.5rem 1rem;font-size:0.8rem;">🔄 Refresh</button>
        </div>
    </div>

    <!-- Applicants Table -->
    <div class="chart-card">
        <h3>📄 Candidate Applications (${apps.length})</h3>
        <table class="data-table" id="recApplicantsTable">
            <thead>
                <tr>
                    <th>Candidate</th>
                    <th>Target Role</th>
                    <th>Skill Match</th>
                    <th>Hire Probability</th>
                    <th>ATS Score</th>
                    <th>Status / Stage</th>
                    <th style="text-align:right;">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${apps.length === 0 ? '<tr><td colspan="7" style="text-align:center;padding:3rem;color:var(--text-muted);">No candidate applications found for your postings.</td></tr>' : apps.map(a => {
                    const matchColor = a.skillMatch >= 75 ? '#10b981' : a.skillMatch >= 50 ? '#3b82f6' : '#f59e0b';
                    const probColor = a.hiringProbability >= 75 ? '#10b981' : a.hiringProbability >= 50 ? '#3b82f6' : '#64748b';
                    const textSearch = sanitize(((a.studentId?.name||'') + ' ' + (a.studentId?.email||'') + ' ' + (a.jobId?.title||'') + ' ' + (a.profile?.education||'') + ' ' + (a.matchedSkills||[]).join(' ')).toLowerCase());
                    return `
                    <tr data-job-id="${a.jobId?._id || ''}" data-stage="${a.status || 'applied'}" data-match="${a.skillMatch || 0}" data-text="${textSearch}">
                        <td>
                            <div style="display:flex;align-items:center;gap:0.75rem;">
                                <div style="width:36px;height:36px;border-radius:50%;background:#3b82f6;color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;flex-shrink:0;">
                                    ${(a.studentId?.name || 'C').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style="font-weight:600;color:var(--text-main);display:flex;align-items:center;gap:0.35rem;">
                                        ${sanitize(a.studentId?.name || 'Candidate')}
                                        ${a.isTopPerformer ? '<span title="Top Performer" style="font-size:0.8rem;">🏆</span>' : ''}
                                    </div>
                                    <div style="font-size:0.75rem;color:var(--text-muted);">${sanitize(a.studentId?.email || '')}</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div style="font-weight:600;font-size:0.85rem;">${sanitize(a.jobId?.title || 'Job')}</div>
                            <div style="font-size:0.75rem;color:var(--text-muted);">${sanitize(a.jobId?.department || a.jobId?.location || 'General')}</div>
                        </td>
                        <td>
                            <div style="display:flex;align-items:center;gap:0.5rem;">
                                <div style="font-weight:700;color:${matchColor};font-size:0.9rem;">${a.skillMatch || 0}%</div>
                                <div style="width:50px;height:6px;background:var(--bg-muted);border-radius:3px;overflow:hidden;">
                                    <div style="width:${a.skillMatch||0}%;height:100%;background:${matchColor};"></div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div style="font-weight:700;color:${probColor};">${a.hiringProbability || 0}%</div>
                            <small style="font-size:0.7rem;color:var(--text-muted);">${a.recommendation || ''}</small>
                        </td>
                        <td>
                            <span style="font-weight:600;font-size:0.85rem;color:${a.profile?.resumeScore>=75?'#10b981':'#64748b'};">${a.profile?.resumeScore || 0}%</span>
                        </td>
                        <td>
                            <select onchange="updateRecAppStage('${a._id}', this.value)" style="padding:0.3rem 0.5rem;font-size:0.75rem;border-radius:6px;border:1px solid var(--border-color);background:var(--input-bg);font-weight:600;">
                                <option value="new" ${a.status==='new'?'selected':''}>New</option>
                                <option value="in-review" ${a.status==='in-review'?'selected':''}>In Review</option>
                                <option value="shortlisted" ${a.status==='shortlisted'?'selected':''}>Shortlisted</option>
                                <option value="interview" ${a.status==='interview'?'selected':''}>Interview</option>
                                <option value="selected" ${a.status==='selected'?'selected':''}>Selected / Offer</option>
                                <option value="rejected" ${a.status==='rejected'?'selected':''}>Rejected</option>
                            </select>
                        </td>
                        <td style="text-align:right;white-space:nowrap;">
                            <button onclick="inspectApplicantModal('${a._id}')" class="btn btn-outline" style="padding:0.25rem 0.6rem;font-size:0.75rem;margin-right:0.3rem;">👁️ Profile</button>
                            <button onclick="openScheduleInterviewModal('${a._id}', '${sanitize(a.studentId?.name||'Candidate')}', '${sanitize(a.jobId?.title||'Job')}')" class="btn btn-outline" style="padding:0.25rem 0.6rem;font-size:0.75rem;color:#3b82f6;border-color:rgba(59,130,246,0.3);">📅 Schedule</button>
                        </td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
    </div>

    <!-- Candidate Detail Inspector Modal Container -->
    <div id="applicantInspectorModal" style="display:none;position:fixed;inset:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(4px);z-index:99999;align-items:center;justify-content:center;padding:1.5rem;"></div>

    <!-- Schedule Interview Modal Container -->
    <div id="scheduleInterviewModal" style="display:none;position:fixed;inset:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(4px);z-index:99999;align-items:center;justify-content:center;padding:1.5rem;"></div>
    `;
}

function filterRecApplicantsTable() {
    const s = (document.getElementById('recAppSearch')?.value || '').toLowerCase();
    const jId = document.getElementById('recAppJobFilter')?.value || 'all';
    const stage = document.getElementById('recAppStageFilter')?.value || 'all';
    const minMatch = parseInt(document.getElementById('recAppMatchFilter')?.value || '0');

    document.querySelectorAll('#recApplicantsTable tbody tr').forEach(r => {
        const txt = r.getAttribute('data-text') || '';
        const rowJob = r.getAttribute('data-job-id') || '';
        const rowStage = r.getAttribute('data-stage') || '';
        const rowMatch = parseInt(r.getAttribute('data-match') || '0');

        const matchSearch = !s || txt.includes(s);
        const matchJob = jId === 'all' || rowJob === jId;
        const matchStage = stage === 'all' || (stage === 'applied' && (rowStage === 'applied' || rowStage === 'new')) || rowStage === stage;
        const matchScore = rowMatch >= minMatch;

        r.style.display = (matchSearch && matchJob && matchStage && matchScore) ? '' : 'none';
    });
}

async function updateRecAppStage(id, status) {
    try {
        await API.put(`/applications/${id}/status`, { status });
        showToast(`Candidate stage updated to ${status.toUpperCase()}`, 'success');
        const r = document.querySelector(`tr[data-job-id][data-stage]`);
        if (r) r.setAttribute('data-stage', status);
    } catch(e) {
        showToast('Error updating stage: ' + e.message, 'error');
    }
}

// ══════════════ 👁️ Full Candidate Profile Inspector Modal ══════════════
function inspectApplicantModal(appId) {
    const app = recApplicantsCache.find(a => a._id === appId);
    if (!app) return;

    const modal = document.getElementById('applicantInspectorModal');
    if (!modal) return;

    const prof = app.profile || {};
    const skills = prof.skills || [];

    modal.innerHTML = `
        <div style="background:var(--card-bg, #ffffff);color:var(--text-main);border-radius:16px;max-width:750px;width:100%;max-height:85vh;overflow-y:auto;padding:2rem;border:1px solid var(--border-color);box-shadow:0 25px 50px rgba(0,0,0,0.25);position:relative;">
            <button onclick="document.getElementById('applicantInspectorModal').style.display='none'" style="position:absolute;right:1.25rem;top:1.25rem;width:32px;height:32px;border-radius:50%;background:var(--bg-muted);border:1px solid var(--border-color);font-size:1.2rem;cursor:pointer;">✕</button>
            
            <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;border-bottom:1px solid var(--border-color);padding-bottom:1.25rem;">
                <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg, #3b82f6, #1d4ed8);color:white;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;">
                    ${(app.studentId?.name || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 style="margin:0 0 0.25rem;font-size:1.3rem;">${sanitize(app.studentId?.name || 'Candidate Profile')}</h2>
                    <div style="font-size:0.85rem;color:var(--text-muted);">📧 ${sanitize(app.studentId?.email || 'N/A')} • 📱 ${sanitize(app.studentId?.phone || 'Not specified')}</div>
                </div>
            </div>

            <!-- Scores Strip -->
            <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:1rem;background:var(--bg-muted);padding:1rem;border-radius:10px;margin-bottom:1.5rem;">
                <div style="text-align:center;">
                    <small style="color:var(--text-muted);display:block;font-size:0.75rem;text-transform:uppercase;">Skill Match</small>
                    <strong style="font-size:1.3rem;color:#10b981;">${app.skillMatch}%</strong>
                </div>
                <div style="text-align:center;">
                    <small style="color:var(--text-muted);display:block;font-size:0.75rem;text-transform:uppercase;">Hiring Probability</small>
                    <strong style="font-size:1.3rem;color:#3b82f6;">${app.hiringProbability}%</strong>
                </div>
                <div style="text-align:center;">
                    <small style="color:var(--text-muted);display:block;font-size:0.75rem;text-transform:uppercase;">ATS Resume Score</small>
                    <strong style="font-size:1.3rem;color:#f59e0b;">${prof.resumeScore || 0}%</strong>
                </div>
            </div>

            <!-- Matched vs Missing Skills -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">
                <div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2);padding:1rem;border-radius:8px;">
                    <h4 style="margin:0 0 0.5rem;font-size:0.85rem;color:#15803d;">✓ Matched Skills (${(app.matchedSkills||[]).length})</h4>
                    <div style="display:flex;gap:0.35rem;flex-wrap:wrap;">
                        ${(app.matchedSkills||[]).map(s => `<span style="font-size:0.75rem;background:#dcfce7;color:#15803d;padding:0.2rem 0.5rem;border-radius:4px;font-weight:600;">${sanitize(s)}</span>`).join('') || '<span style="font-size:0.75rem;color:var(--text-muted);">None</span>'}
                    </div>
                </div>
                <div style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);padding:1rem;border-radius:8px;">
                    <h4 style="margin:0 0 0.5rem;font-size:0.85rem;color:#991b1b;">⚠️ Missing Skills (${(app.missingSkills||[]).length})</h4>
                    <div style="display:flex;gap:0.35rem;flex-wrap:wrap;">
                        ${(app.missingSkills||[]).map(s => `<span style="font-size:0.75rem;background:#fee2e2;color:#991b1b;padding:0.2rem 0.5rem;border-radius:4px;font-weight:600;">${sanitize(s)}</span>`).join('') || '<span style="font-size:0.75rem;color:#15803d;">All key skills present!</span>'}
                    </div>
                </div>
            </div>

            <!-- Education & Experience -->
            <div style="margin-bottom:1.5rem;">
                <h4 style="font-size:0.95rem;margin:0 0 0.5rem;">🎓 Education & Background</h4>
                <div style="background:var(--bg-muted);padding:0.85rem 1rem;border-radius:8px;font-size:0.875rem;color:var(--text-main);">
                    ${sanitize(prof.education || 'Self-taught / Degree details on resume')}
                </div>
            </div>

            <div style="margin-bottom:1.5rem;">
                <h4 style="font-size:0.95rem;margin:0 0 0.5rem;">💼 Experience Summary</h4>
                <div style="background:var(--bg-muted);padding:0.85rem 1rem;border-radius:8px;font-size:0.875rem;color:var(--text-main);line-height:1.5;">
                    ${sanitize(prof.experience || 'No previous experience logged.')}
                </div>
            </div>

            <div style="display:flex;gap:0.75rem;justify-content:flex-end;border-top:1px solid var(--border-color);padding-top:1.25rem;">
                <button onclick="document.getElementById('applicantInspectorModal').style.display='none'" class="btn btn-outline">Close</button>
                <button onclick="document.getElementById('applicantInspectorModal').style.display='none';openScheduleInterviewModal('${app._id}', '${sanitize(app.studentId?.name||'Candidate')}', '${sanitize(app.jobId?.title||'Job')}')" class="btn btn-primary">📅 Schedule Interview Round</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

// ══════════════ 📅 Schedule Interview Modal ══════════════
function openScheduleInterviewModal(appId, candidateName, jobTitle) {
    const modal = document.getElementById('scheduleInterviewModal');
    if (!modal) return;

    modal.innerHTML = `
        <div style="background:var(--card-bg, #ffffff);color:var(--text-main);border-radius:16px;max-width:520px;width:100%;padding:2rem;border:1px solid var(--border-color);box-shadow:0 25px 50px rgba(0,0,0,0.25);position:relative;">
            <button onclick="document.getElementById('scheduleInterviewModal').style.display='none'" style="position:absolute;right:1.25rem;top:1.25rem;width:32px;height:32px;border-radius:50%;background:var(--bg-muted);border:1px solid var(--border-color);font-size:1.2rem;cursor:pointer;">✕</button>
            
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
                <div style="font-size:2rem;">📅</div>
                <div>
                    <h3 style="margin:0;font-size:1.2rem;">Schedule Interview</h3>
                    <small style="color:var(--text-muted);">${sanitize(candidateName)} • ${sanitize(jobTitle)}</small>
                </div>
            </div>

            <form id="scheduleInterviewForm" onsubmit="submitScheduleInterview(event, '${appId}')">
                <div style="margin-bottom:1rem;">
                    <label style="display:block;font-size:0.8rem;font-weight:600;margin-bottom:0.35rem;">Interview Round</label>
                    <input type="text" id="schedRoundName" value="Round 1: Technical & Problem Solving" required style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);">
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;">
                    <div>
                        <label style="display:block;font-size:0.8rem;font-weight:600;margin-bottom:0.35rem;">Date & Time</label>
                        <input type="datetime-local" id="schedDateTime" required style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);">
                    </div>
                    <div>
                        <label style="display:block;font-size:0.8rem;font-weight:600;margin-bottom:0.35rem;">Mode / Type</label>
                        <select id="schedType" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);">
                            <option value="video">Online Video Call (Google Meet / Zoom)</option>
                            <option value="technical">Live Coding Assessment</option>
                            <option value="phone">Phone Screening</option>
                            <option value="onsite">On-Site Office Interview</option>
                        </select>
                    </div>
                </div>

                <div style="margin-bottom:1rem;">
                    <label style="display:block;font-size:0.8rem;font-weight:600;margin-bottom:0.35rem;">Meeting Link / Venue</label>
                    <input type="text" id="schedMeetingLink" placeholder="https://meet.google.com/xyz or Office Address" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);">
                </div>

                <div style="margin-bottom:1.5rem;">
                    <label style="display:block;font-size:0.8rem;font-weight:600;margin-bottom:0.35rem;">Preparation Notes for Candidate</label>
                    <textarea id="schedNotes" rows="3" placeholder="e.g. Please be ready with your laptop and IDE for coding round..." style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);resize:vertical;"></textarea>
                </div>

                <div style="display:flex;gap:0.75rem;justify-content:flex-end;">
                    <button type="button" onclick="document.getElementById('scheduleInterviewModal').style.display='none'" class="btn btn-outline">Cancel</button>
                    <button type="submit" id="schedSubmitBtn" class="btn btn-primary">⚡ Send Interview Invitation</button>
                </div>
            </form>
        </div>
    `;

    // Default datetime to tomorrow 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const dateInput = document.getElementById('schedDateTime');
    if (dateInput) dateInput.value = tomorrow.toISOString().slice(0, 16);

    modal.style.display = 'flex';
}

async function submitScheduleInterview(e, appId) {
    e.preventDefault();
    const btn = document.getElementById('schedSubmitBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending Invitation...'; }

    const payload = {
        roundName: document.getElementById('schedRoundName')?.value,
        interviewDate: document.getElementById('schedDateTime')?.value,
        interviewType: document.getElementById('schedType')?.value,
        meetingLink: document.getElementById('schedMeetingLink')?.value,
        interviewNotes: document.getElementById('schedNotes')?.value
    };

    try {
        await API.post(`/applications/${appId}/schedule-interview`, payload);
        showToast('Interview scheduled! Invitation delivered to candidate.', 'success');
        document.getElementById('scheduleInterviewModal').style.display = 'none';
        await loadRecSection('applicants');
    } catch(err) {
        showToast('Failed to schedule interview: ' + err.message, 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '⚡ Send Interview Invitation'; }
    }
}

// ══════════════ 📅 Scheduled Interviews View ══════════════
async function renderRecInterviews(c) {
    let data = { interviews: [] };
    try {
        data = await API.get('/applications/recruiter/interviews');
    } catch(e) {}

    const interviews = data.interviews || [];

    c.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
        <div>
            <h2 style="margin:0 0 0.25rem;font-size:1.25rem;">📅 Upcoming Candidate Interviews (${interviews.length})</h2>
            <small style="color:var(--text-muted);">Track scheduled rounds, meeting links, and candidate preparation status.</small>
        </div>
        <button onclick="loadRecSection('interviews')" class="btn btn-outline" style="padding:0.45rem 1rem;font-size:0.8rem;">🔄 Refresh</button>
    </div>

    ${interviews.length === 0 ? `
        <div class="chart-card" style="text-align:center;padding:4rem;color:var(--text-muted);">
            <div style="font-size:3rem;margin-bottom:0.75rem;">📅</div>
            <h3>No Scheduled Interviews</h3>
            <p style="font-size:0.875rem;margin-bottom:1.25rem;">Go to the Applicants section and click "Schedule" to invite candidates to interview rounds.</p>
            <button onclick="loadRecSection('applicants')" class="btn btn-primary">Browse Applicants →</button>
        </div>
    ` : `
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(340px, 1fr));gap:1rem;">
            ${interviews.map(inv => `
                <div class="chart-card" style="border-left:4px solid #3b82f6;display:flex;flex-direction:column;justify-content:space-between;">
                    <div>
                        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem;">
                            <div>
                                <span style="font-size:0.75rem;background:#dbeafe;color:#1e40af;padding:0.2rem 0.5rem;border-radius:4px;font-weight:700;">${sanitize(inv.roundName || 'Interview Round')}</span>
                            </div>
                            <span style="font-size:0.75rem;color:var(--text-muted);">${inv.interviewType?.toUpperCase() || 'VIDEO'}</span>
                        </div>
                        <h3 style="margin:0 0 0.35rem;font-size:1.05rem;color:var(--text-main);">${sanitize(inv.studentId?.name || 'Candidate')}</h3>
                        <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.75rem;">
                            💼 Role: <strong>${sanitize(inv.jobId?.title || 'Job')}</strong><br>
                            📧 ${sanitize(inv.studentId?.email || '')}
                        </div>
                        <div style="background:var(--bg-muted);padding:0.75rem;border-radius:8px;font-size:0.8rem;margin-bottom:0.75rem;">
                            <strong>🕒 Scheduled Time:</strong><br>
                            ${inv.interviewDate ? new Date(inv.interviewDate).toLocaleString() : 'TBD'}
                        </div>
                        ${inv.meetingLink ? `
                            <div style="font-size:0.8rem;margin-bottom:0.5rem;word-break:break-all;">
                                <strong>🔗 Link:</strong> <a href="${inv.meetingLink}" target="_blank" style="color:var(--primary);font-weight:600;">${sanitize(inv.meetingLink)}</a>
                            </div>
                        ` : ''}
                        ${inv.interviewNotes ? `<div style="font-size:0.75rem;color:var(--text-muted);font-style:italic;">"${sanitize(inv.interviewNotes)}"</div>` : ''}
                    </div>
                    <div style="display:flex;gap:0.5rem;margin-top:1rem;border-top:1px solid var(--border-color);padding-top:0.75rem;">
                        <button onclick="updateRecAppStage('${inv._id}', 'selected'); loadRecSection('interviews');" class="btn btn-outline" style="flex:1;padding:0.35rem;font-size:0.75rem;color:#10b981;border-color:rgba(16,185,129,0.3);">✓ Select / Offer</button>
                        <button onclick="updateRecAppStage('${inv._id}', 'rejected'); loadRecSection('interviews');" class="btn btn-outline" style="flex:1;padding:0.35rem;font-size:0.75rem;color:#ef4444;border-color:rgba(239,68,68,0.3);">✕ Reject</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `}
    `;
}

// Window Bindings for Recruiter Handlers
window.loadRecSection = loadRecSection;
window.viewJobPipeline = viewJobPipeline;
window.deleteJobPosting = deleteJobPosting;
window.movePipeline = movePipeline;
window.updateCompareBtn = updateCompareBtn;
window.toggleAllCompare = toggleAllCompare;
window.compareSelected = compareSelected;
window.openRecNotification = openRecNotification;
window.addHiringRound = addHiringRound;
window.removeHiringRound = removeHiringRound;
window.saveCompanyProfileAndRounds = saveCompanyProfileAndRounds;
window.openHrProfileModal = openHrProfileModal;
window.saveHrProfileDirect = saveHrProfileDirect;
window.handleRecruiterLogout = handleRecruiterLogout;
window.renderRecApplicants = renderRecApplicants;
window.filterRecApplicantsTable = filterRecApplicantsTable;
window.updateRecAppStage = updateRecAppStage;
window.inspectApplicantModal = inspectApplicantModal;
window.openScheduleInterviewModal = openScheduleInterviewModal;
window.submitScheduleInterview = submitScheduleInterview;
window.renderRecInterviews = renderRecInterviews;

// ── Authenticated CSV Export ──
async function exportRecruiterCSV() {
    try {
        const token = localStorage.getItem('hs_token');
        if (!token) { showToast('Please log in to export data', 'error'); return; }
        const response = await fetch('/api/applications/export/recruiter', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Export failed: ' + response.statusText);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `applicants_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('CSV exported successfully!', 'success');
    } catch (err) {
        showToast('Failed to export CSV: ' + err.message, 'error');
    }
}
window.exportRecruiterCSV = exportRecruiterCSV;


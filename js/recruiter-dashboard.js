// recruiter-dashboard.js — Full recruiter dashboard with sidebar nav
const recState = { jobs: [], selectedJob: null, compareIds: [] };
const titles = { overview:'📊 Dashboard', jobs:'💼 My Jobs', pipeline:'🔄 Hiring Pipeline', candidates:'🔍 Candidate Search', notifications:'🔔 Notifications' };

document.addEventListener('DOMContentLoaded', () => {
    if (!API.isLoggedIn()) return window.location.href = '/frontend/auth.html';
    const user = API.getUser();
    if (user.role !== 'recruiter') return window.location.href = '/index.html';
    document.getElementById('recName').textContent = user.name;
    document.getElementById('recAvatar').textContent = user.name.charAt(0).toUpperCase();
    document.getElementById('recSignOut').addEventListener('click', () => handleLogout());

    document.querySelectorAll('.rec-sidebar .nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.rec-sidebar .nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            const section = item.dataset.section;
            document.getElementById('topbarTitle').textContent = titles[section] || section;
            loadRecSection(section);
        });
    });
    loadRecSection('overview');
});

function rc() { return document.getElementById('recContent'); }

async function loadRecSection(section) {
    const c = rc();
    c.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--text-muted);">Loading...</div>';
    try {
        if (section === 'overview') await renderRecOverview(c);
        else if (section === 'jobs') await renderRecJobs(c);
        else if (section === 'pipeline') await renderRecPipeline(c);
        else if (section === 'candidates') await renderRecCandidates(c);
        else if (section === 'notifications') await renderRecNotifs(c);
    } catch(e) { c.innerHTML = `<div style="color:#ef4444;padding:2rem;">Error: ${e.message}</div>`; }
}

// === OVERVIEW ===
async function renderRecOverview(c) {
    const data = await API.get('/jobs/recruiter/my');
    recState.jobs = data.jobs || [];
    const jobs = recState.jobs;
    const totalApps = jobs.reduce((s,j) => s + (j.applicantCount||0), 0);
    const activeJobs = jobs.filter(j => j.status === 'active').length;

    let perfData = null;
    try { perfData = await API.get('/admin/top-performers'); } catch(e) {}
    const highMatch = perfData ? (perfData.performers||[]).filter(p => p.compositeScore >= 70).length : 0;

    c.innerHTML = `
        <div class="metric-grid">
            <div class="metric-card"><div class="label">💼 Total Jobs</div><div class="value">${jobs.length}</div></div>
            <div class="metric-card"><div class="label">📄 Applicants</div><div class="value">${totalApps}</div></div>
            <div class="metric-card"><div class="label">✅ Active Jobs</div><div class="value" style="color:#10b981;">${activeJobs}</div></div>
            <div class="metric-card"><div class="label">⭐ High Match</div><div class="value" style="color:var(--primary);">${highMatch}</div><div style="font-size:0.7rem;color:var(--text-muted);">Score > 70%</div></div>
        </div>
        <div class="chart-grid">
            <div class="chart-card"><h3>📊 Applicants Per Job</h3><div style="position:relative; height:200px;"><canvas id="recAppsChart"></canvas></div></div>
            <div class="chart-card"><h3>🏆 Top Candidates</h3><div id="recTopList" style="max-height:280px;overflow-y:auto;"></div></div>
        </div>
        <div style="background:white;border-radius:12px;border:1px solid var(--border-color);overflow:hidden;">
            <div style="padding:1rem 1.25rem;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">
                <h3 style="margin:0;font-size:1rem;">Recent Jobs</h3>
                <a href="job-posting.html" class="btn btn-primary" style="font-size:0.75rem;text-decoration:none;">+ Post Job</a>
            </div>
            <table class="data-table"><thead><tr><th>Job</th><th>Status</th><th>Applicants</th><th>Posted</th></tr></thead>
            <tbody>${jobs.length===0?'<tr><td colspan="4" style="text-align:center;padding:2rem;color:var(--text-muted);">No jobs yet. <a href="job-posting.html">Post one →</a></td></tr>':jobs.slice(0,5).map(j=>`<tr>
                <td><div style="font-weight:600;">${j.title}</div><div style="font-size:0.75rem;color:var(--text-muted);">${j.companyName}</div></td>
                <td><span style="padding:0.15rem 0.5rem;border-radius:999px;font-size:0.7rem;font-weight:600;${j.status==='active'?'background:#dcfce7;color:#15803d;':'background:#fee2e2;color:#dc2626;'}">${j.status}</span></td>
                <td style="font-weight:600;">${j.applicantCount||0}</td>
                <td style="font-size:0.8rem;color:var(--text-muted);">${new Date(j.createdAt).toLocaleDateString()}</td>
            </tr>`).join('')}</tbody></table>
        </div>`;

    if(jobs.length > 0) {
        new Chart(document.getElementById('recAppsChart'), {
            type:'bar', data:{ labels:jobs.slice(0,8).map(j=>j.title.substring(0,20)), datasets:[{label:'Applicants',data:jobs.slice(0,8).map(j=>j.applicantCount||0),backgroundColor:'#3b82f6'}]},
            options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}}
        });
    }
    if(perfData) {
        const top = (perfData.performers||[]).slice(0,6);
        document.getElementById('recTopList').innerHTML = top.map((p,i) => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:0.6rem 0;${i<top.length-1?'border-bottom:1px solid var(--border-color);':''}">
                <div style="display:flex;align-items:center;gap:0.6rem;">
                    <div style="width:30px;height:30px;border-radius:50%;background:${i<3?'#3b82f6':'#e2e8f0'};color:${i<3?'white':'var(--text-main)'};display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.7rem;">${p.name.charAt(0)}</div>
                    <div><div style="font-weight:600;font-size:0.85rem;">${p.name}</div><div style="font-size:0.7rem;color:var(--text-muted);">${p.skills.slice(0,3).join(', ')}</div></div>
                </div>
                <span style="font-weight:700;color:${p.compositeScore>=70?'#10b981':p.compositeScore>=40?'#d97706':'#ef4444'};">${p.compositeScore}%</span>
            </div>`).join('');
    }
}

// === MY JOBS ===
async function renderRecJobs(c) {
    const data = await API.get('/jobs/recruiter/my');
    recState.jobs = data.jobs || [];
    c.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <span style="font-size:0.9rem;color:var(--text-muted);">${recState.jobs.length} total jobs</span>
            <a href="job-posting.html" class="btn btn-primary" style="font-size:0.8rem;text-decoration:none;">+ Post New Job</a>
        </div>
        <div style="display:grid;gap:1rem;">
            ${recState.jobs.map(j => `<div style="background:white;border:1px solid var(--border-color);border-radius:12px;padding:1.25rem;display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div style="font-weight:600;font-size:1rem;">${j.title}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">${j.companyName} · ${j.location||''}</div>
                    <div style="display:flex;gap:0.4rem;margin-top:0.5rem;flex-wrap:wrap;">${(j.requiredSkills||[]).map(s=>`<span style="font-size:0.65rem;padding:0.1rem 0.4rem;border-radius:4px;background:#f1f5f9;border:1px solid var(--border-color);">${s}</span>`).join('')}</div>
                </div>
                <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:0.5rem;">
                    <span style="padding:0.15rem 0.5rem;border-radius:999px;font-size:0.7rem;font-weight:600;${j.status==='active'?'background:#dcfce7;color:#15803d;':'background:#fee2e2;color:#dc2626;'}">${j.status}</span>
                    <div style="font-weight:700;font-size:1.25rem;">${j.applicantCount||0}<span style="font-size:0.7rem;color:var(--text-muted);font-weight:400;"> applicants</span></div>
                    <button onclick="viewJobPipeline('${j._id}')" class="btn btn-outline" style="font-size:0.7rem;padding:0.3rem 0.7rem;">View Pipeline →</button>
                </div>
            </div>`).join('')}
        </div>`;
}
function viewJobPipeline(jobId) {
    recState.selectedJob = jobId;
    document.querySelectorAll('.rec-sidebar .nav-item').forEach(n => { n.classList.toggle('active', n.dataset.section === 'pipeline'); });
    document.getElementById('topbarTitle').textContent = titles.pipeline;
    loadRecSection('pipeline');
}

// === PIPELINE ===
async function renderRecPipeline(c) {
    if (!recState.selectedJob && recState.jobs.length > 0) recState.selectedJob = recState.jobs[0]._id;
    if (!recState.selectedJob) {
        const d = await API.get('/jobs/recruiter/my'); recState.jobs = d.jobs||[];
        if(recState.jobs.length>0) recState.selectedJob = recState.jobs[0]._id;
        else { c.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--text-muted);">No jobs. Post a job first.</div>'; return; }
    }
    const apps = await API.get(`/applications/job/${recState.selectedJob}`);
    const allApps = apps.applications || [];
    const stages = ['new','in-review','shortlisted','interview','selected','rejected'];
    const stageLabels = {'new':'📥 New','in-review':'👁 In Review','shortlisted':'⭐ Shortlisted','interview':'🎙 Interview','selected':'✅ Selected','rejected':'❌ Rejected'};
    const stageColors = {'new':'#6366f1','in-review':'#3b82f6','shortlisted':'#f59e0b','interview':'#8b5cf6','selected':'#10b981','rejected':'#ef4444'};

    // Job selector
    if(recState.jobs.length===0) { const d = await API.get('/jobs/recruiter/my'); recState.jobs = d.jobs||[]; }
    c.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <select id="pipelineJobSelect" onchange="recState.selectedJob=this.value;loadRecSection('pipeline');" style="padding:0.5rem 0.75rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;">
                ${recState.jobs.map(j=>`<option value="${j._id}" ${j._id===recState.selectedJob?'selected':''}>${j.title} — ${j.companyName}</option>`).join('')}
            </select>
            <span style="font-size:0.8rem;color:var(--text-muted);">${allApps.length} applicants</span>
        </div>
        <div style="display:flex;gap:0.75rem;overflow-x:auto;padding-bottom:1rem;">
            ${stages.map(st => {
                const cards = allApps.filter(a => a.status === st);
                return `<div class="pipeline-col">
                    <h4><span>${stageLabels[st]}</span><span style="background:${stageColors[st]};color:white;font-size:0.65rem;padding:0.1rem 0.4rem;border-radius:999px;">${cards.length}</span></h4>
                    ${cards.map(a => `<div class="pipeline-card" onclick="showCandidateDetail('${a._id}')">
                        <div style="font-weight:600;margin-bottom:0.25rem;">${a.studentId?.name||'Student'}</div>
                        <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted);">
                            <span>Match: <b style="color:${a.skillMatch>=70?'#10b981':'#d97706'}">${a.skillMatch}%</b></span>
                            <span>Prob: <b>${a.hiringProbability}%</b></span>
                        </div>
                        ${a.matchedSkills?`<div style="margin-top:0.35rem;display:flex;flex-wrap:wrap;gap:0.2rem;">${a.matchedSkills.slice(0,3).map(s=>`<span style="font-size:0.6rem;padding:0.1rem 0.3rem;border-radius:3px;background:#dcfce7;color:#15803d;">${s}</span>`).join('')}</div>`:''}
                        <div style="display:flex;gap:0.25rem;margin-top:0.5rem;flex-wrap:wrap;">
                            ${stages.filter(s=>s!==st&&s!=='rejected').slice(0,3).map(s=>`<button onclick="event.stopPropagation();movePipeline('${a._id}','${s}')" style="font-size:0.55rem;padding:0.15rem 0.35rem;border:1px solid var(--border-color);border-radius:4px;background:white;cursor:pointer;">${stageLabels[s].split(' ')[0]}</button>`).join('')}
                        </div>
                    </div>`).join('')}
                </div>`;
            }).join('')}
        </div>`;
}
async function movePipeline(appId, status) {
    try { await API.put(`/applications/${appId}/status`, { status }); loadRecSection('pipeline'); } catch(e) { alert(e.message); }
}
async function showCandidateDetail(appId) {
    // Simple detail display via alert for now - data is visible in pipeline cards
    alert('Candidate details visible in pipeline card. Use status buttons to move through stages.');
}

// === CANDIDATE SEARCH ===
async function renderRecCandidates(c) {
    if(recState.jobs.length===0) { const d = await API.get('/jobs/recruiter/my'); recState.jobs = d.jobs||[]; }
    if(recState.jobs.length===0) { c.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--text-muted);">Post a job first to search candidates.</div>'; return; }
    const jobId = recState.selectedJob || recState.jobs[0]._id;
    const apps = await API.get(`/applications/job/${jobId}`);
    const allApps = apps.applications || [];
    let recData = null;
    try { recData = await API.get(`/applications/job/${jobId}/recommended`); } catch(e) {}

    c.innerHTML = `
        <div style="display:flex;gap:0.75rem;align-items:center;margin-bottom:1rem;flex-wrap:wrap;">
            <select id="candJobSelect" onchange="recState.selectedJob=this.value;loadRecSection('candidates');" style="padding:0.5rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;">
                ${recState.jobs.map(j=>`<option value="${j._id}" ${j._id===jobId?'selected':''}>${j.title}</option>`).join('')}
            </select>
            <span style="font-size:0.8rem;color:var(--text-muted);">${allApps.length} applicants</span>
            <button id="compareBtn" onclick="compareSelected()" class="btn btn-outline" style="font-size:0.75rem;margin-left:auto;" disabled>Compare Selected (0)</button>
        </div>
        ${recData && recData.recommended && recData.recommended.length > 0 ? `
        <div style="background:linear-gradient(135deg,rgba(59,130,246,0.05),rgba(139,92,246,0.05));border:1px solid rgba(59,130,246,0.2);border-radius:12px;padding:1.25rem;margin-bottom:1.5rem;">
            <h3 style="margin:0 0 0.75rem;font-size:0.95rem;">🤖 Auto-Recommended Candidates</h3>
            <div style="display:flex;gap:0.75rem;overflow-x:auto;">
                ${recData.recommended.slice(0,5).map(r=>`<div style="min-width:200px;background:white;border-radius:10px;padding:1rem;border:1px solid var(--border-color);">
                    <div style="font-weight:600;font-size:0.85rem;">${r.name}</div>
                    <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:0.5rem;">${r.education||'-'}</div>
                    <div style="font-size:1.25rem;font-weight:700;color:${r.hiringProbability>=85?'#10b981':r.hiringProbability>=60?'#d97706':'#ef4444'};margin-bottom:0.25rem;">${r.hiringProbability}%</div>
                    <div style="font-size:0.65rem;color:var(--text-muted);">Match: ${r.skillMatch}% · Resume: ${r.resumeScore}%</div>
                    ${r.alreadyApplied?'<div style="font-size:0.6rem;color:#3b82f6;margin-top:0.25rem;">✓ Already applied</div>':''}
                </div>`).join('')}
            </div>
        </div>` : ''}
        <div style="background:white;border-radius:12px;border:1px solid var(--border-color);overflow:hidden;">
            <table class="data-table"><thead><tr><th style="width:30px;"><input type="checkbox" onchange="toggleAllCompare(this)"></th><th>Candidate</th><th>Match</th><th>Probability</th><th>Skills</th><th>Status</th><th>Ranking Reason</th></tr></thead>
            <tbody>${allApps.map(a=>`<tr>
                <td><input type="checkbox" class="compare-cb" value="${a._id}" onchange="updateCompareBtn()"></td>
                <td><div style="font-weight:600;">${a.studentId?.name||'-'}</div><div style="font-size:0.7rem;color:var(--text-muted);">${a.studentProfile?.education||'-'} · ${a.studentProfile?.location||'-'}</div></td>
                <td><span style="font-weight:700;color:${a.skillMatch>=70?'#10b981':a.skillMatch>=40?'#d97706':'#ef4444'};">${a.skillMatch}%</span></td>
                <td><span style="font-weight:700;">${a.hiringProbability}%</span></td>
                <td><div style="display:flex;flex-wrap:wrap;gap:0.2rem;">${(a.matchedSkills||[]).slice(0,3).map(s=>`<span style="font-size:0.6rem;padding:0.1rem 0.3rem;background:#dcfce7;color:#15803d;border-radius:3px;">✓${s}</span>`).join('')}${(a.missingSkills||[]).slice(0,2).map(s=>`<span style="font-size:0.6rem;padding:0.1rem 0.3rem;background:#fee2e2;color:#dc2626;border-radius:3px;">✕${s}</span>`).join('')}</div></td>
                <td><span style="padding:0.15rem 0.5rem;border-radius:999px;font-size:0.65rem;font-weight:600;background:#f1f5f9;">${a.status}</span></td>
                <td style="font-size:0.75rem;color:var(--text-muted);max-width:200px;">${a.rankingBreakdown?.rankReason||'-'}</td>
            </tr>`).join('')}</tbody></table>
        </div>`;
}
function updateCompareBtn() {
    const checked = document.querySelectorAll('.compare-cb:checked');
    const btn = document.getElementById('compareBtn');
    btn.textContent = `Compare Selected (${checked.length})`;
    btn.disabled = checked.length < 2 || checked.length > 3;
}
function toggleAllCompare(master) {
    document.querySelectorAll('.compare-cb').forEach(cb => { cb.checked = master.checked; });
    updateCompareBtn();
}
async function compareSelected() {
    const ids = Array.from(document.querySelectorAll('.compare-cb:checked')).map(cb => cb.value);
    if (ids.length < 2 || ids.length > 3) return alert('Select 2-3 candidates');
    try {
        const data = await API.post('/applications/compare', { applicationIds: ids });
        const cands = data.candidates;
        const modal = document.getElementById('compareModal');
        modal.style.display = 'flex';
        modal.innerHTML = `<div class="compare-modal" onclick="if(event.target===this)document.getElementById('compareModal').style.display='none'">
            <div class="compare-panel">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
                    <h2 style="margin:0;font-size:1.25rem;">🔍 Candidate Comparison</h2>
                    <button onclick="document.getElementById('compareModal').style.display='none'" style="background:none;border:none;font-size:1.5rem;cursor:pointer;">✕</button>
                </div>
                <div style="display:grid;grid-template-columns:repeat(${cands.length},1fr);gap:1.5rem;">
                    ${cands.map(ca => `<div style="border:1px solid var(--border-color);border-radius:12px;padding:1.25rem;">
                        <div style="text-align:center;margin-bottom:1rem;">
                            <div style="width:50px;height:50px;border-radius:50%;background:#3b82f6;color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:1.2rem;margin:0 auto 0.5rem;">${ca.name.charAt(0)}</div>
                            <div style="font-weight:700;font-size:1rem;">${ca.name}</div>
                            <div style="font-size:0.75rem;color:var(--text-muted);">${ca.email}</div>
                        </div>
                        <div style="display:grid;gap:0.75rem;">
                            <div style="text-align:center;padding:0.75rem;background:#f8fafc;border-radius:8px;">
                                <div style="font-size:1.5rem;font-weight:700;color:${ca.hiringProbability>=85?'#10b981':ca.hiringProbability>=60?'#d97706':'#ef4444'};">${ca.hiringProbability}%</div>
                                <div style="font-size:0.7rem;color:var(--text-muted);">Hiring Probability</div>
                            </div>
                            <div style="display:flex;justify-content:space-between;font-size:0.8rem;"><span>Skill Match</span><b>${ca.skillMatch}%</b></div>
                            <div style="display:flex;justify-content:space-between;font-size:0.8rem;"><span>Resume</span><b>${ca.profile?.resumeScore||0}%</b></div>
                            <div style="display:flex;justify-content:space-between;font-size:0.8rem;"><span>Education</span><b style="font-size:0.75rem;">${ca.profile?.education||'-'}</b></div>
                            <div style="display:flex;justify-content:space-between;font-size:0.8rem;"><span>Experience</span><b style="font-size:0.75rem;">${ca.profile?.experience||'-'}</b></div>
                            <div><div style="font-size:0.75rem;font-weight:600;margin-bottom:0.25rem;">Matched Skills</div><div style="display:flex;flex-wrap:wrap;gap:0.2rem;">${(ca.matchedSkills||[]).map(s=>`<span style="font-size:0.6rem;padding:0.1rem 0.3rem;border-radius:3px;background:#dcfce7;color:#15803d;">${s}</span>`).join('')||'None'}</div></div>
                            <div><div style="font-size:0.75rem;font-weight:600;margin-bottom:0.25rem;">Missing Skills</div><div style="display:flex;flex-wrap:wrap;gap:0.2rem;">${(ca.missingSkills||[]).map(s=>`<span style="font-size:0.6rem;padding:0.1rem 0.3rem;border-radius:3px;background:#fee2e2;color:#dc2626;">${s}</span>`).join('')||'None'}</div></div>
                            <div style="font-size:0.75rem;padding:0.15rem 0.5rem;border-radius:999px;text-align:center;background:${ca.recommendation==='High'?'#dcfce7':ca.recommendation==='Medium'?'#fef3c7':'#fee2e2'};color:${ca.recommendation==='High'?'#15803d':ca.recommendation==='Medium'?'#b45309':'#dc2626'};font-weight:600;">${ca.recommendation} Match</div>
                        </div>
                    </div>`).join('')}
                </div>
            </div>
        </div>`;
    } catch(e) { alert('Compare error: ' + e.message); }
}

// === NOTIFICATIONS ===
async function renderRecNotifs(c) {
    try {
        const data = await API.get('/notifications/my');
        const notifs = data.notifications || [];
        c.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
                ${notifs.length===0?'<div style="text-align:center;padding:3rem;color:var(--text-muted);">No notifications</div>':notifs.map(n=>`
                <div style="background:white;border:1px solid var(--border-color);border-radius:10px;padding:1rem 1.25rem;${n.isRead?'':'border-left:3px solid #3b82f6;'}">
                    <div style="display:flex;justify-content:space-between;"><div style="font-weight:600;font-size:0.9rem;">${n.title}</div><span style="font-size:0.7rem;color:var(--text-muted);">${new Date(n.createdAt).toLocaleDateString()}</span></div>
                    <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.25rem;">${n.message}</div>
                </div>`).join('')}
            </div>`;
    } catch(e) { c.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted);">Could not load notifications</div>'; }
}

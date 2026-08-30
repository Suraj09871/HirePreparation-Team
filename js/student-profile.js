// student-profile.js — Full student profile management, applied jobs tracking, internships, and application withdrawal
let state = {
    profile: null,
    additionalDetails: {},
    myApplications: [],
    allJobs: []
};

document.addEventListener('DOMContentLoaded', async () => {
    if (!API.isLoggedIn()) {
        var base = (/\/frontend\/(student|recruiter|admin)\//i.test(window.location.pathname)) ? '../../' : '';
        return window.location.href = base + 'frontend/auth.html';
    }

    const user = API.getUser();
    if (document.getElementById('sideName')) document.getElementById('sideName').textContent = user.name || 'Student User';
    if (document.getElementById('sideEmail')) document.getElementById('sideEmail').textContent = user.email || '';

    // Fetch profile and applications
    try {
        const data = await API.get('/profile');
        state.profile = data.profile;
        state.additionalDetails = (data.profile && data.profile.additionalDetails) || {};
        populateUI();
    } catch (e) {
        console.error('Error fetching profile:', e.message);
    }

    try {
        const appRes = await API.get('/applications/my');
        state.myApplications = appRes.applications || [];
    } catch (e) {
        console.warn('Could not load applications:', e.message);
    }

    try {
        const jobsRes = await API.get('/jobs');
        state.allJobs = jobsRes.jobs || [];
    } catch (e) {
        console.warn('Could not load jobs:', e.message);
    }

    setupInteractions();
    checkUrlHashSection();
});

function checkUrlHashSection() {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'jobs') switchProfileSection('jobs');
    else if (hash === 'internships') switchProfileSection('internships');
    else if (hash === 'activity') switchProfileSection('activity');
}

function switchProfileSection(sectionName) {
    ['section-settings', 'section-jobs', 'section-internships', 'section-activity'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    document.querySelectorAll('.profile-sidebar-nav .sidebar-link').forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`.profile-sidebar-nav .sidebar-link[data-section="${sectionName}"]`);
    if (activeLink) activeLink.classList.add('active');

    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection) {
        targetSection.style.display = 'block';
    }

    if (sectionName === 'jobs') renderAppliedJobsSection();
    if (sectionName === 'internships') renderInternshipsSection();
    if (sectionName === 'activity') renderActivitySection();
}

window.switchProfileSection = switchProfileSection;

// ── Render Applied Jobs View with Withdraw Feature ──
function renderAppliedJobsSection() {
    const container = document.getElementById('section-jobs');
    if (!container) return;

    const apps = state.myApplications || [];

    let html = `
        <div style="margin-bottom:1.5rem;">
            <a href="student-dashboard.html" style="color: var(--text-muted); text-decoration: none; font-size: 0.875rem; display: inline-flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">← Back to Dashboard</a>
            <h1 style="font-size: 1.5rem; margin-bottom: 0.25rem; color:var(--text-main);">💼 Applied Jobs & Application Status</h1>
            <p style="margin: 0 0 1.5rem 0; color: var(--text-muted); font-size: 0.875rem;">Track all your submitted applications, match scores, and withdraw applications anytime.</p>
        </div>
    `;

    if (apps.length === 0) {
        html += `
            <div style="background:var(--bg-muted);border:1px solid var(--border-color);border-radius:12px;padding:3rem;text-align:center;">
                <div style="font-size:3rem;margin-bottom:1rem;">💼</div>
                <h3 style="margin-bottom:0.5rem;color:var(--text-main);">No Job Applications Yet</h3>
                <p style="color:var(--text-muted);max-width:460px;margin:0 auto 1.5rem;font-size:0.9rem;">You haven't submitted any job applications yet. Browse top hiring companies and check your match score!</p>
                <a href="jobs.html" class="btn btn-primary" style="text-decoration:none;font-weight:600;">🔍 Explore & Apply for Jobs →</a>
            </div>
        `;
    } else {
        html += `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-bottom:2rem;">
                <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;padding:1.25rem;">
                    <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;">TOTAL APPLICATIONS</div>
                    <div style="font-size:1.75rem;font-weight:800;color:var(--primary);margin-top:0.2rem;">${apps.length}</div>
                </div>
                <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;padding:1.25rem;">
                    <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;">AVG MATCH SCORE</div>
                    <div style="font-size:1.75rem;font-weight:800;color:#10b981;margin-top:0.2rem;">
                        ${Math.round(apps.reduce((s, a) => s + (a.skillMatch || 75), 0) / apps.length)}%
                    </div>
                </div>
                <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;padding:1.25rem;">
                    <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;">INTERVIEW STAGE</div>
                    <div style="font-size:1.75rem;font-weight:800;color:#3b82f6;margin-top:0.2rem;">
                        ${apps.filter(a => a.status === 'interview' || a.status === 'shortlisted').length}
                    </div>
                </div>
            </div>

            <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;overflow:hidden;">
                <div style="padding:1rem 1.25rem;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">
                    <h3 style="margin:0;font-size:1rem;color:var(--text-main);">Application Records</h3>
                    <a href="jobs.html" class="btn btn-outline" style="font-size:0.75rem;text-decoration:none;">+ Apply for More Jobs</a>
                </div>
                <div style="overflow-x:auto;">
                    <table class="data-table" style="width:100%;">
                        <thead>
                            <tr>
                                <th>Role & Company</th>
                                <th>Match Score</th>
                                <th>Application Status</th>
                                <th>Applied Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${apps.map(app => {
                                const job = app.jobId || {};
                                const score = app.skillMatch || app.hiringProbability || 80;
                                const scoreColor = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
                                const statusBg = app.status === 'interview' ? 'rgba(59,130,246,0.15)' : app.status === 'selected' ? 'rgba(16,185,129,0.15)' : 'rgba(249,115,22,0.15)';
                                const statusColor = app.status === 'interview' ? '#3b82f6' : app.status === 'selected' ? '#10b981' : '#f97316';
                                const safeTitle = sanitize(job.title || 'Job');

                                return `
                                    <tr>
                                        <td>
                                            <div style="font-weight:600;color:var(--text-main);">${safeTitle}</div>
                                            <div style="font-size:0.75rem;color:var(--primary);font-weight:500;">${sanitize(job.companyName || 'Company')} • 📍 ${sanitize(job.location || 'Remote')}</div>
                                        </td>
                                        <td>
                                            <div style="font-weight:700;color:${scoreColor};">${score}%</div>
                                            <div style="width:70px;height:4px;background:var(--border-color);border-radius:2px;overflow:hidden;margin-top:0.2rem;">
                                                <div style="width:${score}%;height:100%;background:${scoreColor};"></div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style="font-size:0.75rem;padding:0.2rem 0.6rem;border-radius:999px;font-weight:700;background:${statusBg};color:${statusColor};text-transform:capitalize;">
                                                ${app.status || 'Under Review'}
                                            </span>
                                        </td>
                                        <td style="font-size:0.8rem;color:var(--text-muted);">
                                            ${new Date(app.appliedAt || Date.now()).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div style="display:flex;gap:0.4rem;align-items:center;">
                                                <a href="jobs.html" class="btn btn-outline" style="font-size:0.75rem;padding:0.25rem 0.6rem;text-decoration:none;">View Job →</a>
                                                <button onclick="window.withdrawApplication('${app._id}', '${safeTitle.replace(/'/g, "\\'")}')" class="btn" style="font-size:0.75rem;padding:0.25rem 0.6rem;background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.3);font-weight:600;" title="Withdraw Application">🗑 Withdraw</button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

// ── Application Withdrawal Action ──
window.withdrawApplication = async function(appId, jobTitle) {
    if (!confirm(`Are you sure you want to withdraw your application for "${jobTitle}"?`)) return;

    try {
        await API.delete('/applications/' + appId);
        state.myApplications = state.myApplications.filter(a => a._id !== appId);
        
        if (typeof showToast === 'function') showToast('Application withdrawn successfully', 'success');
        else alert('Application withdrawn successfully');
        
        renderAppliedJobsSection();
    } catch (e) {
        if (typeof showToast === 'function') showToast(e.message, 'error');
        else alert(e.message);
    }
};

// ── Render Internships View ──
function renderInternshipsSection() {
    const container = document.getElementById('section-internships');
    if (!container) return;

    const internshipJobs = (state.allJobs || []).filter(j => 
        (j.title || '').toLowerCase().includes('intern') || 
        (j.description || '').toLowerCase().includes('intern') ||
        (j.salary || '').toLowerCase().includes('stipend') ||
        (j.title || '').toLowerCase().includes('trainee')
    );

    const displayInternships = internshipJobs.length > 0 ? internshipJobs : [
        { _id: 'int-1', title: 'Software Engineering Intern', companyName: 'Razorpay', location: 'Bangalore / Remote', salary: '₹35,000 / month Stipend', requiredSkills: ['React', 'Node.js', 'JavaScript'], description: 'Work alongside senior engineers building scalable fintech payment APIs.' },
        { _id: 'int-2', title: 'Data Analytics Intern', companyName: 'Swiggy', location: 'Bangalore', salary: '₹30,000 / month Stipend', requiredSkills: ['Python', 'SQL', 'Pandas'], description: 'Analyze food delivery logistics data and build real-time dashboard visualizations.' },
        { _id: 'int-3', title: 'Cloud & DevOps Trainee', companyName: 'TechNova', location: 'Remote', salary: '₹25,000 / month Stipend', requiredSkills: ['Docker', 'AWS', 'Linux'], description: 'Manage CI/CD deployment automation pipelines and Kubernetes container pods.' }
    ];

    container.innerHTML = `
        <div style="margin-bottom:1.5rem;">
            <a href="student-dashboard.html" style="color: var(--text-muted); text-decoration: none; font-size: 0.875rem; display: inline-flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">← Back to Dashboard</a>
            <h1 style="font-size: 1.5rem; margin-bottom: 0.25rem; color:var(--text-main);">🎓 Internship Opportunities & Applications</h1>
            <p style="margin: 0 0 1.5rem 0; color: var(--text-muted); font-size: 0.875rem;">Kickstart your tech career with paid internships and trainee programs.</p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.25rem;">
            ${displayInternships.map(intern => `
                <div class="feature-card" style="display:flex;flex-direction:column;justify-content:space-between;border:1px solid var(--border-color);border-radius:12px;padding:1.25rem;background:var(--card-bg);">
                    <div>
                        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.5rem;">
                            <h3 style="font-size:1.1rem;margin:0;color:var(--text-main);">${sanitize(intern.title)}</h3>
                            <span style="font-size:0.7rem;background:rgba(16,185,129,0.15);color:#10b981;padding:0.15rem 0.5rem;border-radius:999px;font-weight:600;">Stipend</span>
                        </div>
                        <div style="font-size:0.85rem;color:var(--primary);font-weight:600;margin-bottom:0.75rem;">${sanitize(intern.companyName)} • 📍 ${sanitize(intern.location)}</div>
                        <p style="font-size:0.85rem;color:var(--text-muted);line-height:1.5;margin-bottom:1rem;">${sanitize(intern.description.substring(0, 110))}...</p>
                        <div style="display:flex;gap:0.35rem;flex-wrap:wrap;margin-bottom:1rem;">
                            ${(intern.requiredSkills || []).map(s => `<span style="font-size:0.75rem;background:var(--bg-muted);padding:0.2rem 0.5rem;border-radius:4px;border:1px solid var(--border-color);">${sanitize(s)}</span>`).join('')}
                        </div>
                    </div>
                    <div style="border-top:1px solid var(--border-color);padding-top:0.75rem;display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.85rem;font-weight:700;color:var(--text-main);">💰 ${intern.salary}</span>
                        <a href="jobs.html" class="btn btn-primary" style="font-size:0.8rem;text-decoration:none;padding:0.35rem 0.85rem;">Apply Now →</a>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ── Render Activity View ──
function renderActivitySection() {
    const container = document.getElementById('section-activity');
    if (!container) return;

    const profile = state.profile || {};
    const submissions = JSON.parse(localStorage.getItem('hs_submissions') || '[]');

    container.innerHTML = `
        <div style="margin-bottom:1.5rem;">
            <a href="student-dashboard.html" style="color: var(--text-muted); text-decoration: none; font-size: 0.875rem; display: inline-flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">← Back to Dashboard</a>
            <h1 style="font-size: 1.5rem; margin-bottom: 0.25rem; color:var(--text-main);">📈 Your Practice & Skill Activity</h1>
            <p style="margin: 0 0 1.5rem 0; color: var(--text-muted); font-size: 0.875rem;">Summary of your solved questions, ATS score, and mock assessments.</p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-bottom:2rem;">
            <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;padding:1.25rem;">
                <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;">ATS RESUME SCORE</div>
                <div style="font-size:1.75rem;font-weight:800;color:var(--primary);margin-top:0.2rem;">${profile.resumeScore || 85}/100</div>
            </div>
            <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;padding:1.25rem;">
                <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;">CODE SUBMISSIONS</div>
                <div style="font-size:1.75rem;font-weight:800;color:#10b981;margin-top:0.2rem;">${submissions.length}</div>
            </div>
            <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;padding:1.25rem;">
                <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;">SKILLS LISTED</div>
                <div style="font-size:1.75rem;font-weight:800;color:#3b82f6;margin-top:0.2rem;">${(profile.skills || []).length}</div>
            </div>
        </div>

        <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;padding:1.5rem;">
            <h3 style="font-size:1.1rem;margin-bottom:1rem;color:var(--text-main);">⚡ Quick Action Portals</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;">
                <a href="practice.html" class="btn btn-outline" style="text-decoration:none;padding:1rem;text-align:center;font-weight:600;">💻 Coding Practice Portal</a>
                <a href="resume-builder.html" class="btn btn-outline" style="text-decoration:none;padding:1rem;text-align:center;font-weight:600;">📄 ATS Resume Builder</a>
                <a href="preparation.html" class="btn btn-outline" style="text-decoration:none;padding:1rem;text-align:center;font-weight:600;">🏢 Company Roadmaps</a>
                <a href="mock-test.html" class="btn btn-outline" style="text-decoration:none;padding:1rem;text-align:center;font-weight:600;">⏱ Take Mock Assessment</a>
            </div>
        </div>
    `;
}

function populateUI() {
    const p = state.profile;
    if (!p) return;

    if (document.getElementById('profileName')) document.getElementById('profileName').value = p.name || '';
    if (document.getElementById('profileTitle')) document.getElementById('profileTitle').value = p.title || '';
    if (document.getElementById('profileEmail')) document.getElementById('profileEmail').value = p.email || '';
    if (document.getElementById('profilePhone')) document.getElementById('profilePhone').value = p.phone || '';
    if (document.getElementById('profileLocation')) document.getElementById('profileLocation').value = p.location || '';
    if (document.getElementById('profileBio')) document.getElementById('profileBio').value = p.bio || '';
    if (document.getElementById('profileGithub')) document.getElementById('profileGithub').value = p.github || '';
    if (document.getElementById('profileLinkedin')) document.getElementById('profileLinkedin').value = p.linkedin || '';
    if (document.getElementById('profileExperience')) document.getElementById('profileExperience').value = p.experience || '';
    if (document.getElementById('profileEducation')) document.getElementById('profileEducation').value = p.education || '';
}

function setupInteractions() {
    // Sidebar link handlers
    document.querySelectorAll('.profile-sidebar-nav .sidebar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const section = link.dataset.section;
            if (section) {
                e.preventDefault();
                switchProfileSection(section);
            }
        });
    });

    // Resume CTA
    const resumeCta = document.getElementById('createResumeCta');
    if (resumeCta) {
        resumeCta.addEventListener('click', () => {
            window.location.href = 'resume-builder.html';
        });
    }

    // Settings Tab switching
    const tabMap = ['edit-profile', 'tab-profile-image', 'tab-password', 'tab-privacy', 'tab-delete'];
    document.querySelectorAll('.settings-tab').forEach((tab, idx) => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const accWrapper = document.querySelector('.accordion-wrapper');
            if (accWrapper) accWrapper.style.display = idx === 0 ? 'block' : 'none';
            
            document.querySelectorAll('[id^="tab-profile-image"], #tab-password, #tab-privacy, #tab-delete').forEach(el => el.style.display = 'none');
            
            const cta = document.getElementById('createResumeCta');
            if (cta) cta.style.display = idx === 0 ? 'flex' : 'none';

            if (idx > 0) {
                const panel = document.getElementById(tabMap[idx]);
                if (panel) panel.style.display = 'block';
            }
        });
    });

    // Accordions
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            item.classList.toggle('active');
        });
    });

    // Save profile button
    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;

            const payload = {
                name: document.getElementById('profileName')?.value,
                title: document.getElementById('profileTitle')?.value,
                phone: document.getElementById('profilePhone')?.value,
                location: document.getElementById('profileLocation')?.value,
                bio: document.getElementById('profileBio')?.value,
                github: document.getElementById('profileGithub')?.value,
                linkedin: document.getElementById('profileLinkedin')?.value,
                experience: document.getElementById('profileExperience')?.value,
                education: document.getElementById('profileEducation')?.value
            };

            try {
                await API.put('/profile', payload);
                if (typeof showToast === 'function') showToast('Profile updated successfully!', 'success');
                else alert('Profile updated successfully!');
            } catch (e) {
                if (typeof showToast === 'function') showToast(e.message, 'error');
                else alert(e.message);
            } finally {
                saveBtn.textContent = '💾 Save Profile Changes';
                saveBtn.disabled = false;
            }
        });
    }
}

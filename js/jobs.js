// jobs.js — Browse Jobs with Interactive Job Details, In-Modal Match Score Calculator, Preparation Roadmap & Applied Status Synchronization
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('jobsGrid');
    const searchInput = document.getElementById('jobSearch');
    window.allJobsData = [];
    window.appliedJobIdsSet = new Set();

    // Fetch student's existing applications if logged in
    if (API.isLoggedIn()) {
        try {
            const appRes = await API.get('/applications/my');
            const apps = appRes.applications || [];
            apps.forEach(a => {
                const jId = (a.jobId && a.jobId._id) ? a.jobId._id.toString() : (a.jobId ? a.jobId.toString() : '');
                if (jId) window.appliedJobIdsSet.add(jId);
            });
        } catch (e) {
            console.warn('Could not fetch user applications:', e.message);
        }
    }

    // Load jobs
    try {
        const data = await API.get('/jobs');
        window.allJobsData = data.jobs || [];
        
        // Check URL query parameters for search/filter (e.g. jobs.html?search=react or ?filter=internship)
        const urlParams = new URLSearchParams(window.location.search);
        const searchQ = urlParams.get('search') || urlParams.get('filter') || urlParams.get('q');
        if (searchQ && searchInput) {
            searchInput.value = searchQ;
            const q = searchQ.toLowerCase();
            const filtered = window.allJobsData.filter(j =>
                j.title.toLowerCase().includes(q) ||
                j.companyName.toLowerCase().includes(q) ||
                (j.requiredSkills && j.requiredSkills.some(s => s.toLowerCase().includes(q)))
            );
            renderJobs(filtered);
        } else {
            renderJobs(window.allJobsData);
        }
    } catch (e) {
        if (container) container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:3rem;">Failed to load jobs.</p>';
    }

    // Search
    if (searchInput) searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase();
        const filtered = window.allJobsData.filter(j =>
            j.title.toLowerCase().includes(q) ||
            j.companyName.toLowerCase().includes(q) ||
            (j.requiredSkills && j.requiredSkills.some(s => s.toLowerCase().includes(q)))
        );
        renderJobs(filtered);
    });

    function renderJobs(jobs) {
        if (!container) return;
        if (jobs.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:3rem;">No jobs found matching your criteria.</p>';
            return;
        }

        const isLogged = API.isLoggedIn();
        
        // Remove existing guest notice
        const existingNotice = document.getElementById('jobsGuestNotice');
        if (existingNotice) existingNotice.remove();

        if (!isLogged) {
            const notice = document.createElement('div');
            notice.id = 'jobsGuestNotice';
            notice.style.cssText = 'background:var(--card-bg);border:1px solid var(--primary);border-radius:12px;padding:1rem 1.5rem;margin-bottom:1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;box-shadow:0 4px 12px rgba(249,115,22,0.08);';
            notice.innerHTML = `
                <div style="display:flex;align-items:center;gap:0.75rem;">
                    <span style="font-size:1.6rem;">🔒</span>
                    <div>
                        <div style="font-weight:700;color:var(--text-main);font-size:0.95rem;">Guest Preview Mode</div>
                        <div style="font-size:0.825rem;color:var(--text-muted);">You are viewing 4 sample opportunities. Sign in to search all jobs, analyze ATS match score, and apply directly.</div>
                    </div>
                </div>
                <a href="../auth.html?redirect=jobs" class="btn btn-primary" style="padding:0.5rem 1.25rem;font-size:0.85rem;white-space:nowrap;font-weight:600;">Sign In to View All →</a>
            `;
            if (container.parentNode) {
                container.parentNode.insertBefore(notice, container);
            }
        }

        const visibleJobs = isLogged ? jobs : jobs.slice(0, 4);

        container.innerHTML = '';
        visibleJobs.forEach(job => {
            const isApplied = window.appliedJobIdsSet && window.appliedJobIdsSet.has(job._id.toString());
            const card = document.createElement('div');
            card.className = 'feature-card job-card-item';
            card.style.cssText = 'cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;';
            
            const applyBtnMarkup = isApplied 
                ? `<button class="btn btn-outline btn-applied-badge" disabled style="font-size:0.85rem;background:#10b981;border-color:#10b981;color:white;cursor:default;">✓ Applied</button>`
                : `<button class="btn btn-outline btn-apply-now" data-job-id="${job._id}" style="font-size:0.85rem;">Apply</button>`;

            card.innerHTML = `
                <div>
                    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem;">
                        <div>
                            <h3 style="font-size:1.125rem;margin-bottom:0.25rem;color:var(--text-main);">${sanitize(job.title)}</h3>
                            <p style="margin:0;color:var(--primary);font-weight:600;font-size:0.875rem;">${sanitize(job.companyName)}</p>
                        </div>
                        <span style="font-size:0.75rem;background:${job.status === 'active' ? 'rgba(16,185,129,0.1)' : 'var(--bg-muted)'};color:${job.status === 'active' ? '#10b981' : 'var(--text-muted)'};padding:0.2rem 0.6rem;border-radius:999px;font-weight:600;">${job.status}</span>
                    </div>
                    <p style="font-size:0.875rem;margin-bottom:1rem;color:var(--text-muted);line-height:1.5;">${sanitize((job.description || '').substring(0, 110))}...</p>
                    <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:1rem;">
                        ${(job.requiredSkills || []).slice(0, 4).map(s => `<span style="font-size:0.75rem;background:var(--bg-muted);padding:0.2rem 0.5rem;border-radius:4px;border:1px solid var(--border-color);">${sanitize(s)}</span>`).join('')}
                    </div>
                </div>
                <div>
                    <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-muted);padding-top:0.75rem;border-top:1px solid var(--border-color);margin-bottom:1rem;">
                        <span>📍 ${sanitize(job.location)}</span>
                        <span>💰 ${job.salary || 'Competitive'}</span>
                    </div>
                    <div style="display:flex;gap:0.5rem;">
                        <button class="btn btn-primary btn-view-prep" style="flex:1;font-size:0.85rem;">View Details & Prep</button>
                        ${applyBtnMarkup}
                    </div>
                </div>
            `;

            // Card click listener
            card.addEventListener('click', () => window.viewJob(job._id));

            // View button listener
            const viewBtn = card.querySelector('.btn-view-prep');
            if (viewBtn) {
                viewBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.viewJob(job._id);
                });
            }

            // Apply button listener (only if not already applied)
            const applyBtn = card.querySelector('.btn-apply-now');
            if (applyBtn) {
                applyBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.applyJob(job._id);
                });
            }

            container.appendChild(card);
        });

        if (!isLogged && jobs.length > 4) {
            const unlockCard = document.createElement('div');
            unlockCard.className = 'feature-card';
            unlockCard.style.cssText = 'background:linear-gradient(135deg, rgba(249,115,22,0.08), rgba(59,130,246,0.08));border:2px dashed var(--primary);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem 1.5rem;cursor:pointer;';
            unlockCard.onclick = () => { window.location.href = '../auth.html?redirect=jobs'; };
            unlockCard.innerHTML = `
                <div style="font-size:2.5rem;margin-bottom:0.75rem;">✨</div>
                <h3 style="margin:0 0 0.5rem;font-size:1.1rem;color:var(--text-main);font-weight:700;">+${jobs.length - 4} More Verified Roles</h3>
                <p style="font-size:0.85rem;color:var(--text-muted);margin:0 0 1.25rem;line-height:1.5;">Sign in to view all positions from top companies, calculate resume match score, and apply.</p>
                <a href="../auth.html?redirect=jobs" class="btn btn-primary" style="font-size:0.85rem;padding:0.5rem 1.25rem;font-weight:600;">Unlock All Jobs →</a>
            `;
            container.appendChild(unlockCard);
        }
    }

    window.refreshJobsGrid = function() {
        if (window.allJobsData && window.allJobsData.length > 0) {
            renderJobs(window.allJobsData);
        }
    };
});

// ── Smart Question & Roadmap Rule Engine ──
function getSuggestedQuestions(skills, company) {
    const questions = [];
    const lowerSkills = (skills || []).map(s => s.toLowerCase());
    const lowerComp = (company || '').toLowerCase();

    if (lowerSkills.some(s => s.includes('node') || s.includes('express') || s.includes('backend'))) {
        questions.push({ id: 'two-sum-0', q: 'Explain Node.js Event Loop phases and microtask vs macrotask queue execution.', diff: 'Medium', topic: 'Node.js' });
        questions.push({ id: 'valid-parentheses-1', q: 'How do you handle uncaught exceptions and memory leaks in production Express services?', diff: 'Hard', topic: 'Backend' });
        questions.push({ id: 'two-sum-0', q: 'Compare Streams vs Buffers in Node.js when processing large data payloads.', diff: 'Medium', topic: 'Node.js' });
    }
    if (lowerSkills.some(s => s.includes('react') || s.includes('frontend') || s.includes('javascript') || s.includes('js'))) {
        questions.push({ id: 'valid-parentheses-1', q: 'How does React Reconciliation & Virtual DOM diffing algorithm work under the hood?', diff: 'Medium', topic: 'React' });
        questions.push({ id: 'two-sum-0', q: 'Explain the difference between useMemo, useCallback, and React.memo performance optimizations.', diff: 'Medium', topic: 'React' });
        questions.push({ id: 'valid-parentheses-1', q: 'What is Event Delegation in JavaScript and how does event bubbling work?', diff: 'Easy', topic: 'JavaScript' });
    }
    if (lowerSkills.some(s => s.includes('python') || s.includes('data') || s.includes('sql') || s.includes('tableau'))) {
        questions.push({ id: 'two-sum-0', q: 'Explain SQL Window Functions (ROW_NUMBER, RANK, DENSE_RANK) with real-world examples.', diff: 'Medium', topic: 'SQL' });
        questions.push({ id: 'valid-parentheses-1', q: 'How does Python GIL affect multithreading vs multiprocessing for CPU-bound tasks?', diff: 'Hard', topic: 'Python' });
        questions.push({ id: 'two-sum-0', q: 'How do index B-Trees optimize database query execution time?', diff: 'Medium', topic: 'Database' });
    }
    if (lowerSkills.some(s => s.includes('docker') || s.includes('aws') || s.includes('kubernetes') || s.includes('devops') || s.includes('ci/cd'))) {
        questions.push({ id: 'valid-parentheses-1', q: 'What is the architectural difference between a Docker container and a Virtual Machine?', diff: 'Easy', topic: 'DevOps' });
        questions.push({ id: 'two-sum-0', q: 'Explain Kubernetes Pod lifecycle, ReplicaSets, and Ingress routing controllers.', diff: 'Hard', topic: 'Kubernetes' });
        questions.push({ id: 'valid-parentheses-1', q: 'How to design a zero-downtime Blue/Green deployment strategy using CI/CD pipelines?', diff: 'Hard', topic: 'DevOps' });
    }

    if (questions.length < 4) {
        questions.push({ id: 'two-sum-0', q: 'How would you design a scalable rate-limiting service to prevent API abuse?', diff: 'Hard', topic: 'System Design' });
        questions.push({ id: 'valid-parentheses-1', q: 'Explain CAP theorem trade-offs between Consistency, Availability, and Partition Tolerance.', diff: 'Medium', topic: 'System Design' });
        questions.push({ id: 'two-sum-0', q: 'How does Redis Caching work with Cache-Aside vs Write-Through strategies?', diff: 'Medium', topic: 'Caching' });
    }

    if (lowerComp.includes('google') || lowerComp.includes('amazon') || lowerComp.includes('meta')) {
        questions.unshift({ id: 'two-sum-0', q: `Top ${company} Round Question: Design an auto-complete search suggestion system with high throughput.`, diff: 'Hard', topic: company });
    } else if (lowerComp.includes('swiggy') || lowerComp.includes('razorpay') || lowerComp.includes('infosys')) {
        questions.unshift({ id: 'valid-parentheses-1', q: `Top ${company} Interview Question: How to handle concurrent database transactions safely?`, diff: 'Medium', topic: company });
    }

    return questions.slice(0, 5);
}

// ── Open Job Detail Modal ──
window.viewJob = function(jobId) {
    const job = (window.allJobsData || []).find(j => j._id === jobId);
    if (!job) return;

    const modal = document.getElementById('jobDetailModal');
    if (!modal) return;

    const isApplied = window.appliedJobIdsSet && window.appliedJobIdsSet.has(job._id.toString());
    const questions = getSuggestedQuestions(job.requiredSkills, job.companyName);

    const modalApplyBtnMarkup = isApplied
        ? `<button id="modalApplyBtn_${job._id}" class="btn btn-primary" disabled style="background:#10b981;border-color:#10b981;color:white;cursor:default;font-weight:600;">✓ Applied</button>`
        : `<button id="modalApplyBtn_${job._id}" class="btn btn-primary" style="font-weight:600;">Apply Now →</button>`;

    const modalApplyStatusMarkup = isApplied
        ? `<div id="modalApplyStatus" style="display:block;margin-bottom:1.25rem;padding:0.85rem 1rem;background:rgba(16,185,129,0.15);color:#10b981;border:1px solid rgba(16,185,129,0.3);border-radius:8px;font-size:0.9rem;">✓ <strong>Applied!</strong> You have already submitted your application for this role.</div>`
        : `<div id="modalApplyStatus" style="display:none;margin-bottom:1.25rem;padding:0.85rem 1rem;background:rgba(16,185,129,0.1);color:#10b981;border:1px solid rgba(16,185,129,0.3);border-radius:8px;font-size:0.9rem;"></div>`;

    modal.innerHTML = `
        <div id="jobModalContentBox" style="background:var(--card-bg);border-radius:16px;max-width:780px;width:94%;max-height:90vh;overflow-y:auto;padding:2rem;border:1px solid var(--border-color);box-shadow:0 20px 40px rgba(0,0,0,0.3);position:relative;z-index:10010;">
            
            <!-- Cut / Close Symbol Button -->
            <button id="modalCloseBtnTop" aria-label="Close modal" title="Close modal"
                    style="position:absolute;right:1.25rem;top:1.25rem;width:36px;height:36px;border-radius:50%;background:var(--bg-muted);border:1px solid var(--border-color);color:var(--text-main);font-size:1.4rem;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10030;transition:all 0.2s;"
                    onmouseover="this.style.background='var(--primary)';this.style.color='white';"
                    onmouseout="this.style.background='var(--bg-muted)';this.style.color='var(--text-main)';">✕</button>
            
            <!-- Application Status Alert -->
            ${modalApplyStatusMarkup}

            <!-- Job Header -->
            <div style="display:flex;gap:1rem;align-items:center;margin-bottom:1.5rem;border-bottom:1px solid var(--border-color);padding-bottom:1.25rem;padding-right:2.5rem;">
                <div style="width:52px;height:52px;background:var(--primary);color:white;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:bold;flex-shrink:0;">
                    ${(job.companyName || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 style="font-size:1.4rem;margin:0 0 0.25rem;color:var(--text-main);">${sanitize(job.title)}</h2>
                    <div style="font-size:0.9rem;color:var(--primary);font-weight:600;">${sanitize(job.companyName)} • <span style="color:var(--text-muted);font-weight:normal;">📍 ${sanitize(job.location)}</span></div>
                </div>
            </div>

            <!-- Meta details -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:0.75rem;margin-bottom:1.5rem;background:var(--bg-muted);padding:1rem;border-radius:10px;border:1px solid var(--border-color);">
                <div><small style="color:var(--text-muted);display:block;">Salary Range</small><strong style="font-size:0.95rem;color:var(--text-main);">${job.salary || 'Competitive'}</strong></div>
                <div><small style="color:var(--text-muted);display:block;">Status</small><span style="color:#10b981;font-weight:600;font-size:0.9rem;">${job.status || 'Active'}</span></div>
                <div><small style="color:var(--text-muted);display:block;">Requirements</small><strong style="font-size:0.95rem;color:var(--text-main);">${(job.requiredSkills || []).length} Key Skills</strong></div>
            </div>

            <!-- In-Modal Match Score Container -->
            <div id="matchBreakdownContainer" style="display:none;"></div>

            <!-- Job Description -->
            <div style="margin-bottom:1.5rem;">
                <h4 style="font-size:1rem;margin-bottom:0.5rem;color:var(--text-main);">📋 Role Overview & Requirements</h4>
                <p style="color:var(--text-muted);font-size:0.9rem;line-height:1.6;">${sanitize(job.description || 'No description provided.')}</p>
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.75rem;">
                    ${(job.requiredSkills || []).map(s => `<span style="font-size:0.8rem;background:var(--bg-muted);padding:0.3rem 0.6rem;border-radius:6px;border:1px solid var(--border-color);color:var(--text-main); font-weight:500;">✓ ${sanitize(s)}</span>`).join('')}
                </div>
            </div>

            <!-- Hiring Process Workflow -->
            <div style="margin-bottom:1.75rem;">
                <h4 style="font-size:1rem;margin-bottom:0.75rem;color:var(--text-main);">🔄 Hiring Process Workflow</h4>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.75rem;">
                    <div style="background:var(--bg-muted);padding:0.75rem;border-radius:8px;border-left:3px solid #3b82f6;">
                        <div style="font-size:0.75rem;color:#3b82f6;font-weight:700;">ROUND 1</div>
                        <div style="font-size:0.85rem;font-weight:600;color:var(--text-main);margin-top:0.2rem;">Online Screening</div>
                        <small style="color:var(--text-muted);">MCQ & Coding Test</small>
                    </div>
                    <div style="background:var(--bg-muted);padding:0.75rem;border-radius:8px;border-left:3px solid #8b5cf6;">
                        <div style="font-size:0.75rem;color:#8b5cf6;font-weight:700;">ROUND 2</div>
                        <div style="font-size:0.85rem;font-weight:600;color:var(--text-main);margin-top:0.2rem;">Technical Interview</div>
                        <small style="color:var(--text-muted);">Core Stack & Algorithms</small>
                    </div>
                    <div style="background:var(--bg-muted);padding:0.75rem;border-radius:8px;border-left:3px solid #f59e0b;">
                        <div style="font-size:0.75rem;color:#f59e0b;font-weight:700;">ROUND 3</div>
                        <div style="font-size:0.85rem;font-weight:600;color:var(--text-main);margin-top:0.2rem;">System Architecture</div>
                        <small style="color:var(--text-muted);">Design & Problem Solving</small>
                    </div>
                    <div style="background:var(--bg-muted);padding:0.75rem;border-radius:8px;border-left:3px solid #10b981;">
                        <div style="font-size:0.75rem;color:#10b981;font-weight:700;">ROUND 4</div>
                        <div style="font-size:0.85rem;font-weight:600;color:var(--text-main);margin-top:0.2rem;">HR & Culture Fit</div>
                        <small style="color:var(--text-muted);">Offer Discussion</small>
                    </div>
                </div>
            </div>

            <!-- Preparation Roadmap -->
            <div style="margin-bottom:1.75rem;">
                <h4 style="font-size:1rem;margin-bottom:0.75rem;color:var(--text-main);">🗺️ Recommended Preparation Roadmap</h4>
                <div style="background:var(--bg-muted);padding:1rem;border-radius:10px;border:1px solid var(--border-color);">
                    <ul style="margin:0;padding-left:1.25rem;color:var(--text-main);font-size:0.875rem;line-height:1.7;">
                        <li><strong>Phase 1:</strong> Master core fundamentals in <code>${(job.requiredSkills || ['CS Fundamentals'])[0]}</code>.</li>
                        <li><strong>Phase 2:</strong> Practice 15+ coding & aptitude questions on the <a href="practice.html" style="color:var(--primary);font-weight:600;">Practice Portal →</a>.</li>
                        <li><strong>Phase 3:</strong> Review architecture concepts: Caching, Database Indexing, & REST API patterns.</li>
                        <li><strong>Phase 4:</strong> Check company-specific interview experience in <a href="preparation.html" style="color:var(--primary);font-weight:600;">Company Roadmaps →</a>.</li>
                    </ul>
                </div>
            </div>

            <!-- Suggested Interview Questions (Clickable Links to Solve) -->
            <div style="margin-bottom:2rem;">
                <h4 style="font-size:1rem;margin-bottom:0.75rem;color:var(--text-main);display:flex;justify-content:space-between;align-items:center;">
                    <span>❓ Suggested Interview Questions for ${sanitize(job.companyName)}</span>
                    <small style="font-size:0.75rem;color:var(--primary);font-weight:500;">Click any question to solve →</small>
                </h4>
                <div style="display:flex;flex-direction:column;gap:0.6rem;">
                    ${questions.map((item, idx) => `
                        <a href="question-detail.html?id=${item.id || 'two-sum-0'}&title=${encodeURIComponent(item.q)}&company=${encodeURIComponent(job.companyName)}&type=Coding" 
                           style="text-decoration:none;background:var(--bg-muted);padding:0.85rem 1rem;border-radius:8px;border:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;gap:0.75rem;transition:all 0.2s;"
                           onmouseover="this.style.borderColor='var(--primary)';this.style.transform='translateX(4px)'"
                           onmouseout="this.style.borderColor='var(--border-color)';this.style.transform='none'">
                            <div style="font-size:0.875rem;color:var(--text-main);line-height:1.4;">
                                <strong style="color:var(--primary);">Q${idx + 1}:</strong> ${sanitize(item.q)}
                            </div>
                            <div style="display:flex;align-items:center;gap:0.5rem;flex-shrink:0;">
                                <span style="font-size:0.7rem;background:rgba(249,115,22,0.12);color:var(--primary);padding:0.2rem 0.5rem;border-radius:4px;font-weight:600;">${item.topic} • ${item.diff}</span>
                                <span style="font-size:0.75rem;color:white;background:var(--primary);padding:0.2rem 0.6rem;border-radius:6px;font-weight:600;">Solve ⚡</span>
                            </div>
                        </a>
                    `).join('')}
                </div>
            </div>

            <!-- Action Buttons -->
            <div style="display:flex;gap:1rem;justify-content:flex-end;border-top:1px solid var(--border-color);padding-top:1.25rem;">
                <button id="modalCloseBtnBottom" class="btn btn-outline">Close</button>
                <button id="modalMatchBtn_${job._id}" class="btn btn-outline" style="font-weight:600;">Check Match Score</button>
                ${modalApplyBtnMarkup}
            </div>
        </div>
    `;

    // Explicit DOM Event Listeners
    const topCutBtn = document.getElementById('modalCloseBtnTop');
    if (topCutBtn) {
        topCutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.closeJobModal();
        });
    }

    const botCloseBtn = document.getElementById('modalCloseBtnBottom');
    if (botCloseBtn) {
        botCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.closeJobModal();
        });
    }

    const matchBtn = document.getElementById(`modalMatchBtn_${job._id}`);
    if (matchBtn) {
        matchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.previewMatch(job._id);
        });
    }

    const applyBtn = document.getElementById(`modalApplyBtn_${job._id}`);
    if (applyBtn && !isApplied) {
        applyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.applyJob(job._id);
        });
    }

    modal.style.display = 'flex';
};

window.closeJobModal = function() {
    const modal = document.getElementById('jobDetailModal');
    if (modal) {
        modal.style.display = 'none';
        modal.innerHTML = '';
    }
};

// ── In-Modal Match Score Preview ──
window.previewMatch = async function(jobId) {
    if (!API.isLoggedIn()) {
        var base = (/\/frontend\/(student|recruiter|admin)\//i.test(window.location.pathname)) ? '../../' : '';
        window.location.href = base + 'frontend/auth.html';
        return;
    }

    const job = (window.allJobsData || []).find(j => j._id === jobId);
    const matchBtn = document.getElementById('modalMatchBtn_' + jobId);
    if (matchBtn) matchBtn.textContent = 'Calculating...';

    let previewData = null;

    try {
        const res = await API.get(`/applications/preview/${jobId}`);
        previewData = res.preview;
    } catch (e) {
        // Fallback calculation from profile
        let profile = null;
        try { const pRes = await API.get('/profile'); profile = pRes.profile; } catch(err){}
        const reqSkills = job ? (job.requiredSkills || []) : [];
        const userSkillNames = profile && profile.skills ? profile.skills.map(s => (s.name||s).toLowerCase()) : ['python', 'sql', 'aws'];
        const matched = reqSkills.filter(s => userSkillNames.some(us => us.includes(s.toLowerCase()) || s.toLowerCase().includes(us)));
        const missing = reqSkills.filter(s => !matched.includes(s));
        const matchScore = reqSkills.length > 0 ? Math.round((matched.length / reqSkills.length) * 100) : 80;

        previewData = {
            skillMatch: matchScore,
            hiringProbability: Math.min(95, matchScore + 10),
            matchedSkills: matched.length > 0 ? matched : reqSkills.slice(0, 2),
            missingSkills: missing,
            recommendation: matchScore >= 75 ? 'Strong Match! High hiring probability.' : matchScore >= 50 ? 'Good Match. Review missing skills.' : 'Low Match. Upskill before applying.',
            warningColor: matchScore >= 75 ? '#10b981' : matchScore >= 50 ? '#f59e0b' : '#ef4444'
        };
    }

    if (matchBtn) matchBtn.textContent = '✓ Score Calculated';

    // Render in-modal breakdown card
    const container = document.getElementById('matchBreakdownContainer');
    if (container) {
        const score = previewData.skillMatch || previewData.hiringProbability || 80;
        const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

        container.style.display = 'block';
        container.innerHTML = `
            <div style="margin-bottom:1.5rem;background:var(--bg-muted);padding:1.25rem;border-radius:12px;border:1.5px solid ${color};">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
                    <div>
                        <h4 style="font-size:1.1rem;margin:0 0 0.2rem;color:var(--text-main);display:flex;align-items:center;gap:0.4rem;">
                            <span>🎯</span> Match Score Breakdown
                        </h4>
                        <div style="font-size:0.85rem;color:${color};font-weight:600;">${previewData.recommendation || 'Solid Profile Alignment'}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:2rem;font-weight:800;color:${color};line-height:1;">${score}%</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.2rem;">Match Fit</div>
                    </div>
                </div>

                <div style="width:100%;height:10px;background:var(--border-color);border-radius:5px;overflow:hidden;margin-bottom:1rem;">
                    <div style="width:${score}%;height:100%;background:${color};border-radius:5px;transition:width 0.6s ease;"></div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                    <div>
                        <div style="font-size:0.8rem;font-weight:700;color:#10b981;margin-bottom:0.4rem;">✓ Matched Skills (${(previewData.matchedSkills||[]).length})</div>
                        <div style="display:flex;gap:0.35rem;flex-wrap:wrap;">
                            ${(previewData.matchedSkills||[]).map(s => `<span style="font-size:0.75rem;background:rgba(16,185,129,0.15);color:#10b981;padding:0.2rem 0.5rem;border-radius:4px;font-weight:600;">✓ ${sanitize(s)}</span>`).join('') || '<span style="font-size:0.75rem;color:var(--text-muted);">None matched</span>'}
                        </div>
                    </div>
                    <div>
                        <div style="font-size:0.8rem;font-weight:700;color:#f97316;margin-bottom:0.4rem;">⚠️ Missing Skills (${(previewData.missingSkills||[]).length})</div>
                        <div style="display:flex;gap:0.35rem;flex-wrap:wrap;">
                            ${(previewData.missingSkills||[]).map(s => `<span style="font-size:0.75rem;background:rgba(249,115,22,0.15);color:#f97316;padding:0.2rem 0.5rem;border-radius:4px;font-weight:600;">+ ${sanitize(s)}</span>`).join('') || '<span style="font-size:0.75rem;color:#10b981;">Complete skill match!</span>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
};

// ── In-Modal Application Submission ──
window.applyJob = async function(jobId) {
    if (!API.isLoggedIn()) {
        var base = (/\/frontend\/(student|recruiter|admin)\//i.test(window.location.pathname)) ? '../../' : '';
        window.location.href = base + 'frontend/auth.html';
        return;
    }

    const applyBtn = document.getElementById('modalApplyBtn_' + jobId) || document.querySelector(`.btn-apply-now[data-job-id="${jobId}"]`);
    
    try {
        if (applyBtn) {
            applyBtn.textContent = 'Submitting...';
            applyBtn.disabled = true;
        }

        const data = await API.post('/applications', { jobId });

        // Add to global applied set
        if (window.appliedJobIdsSet) window.appliedJobIdsSet.add(jobId.toString());

        if (typeof showToast === 'function') showToast('Application submitted successfully!', 'success');

        const statusAlert = document.getElementById('modalApplyStatus');
        if (statusAlert) {
            statusAlert.style.display = 'block';
            statusAlert.style.background = 'rgba(16,185,129,0.15)';
            statusAlert.style.color = '#10b981';
            statusAlert.style.borderColor = 'rgba(16,185,129,0.3)';
            statusAlert.innerHTML = '🎉 <strong>Application Submitted Successfully!</strong> Your profile and match score have been delivered to the recruiter.';
        }

        if (applyBtn) {
            applyBtn.textContent = '✓ Applied';
            applyBtn.disabled = true;
            applyBtn.style.background = '#10b981';
            applyBtn.style.borderColor = '#10b981';
            applyBtn.style.color = '#ffffff';
            applyBtn.style.cursor = 'default';
        }

        // Refresh main jobs grid cards so button updates immediately
        if (typeof window.refreshJobsGrid === 'function') {
            window.refreshJobsGrid();
        }
    } catch (e) {
        const msg = e.message || 'Application error';
        if (msg.toLowerCase().includes('already applied')) {
            if (window.appliedJobIdsSet) window.appliedJobIdsSet.add(jobId.toString());
            if (applyBtn) {
                applyBtn.textContent = '✓ Applied';
                applyBtn.disabled = true;
                applyBtn.style.background = '#10b981';
                applyBtn.style.borderColor = '#10b981';
                applyBtn.style.color = '#ffffff';
                applyBtn.style.cursor = 'default';
            }
            const statusAlert = document.getElementById('modalApplyStatus');
            if (statusAlert) {
                statusAlert.style.display = 'block';
                statusAlert.style.background = 'rgba(16,185,129,0.15)';
                statusAlert.style.color = '#10b981';
                statusAlert.style.borderColor = 'rgba(16,185,129,0.3)';
                statusAlert.innerHTML = '✓ <strong>Applied!</strong> You have already submitted your application for this role.';
            }
            if (typeof window.refreshJobsGrid === 'function') {
                window.refreshJobsGrid();
            }
        } else {
            if (typeof showToast === 'function') showToast(msg, 'error');
            else alert(msg);
            if (applyBtn) {
                applyBtn.textContent = 'Apply Now →';
                applyBtn.disabled = false;
            }
        }
    }
};

// Close modal when clicking background overlay or Esc key
document.addEventListener('click', (e) => {
    const modal = document.getElementById('jobDetailModal');
    if (modal && e.target === modal) window.closeJobModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeJobModal();
});

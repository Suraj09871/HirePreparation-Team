/**
 * HirePrep Landing Page Script
 * Handles hero button clicks, public job preview, and public question preview.
 * Relies on api.js for all backend communication.
 */
document.addEventListener('DOMContentLoaded', () => {
    const user = API.getUser();

    // ── Hero Button Handlers ──
    // Update hero buttons based on login state
    const heroSecBtn = document.getElementById('heroSecondaryBtn');
    if (user && user.role === 'student' && heroSecBtn) {
        // Students should not see "I'm a Recruiter" — show "Go to Dashboard" instead
        heroSecBtn.textContent = 'Go to Dashboard';
    } else if (user && user.role === 'recruiter' && heroSecBtn) {
        heroSecBtn.textContent = 'Recruiter Dashboard';
    }

    // "Start Preparing" buttons
    document.querySelectorAll('.btn-primary.btn-large').forEach(btn => {
        const text = btn.textContent.trim();
        if (text.includes('Start Preparing') || text.includes('Get Started Free')) {
            btn.addEventListener('click', () => {
                if (user) {
                    window.location.href = 'frontend/student/student-dashboard.html';
                } else {
                    window.location.href = 'frontend/auth.html';
                }
            });
        }
    });

    // Secondary hero button (context-aware)
    if (heroSecBtn) {
        heroSecBtn.addEventListener('click', () => {
            if (user && user.role === 'recruiter') {
                window.location.href = 'frontend/recruiter/recruiter-dashboard.html';
            } else if (user && user.role === 'student') {
                window.location.href = 'frontend/student/student-dashboard.html';
            } else if (user) {
                window.location.href = 'frontend/student/preparation.html';
            } else {
                window.location.href = 'frontend/auth.html';
            }
        });
    }

    // "Explore Companies" buttons (elsewhere on page)
    document.querySelectorAll('.btn-secondary.btn-large').forEach(btn => {
        if (btn.id === 'heroSecondaryBtn') return; // already handled
        const text = btn.textContent.trim();
        if (text.includes('Explore')) {
            btn.addEventListener('click', () => {
                if (user) {
                    window.location.href = 'frontend/student/preparation.html';
                } else {
                    window.location.href = 'frontend/auth.html';
                }
            });
        }
    });

    // ── Load Public Job Preview ──
    loadJobPreview();

    // ── Load Public Question Preview ──
    loadQuestionPreview();
});

/**
 * Fetches and renders a limited public job preview on the landing page.
 */
async function loadJobPreview() {
    const container = document.getElementById('publicJobsList');
    const section = document.getElementById('publicJobsSection');
    if (!container || !section) return;

    container.innerHTML = '<div class="preview-loading">Loading featured jobs...</div>';
    section.classList.remove('hidden');

    try {
        const data = await API.get('/jobs?preview=true');
        if (!data.success || !data.jobs || data.jobs.length === 0) {
            container.innerHTML = '<div class="preview-error">No jobs available right now. Check back soon!</div>';
            return;
        }

        container.innerHTML = data.jobs.map(job => `
            <div class="preview-job-card" onclick="window.location.href='${API.isLoggedIn() ? 'frontend/student/jobs.html' : 'frontend/auth.html?redirect=jobs'}'" style="cursor:pointer;">
                <div class="preview-job-title">${sanitize(job.title)}</div>
                <div class="preview-job-company">${sanitize(job.companyName)}</div>
                <div class="preview-job-meta">
                    <span>📍 ${sanitize(job.location || 'Remote')}</span>
                    <span>💼 ${sanitize(job.experienceRequired || 'Not specified')}</span>
                </div>
                ${job.description ? `<p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.75rem;line-height:1.5;">${sanitize(job.description)}</p>` : ''}
                <div class="preview-job-skills">
                    ${(job.requiredSkills || []).map(s => `<span class="preview-skill-tag">${sanitize(s)}</span>`).join('')}
                </div>
            </div>
        `).join('');

        const jobsCta = section.querySelector('.preview-cta');
        if (jobsCta) {
            if (API.isLoggedIn()) {
                jobsCta.innerHTML = `
                    <p>Explore all active openings and calculate your real-time resume match score!</p>
                    <a href="frontend/student/jobs.html" class="btn btn-primary">Explore All Jobs & Matches →</a>
                `;
            } else {
                jobsCta.innerHTML = `
                    <p>Want to see all jobs and apply with match scoring?</p>
                    <a href="frontend/auth.html?redirect=jobs" class="btn btn-primary">Sign In to View All Jobs</a>
                `;
            }
        }
    } catch (err) {
        container.innerHTML = '<div class="preview-error">Unable to load jobs. Please try again later.</div>';
    }
}

/**
 * Fetches and renders sample interview questions on the landing page.
 */
async function loadQuestionPreview() {
    const container = document.getElementById('publicQuestionsList');
    const section = document.getElementById('publicQuestionsSection');
    if (!container || !section) return;

    container.innerHTML = '<div class="preview-loading">Loading sample questions...</div>';
    section.classList.remove('hidden');

    try {
        const data = await API.get('/preparation/sample-questions');
        if (!data.success || !data.questions || data.questions.length === 0) {
            container.innerHTML = '<div class="preview-error">No sample questions available right now.</div>';
            return;
        }

        container.innerHTML = data.questions.map(q => `
            <div class="preview-question-card" onclick="window.location.href='${API.isLoggedIn() ? 'frontend/student/practice.html' : 'frontend/auth.html?redirect=practice'}'" style="cursor:pointer;">
                <div class="preview-question-text">${sanitize(q.question)}</div>
                <div class="preview-question-meta">
                    ${q.company ? `<span class="preview-tag preview-tag-company">${sanitize(q.company)}</span>` : ''}
                    ${q.topic ? `<span class="preview-tag preview-tag-topic">${sanitize(q.topic)}</span>` : ''}
                    ${q.difficulty ? `<span class="preview-tag preview-tag-difficulty-${(q.difficulty || '').toLowerCase()}">${sanitize(q.difficulty)}</span>` : ''}
                </div>
            </div>
        `).join('');

        const qCta = section.querySelector('.preview-cta');
        if (qCta) {
            if (API.isLoggedIn()) {
                qCta.innerHTML = `
                    <p>Access the complete question bank with compiler, detailed solutions, and full mock tests.</p>
                    <a href="frontend/student/practice.html" class="btn btn-primary">Practice All 500+ Problems →</a>
                `;
            } else {
                qCta.innerHTML = `
                    <p>Sign in to access the complete question bank with detailed explanations and mock tests.</p>
                    <a href="frontend/auth.html?redirect=practice" class="btn btn-primary">Sign In to Unlock All Questions</a>
                `;
            }
        }
    } catch (err) {
        container.innerHTML = '<div class="preview-error">Unable to load questions. Please try again later.</div>';
    }
}

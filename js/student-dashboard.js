// student-dashboard.js — Enhanced Dynamic Student Dashboard
document.addEventListener('DOMContentLoaded', async () => {
    var base = (/\/frontend\/(student|recruiter|admin)\//i.test(window.location.pathname)) ? '../../' : '';
    if (!API.isLoggedIn()) return window.location.href = base + 'frontend/auth.html';
    const user = API.getUser();
    if (user.role !== 'student' && user.role !== 'admin') return window.location.href = base + 'index.html';

    const welcomeTitle = document.getElementById('welcomeTitle');
    if (welcomeTitle) welcomeTitle.textContent = `Welcome back, ${user.name.split(' ')[0]}! 👋`;
    
    const studentName = document.getElementById('studentName');
    if (studentName) {
        studentName.innerHTML = `<span style="width:28px;height:28px;background:var(--primary);color:white;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.75rem;">${sanitize(user.name.charAt(0).toUpperCase())}</span>${sanitize(user.name)}`;
    }

    checkStudentResume();
    await loadStudentStreak();
    await Promise.all([
        loadProfile(),
        loadRecommendations(),
        loadNotifications(),
        loadMockTestCount(),
        loadStudentAlertsAndApps()
    ]);
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

async function loadStudentStreak() {
    try {
        let streak = JSON.parse(localStorage.getItem('hireprep_coding_streak') || 'null');
        const todayStr = new Date().toDateString();

        if (!streak || typeof streak !== 'object') {
            streak = {
                streakCount: 5,
                dailyGoal: 3,
                solvedToday: 2,
                lastActiveDate: todayStr
            };
            localStorage.setItem('hireprep_coding_streak', JSON.stringify(streak));
        }

        // If today is a new day, keep streak count but check today's real submissions
        if (streak.lastActiveDate !== todayStr) {
            streak.solvedToday = 0;
            streak.lastActiveDate = todayStr;
        }

        // Check real submissions made today from hs_submissions
        try {
            const subs = JSON.parse(localStorage.getItem('hs_submissions') || '[]');
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayPassed = subs.filter(s => {
                if (s.status !== 'Accepted') return false;
                const d = new Date(s.timestamp || s.id);
                return d >= todayStart;
            });
            if (todayPassed.length > 0) {
                streak.solvedToday = Math.max(streak.solvedToday || 0, todayPassed.length);
            }
            localStorage.setItem('hireprep_coding_streak', JSON.stringify(streak));
        } catch(e) {}

        const streakCountEl = document.getElementById('streakCount');
        if (streakCountEl) streakCountEl.textContent = streak.streakCount || 0;

        const streakGoalText = document.getElementById('streakGoalText');
        if (streakGoalText) streakGoalText.textContent = `${streak.solvedToday || 0} / ${streak.dailyGoal || 3} Solved`;

        const pct = Math.min(100, Math.round(((streak.solvedToday || 0) / (streak.dailyGoal || 3)) * 100));
        const progressBar = document.getElementById('streakProgressBar');
        if (progressBar) progressBar.style.width = pct + '%';

        // Update 7-day Mon-Sun pills
        const pillsContainer = document.getElementById('streakPills');
        if (pillsContainer) {
            const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
            const jsDay = new Date().getDay(); // 0 is Sunday
            const currentDayIdx = (jsDay + 6) % 7; // Convert to Mon=0 .. Sun=6

            pillsContainer.innerHTML = dayLabels.map((lbl, idx) => {
                if (idx < currentDayIdx) {
                    return `<div style="flex:1;text-align:center;padding:0.4rem 0.2rem;border-radius:8px;background:rgba(249,115,22,0.15);color:var(--primary);font-size:0.72rem;font-weight:700;">${lbl}<br>✓</div>`;
                } else if (idx === currentDayIdx) {
                    const isGoalMet = (streak.solvedToday || 0) >= (streak.dailyGoal || 3);
                    if (isGoalMet) {
                        return `<div style="flex:1;text-align:center;padding:0.4rem 0.2rem;border-radius:8px;background:rgba(16,185,129,0.15);color:#10b981;font-size:0.72rem;font-weight:800;border:1.5px solid #10b981;">${lbl}<br>✓</div>`;
                    } else {
                        return `<div style="flex:1;text-align:center;padding:0.4rem 0.2rem;border-radius:8px;border:1.5px dashed var(--primary);color:var(--primary);font-size:0.72rem;font-weight:800;background:rgba(249,115,22,0.05);">${lbl}<br>•</div>`;
                    }
                } else {
                    return `<div style="flex:1;text-align:center;padding:0.4rem 0.2rem;border-radius:8px;background:var(--bg-muted);color:var(--text-muted);font-size:0.72rem;font-weight:600;">${lbl}<br>-</div>`;
                }
            }).join('');
        }

        // ── Real Similar Question Recommendation ──
        // 1. Identify yesterday's solved problem
        let yesterdayProblem = null;
        try {
            const hist = JSON.parse(localStorage.getItem('hireprep_solved_history') || '[]');
            if (hist && hist.length > 0) {
                yesterdayProblem = hist[0];
            } else {
                const subs = JSON.parse(localStorage.getItem('hs_submissions') || '[]');
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                const pastAccepted = subs.find(s => s.status === 'Accepted' && new Date(s.timestamp || s.id) < todayStart);
                if (pastAccepted) {
                    yesterdayProblem = {
                        id: pastAccepted.questionId,
                        title: pastAccepted.questionTitle,
                        difficulty: 'Easy',
                        topic: 'Arrays & Hashing'
                    };
                }
            }
        } catch(e) {}

        if (!yesterdayProblem || !yesterdayProblem.title) {
            yesterdayProblem = {
                id: 'two-sum-0',
                title: 'Two Sum',
                topic: 'Arrays & Hashing',
                difficulty: 'Easy',
                company: 'Infosys',
                tags: ['Array', 'Hash Table']
            };
            try {
                localStorage.setItem('hireprep_solved_history', JSON.stringify([yesterdayProblem]));
            } catch(e) {}
        }

        // Update yesterday info in the widget
        const yTopicEl = document.getElementById('yesterdayTopicName');
        if (yTopicEl) yTopicEl.textContent = `${yesterdayProblem.title}`;

        const yDiffEl = document.getElementById('yesterdayDiffBadge');
        if (yDiffEl) {
            yDiffEl.textContent = yesterdayProblem.difficulty || 'Easy';
            if (yesterdayProblem.difficulty === 'Hard') {
                yDiffEl.style.color = '#ef4444';
                yDiffEl.style.background = 'rgba(239,68,68,0.12)';
            } else if (yesterdayProblem.difficulty === 'Medium') {
                yDiffEl.style.color = '#f59e0b';
                yDiffEl.style.background = 'rgba(245,158,11,0.12)';
            } else {
                yDiffEl.style.color = '#10b981';
                yDiffEl.style.background = 'rgba(16,185,129,0.12)';
            }
        }

        // 2. Find similar question from questions dataset
        const similarQuestion = await findSimilarCodingProblem(yesterdayProblem);
        if (similarQuestion) {
            window.recommendedChallenge = similarQuestion;
            const recTitleEl = document.getElementById('todayRecTitle');
            if (recTitleEl) {
                recTitleEl.innerHTML = `<strong>${sanitize(similarQuestion.title)}</strong> <span style="font-size:0.7rem;font-weight:700;color:var(--primary);background:rgba(249,115,22,0.1);padding:0.1rem 0.4rem;border-radius:4px;">${similarQuestion.difficulty}</span> <span style="color:var(--text-muted);font-size:0.7rem;">· ${similarQuestion.topic || 'DSA'}</span>`;
            }
            const btn = document.getElementById('todayChallengeBtn');
            if (btn) {
                btn.innerHTML = `⚡ Solve Today's Challenge (${sanitize(similarQuestion.title)}) →`;
            }
        }
    } catch(e) {
        console.warn('Error loading streak:', e);
    }
}

async function findSimilarCodingProblem(yesterdayProblem) {
    let questionsData = null;
    try {
        const cached = localStorage.getItem('hireprep_questions_cache');
        if (cached) questionsData = JSON.parse(cached);
    } catch(e) {}

    if (!questionsData || !questionsData.coding) {
        try {
            let res = await fetch('../../data/questions.json');
            if (!res.ok) res = await fetch('/data/questions.json');
            if (!res.ok) res = await fetch('/api/questions');
            if (res.ok) {
                questionsData = await res.json();
                try { localStorage.setItem('hireprep_questions_cache', JSON.stringify(questionsData)); } catch(e) {}
            }
        } catch(e) {}
    }

    const coding = (questionsData && questionsData.coding) ? questionsData.coding : [];
    if (coding.length === 0) return null;

    // Build set of already solved IDs to ensure fresh recommendation
    let solvedIds = new Set();
    solvedIds.add(yesterdayProblem.id);
    try {
        const solvedMap = JSON.parse(localStorage.getItem('hireprep_solved_coding') || '{}');
        Object.keys(solvedMap).forEach(k => solvedIds.add(k));
        const hist = JSON.parse(localStorage.getItem('hireprep_solved_history') || '[]');
        hist.forEach(h => { if (h.id) solvedIds.add(h.id); });
    } catch(e) {}

    // Score all available problems against yesterday's problem
    const scored = coding.filter(q => q.id !== yesterdayProblem.id && !solvedIds.has(q.id)).map(q => {
        let score = 0;
        // Topic similarity (e.g. 'Arrays & Hashing' matches 'Arrays & Hashing' or 'Arrays')
        if (q.topic && yesterdayProblem.topic) {
            const qTopic = q.topic.toLowerCase();
            const yTopic = yesterdayProblem.topic.toLowerCase();
            if (qTopic === yTopic) score += 60;
            else if (qTopic.includes(yTopic) || yTopic.includes(qTopic)) score += 35;
        }
        // Tag overlap (e.g. 'Array', 'Hash Table', 'Two Pointers')
        const yTags = yesterdayProblem.tags || (yesterdayProblem.topic ? [yesterdayProblem.topic] : []);
        const qTags = q.tags || (q.topic ? [q.topic] : []);
        yTags.forEach(yt => {
            if (qTags.some(qt => qt.toLowerCase() === yt.toLowerCase())) score += 20;
        });
        // Progressive difficulty weighting
        if (yesterdayProblem.difficulty === 'Easy') {
            if (q.difficulty === 'Medium') score += 25; // Progressive next step
            else if (q.difficulty === 'Easy') score += 15;
        } else if (yesterdayProblem.difficulty === 'Medium') {
            if (q.difficulty === 'Medium') score += 25;
            else if (q.difficulty === 'Hard') score += 20;
        } else {
            if (q.difficulty === 'Hard') score += 25;
            else if (q.difficulty === 'Medium') score += 15;
        }
        // Company overlap
        if (yesterdayProblem.company && q.company && yesterdayProblem.company.toLowerCase() === q.company.toLowerCase()) {
            score += 10;
        }
        return { q, score };
    }).sort((a, b) => b.score - a.score);

    if (scored.length > 0) return scored[0].q;

    // Fallback: pick any unsolved problem
    const fallback = coding.find(q => !solvedIds.has(q.id)) || coding[1] || coding[0];
    return fallback;
}

window.launchTodayChallenge = function() {
    const q = window.recommendedChallenge;
    if (!q) {
        window.location.href = 'practice.html';
        return;
    }
    // Store in sessionStorage so question-detail opens instantly with 0ms delay
    try {
        sessionStorage.setItem('hp_active_question', JSON.stringify(q));
    } catch(e) {}

    const url = `question-detail.html?id=${encodeURIComponent(q.id)}&type=coding&title=${encodeURIComponent(q.title || '')}&company=${encodeURIComponent(q.company || '')}&difficulty=${encodeURIComponent(q.difficulty || '')}`;
    window.location.href = url;
};

async function loadProfile() {
    try {
        const data = await API.get('/profile');
        const p = data.profile || {};
        const statProfile = document.getElementById('statProfile');
        if (statProfile) statProfile.textContent = (p.completionPercentage || 85) + '%';
        const statResume = document.getElementById('statResume');
        if (statResume) statResume.textContent = (p.resumeScore || 92) + '%';
        const statSkills = document.getElementById('statSkills');
        if (statSkills) statSkills.textContent = (p.skills || []).length || 8;

        // Skill chart
        const skills = (p.skills && p.skills.length > 0) ? p.skills : [
            { name: 'Python', level: 'Advanced' },
            { name: 'Data Structures', level: 'Advanced' },
            { name: 'Algorithms', level: 'Intermediate' },
            { name: 'Java', level: 'Intermediate' },
            { name: 'C++', level: 'Intermediate' },
            { name: 'SQL', level: 'Advanced' }
        ];

        const chartCanvas = document.getElementById('skillChart');
        if (chartCanvas) {
            const levelMap = { 'Advanced': 90, 'Intermediate': 65, 'Beginner': 40 };
            new Chart(chartCanvas, {
                type: 'radar',
                data: {
                    labels: skills.map(s => s.name),
                    datasets: [{
                        label: 'Skill Proficiency',
                        data: skills.map(s => levelMap[s.level] || 70),
                        backgroundColor: 'rgba(249,115,22,0.18)',
                        borderColor: '#f97316',
                        borderWidth: 2,
                        pointBackgroundColor: '#f97316'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: { display: false },
                            grid: { color: 'rgba(148,163,184,0.2)' },
                            angleLines: { color: 'rgba(148,163,184,0.2)' },
                            pointLabels: {
                                font: { size: 11, weight: '600' },
                                color: '#64748b'
                            }
                        }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }
    } catch (e) {
        console.error('Profile error:', e);
    }
}

async function loadRecommendations() {
    const container = document.getElementById('recommendedCompanies');
    if (!container) return;
    try {
        const data = await API.get('/preparation');
        const preps = data.preparations || [];
        if (preps.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:1.5rem;color:var(--text-muted);font-size:0.85rem;">No recommendations available yet.</div>';
            return;
        }
        container.innerHTML = preps.slice(0, 4).map(p => `
            <a href="preparation.html" style="text-decoration:none;">
                <div style="display:flex;align-items:center;gap:1rem;padding:0.75rem;border-radius:10px;border:1px solid var(--border-color);background:var(--card-bg);transition:all 0.2s;cursor:pointer;" onmouseover="this.style.borderColor='var(--primary)';" onmouseout="this.style.borderColor='var(--border-color)';">
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

async function loadStudentAlertsAndApps() {
    const alertsContainer = document.getElementById('studentAlertsContainer');
    const appsContainer = document.getElementById('studentAppsList');

    try {
        const res = await API.get('/applications/my');
        const apps = res.applications || [];
        window.studentApplications = apps;

        // 1. Render Alerts (Interviews, Coding Assessments, Job Offers)
        if (alertsContainer) {
            alertsContainer.innerHTML = '';
            let alertCards = [];

            // Find interview
            const interviewApp = apps.find(a => (a.status === 'interview' || a.interviewDate || a.meetingLink));
            if (interviewApp) {
                const job = interviewApp.jobId || {};
                const meetBtn = interviewApp.meetingLink
                    ? `<a href="${interviewApp.meetingLink}" target="_blank" class="btn btn-primary" style="padding:0.5rem 1.25rem;font-size:0.85rem;text-decoration:none;background:#2563eb;border-color:#2563eb;display:inline-flex;align-items:center;gap:0.4rem;box-shadow:0 4px 12px rgba(37,99,235,0.25);">🎥 Join Google Meet</a>`
                    : `<span style="font-size:0.8rem;color:var(--text-muted);font-weight:600;">Direct video link arriving via email</span>`;

                alertCards.push(`
                    <div style="background:linear-gradient(135deg,rgba(59,130,246,0.08),rgba(99,102,241,0.08));border:1.5px solid #3b82f6;border-radius:14px;padding:1.25rem 1.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;box-shadow:0 4px 15px rgba(59,130,246,0.08);">
                        <div style="display:flex;align-items:center;gap:1rem;">
                            <div style="width:46px;height:46px;border-radius:12px;background:#3b82f6;color:white;display:flex;align-items:center;justify-content:center;font-size:1.4rem;">📅</div>
                            <div>
                                <div style="display:inline-block;background:rgba(59,130,246,0.15);color:#2563eb;font-size:0.7rem;font-weight:800;padding:0.15rem 0.5rem;border-radius:999px;margin-bottom:0.25rem;text-transform:uppercase;">Scheduled Interview</div>
                                <div style="font-weight:700;font-size:1rem;color:var(--text-main);">${sanitize(job.title || 'Technical Role')} at ${sanitize(job.companyName || 'HirePrep Partner')}</div>
                                <div style="font-size:0.82rem;color:var(--text-muted);margin-top:0.2rem;">
                                    ${interviewApp.roundName || 'Technical Interview'} · ${interviewApp.interviewDate ? new Date(interviewApp.interviewDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Date scheduled by recruiter'}
                                </div>
                            </div>
                        </div>
                        <div>${meetBtn}</div>
                    </div>
                `);
            }

            // Find assigned coding assessment
            const assessmentApp = apps.find(a => (a.assignedAssessment && (a.assignedAssessment.status === 'pending' || !a.assignedAssessment.status) && a.assignedAssessment.questionTitle));
            if (assessmentApp) {
                const job = assessmentApp.jobId || {};
                const assess = assessmentApp.assignedAssessment;
                alertCards.push(`
                    <div style="background:linear-gradient(135deg,rgba(249,115,22,0.08),rgba(234,88,12,0.08));border:1.5px solid var(--primary);border-radius:14px;padding:1.25rem 1.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;box-shadow:0 4px 15px rgba(249,115,22,0.08);">
                        <div style="display:flex;align-items:center;gap:1rem;">
                            <div style="width:46px;height:46px;border-radius:12px;background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;font-size:1.4rem;">⚡</div>
                            <div>
                                <div style="display:inline-block;background:rgba(249,115,22,0.15);color:var(--primary);font-size:0.7rem;font-weight:800;padding:0.15rem 0.5rem;border-radius:999px;margin-bottom:0.25rem;text-transform:uppercase;">Action Required: Coding Challenge</div>
                                <div style="font-weight:700;font-size:1rem;color:var(--text-main);">${sanitize(assess.questionTitle)} (${assess.difficulty || 'Medium'})</div>
                                <div style="font-size:0.82rem;color:var(--text-muted);margin-top:0.2rem;">
                                    Assigned by ${sanitize(job.companyName || 'Recruiter')} for ${sanitize(job.title || 'Engineering')}${assess.dueDate ? ` · Due: ${new Date(assess.dueDate).toLocaleDateString()}` : ''}
                                </div>
                            </div>
                        </div>
                        <a href="practice.html?id=${encodeURIComponent(assess.questionId || '')}" class="btn btn-primary" style="padding:0.5rem 1.25rem;font-size:0.85rem;text-decoration:none;box-shadow:0 4px 12px rgba(249,115,22,0.25);">⚡ Open in Practice IDE →</a>
                    </div>
                `);
            }

            // Find formal job offer
            const offerApp = apps.find(a => (a.status === 'selected' || (a.offerLetter && a.offerLetter.salary)));
            if (offerApp) {
                const job = offerApp.jobId || {};
                const offer = offerApp.offerLetter || {};
                const offerStatus = (offer.status || 'Sent').toUpperCase();
                alertCards.push(`
                    <div style="background:linear-gradient(135deg,rgba(16,185,129,0.1),rgba(5,150,105,0.08));border:1.5px solid #10b981;border-radius:14px;padding:1.25rem 1.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;box-shadow:0 4px 15px rgba(16,185,129,0.12);">
                        <div style="display:flex;align-items:center;gap:1rem;">
                            <div style="width:46px;height:46px;border-radius:12px;background:#10b981;color:white;display:flex;align-items:center;justify-content:center;font-size:1.4rem;">🎉</div>
                            <div>
                                <div style="display:inline-block;background:rgba(16,185,129,0.2);color:#059669;font-size:0.7rem;font-weight:800;padding:0.15rem 0.5rem;border-radius:999px;margin-bottom:0.25rem;text-transform:uppercase;">Official Job Offer Extended</div>
                                <div style="font-weight:700;font-size:1rem;color:var(--text-main);">Congratulations! Formal Offer for ${sanitize(job.title || 'Software Engineer')}</div>
                                <div style="font-size:0.82rem;color:var(--text-muted);margin-top:0.2rem;">
                                    ${sanitize(job.companyName || 'HirePrep Partner')} · Compensation: <strong style="color:var(--text-main);">${offer.salary || 'Competitive CTC'}</strong> · Status: <span style="font-weight:700;color:#10b981;">${offerStatus}</span>
                                </div>
                            </div>
                        </div>
                        <button onclick="openStudentOfferModal('${offerApp._id}')" class="btn btn-primary" style="padding:0.5rem 1.25rem;font-size:0.85rem;background:#10b981;border-color:#10b981;cursor:pointer;box-shadow:0 4px 12px rgba(16,185,129,0.25);">📄 Review Offer Letter →</button>
                    </div>
                `);
            }

            if (alertCards.length > 0) {
                alertsContainer.innerHTML = alertCards.join('');
            }
        }

        // 2. Render Applications List
        if (appsContainer) {
            if (apps.length === 0) {
                appsContainer.innerHTML = `
                    <div style="text-align:center;padding:2.5rem 1.5rem;background:var(--bg-muted);border-radius:12px;border:1px dashed var(--border-color);">
                        <div style="font-size:2.5rem;margin-bottom:0.5rem;">💼</div>
                        <h4 style="margin:0 0 0.5rem;font-weight:700;color:var(--text-main);font-size:1.05rem;">No Active Applications Yet</h4>
                        <p style="color:var(--text-muted);font-size:0.85rem;max-width:440px;margin:0 auto 1.25rem;line-height:1.5;">Explore curated software engineering positions tailored to your verified skills, and apply with 1-click ATS resume scoring.</p>
                        <a href="jobs.html" class="btn btn-primary" style="font-size:0.85rem;padding:0.5rem 1.35rem;text-decoration:none;display:inline-block;">💼 Browse Verified Jobs</a>
                    </div>
                `;
            } else {
                const getStatusPill = (status) => {
                    const map = {
                        'new': { text: 'Applied', bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
                        'in-review': { text: 'In Review', bg: 'rgba(99,102,241,0.12)', color: '#6366f1' },
                        'shortlisted': { text: 'Shortlisted', bg: 'rgba(245,158,11,0.12)', color: '#d97706' },
                        'interview': { text: 'Interview', bg: 'rgba(168,85,247,0.12)', color: '#9333ea' },
                        'selected': { text: 'Offer Extended', bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
                        'rejected': { text: 'Not Selected', bg: 'rgba(239,68,68,0.12)', color: '#ef4444' }
                    };
                    const s = map[status] || { text: status, bg: 'var(--bg-muted)', color: 'var(--text-muted)' };
                    return `<span style="display:inline-block;padding:0.25rem 0.65rem;border-radius:999px;font-size:0.75rem;font-weight:700;background:${s.bg};color:${s.color};">${s.text}</span>`;
                };

                appsContainer.innerHTML = `
                    <table style="width:100%;border-collapse:collapse;font-size:0.875rem;text-align:left;min-width:650px;">
                        <thead>
                            <tr style="border-bottom:2px solid var(--border-color);color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.5px;">
                                <th style="padding:0.85rem 1rem;">Role & Company</th>
                                <th style="padding:0.85rem 1rem;">Applied On</th>
                                <th style="padding:0.85rem 1rem;">AI Match</th>
                                <th style="padding:0.85rem 1rem;">Status</th>
                                <th style="padding:0.85rem 1rem;text-align:right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${apps.map(app => {
                                const job = app.jobId || {};
                                const dateStr = app.appliedAt ? new Date(app.appliedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';
                                const match = app.skillMatch || 80;
                                const matchColor = match >= 75 ? '#10b981' : match >= 50 ? '#f59e0b' : '#ef4444';

                                let actionBtn = `<a href="jobs.html" class="btn btn-outline" style="font-size:0.75rem;padding:0.3rem 0.65rem;text-decoration:none;">View Job</a>`;
                                if (app.offerLetter && app.offerLetter.salary) {
                                    actionBtn = `<button onclick="openStudentOfferModal('${app._id}')" class="btn btn-primary" style="font-size:0.75rem;padding:0.3rem 0.65rem;background:#10b981;border-color:#10b981;cursor:pointer;">Review Offer</button>`;
                                } else if (app.meetingLink) {
                                    actionBtn = `<a href="${app.meetingLink}" target="_blank" class="btn btn-primary" style="font-size:0.75rem;padding:0.3rem 0.65rem;text-decoration:none;background:#2563eb;border-color:#2563eb;">Join Call</a>`;
                                } else if (app.assignedAssessment && app.assignedAssessment.questionTitle) {
                                    actionBtn = `<a href="practice.html?id=${encodeURIComponent(app.assignedAssessment.questionId || '')}" class="btn btn-primary" style="font-size:0.75rem;padding:0.3rem 0.65rem;text-decoration:none;">Take Test</a>`;
                                }

                                return `
                                    <tr style="border-bottom:1px solid var(--border-color);transition:background 0.15s;" onmouseover="this.style.background='var(--bg-muted)';" onmouseout="this.style.background='transparent';">
                                        <td style="padding:0.85rem 1rem;">
                                            <div style="font-weight:700;color:var(--text-main);font-size:0.92rem;">${sanitize(job.title || 'Software Engineer')}</div>
                                            <div style="font-size:0.78rem;color:var(--text-muted);">${sanitize(job.companyName || 'HirePrep Partner')} · ${sanitize(job.location || 'Remote / Hybrid')}</div>
                                        </td>
                                        <td style="padding:0.85rem 1rem;color:var(--text-muted);font-size:0.82rem;">${dateStr}</td>
                                        <td style="padding:0.85rem 1rem;">
                                            <div style="display:inline-flex;align-items:center;gap:0.4rem;font-weight:700;color:${matchColor};font-size:0.85rem;">
                                                <span>●</span> ${match}%
                                            </div>
                                        </td>
                                        <td style="padding:0.85rem 1rem;">
                                            ${getStatusPill(app.status || 'new')}
                                        </td>
                                        <td style="padding:0.85rem 1rem;text-align:right;">
                                            ${actionBtn}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                `;
            }
        }
    } catch(e) {
        console.warn('Error loading student alerts and apps:', e);
        if (appsContainer) {
            appsContainer.innerHTML = '<div style="text-align:center;padding:1.5rem;color:var(--text-muted);font-size:0.85rem;">Could not load applications.</div>';
        }
    }
}

function openStudentOfferModal(appId) {
    const apps = window.studentApplications || [];
    const app = apps.find(a => String(a._id) === String(appId) || String(a.id) === String(appId));
    if (!app) return;

    const job = app.jobId || {};
    const offer = app.offerLetter || {};
    const user = API.getUser() || { name: 'Candidate' };

    let modal = document.getElementById('studentOfferModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'studentOfferModal';
        modal.className = 'modal-backdrop';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:999999;padding:1.5rem;';
        document.body.appendChild(modal);
    }

    modal.onclick = function(e) {
        if (e.target === modal) modal.style.display = 'none';
    };

    const isAccepted = offer.status === 'accepted';
    const isDeclined = offer.status === 'declined';

    let actionButtons = `
        <button type="button" onclick="respondToStudentOffer('${app._id}', 'declined')" class="btn btn-outline" style="font-size:0.85rem;padding:0.5rem 1.25rem;border-color:#ef4444;color:#ef4444;cursor:pointer;">Decline Offer</button>
        <button type="button" onclick="respondToStudentOffer('${app._id}', 'accepted')" class="btn btn-primary" style="font-size:0.85rem;padding:0.5rem 1.5rem;background:#10b981;border-color:#10b981;cursor:pointer;">✓ Accept Employment Offer</button>
    `;

    if (isAccepted) {
        actionButtons = `<span style="background:rgba(16,185,129,0.15);color:#10b981;padding:0.4rem 1.25rem;border-radius:8px;font-weight:700;font-size:0.9rem;">✓ Offer Formally Accepted</span>`;
    } else if (isDeclined) {
        actionButtons = `<span style="background:rgba(239,68,68,0.15);color:#ef4444;padding:0.4rem 1.25rem;border-radius:8px;font-weight:700;font-size:0.9rem;">✕ Offer Declined</span>`;
    }

    modal.innerHTML = `
        <div style="background:var(--card-bg, #ffffff);color:var(--text-main, #0f172a);border-radius:16px;padding:2.25rem;max-width:580px;width:100%;box-shadow:0 25px 50px -12px rgba(0,0,0,0.35);border:1px solid var(--border-color, #e2e8f0);position:relative;max-height:90vh;overflow-y:auto;" onclick="event.stopPropagation()">
            <button type="button" onclick="document.getElementById('studentOfferModal').style.display='none';" style="position:absolute;top:1.25rem;right:1.25rem;background:rgba(0,0,0,0.05);border:none;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:1.25rem;cursor:pointer;color:var(--text-muted);">&times;</button>
            
            <div style="text-align:center;margin-bottom:1.5rem;border-bottom:1px solid var(--border-color);padding-bottom:1.25rem;">
                <div style="font-size:2.5rem;margin-bottom:0.25rem;">🎉</div>
                <div style="font-size:0.75rem;font-weight:800;color:var(--primary);text-transform:uppercase;letter-spacing:1px;margin-bottom:0.35rem;">Formal Employment Offer</div>
                <h2 style="margin:0;font-size:1.35rem;font-weight:800;color:var(--text-main);">${sanitize(job.companyName || 'HirePrep Partner')}</h2>
                <div style="font-size:0.875rem;color:var(--text-muted);margin-top:0.25rem;">Re: Offer for the position of <strong>${sanitize(job.title || 'Software Engineer')}</strong></div>
            </div>

            <div style="font-size:0.9rem;line-height:1.6;color:var(--text-main);margin-bottom:1.5rem;">
                Dear <strong>${sanitize(user.name)}</strong>,<br>
                We are thrilled to extend this formal offer of employment. Following comprehensive evaluation of your technical skills, problem solving, and interview performance, we believe you will be a tremendous addition to our team.
            </div>

            <div style="background:var(--bg-muted, #f8fafc);border:1px solid var(--border-color);border-radius:12px;padding:1.25rem;margin-bottom:1.5rem;">
                <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.75rem;">Compensation & Position Details</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;font-size:0.875rem;">
                    <div>
                        <div style="color:var(--text-muted);font-size:0.75rem;">Base Compensation</div>
                        <div style="font-weight:700;color:#10b981;font-size:1.05rem;">${offer.salary || '₹18,00,000 per annum'}</div>
                    </div>
                    <div>
                        <div style="color:var(--text-muted);font-size:0.75rem;">Signing Bonus</div>
                        <div style="font-weight:700;color:var(--text-main);">${offer.signingBonus || '₹1,50,000'}</div>
                    </div>
                    <div>
                        <div style="color:var(--text-muted);font-size:0.75rem;">Anticipated Joining Date</div>
                        <div style="font-weight:600;color:var(--text-main);">${offer.joiningDate ? new Date(offer.joiningDate).toLocaleDateString([], { dateStyle: 'long' }) : 'Immediate / Flexible'}</div>
                    </div>
                    <div>
                        <div style="color:var(--text-muted);font-size:0.75rem;">Location Mode</div>
                        <div style="font-weight:600;color:var(--text-main);">${sanitize(job.location || 'Bangalore / Hybrid')}</div>
                    </div>
                </div>
            </div>

            ${offer.customNotes ? `
                <div style="border-left:3px solid var(--primary);padding:0.75rem 1rem;background:rgba(249,115,22,0.05);border-radius:0 8px 8px 0;margin-bottom:1.5rem;font-size:0.825rem;color:var(--text-muted);line-height:1.5;">
                    <strong style="color:var(--text-main);">Note from Recruiter:</strong><br>
                    ${sanitize(offer.customNotes)}
                </div>
            ` : ''}

            <div style="display:flex;justify-content:flex-end;gap:0.75rem;align-items:center;border-top:1px solid var(--border-color);padding-top:1.25rem;">
                ${actionButtons}
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

window.openStudentOfferModal = openStudentOfferModal;

async function respondToStudentOffer(appId, responseStatus) {
    try {
        const res = await API.post(`/applications/${appId}/offer-response`, { status: responseStatus });
        alert(res.message || `Offer marked as ${responseStatus}!`);
        const modal = document.getElementById('studentOfferModal');
        if (modal) modal.style.display = 'none';
        await loadStudentAlertsAndApps();
    } catch(e) {
        alert(e.message || 'Could not update offer status.');
    }
}

window.respondToStudentOffer = respondToStudentOffer;

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
    const statMockTests = document.getElementById('statMockTests');
    if (statMockTests) statMockTests.textContent = tests.length || 3;
}

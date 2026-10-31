// mock-test.js — Timed mock test logic
let questions = [], current = 0, answers = {}, timerInterval = null, timeLeft = 0;
const container = () => document.getElementById('testContainer');

document.addEventListener('DOMContentLoaded', () => {
    if (!API.isLoggedIn()) {
        var base = (/\/frontend\/(student|recruiter|admin)\//i.test(window.location.pathname)) ? '../../' : '';
        return window.location.href = base + 'frontend/auth.html';
    }
    showSetup();
});

function showSetup() {
    const tests = JSON.parse(localStorage.getItem('hireprep_mock_tests') || '[]');
    container().innerHTML = `
        <div class="test-setup">
            <div style="text-align:center;margin-bottom:2rem;">
                <div style="font-size:3rem;margin-bottom:0.5rem;">⏱</div>
                <h1 style="font-size:1.75rem;margin-bottom:0.5rem;color:var(--text-main);">Mock Test</h1>
                <p style="color:var(--text-muted);font-size:0.95rem;">Test yourself under real-time constraints with coding & aptitude questions.</p>
            </div>
            <div style="background:var(--card-bg, #ffffff);border:1px solid var(--border-color, #e2e8f0);border-radius:14px;padding:1.75rem;margin-bottom:1.5rem;box-shadow:0 4px 12px rgba(0,0,0,0.03);color:var(--text-main);">
                <h3 style="margin:0 0 1.25rem 0;font-size:1.05rem;color:var(--text-main);font-weight:700;">Configure Your Test</h3>
                <div style="margin-bottom:1rem;">
                    <label style="font-size:0.82rem;font-weight:600;display:block;margin-bottom:0.45rem;color:var(--text-main);">Test Category</label>
                    <select id="testCategory" style="width:100%;padding:0.65rem 0.85rem;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-muted);color:var(--text-main);font-size:0.9rem;outline:none;">
                        <option value="dsa" selected>Data Structures & Algorithms (DSA)</option>
                        <option value="os">Operating Systems (OS)</option>
                        <option value="cn">Computer Networks (CN)</option>
                        <option value="dbms">DBMS & SQL</option>
                        <option value="core_cs">CS Fundamentals (OS, CN, DBMS, OOPs)</option>
                        <option value="aptitude">Quantitative & Logical Aptitude</option>
                        <option value="mixed">Comprehensive Interview (DSA + CS Core + Aptitude)</option>
                    </select>
                </div>
                <div style="margin-bottom:1rem;">
                    <label style="font-size:0.82rem;font-weight:600;display:block;margin-bottom:0.45rem;color:var(--text-main);">Number of Questions</label>
                    <select id="testCount" style="width:100%;padding:0.65rem 0.85rem;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-muted);color:var(--text-main);font-size:0.9rem;outline:none;">
                        <option value="5">5 Questions (Quick)</option>
                        <option value="10" selected>10 Questions (Standard)</option>
                        <option value="15">15 Questions (Extended)</option>
                    </select>
                </div>
                <div style="margin-bottom:1.5rem;">
                    <label style="font-size:0.82rem;font-weight:600;display:block;margin-bottom:0.45rem;color:var(--text-main);">Time per Question</label>
                    <select id="testTime" style="width:100%;padding:0.65rem 0.85rem;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-muted);color:var(--text-main);font-size:0.9rem;outline:none;">
                        <option value="60">1 minute</option>
                        <option value="90" selected>1.5 minutes</option>
                        <option value="120">2 minutes</option>
                    </select>
                </div>
                <button onclick="startTest()" class="btn btn-primary" style="width:100%;padding:0.85rem;font-size:1rem;font-weight:700;">▶ Start Test</button>
            </div>
            ${tests.length > 0 ? `
            <div style="background:var(--card-bg, #ffffff);border:1px solid var(--border-color, #e2e8f0);border-radius:14px;padding:1.5rem;color:var(--text-main);box-shadow:0 4px 12px rgba(0,0,0,0.03);">
                <h3 style="margin:0 0 1rem 0;font-size:1.05rem;color:var(--text-main);font-weight:700;">📋 Recent Results</h3>
                ${tests.slice(-5).reverse().map(t => `<div style="display:flex;justify-content:space-between;align-items:center;padding:0.65rem 0;border-bottom:1px solid var(--border-color);">
                    <div><span style="font-weight:600;color:var(--text-main);">${t.category}</span> <span style="font-size:0.75rem;color:var(--text-muted);">· ${t.count} Qs</span></div>
                    <div><span style="font-weight:700;color:${t.score >= 70 ? '#10b981' : t.score >= 40 ? '#d97706' : '#ef4444'};">${t.score}%</span> <span style="font-size:0.75rem;color:var(--text-muted);margin-left:0.5rem;">${new Date(t.date).toLocaleDateString()}</span></div>
                </div>`).join('')}
            </div>` : ''}
        </div>
    `;
}

async function startTest() {
    const category = document.getElementById('testCategory').value;
    const count = parseInt(document.getElementById('testCount').value);
    const timePerQ = parseInt(document.getElementById('testTime').value);

    // Load questions with multiple fallback paths
    try {
        let res = await fetch('../../data/questions.json');
        if (!res.ok) res = await fetch('/data/questions.json');
        if (!res.ok) res = await fetch('/api/questions');
        const data = await res.json();
        
        const mcqList = data.coding_mcq || [];
        const aptList = data.aptitude || [];
        let pool = [];

        if (category === 'dsa' || category === 'coding') {
            pool = mcqList.filter(q => q.topic === 'Data Structures' || q.topic === 'Algorithms' || q.topic === 'DSA');
        } else if (category === 'os') {
            pool = mcqList.filter(q => q.topic === 'Operating Systems' || (q.tags && q.tags.includes('OS')));
        } else if (category === 'cn') {
            pool = mcqList.filter(q => q.topic === 'Computer Networks' || (q.tags && q.tags.includes('CN')));
        } else if (category === 'dbms') {
            pool = mcqList.filter(q => q.topic === 'DBMS' || (q.tags && q.tags.includes('DBMS')));
        } else if (category === 'core_cs') {
            pool = mcqList.filter(q => ['Operating Systems', 'Computer Networks', 'DBMS', 'OOPs'].includes(q.topic));
        } else if (category === 'aptitude') {
            pool = aptList;
        } else {
            // Mixed: combine real DSA + Core CS + Aptitude
            pool = [...mcqList, ...aptList];
        }

        // Format and filter questions that have valid options
        pool = pool.map(q => formatRealQ(q)).filter(q => q.options && q.options.length >= 2);

        // Shuffle questions
        for (let i = pool.length - 1; i > 0; i--) { 
            const j = Math.floor(Math.random() * (i + 1)); 
            [pool[i], pool[j]] = [pool[j], pool[i]]; 
        }

        questions = pool.slice(0, Math.min(count, pool.length));

        if (questions.length === 0) {
            if (typeof showToast === 'function') showToast('No questions available for this category', 'error');
            return;
        }

        current = 0;
        answers = {};
        timeLeft = questions.length * timePerQ;
        renderTest();
        startTimer();
    } catch (e) {
        if (typeof showToast === 'function') showToast('Failed to load questions: ' + e.message, 'error');
    }
}

function formatRealQ(q) {
    return {
        text: q.question || q.title || 'Technical Question',
        difficulty: q.difficulty || 'Medium',
        category: q.topic || q.category || (q.type === 'aptitude' ? 'Aptitude' : 'Technical'),
        options: Array.isArray(q.options) && q.options.length > 0 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
        correct: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        explanation: q.explanation || ''
    };
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) { clearInterval(timerInterval); submitTest(); }
    }, 1000);
}

function updateTimerDisplay() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    const el = document.getElementById('timerDisplay');
    if (el) {
        el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
        el.parentElement.className = timeLeft < 60 ? 'timer-bar warning' : 'timer-bar';
    }
}

function renderTest() {
    const q = questions[current];
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const safeText = typeof sanitize === 'function' ? sanitize(q.text) : q.text;

    container().innerHTML = `
        <div class="test-active">
            <div class="timer-bar">
                <div style="display:flex;align-items:center;gap:0.75rem;">
                    <span style="font-weight:700;font-size:0.95rem;color:var(--text-main);">Question ${current + 1}/${questions.length}</span>
                    <span style="font-size:0.75rem;font-weight:700;padding:0.2rem 0.6rem;border-radius:999px;${q.difficulty === 'Easy' ? 'color:#10b981;background:rgba(16,185,129,0.12)' : q.difficulty === 'Medium' ? 'color:#f59e0b;background:rgba(245,158,11,0.12)' : 'color:#ef4444;background:rgba(239,68,68,0.12)'};">${q.difficulty}</span>
                    <span style="font-size:0.75rem;font-weight:600;background:var(--bg-muted);color:var(--text-muted);border:1px solid var(--border-color);padding:0.2rem 0.6rem;border-radius:6px;">${q.category}</span>
                </div>
                <div class="timer-display" id="timerDisplay">--:--</div>
            </div>
            <div class="question-card">
                <h3>${safeText}</h3>
                <div class="option-list">
                    ${q.options.map((opt, i) => {
                        const safeOpt = typeof sanitize === 'function' ? sanitize(opt) : opt;
                        const isSelected = answers[current] === i;
                        return `
                        <button type="button" class="option-btn ${isSelected ? 'selected' : ''}" onclick="selectAnswer(${i})">
                            <span class="opt-letter">${letters[i]}</span>
                            <span>${safeOpt}</span>
                        </button>`;
                    }).join('')}
                </div>
                <div class="q-nav">
                    <button type="button" onclick="prevQ()" class="btn btn-outline" ${current === 0 ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>← Previous</button>
                    ${current === questions.length - 1 
                        ? '<button type="button" onclick="submitTest()" class="btn btn-primary" style="font-weight:700;">Submit Test</button>' 
                        : '<button type="button" onclick="nextQ()" class="btn btn-primary" style="font-weight:700;">Next →</button>'}
                </div>
                <div class="q-progress">
                    ${questions.map((_, i) => `<div class="q-dot ${i === current ? 'current' : ''} ${answers[i] !== undefined ? 'answered' : ''}" onclick="goToQ(${i})">${i + 1}</div>`).join('')}
                </div>
            </div>
        </div>
    `;
    updateTimerDisplay();
}

function selectAnswer(i) { answers[current] = i; renderTest(); }
function nextQ() { if (current < questions.length - 1) { current++; renderTest(); } }
function prevQ() { if (current > 0) { current--; renderTest(); } }
function goToQ(i) { current = i; renderTest(); }

function submitTest() {
    clearInterval(timerInterval);
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correct) correct++; });
    const score = Math.round((correct / questions.length) * 100);
    const category = document.getElementById('testCategory')?.value || questions[0]?.category || 'Mixed';

    // Save result
    const tests = JSON.parse(localStorage.getItem('hireprep_mock_tests') || '[]');
    tests.push({ category, count: questions.length, correct, score, date: new Date().toISOString() });
    localStorage.setItem('hireprep_mock_tests', JSON.stringify(tests));

    container().innerHTML = `
        <div class="result-card">
            <div style="font-size:3.5rem;margin-bottom:0.5rem;">${score >= 70 ? '🎉' : score >= 40 ? '👍' : '💪'}</div>
            <h2 style="font-size:1.5rem;margin-bottom:0;color:var(--text-main);font-weight:700;">Test Complete!</h2>
            <div class="result-score">${score}%</div>
            <p style="color:var(--text-main);font-weight:600;font-size:1.05rem;margin-bottom:0.5rem;">${correct} out of ${questions.length} correct</p>
            <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:2rem;line-height:1.6;">${score >= 70 ? 'Excellent work! You are well prepared.' : score >= 40 ? 'Good effort! Keep practicing to improve accuracy.' : 'Keep going! Practice makes perfect.'}</p>
            <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">
                <button type="button" onclick="showSetup()" class="btn btn-primary" style="font-weight:600;">Take Another Test</button>
                <a href="student-dashboard.html" class="btn btn-outline" style="text-decoration:none;font-weight:600;">Back to Dashboard</a>
            </div>
        </div>
    `;
}

// Window Bindings for Inline onclick Handlers
window.showSetup = showSetup;
window.startTest = startTest;
window.selectAnswer = selectAnswer;
window.nextQ = nextQ;
window.prevQ = prevQ;
window.goToQ = goToQ;
window.submitTest = submitTest;

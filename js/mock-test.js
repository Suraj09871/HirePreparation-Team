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
                <h1 style="font-size:1.75rem;margin-bottom:0.5rem;">Mock Test</h1>
                <p style="color:var(--text-muted);">Test yourself under time pressure with coding & aptitude questions.</p>
            </div>
            <div style="background:white;border:1px solid var(--border-color);border-radius:12px;padding:1.5rem;margin-bottom:1.5rem;">
                <h3 style="margin:0 0 1rem 0;font-size:1rem;">Configure Your Test</h3>
                <div style="margin-bottom:1rem;">
                    <label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.4rem;">Category</label>
                    <select id="testCategory" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;">
                        <option value="coding">Coding (DSA)</option>
                        <option value="aptitude">Aptitude</option>
                        <option value="mixed">Mixed</option>
                    </select>
                </div>
                <div style="margin-bottom:1rem;">
                    <label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.4rem;">Number of Questions</label>
                    <select id="testCount" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;">
                        <option value="5">5 Questions (Quick)</option>
                        <option value="10" selected>10 Questions (Standard)</option>
                        <option value="15">15 Questions (Extended)</option>
                    </select>
                </div>
                <div style="margin-bottom:1.5rem;">
                    <label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.4rem;">Time per Question</label>
                    <select id="testTime" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;">
                        <option value="60">1 minute</option>
                        <option value="90" selected>1.5 minutes</option>
                        <option value="120">2 minutes</option>
                    </select>
                </div>
                <button onclick="startTest()" class="btn btn-primary" style="width:100%;padding:0.85rem;font-size:1rem;">▶ Start Test</button>
            </div>
            ${tests.length > 0 ? `
            <div style="background:white;border:1px solid var(--border-color);border-radius:12px;padding:1.25rem;">
                <h3 style="margin:0 0 0.75rem 0;font-size:1rem;">📋 Recent Results</h3>
                ${tests.slice(-5).reverse().map(t => `<div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;border-bottom:1px solid var(--border-color);">
                    <div><span style="font-weight:600;">${t.category}</span> <span style="font-size:0.75rem;color:var(--text-muted);">· ${t.count} Qs</span></div>
                    <div><span style="font-weight:700;color:${t.score >= 70 ? '#10b981' : t.score >= 40 ? '#d97706' : '#ef4444'};">${t.score}%</span> <span style="font-size:0.7rem;color:var(--text-muted);margin-left:0.5rem;">${new Date(t.date).toLocaleDateString()}</span></div>
                </div>`).join('')}
            </div>` : ''}
        </div>
    `;
}

async function startTest() {
    const category = document.getElementById('testCategory').value;
    const count = parseInt(document.getElementById('testCount').value);
    const timePerQ = parseInt(document.getElementById('testTime').value);

    // Load questions
    try {
        const res = await fetch('../../data/questions.json');
        const data = await res.json();
        let pool = [];
        if (category === 'coding') pool = (data.coding || []).map(q => formatCodingQ(q));
        else if (category === 'aptitude') pool = (data.aptitude || []).map(q => formatAptitudeQ(q));
        else pool = [...(data.coding || []).map(q => formatCodingQ(q)), ...(data.aptitude || []).map(q => formatAptitudeQ(q))];

        // Shuffle and take
        pool = pool.filter(q => q.options && q.options.length >= 2);
        for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
        questions = pool.slice(0, Math.min(count, pool.length));

        if (questions.length === 0) {
            showToast('Not enough questions available for this category', 'error');
            return;
        }

        current = 0;
        answers = {};
        timeLeft = questions.length * timePerQ;
        renderTest();
        startTimer();
    } catch (e) {
        showToast('Failed to load questions: ' + e.message, 'error');
    }
}

function formatCodingQ(q) {
    // Create MCQ from coding question
    return {
        text: q.title || q.question || 'Coding Question',
        difficulty: q.difficulty || 'Medium',
        category: 'Coding',
        options: q.options || generateDefaultOptions(q),
        correct: q.correctAnswer || 0
    };
}

function formatAptitudeQ(q) {
    return {
        text: q.question || q.title || 'Aptitude Question',
        difficulty: q.difficulty || 'Easy',
        category: 'Aptitude',
        options: q.options || generateDefaultOptions(q),
        correct: q.correctAnswer || 0
    };
}

function generateDefaultOptions(q) {
    return ['Option A', 'Option B', 'Option C', 'Option D'];
}

function startTimer() {
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
    container().innerHTML = `
        <div class="test-active">
            <div class="timer-bar">
                <div style="display:flex;align-items:center;gap:0.75rem;">
                    <span style="font-weight:600;font-size:0.9rem;">Question ${current + 1}/${questions.length}</span>
                    <span style="font-size:0.75rem;padding:0.15rem 0.5rem;border-radius:999px;${q.difficulty === 'Easy' ? 'color:#10b981;background:rgba(16,185,129,0.1)' : q.difficulty === 'Medium' ? 'color:#d97706;background:rgba(217,119,6,0.1)' : 'color:#ef4444;background:rgba(239,68,68,0.1)'};">${q.difficulty}</span>
                    <span style="font-size:0.7rem;background:var(--bg-muted);padding:0.15rem 0.5rem;border-radius:4px;">${q.category}</span>
                </div>
                <div class="timer-display" id="timerDisplay">--:--</div>
            </div>
            <div class="question-card">
                <h3>${q.text}</h3>
                <div class="option-list">
                    ${q.options.map((opt, i) => `<button class="option-btn ${answers[current] === i ? 'selected' : ''}" onclick="selectAnswer(${i})">
                        <span class="opt-letter">${letters[i]}</span>${opt}
                    </button>`).join('')}
                </div>
                <div class="q-nav">
                    <button onclick="prevQ()" class="btn btn-outline" ${current === 0 ? 'disabled style="opacity:0.4;pointer-events:none;"' : ''}>← Previous</button>
                    ${current === questions.length - 1 ? '<button onclick="submitTest()" class="btn btn-primary">Submit Test</button>' : '<button onclick="nextQ()" class="btn btn-primary">Next →</button>'}
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
        <div class="result-card" style="padding:2rem;">
            <div style="font-size:3rem;margin-bottom:0.5rem;">${score >= 70 ? '🎉' : score >= 40 ? '👍' : '💪'}</div>
            <h2 style="font-size:1.25rem;margin-bottom:0;">Test Complete!</h2>
            <div class="result-score" style="font-size:3rem;margin:0.5rem 0;font-weight:800;color:var(--primary);">${score}%</div>
            <p style="color:var(--text-muted);margin-bottom:0.5rem;">${correct} out of ${questions.length} correct</p>
            <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:2rem;">${score >= 70 ? 'Excellent work! You\'re well prepared.' : score >= 40 ? 'Good effort! Keep practicing.' : 'Keep going! Practice makes perfect.'}</p>
            <div style="display:flex;gap:0.75rem;justify-content:center;">
                <button onclick="showSetup()" class="btn btn-primary">Take Another Test</button>
                <a href="student-dashboard.html" class="btn btn-outline" style="text-decoration:none;">Back to Dashboard</a>
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

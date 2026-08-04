// mcq-quiz.js — Dedicated Quiz Mode for Coding MCQs
let questions = [], current = 0, answers = {}, timerInterval = null, timeLeft = 0;
let isReviewMode = false;
const container = () => document.getElementById('quizContainer');

document.addEventListener('DOMContentLoaded', () => {
    showSetup();
});

function showSetup() {
    const history = JSON.parse(localStorage.getItem('hiresmart_quiz_history') || '[]');
    container().innerHTML = `
        <div class="test-setup">
            <div style="text-align:center;margin-bottom:2rem;">
                <div style="font-size:3rem;margin-bottom:0.5rem;">⏱</div>
                <h1 style="font-size:1.75rem;margin-bottom:0.5rem;">Coding MCQ Practice</h1>
                <p style="color:var(--text-muted);">Test your knowledge across Data Structures, Algorithms, DBMS, OS, Networks, and OOPs.</p>
            </div>
            <div style="background:white;border:1px solid var(--border-color);border-radius:12px;padding:1.5rem;margin-bottom:1.5rem;">
                <h3 style="margin:0 0 1rem 0;font-size:1rem;">Configure Quiz</h3>
                <div style="margin-bottom:1rem;">
                    <label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.4rem;">Topic Focus</label>
                    <select id="quizTopic" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;">
                        <option value="Mixed">Mixed (All Topics)</option>
                        <option value="Data Structures">Data Structures</option>
                        <option value="Algorithms">Algorithms</option>
                        <option value="DBMS">DBMS</option>
                        <option value="Operating Systems">Operating Systems</option>
                        <option value="Computer Networks">Computer Networks</option>
                        <option value="OOPs">OOPs</option>
                    </select>
                </div>
                <div style="margin-bottom:1rem;">
                    <label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.4rem;">Number of Questions</label>
                    <select id="quizCount" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;">
                        <option value="5">5 Questions (Quick)</option>
                        <option value="10" selected>10 Questions (Standard)</option>
                        <option value="20">20 Questions (Extended)</option>
                    </select>
                </div>
                <div style="margin-bottom:1.5rem;">
                    <label style="font-size:0.8rem;font-weight:600;display:block;margin-bottom:0.4rem;">Time per Question</label>
                    <select id="quizTime" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;">
                        <option value="60" selected>1 minute</option>
                        <option value="120">2 minutes</option>
                    </select>
                </div>
                <button onclick="startQuiz()" class="btn btn-primary" style="width:100%;padding:0.85rem;font-size:1rem;">▶ Start Practice</button>
            </div>
            ${history.length > 0 ? `
            <div style="background:white;border:1px solid var(--border-color);border-radius:12px;padding:1.25rem;">
                <h3 style="margin:0 0 0.75rem 0;font-size:1rem;">📋 Performance History</h3>
                ${history.slice(-5).reverse().map(t => `<div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;border-bottom:1px solid var(--border-color);">
                    <div><span style="font-weight:600;">${t.topic}</span> <span style="font-size:0.75rem;color:var(--text-muted);">· ${t.count} Qs</span></div>
                    <div><span style="font-weight:700;color:${t.score >= 70 ? '#10b981' : t.score >= 40 ? '#d97706' : '#ef4444'};">${t.score}%</span> <span style="font-size:0.7rem;color:var(--text-muted);margin-left:0.5rem;">${new Date(t.date).toLocaleDateString()}</span></div>
                </div>`).join('')}
            </div>` : ''}
        </div>
    `;
}

async function startQuiz() {
    const topic = document.getElementById('quizTopic').value;
    const count = parseInt(document.getElementById('quizCount').value);
    const timePerQ = parseInt(document.getElementById('quizTime').value);

    container().innerHTML = '<div style="text-align:center;padding:4rem;"><div style="font-size:2rem;animation:pulse 2s infinite;">⏳</div>Loading Questions...</div>';

    try {
        const res = await fetch('../../data/questions.json');
        const data = await res.json();
        let pool = data.coding_mcq || [];
        
        if (topic !== 'Mixed') {
            pool = pool.filter(q => q.topic === topic);
        }

        if (pool.length === 0) {
            container().innerHTML = '<div style="text-align:center;padding:4rem;color:#ef4444;">No questions found for this topic.</div><div style="text-align:center;"><button onclick="showSetup()" class="btn btn-primary">Go Back</button></div>';
            return;
        }

        // Shuffle pool
        for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
        questions = pool.slice(0, Math.min(count, pool.length));

        current = 0;
        answers = {};
        isReviewMode = false;
        timeLeft = questions.length * timePerQ;
        renderQuiz();
        startTimer();
    } catch (e) {
        container().innerHTML = `<div style="color:red;padding:2rem;">Failed to load questions: ${e.message}</div>`;
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) { clearInterval(timerInterval); submitQuiz(); }
    }, 1000);
}

function updateTimerDisplay() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    const el = document.getElementById('timerDisplay');
    if (el && !isReviewMode) {
        el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
        el.parentElement.className = timeLeft < 60 ? 'timer-bar warning' : 'timer-bar';
    }
}

function renderQuiz() {
    const q = questions[current];
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const options = q.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
    
    let optionsHtml = '';
    
    if (isReviewMode) {
        const selected = answers[current] !== undefined ? answers[current] : null;
        const correct = q.correctAnswer;
        
        optionsHtml = options.map((opt, i) => {
            let className = 'option-btn';
            if (i === correct) className += ' correct';
            else if (i === selected) className += ' wrong';
            
            let icon = '';
            if (i === correct) icon = '<span style="color:#10b981;font-weight:bold;margin-left:auto;">✓</span>';
            else if (i === selected) icon = '<span style="color:#ef4444;font-weight:bold;margin-left:auto;">✗</span>';
            
            return `<div class="${className}" style="cursor:default;">
                <span class="opt-letter">${letters[i]}</span>${opt} ${icon}
            </div>`;
        }).join('');
    } else {
        optionsHtml = options.map((opt, i) => `<button class="option-btn ${answers[current] === i ? 'selected' : ''}" onclick="selectAnswer(${i})">
            <span class="opt-letter">${letters[i]}</span>${opt}
        </button>`).join('');
    }

    const codeBlock = q.code ? `<div style="margin-bottom:1.5rem;background:#1e293b;color:#f8fafc;padding:1.5rem;border-radius:8px;font-family:monospace;font-size:0.9rem;white-space:pre-wrap;overflow-x:auto;">
        ${q.code}
    </div>` : '';

    const reviewPanel = isReviewMode ? `
        <div class="explanation-block">
            <strong style="color:var(--text-main);display:block;margin-bottom:0.5rem;">Explanation:</strong>
            <span style="color:var(--text-muted);">${q.explanation || 'No detailed explanation provided.'}</span>
        </div>
    ` : '';

    container().innerHTML = `
        <div class="test-active">
            ${!isReviewMode ? `
            <div class="timer-bar">
                <div style="display:flex;align-items:center;gap:0.75rem;">
                    <span style="font-weight:600;font-size:0.9rem;">Question ${current + 1}/${questions.length}</span>
                    <span style="font-size:0.75rem;padding:0.15rem 0.5rem;border-radius:999px;background:var(--bg-muted);">${q.topic}</span>
                </div>
                <div class="timer-display" id="timerDisplay">--:--</div>
            </div>` : `<div style="margin-bottom:1rem;text-align:right;"><button class="btn btn-outline" onclick="showResults()">Back to Results</button></div>`}
            
            <div class="question-card">
                <h3>${q.title}</h3>
                ${codeBlock}
                <div class="option-list">
                    ${optionsHtml}
                </div>
                ${reviewPanel}
                
                <div class="q-nav">
                    <button onclick="prevQ()" class="btn btn-outline" ${current === 0 ? 'disabled style="opacity:0.4;pointer-events:none;"' : ''}>← Previous</button>
                    ${!isReviewMode && current === questions.length - 1 ? '<button onclick="submitQuiz()" class="btn btn-primary">Submit Test</button>' : ''}
                    ${current < questions.length - 1 ? '<button onclick="nextQ()" class="btn btn-primary">Next →</button>' : ''}
                </div>
                <div class="q-progress">
                    ${questions.map((_, i) => `<div class="q-dot ${i === current ? 'current' : ''} ${answers[i] !== undefined ? 'answered' : ''} ${isReviewMode ? (answers[i] === questions[i].correctAnswer ? 'correct-dot' : 'wrong-dot') : ''}" onclick="goToQ(${i})">${i + 1}</div>`).join('')}
                </div>
            </div>
        </div>
    `;
    if (!isReviewMode) updateTimerDisplay();
}

function selectAnswer(i) { 
    if (isReviewMode) return;
    answers[current] = i; 
    renderQuiz(); 
}
function nextQ() { if (current < questions.length - 1) { current++; renderQuiz(); } }
function prevQ() { if (current > 0) { current--; renderQuiz(); } }
function goToQ(i) { current = i; renderQuiz(); }

function submitQuiz() {
    clearInterval(timerInterval);
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) correct++; });
    const score = Math.round((correct / questions.length) * 100);
    const topic = document.getElementById('quizTopic')?.value || 'Mixed';

    // Save result
    const history = JSON.parse(localStorage.getItem('hiresmart_quiz_history') || '[]');
    history.push({ topic, count: questions.length, correct, score, date: new Date().toISOString() });
    localStorage.setItem('hiresmart_quiz_history', JSON.stringify(history));

    isReviewMode = true; // Flag for reviewing mode
    showResults(score, correct);
}

function showResults(scoreParam, correctParam) {
    let correct = correctParam;
    let score = scoreParam;
    
    if (correct === undefined) {
        correct = 0;
        questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) correct++; });
        score = Math.round((correct / questions.length) * 100);
    }

    container().innerHTML = `
        <div class="result-card" style="padding:2rem;">
            <div style="font-size:3rem;margin-bottom:0.5rem;">${score >= 70 ? '🏆' : score >= 40 ? '👍' : '💪'}</div>
            <h2 style="font-size:1.5rem;margin-bottom:0;">Quiz Complete!</h2>
            <div class="result-score" style="font-size:3rem;margin:0.5rem 0;">${score}%</div>
            <p style="color:var(--text-muted);margin-bottom:1.5rem;">You answered ${correct} out of ${questions.length} correctly</p>
            
            <div style="display:flex;gap:1rem;justify-content:center;margin-bottom:2rem;">
                <button onclick="goToQ(0)" class="btn btn-outline">Review Answers & Explanations</button>
                <button onclick="showSetup()" class="btn btn-primary">Take Another Quiz</button>
            </div>
        </div>
    `;
}

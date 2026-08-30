/**
 * Practice Page - Question browser with filtering, search, and pagination
 * Works with the enhanced questions.json format
 */
let state = { allData: null, category: 'coding', company: null, topic: null, search: '', difficulty: '', currentPage: 1, itemsPerPage: 15 };

document.addEventListener('DOMContentLoaded', async () => {
    const loadingEl = document.getElementById('loading-indicator');
    try {
        const response = await fetch('../../data/questions.json');
        if (!response.ok) throw new Error("Failed to fetch questions");
        state.allData = await response.json();
        if (loadingEl) loadingEl.style.display = 'none';
        checkResumeBanner();

        // Update counts in stats and tabs
        const codingLen = (state.allData.coding || []).length;
        const mcqLen = (state.allData.coding_mcq || []).length;
        const aptLen = (state.allData.aptitude || []).length;
        
        ['codingCount', 'codingTabCount'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = codingLen;
        });
        ['mcqCount', 'mcqTabCount'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = mcqLen;
        });
        ['aptitudeCount', 'aptitudeTabCount'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = aptLen;
        });

        // Company filter buttons
        document.querySelectorAll('.company-btn, .company-pill').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const company = target.textContent.trim();
                
                document.querySelectorAll('.company-btn, .company-pill').forEach(b => b.classList.remove('active'));
                
                if (state.company === company) {
                    state.company = null;
                } else {
                    state.company = company;
                    target.classList.add('active');
                }
                state.currentPage = 1;
                renderQuestions();
            });
        });

        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                state.category = type;
                
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                // Show quiz button for MCQ/aptitude
                const quizBtn = document.getElementById('takeQuizBtn');
                if (quizBtn) {
                    quizBtn.style.display = (type === 'coding_mcq' || type === 'aptitude') ? 'block' : 'none';
                }
                state.currentPage = 1;
                renderQuestions();
            });
        });

        // Topic chip filters
        document.querySelectorAll('.topic-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const topic = e.target.dataset.topic;
                document.querySelectorAll('.topic-chip').forEach(c => c.classList.remove('active'));
                
                if (state.topic === topic) {
                    state.topic = null;
                } else {
                    state.topic = topic;
                    e.target.classList.add('active');
                }
                state.currentPage = 1;
                renderQuestions();
            });
        });

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                state.search = e.target.value.toLowerCase();
                state.currentPage = 1;
                renderQuestions();
            });
        }
        
        // Difficulty filter
        const diffFilter = document.getElementById('diffFilter');
        if (diffFilter) {
            diffFilter.addEventListener('change', (e) => {
                state.difficulty = e.target.value;
                state.currentPage = 1;
                renderQuestions();
            });
        }

        renderQuestions();
    } catch (error) {
        console.error(error);
        if (loadingEl) loadingEl.innerHTML = '<div style="font-size:2rem;margin-bottom:1rem;">❌</div>Failed to load questions. Please refresh the page.';
    }
});

function renderQuestions() {
    const container = document.getElementById('questions-container');
    container.innerHTML = '';
    if (!state.allData) return;

    let sourceData = state.allData[state.category] || [];
    let filtered = sourceData.filter(q => {
        if (state.company && q.company !== state.company) return false;
        if (state.difficulty && q.difficulty !== state.difficulty) return false;
        if (state.topic && q.topic !== state.topic) return false;
        if (state.search) {
            const term = state.search;
            const matchesTitle = q.title && q.title.toLowerCase().includes(term);
            const matchesTopic = q.topic && q.topic.toLowerCase().includes(term);
            const matchesCompany = q.company && q.company.toLowerCase().includes(term);
            const matchesTags = q.tags && q.tags.some(t => t.toLowerCase().includes(term));
            if (!matchesTitle && !matchesTopic && !matchesCompany && !matchesTags) return false;
        }
        return true;
    });

    const isLogged = API.isLoggedIn();

    // Guest notice handler
    const existingNotice = document.getElementById('practiceGuestNotice');
    if (existingNotice) existingNotice.remove();

    if (!isLogged) {
        const notice = document.createElement('div');
        notice.id = 'practiceGuestNotice';
        notice.style.cssText = 'background:var(--card-bg);border:1px solid var(--primary);border-radius:12px;padding:1rem 1.5rem;margin-bottom:1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;box-shadow:0 4px 12px rgba(249,115,22,0.08);';
        notice.innerHTML = `
            <div style="display:flex;align-items:center;gap:0.75rem;">
                <span style="font-size:1.6rem;">🔒</span>
                <div>
                    <div style="font-weight:700;color:var(--text-main);font-size:0.95rem;">Guest Practice Preview</div>
                    <div style="font-size:0.825rem;color:var(--text-muted);">You can preview 3 sample questions. Sign in to unlock 500+ coding & MCQ problems, run in-browser tests, and save solutions.</div>
                </div>
            </div>
            <a href="../auth.html?redirect=practice" class="btn btn-primary" style="padding:0.5rem 1.25rem;font-size:0.85rem;white-space:nowrap;font-weight:600;">Sign In to Unlock All →</a>
        `;
        if (container.parentNode) {
            container.parentNode.insertBefore(notice, container);
        }
    }

    const totalPages = isLogged ? Math.ceil(filtered.length / state.itemsPerPage) : 1;
    if (state.currentPage > totalPages) state.currentPage = Math.max(1, totalPages);

    const startIdx = (state.currentPage - 1) * state.itemsPerPage;
    const questionsToRender = isLogged ? filtered.slice(startIdx, startIdx + state.itemsPerPage) : filtered.slice(0, 3);

    if (questionsToRender.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--text-muted);">
            <div style="font-size:2.5rem;margin-bottom:1rem;">📭</div>
            <p style="font-size:1.1rem;font-weight:500;">No questions found</p>
            <p style="font-size:0.875rem;">Try adjusting your filters or search term</p>
        </div>`;
        renderPagination(0);
        return;
    }

    questionsToRender.forEach((q, index) => {
        const diffClass = q.difficulty === 'Easy' ? 'badge-easy' : q.difficulty === 'Hard' ? 'badge-hard' : 'badge-medium';
        
        // Build tags HTML
        const tags = q.tags || (q.topic ? [q.topic] : []);
        const tagsHtml = tags.slice(0, 3).map(t => `<span class="badge-tag">${t}</span>`).join('');
        
        const companyBadge = q.company ? `<span class="badge-company">${q.company}</span>` : '';
        const acceptanceHtml = q.acceptance ? `<span class="badge-acceptance">✓ ${q.acceptance}</span>` : '';

        const card = document.createElement('div');
        card.className = 'question-card';
        card.addEventListener('click', () => {
            const qType = (q.type || state.category).toLowerCase();
            const baseUrl = (qType === 'coding mcq' || qType === 'coding_mcq' || qType === 'mcq' || qType === 'aptitude') ? 'mcq-detail.html' : 'question-detail.html';
            const detailUrl = `${baseUrl}?id=${encodeURIComponent(q.id)}&type=${encodeURIComponent(q.type || state.category)}`;
            window.location.href = detailUrl;
        });

        const qType = (q.type || state.category).toLowerCase();
        const isMcqType = qType === 'coding mcq' || qType === 'coding_mcq' || qType === 'mcq' || qType === 'aptitude';
        const subtitleText = isMcqType && q.question ? q.question.substring(0, 90) + (q.question.length > 90 ? '...' : '') : '';

        // Check solved status from localStorage
        const solvedKey = 'hireprep_solved_' + (q.type || state.category);
        let solvedStatus = '';
        try { const map = JSON.parse(localStorage.getItem(solvedKey) || '{}'); solvedStatus = map[q.id] || ''; } catch(e){}
        const solvedBadge = solvedStatus === 'correct' 
            ? '<span style="font-size:0.7rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:999px;color:#10b981;background:rgba(16,185,129,0.1);margin-left:0.5rem;">✅ Solved</span>'
            : solvedStatus === 'wrong'
            ? '<span style="font-size:0.7rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:999px;color:#ef4444;background:rgba(239,68,68,0.1);margin-left:0.5rem;">❌ Attempted</span>'
            : '';

        card.innerHTML = `
            <div style="display:flex;gap:1rem;align-items:center;min-width:0;flex:1;">
                <div class="q-number" ${solvedStatus === 'correct' ? 'style="background:#10b981;color:white;border-color:#10b981;"' : solvedStatus === 'wrong' ? 'style="background:#ef4444;color:white;border-color:#ef4444;"' : ''}>${startIdx + index + 1}</div>
                <div class="q-info">
                    <div class="q-title">${q.title}${solvedBadge}</div>
                    ${subtitleText ? `<div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.2rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:500px;">${subtitleText}</div>` : ''}
                    <div class="q-meta">
                        <span class="badge ${diffClass}">${q.difficulty}</span>
                        ${companyBadge}
                        ${tagsHtml}
                        ${acceptanceHtml}
                    </div>
                </div>
            </div>
            <button class="solve-btn">${solvedStatus ? (isMcqType ? 'Retry →' : 'Redo →') : (isMcqType ? 'Attempt →' : 'Solve →')}</button>
        `;
        container.appendChild(card);
    });

    if (!isLogged && filtered.length > 3) {
        const lockCard = document.createElement('div');
        lockCard.className = 'question-card';
        lockCard.style.cssText = 'background:linear-gradient(135deg, rgba(249,115,22,0.08), rgba(59,130,246,0.08));border:2px dashed var(--primary);display:flex;align-items:center;justify-content:space-between;padding:1.25rem 1.5rem;cursor:pointer;margin-top:1rem;';
        lockCard.onclick = () => { window.location.href = '../auth.html?redirect=practice'; };
        lockCard.innerHTML = `
            <div style="display:flex;align-items:center;gap:1rem;">
                <span style="font-size:2rem;">🔒</span>
                <div>
                    <div style="font-weight:700;font-size:1rem;color:var(--text-main);">+${filtered.length - 3} More Interview Problems Locked</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">Sign in to unlock all coding challenges, MCQs, and full solutions.</div>
                </div>
            </div>
            <button class="btn btn-primary" style="padding:0.45rem 1.25rem;font-size:0.85rem;font-weight:600;">Unlock All Problems →</button>
        `;
        container.appendChild(lockCard);
    }

    renderPagination(isLogged ? totalPages : 0);
}

function renderPagination(totalPages) {
    const controls = document.getElementById('pagination-controls');
    if (!controls) return;
    
    if (totalPages <= 1) {
        controls.innerHTML = '';
        return;
    }

    let html = `<button class="page-btn" onclick="changePage(-1)" ${state.currentPage === 1 ? 'disabled' : ''}>← Prev</button>`;
    
    // Show page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, state.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);
    
    if (startPage > 1) {
        html += `<button class="page-btn" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) html += `<span style="color:var(--text-muted);">...</span>`;
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="page-btn ${i === state.currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span style="color:var(--text-muted);">...</span>`;
        html += `<button class="page-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }
    
    html += `<button class="page-btn" onclick="changePage(1)" ${state.currentPage === totalPages ? 'disabled' : ''}>Next →</button>`;
    controls.innerHTML = html;
}

window.changePage = function(dir) {
    state.currentPage += dir;
    renderQuestions();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.goToPage = function(page) {
    state.currentPage = page;
    renderQuestions();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ── Autosave Resume Banner ──
function checkResumeBanner() {
    try {
        const last = JSON.parse(localStorage.getItem('hireprep_last_problem') || 'null');
        const banner = document.getElementById('resumePracticeBanner');
        if (last && banner && last.title && last.url) {
            banner.style.display = 'flex';
            const titleEl = document.getElementById('resumeProblemTitle');
            if (titleEl) titleEl.textContent = `Resume: ${last.title}`;
            const categoryLabel = last.type === 'coding' ? 'Coding Problem' : last.type === 'aptitude' ? 'Aptitude Test' : 'MCQ Quiz';
            const metaEl = document.getElementById('resumeProblemMeta');
            if (metaEl) metaEl.textContent = `${categoryLabel} · ${last.difficulty || 'Medium'} · Autosaved session`;
            const linkEl = document.getElementById('resumeProblemLink');
            if (linkEl) linkEl.href = last.url;
        }
    } catch(e) {}
}
window.checkResumeBanner = checkResumeBanner;


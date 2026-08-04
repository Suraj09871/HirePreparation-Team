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

    const totalPages = Math.ceil(filtered.length / state.itemsPerPage);
    if (state.currentPage > totalPages) state.currentPage = Math.max(1, totalPages);

    const startIdx = (state.currentPage - 1) * state.itemsPerPage;
    const questionsToRender = filtered.slice(startIdx, startIdx + state.itemsPerPage);

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

        card.innerHTML = `
            <div style="display:flex;gap:1rem;align-items:center;min-width:0;flex:1;">
                <div class="q-number">${startIdx + index + 1}</div>
                <div class="q-info">
                    <div class="q-title">${q.title}</div>
                    <div class="q-meta">
                        <span class="badge ${diffClass}">${q.difficulty}</span>
                        ${companyBadge}
                        ${tagsHtml}
                        ${acceptanceHtml}
                    </div>
                </div>
            </div>
            <button class="solve-btn">Solve →</button>
        `;
        container.appendChild(card);
    });

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const controls = document.getElementById('pagination-controls');
    if (!controls) return;
    
    if (totalPages <= 1) {
        controls.innerHTML = '';
        return;
    }

    let html = `<button class="page-btn" onclick="changePage(1)" ${state.currentPage === 1 ? 'disabled' : ''}>← Prev</button>`;
    
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

function changePage(dir) {
    state.currentPage += dir;
    renderQuestions();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToPage(page) {
    state.currentPage = page;
    renderQuestions();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

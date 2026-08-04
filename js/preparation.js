/**
 * Preparation UI Logic
 * Replicates the Lovable UI screenshots with a dynamic React-like rendering approach.
 */

let state = {
    paths: [],
    currentPathId: null,
    currentView: 'overview', // 'overview' or 'detail'
    currentTab: 'questions', // 'questions', 'roadmap', 'jobs'
    diffFilter: 'All'
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await API.get('/preparation');
        state.paths = data.preparations || data.paths || [];
        if (state.paths.length > 0) {
            state.currentPathId = state.paths[0]._id;
        }
        render();
    } catch (e) {
        document.getElementById('prepApp').innerHTML = `
            <div style="text-align:center;padding:5rem;color:var(--text-muted);">Failed to load preparation data. <button class="btn btn-primary" onclick="location.reload()" style="margin-top:1rem;">Retry</button></div>
        `;
    }
});

async function setDetailView(pathId) {
    // Show loading
    document.getElementById('prepApp').innerHTML = '<div style="text-align:center;padding:5rem;color:var(--text-muted);"><div style="font-size:2rem;margin-bottom:1rem;animation:pulse 2s infinite;">⏳</div>Loading company details...</div>';
    
    try {
        const data = await API.get(`/preparation/${pathId}`);
        if (data.success && data.preparation) {
            // Update the path in the list with full details
            const idx = state.paths.findIndex(p => p._id === pathId);
            if (idx !== -1) {
                state.paths[idx] = data.preparation;
            }
            setState({ currentPathId: pathId, currentView: 'detail', currentTab: 'questions' });
        } else {
            throw new Error('Failed');
        }
    } catch (e) {
        console.error(e);
        setState({ currentView: 'overview' }); // Fallback
    }
}

function setState(newState) {
    state = { ...state, ...newState };
    render();
}

function render() {
    const app = document.getElementById('prepApp');
    if (!state.paths.length) return;

    if (state.currentView === 'overview') {
        app.innerHTML = renderOverview();
    } else {
        app.innerHTML = renderDetail();
    }
}

// --- VIEWS ---

function renderOverview() {
    const path = state.paths.find(p => p._id === state.currentPathId);
    if (!path) return '';

    // Render Company Pills
    const pillsHTML = `
        <div style="background:var(--card-bg); border-bottom:1px solid var(--border-color); padding:1rem 0;">
            <div class="container" style="display:flex; gap:0.75rem; overflow-x:auto; padding-bottom:0.5rem;">
                ${state.paths.map(p => `
                    <button onclick="setState({currentPathId: '${p._id}'})" 
                        style="padding:0.4rem 1.25rem; border-radius:8px; border:1px solid var(--border-color); cursor:pointer; font-weight:500; transition:all 0.2s; white-space:nowrap;
                        ${p._id === state.currentPathId ? 'background:#1e293b; color:white; border-color:#1e293b;' : 'background:transparent; color:var(--text-main);'}"
                        ${document.documentElement.getAttribute('data-theme') === 'dark' && p._id === state.currentPathId ? 'style="background:var(--primary);color:white;border-color:var(--primary);"' : ''}>
                        ${p.companyName}
                    </button>
                `).join('')}

            </div>
        </div>
    `;

    const diffColor = path.difficulty === 'Hard' ? '#ef4444' : path.difficulty === 'Medium' ? '#f59e0b' : '#10b981';

    const mainHTML = `
        <div class="container py-12">
            <div class="prep-main-grid" style="display:grid; grid-template-columns: 2fr 1fr; gap:2rem;">
                
                <!-- Left Column -->
                <div>
                    <!-- Company Intro Card -->
                    <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:12px; padding:2rem; margin-bottom:1.5rem; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                        <div style="display:flex; align-items:center; gap:1.5rem; margin-bottom:1.5rem;">
                            <div style="width:64px; height:64px; background:rgba(249,115,22,0.1); color:var(--primary); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.75rem; font-weight:700;">
                                ${path.companyName.charAt(0)}
                            </div>
                            <div>
                                <h1 style="font-size:1.5rem; margin-bottom:0.5rem; color:var(--text-main);">${path.companyName}</h1>
                                <div style="display:flex; gap:0.75rem; font-size:0.8rem;">
                                    <span style="background:${diffColor}15; color:${diffColor}; padding:0.2rem 0.6rem; border-radius:999px; font-weight:600;">${path.difficulty}</span>
                                    <span style="background:var(--bg-muted); border:1px solid var(--border-color); color:var(--text-main); padding:0.2rem 0.6rem; border-radius:999px;">${path.questionCount} questions</span>
                                    <span style="background:var(--bg-muted); border:1px solid var(--border-color); color:var(--text-main); padding:0.2rem 0.6rem; border-radius:999px;">${path.topicCount} topics</span>
                                </div>
                            </div>
                        </div>
                        
                        <p style="color:var(--text-muted); font-size:0.95rem; line-height:1.6; margin-bottom:2rem;">${path.description}</p>
                        
                        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:1rem; margin-bottom:2rem;">
                            <div style="background:var(--bg-muted); padding:1.25rem; border-radius:8px; text-align:center;">
                                <div style="font-size:1.5rem; font-weight:700; color:var(--text-main); margin-bottom:0.25rem;">${path.questionCount}</div>
                                <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em;">Questions</div>
                            </div>
                            <div style="background:var(--bg-muted); padding:1.25rem; border-radius:8px; text-align:center;">
                                <div style="font-size:1.5rem; font-weight:700; color:var(--text-main); margin-bottom:0.25rem;">${path.topicCount}</div>
                                <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em;">Topics</div>
                            </div>
                            <div style="background:var(--bg-muted); padding:1.25rem; border-radius:8px; text-align:center;">
                                <div style="font-size:1.5rem; font-weight:700; color:var(--text-main); margin-bottom:0.25rem;">${path.avgSalary}</div>
                                <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em;">Avg Salary</div>
                            </div>
                        </div>

                        <div style="margin-bottom:1.5rem;">
                            <h4 style="font-size:0.875rem; color:var(--text-muted); margin-bottom:0.75rem;">Available Roles</h4>
                            <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                                ${(path.roles || []).map(r => `<span style="font-size:0.8rem; background:var(--bg-muted); border:1px solid var(--border-color); color:var(--text-main); padding:0.3rem 0.75rem; border-radius:999px; font-weight:500;">${r}</span>`).join('')}
                            </div>
                        </div>

                        <button class="btn btn-outline" onclick="setDetailView('${path._id}')" style="font-size:0.875rem; padding:0.6rem 1.25rem;">
                            <span style="margin-right:0.5rem;">↗</span> View Full Company Page
                        </button>
                    </div>

                    <!-- FAQ -->
                    <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,0.05); overflow:hidden;">
                        <div style="padding:1.5rem; border-bottom:1px solid var(--border-color);">
                            <h3 style="font-size:1.125rem; margin:0; display:flex; align-items:center; gap:0.5rem;"><span style="color:#ef4444;">❓</span> Frequently Asked Questions</h3>
                        </div>
                        <div>
                            ${(path.questions || []).slice(0, 10).map((q, idx) => {
                                const qColor = q.difficulty === 'Hard' ? '#ef4444' : q.difficulty === 'Medium' ? '#f59e0b' : '#10b981';
                                return `
                                <div onclick="window.location.href='question-detail.html?id=${encodeURIComponent(q.id || '')}&type=coding'" style="display:flex; align-items:center; gap:1.25rem; padding:1.25rem 1.5rem; border-bottom:1px solid var(--border-color); cursor:pointer; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-muted)'" onmouseout="this.style.background='transparent'">
                                    <div style="width:32px; height:32px; background:var(--bg-muted); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.875rem; font-weight:600; color:var(--text-muted); flex-shrink:0;">${idx + 1}</div>
                                    <div style="flex:1;">
                                        <div style="font-weight:500; font-size:0.95rem; margin-bottom:0.4rem; color:var(--text-main);">${q.title || q.question}</div>
                                        <div style="display:flex; gap:0.5rem;">
                                            <span style="font-size:0.7rem; background:var(--bg-muted); border:1px solid var(--border-color); color:var(--text-main); padding:0.15rem 0.5rem; border-radius:4px;">${q.topic || q.category}</span>
                                            <span style="font-size:0.7rem; background:white; border:1px solid ${qColor}40; color:${qColor}; padding:0.15rem 0.5rem; border-radius:4px; font-weight:600;">${q.difficulty}</span>
                                        </div>
                                    </div>
                                    <span style="color:var(--text-muted); font-size:1.25rem;">›</span>
                                </div>
                            `}).join('')}
                        </div>
                    </div>
                </div>

                <!-- Right Column -->
                <div>
                    <!-- Roadmap Summary -->
                    <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:12px; padding:1.5rem; margin-bottom:1.5rem; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                        <h3 style="font-size:1.125rem; margin:0 0 1.5rem 0; display:flex; align-items:center; gap:0.5rem;"><span style="color:#ef4444;">🎯</span> Learning Roadmap</h3>
                        <div class="roadmap-timeline">
                            ${(path.topics || []).map((t, idx) => `
                                <div class="roadmap-item">
                                    <div style="font-size:0.8rem; color:var(--text-muted); font-weight:600; margin-bottom:0.25rem; text-transform:uppercase; letter-spacing:0.05em;">${t.title}</div>
                                    <div style="font-weight:600; font-size:0.95rem; color:var(--text-main); margin-bottom:0.5rem;">${t.title} Focus</div>
                                    <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.4rem;">
                                        ${t.items.map(item => `<li style="font-size:0.875rem; color:var(--text-muted);">• ${item}</li>`).join('')}
                                    </ul>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Tips -->
                    <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:12px; padding:1.5rem; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                        <h3 style="font-size:1.125rem; margin:0 0 1.25rem 0; display:flex; align-items:center; gap:0.5rem;"><span style="color:#eab308;">💡</span> Tips</h3>
                        <div style="display:flex; flex-direction:column; gap:1rem;">
                            <div style="display:flex; gap:0.75rem; align-items:start;">
                                <span style="color:#eab308; margin-top:0.1rem;">☆</span>
                                <span style="font-size:0.875rem; color:var(--text-muted); line-height:1.5;">Focus on system design for senior roles</span>
                            </div>
                            <div style="display:flex; gap:0.75rem; align-items:start;">
                                <span style="color:#eab308; margin-top:0.1rem;">☆</span>
                                <span style="font-size:0.875rem; color:var(--text-muted); line-height:1.5;">Practice behavioral questions with STAR method</span>
                            </div>
                            <div style="display:flex; gap:0.75rem; align-items:start;">
                                <span style="color:#eab308; margin-top:0.1rem;">☆</span>
                                <span style="font-size:0.875rem; color:var(--text-muted); line-height:1.5;">Review past 6 months of interview patterns</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;

    return pillsHTML + mainHTML;
}

function renderDetail() {
    const path = state.paths.find(p => p._id === state.currentPathId);
    if (!path) return '';

    const diffColor = path.difficulty === 'Hard' ? '#ef4444' : path.difficulty === 'Medium' ? '#f59e0b' : '#10b981';

    // Header
    const headerHTML = `
        <div class="prep-header-bg">
            <div class="container">
                <a href="#" onclick="setState({currentView: 'overview'}); return false;" style="color:rgba(255,255,255,0.7); text-decoration:none; font-size:0.875rem; display:flex; align-items:center; gap:0.5rem; margin-bottom:2rem;">
                    ← Back to Preparation
                </a>
                <div style="display:flex; align-items:center; gap:1.5rem;">
                    <div style="width:72px; height:72px; background:rgba(249,115,22,0.2); border:1px solid rgba(249,115,22,0.5); color:var(--primary); border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:2rem; font-weight:700;">
                        ${path.companyName.charAt(0)}
                    </div>
                    <div>
                        <h1 style="font-size:2.5rem; margin:0 0 0.5rem 0; color:white;">${path.companyName}</h1>
                        <div style="display:flex; gap:0.75rem; font-size:0.875rem; margin-bottom:1rem;">
                            <span style="background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.9); padding:0.25rem 0.75rem; border-radius:999px; font-weight:500;">${path.difficulty}</span>
                            <span style="background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.9); padding:0.25rem 0.75rem; border-radius:999px; font-weight:500;">${path.questionCount} questions</span>
                            <span style="background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.9); padding:0.25rem 0.75rem; border-radius:999px; font-weight:500;">${path.topicCount} topics</span>
                            <span style="background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.9); padding:0.25rem 0.75rem; border-radius:999px; font-weight:500;">${path.avgSalary} avg salary</span>
                        </div>
                        <p style="color:rgba(255,255,255,0.8); font-size:0.95rem; max-width:600px; margin:0; line-height:1.5;">${path.description}</p>
                    </div>
                </div>
                
                <div class="prep-tabs-container">
                    <button class="prep-tab ${state.currentTab === 'questions' ? 'active' : ''}" onclick="setState({currentTab: 'questions'})">
                        <span>❓</span> Questions (${path.questionCount})
                    </button>
                    <button class="prep-tab ${state.currentTab === 'roadmap' ? 'active' : ''}" onclick="setState({currentTab: 'roadmap'})">
                        <span>🎯</span> Roadmap (${path.topicCount})
                    </button>
                    <button class="prep-tab ${state.currentTab === 'jobs' ? 'active' : ''}" onclick="setState({currentTab: 'jobs'})">
                        <span>💼</span> Open Jobs (0)
                    </button>
                </div>
            </div>
        </div>
    `;

    let tabContentHTML = '';

    if (state.currentTab === 'questions') {
        const questions = path.questions || [];
        const filteredQ = state.diffFilter === 'All' ? questions : questions.filter(q => q.difficulty === state.diffFilter);
        
        const counts = {
            Easy: questions.filter(q => q.difficulty === 'Easy').length,
            Medium: questions.filter(q => q.difficulty === 'Medium').length,
            Hard: questions.filter(q => q.difficulty === 'Hard').length
        };

        tabContentHTML = `
            <div style="display:flex; gap:0.5rem; margin-bottom:1.5rem; overflow-x:auto;">
                <button class="prep-diff-tab ${state.diffFilter === 'All' ? 'active' : ''}" onclick="setState({diffFilter: 'All'})">All</button>
                <button class="prep-diff-tab ${state.diffFilter === 'Easy' ? 'active' : ''}" onclick="setState({diffFilter: 'Easy'})">Easy (${counts.Easy})</button>
                <button class="prep-diff-tab ${state.diffFilter === 'Medium' ? 'active' : ''}" onclick="setState({diffFilter: 'Medium'})">Medium (${counts.Medium})</button>
                <button class="prep-diff-tab ${state.diffFilter === 'Hard' ? 'active' : ''}" onclick="setState({diffFilter: 'Hard'})">Hard (${counts.Hard})</button>
            </div>

            <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,0.05); overflow:hidden;">
                ${filteredQ.length > 0 ? filteredQ.map((q, idx) => {
                    const qColor = q.difficulty === 'Hard' ? '#ef4444' : q.difficulty === 'Medium' ? '#f59e0b' : '#10b981';
                    return `
                    <div onclick="window.location.href='question-detail.html?id=${encodeURIComponent(q.id || '')}&type=coding'" style="display:flex; align-items:center; gap:1.25rem; padding:1.25rem 1.5rem; border-bottom:1px solid var(--border-color); cursor:pointer; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-muted)'" onmouseout="this.style.background='transparent'">
                        <div style="width:32px; height:32px; background:var(--bg-muted); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.875rem; font-weight:600; color:var(--text-muted); flex-shrink:0;">${idx + 1}</div>
                        <div style="flex:1;">
                            <div style="font-weight:500; font-size:0.95rem; margin-bottom:0.4rem; color:var(--text-main);">${q.title || q.question}</div>
                            <div style="display:flex; gap:0.5rem;">
                                <span style="font-size:0.7rem; background:var(--bg-muted); border:1px solid var(--border-color); color:var(--text-main); padding:0.15rem 0.5rem; border-radius:4px;">${q.topic || q.category}</span>
                                <span style="font-size:0.7rem; background:transparent; border:1px solid ${qColor}40; color:${qColor}; padding:0.15rem 0.5rem; border-radius:4px; font-weight:600;">${q.difficulty}</span>
                            </div>
                        </div>
                        <span style="color:var(--text-muted); font-size:1.25rem;">›</span>
                    </div>
                `}).join('') : '<div style="padding:2rem;text-align:center;color:var(--text-muted);">No questions match this filter.</div>'}
            </div>
        `;
    } else if (state.currentTab === 'roadmap') {
        tabContentHTML = `
            <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:12px; padding:2rem; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <div class="roadmap-timeline">
                    ${(path.topics || []).map((t, idx) => `
                        <div class="roadmap-item">
                            <div style="display:inline-block; font-size:0.75rem; background:var(--bg-muted); border:1px solid var(--border-color); color:var(--text-muted); padding:0.2rem 0.6rem; border-radius:999px; font-weight:600; margin-bottom:0.5rem;">Phase ${idx+1}</div>
                            <div style="font-weight:600; font-size:1.125rem; color:var(--text-main); margin-bottom:1rem;">${t.title}</div>
                            <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.5rem;">
                                ${t.items.map(item => `
                                    <li style="display:flex; align-items:center; gap:0.75rem; font-size:0.9rem; color:var(--text-muted);">
                                        <span style="color:#ef4444; font-size:1.25rem;">•</span> ${item}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        tabContentHTML = `
            <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:12px; padding:3rem; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <div style="font-size:2rem; margin-bottom:1rem;">💼</div>
                <h3 style="color:var(--text-main); margin-bottom:0.5rem;">No Open Jobs</h3>
                <p style="color:var(--text-muted);">There are currently no active job postings for ${path.companyName}.</p>
            </div>
        `;
    }

    const counts = {
        Easy: (path.questions||[]).filter(q => q.difficulty === 'Easy').length,
        Medium: (path.questions||[]).filter(q => q.difficulty === 'Medium').length,
        Hard: (path.questions||[]).filter(q => q.difficulty === 'Hard').length
    };

    const mainHTML = `
        <div class="container py-12">
            <div class="prep-main-grid" style="display:grid; grid-template-columns: 2fr 1fr; gap:2rem;">
                <!-- Left Content -->
                <div>
                    ${tabContentHTML}
                </div>

                <!-- Right Sidebar -->
                <div>
                    <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:12px; padding:1.5rem; margin-bottom:1.5rem; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                        <h3 style="font-size:1rem; margin:0 0 1.25rem 0; display:flex; align-items:center; gap:0.5rem; color:var(--text-main);"><span style="color:#ef4444;">📈</span> Difficulty Breakdown</h3>
                        <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem; font-size:0.875rem;">
                            <span style="color:#10b981; font-weight:500;">Easy</span>
                            <span style="color:var(--text-main); font-weight:600;">${counts.Easy}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem; font-size:0.875rem;">
                            <span style="color:#f59e0b; font-weight:500;">Medium</span>
                            <span style="color:var(--text-main); font-weight:600;">${counts.Medium}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:0.875rem;">
                            <span style="color:#ef4444; font-weight:500;">Hard</span>
                            <span style="color:var(--text-main); font-weight:600;">${counts.Hard}</span>
                        </div>
                    </div>

                    <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:12px; padding:1.5rem; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                        <h3 style="font-size:1rem; margin:0 0 1.25rem 0; display:flex; align-items:center; gap:0.5rem; color:var(--text-main);"><span style="color:#ef4444;">📖</span> Roles</h3>
                        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                            ${(path.roles || []).map(r => `<span style="font-size:0.8rem; background:var(--bg-muted); border:1px solid var(--border-color); color:var(--text-main); padding:0.3rem 0.75rem; border-radius:999px; font-weight:500;">${r}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return headerHTML + mainHTML;
}

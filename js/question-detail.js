document.addEventListener('DOMContentLoaded', async () => {
    // Extract query parameters
    const params = new URLSearchParams(window.location.search);
    const questionId = params.get('id');
    const paramTitle = params.get('title');
    const paramCompany = params.get('company') || 'Tech Corporate';
    const questionType = params.get('type') || 'Coding';

    let question = null;

    try {
        const response = await fetch('../../data/questions.json');
        if (response.ok) {
            const data = await response.json();
            const searchArray = questionType.toLowerCase() === 'aptitude' ? (data.aptitude || []) : (data.coding || []);
            if (questionId) {
                question = searchArray.find(q => q.id === questionId);
            }
            if (!question && paramTitle) {
                question = searchArray.find(q => q.title.toLowerCase().includes(paramTitle.toLowerCase()) || paramTitle.toLowerCase().includes(q.title.toLowerCase()));
            }
        }
    } catch (e) {
        console.warn('Questions JSON fetch error, using dynamic fallback:', e);
    }

    // Dynamic fallback object if not found in static JSON array
    if (!question) {
        const titleText = paramTitle || "Algorithm Optimization & System Problem";
        question = {
            id: questionId || 'dynamic-q-1',
            title: titleText,
            difficulty: titleText.toLowerCase().includes('hard') ? 'Hard' : 'Medium',
            company: paramCompany,
            type: questionType,
            description: `Implement an optimal solution for <strong>${titleText}</strong> asked during <strong>${paramCompany}</strong> technical interviews. Focus on computational efficiency and edge cases.`
        };
    }

    // 1. Update Title
    const titleEl = document.getElementById('question-title');
    if (titleEl) titleEl.textContent = question.title;

    // 2. Update Difficulty
    const diffEl = document.getElementById('question-difficulty');
    if (diffEl) {
        diffEl.textContent = question.difficulty || 'Medium';
        if (question.difficulty === "Easy") {
            diffEl.style.color = "#10b981";
            diffEl.style.background = "rgba(16, 185, 129, 0.1)";
        } else if (question.difficulty === "Hard") {
            diffEl.style.color = "#ef4444";
            diffEl.style.background = "rgba(239, 68, 68, 0.1)";
        } else {
            diffEl.style.color = "var(--primary)";
            diffEl.style.background = "rgba(249, 115, 22, 0.1)";
        }
    }

    // 3. Update Company Pill
    const companiesContainer = document.getElementById('question-companies');
    if (companiesContainer) companiesContainer.innerHTML = `<span class="company-pill">${question.company || 'Tech Corp'}</span>`;

    // 4. Update Tag Pill
    const tagsContainer = document.getElementById('question-tags');
    if (tagsContainer) tagsContainer.innerHTML = `<span class="tag-pill">${question.type || 'Coding'}</span>`;

    // 5. Update Problem Description & Instructions
    const descriptionContainer = document.getElementById('question-description');
    if (descriptionContainer) {
        descriptionContainer.innerHTML = `
            <p style="line-height:1.6;font-size:0.95rem;color:var(--text-main);">${question.description}</p>
            <div style="margin-top:1.25rem;background:var(--bg-muted);padding:1rem;border-radius:8px;border:1px solid var(--border-color);">
                <h4 style="margin:0 0 0.5rem;font-size:0.9rem;color:var(--primary);">🎯 Key Requirements:</h4>
                <ul style="margin:0;padding-left:1.2rem;font-size:0.85rem;color:var(--text-muted);line-height:1.6;">
                    <li>Design an algorithm with efficient time complexity O(N) or O(N log N).</li>
                    <li>Handle null, empty array, or out-of-bounds input boundary cases.</li>
                    <li>Write clean, modular code with appropriate variable naming.</li>
                </ul>
            </div>
            <div style="margin-top:1.25rem;">
                <h4 style="margin:0 0 0.5rem;font-size:0.9rem;color:var(--text-main);">🧪 Sample Test Cases:</h4>
                <div style="background:var(--bg-muted);padding:0.75rem 1rem;border-radius:6px;border:1px solid var(--border-color);font-family:monospace;font-size:0.8rem;margin-bottom:0.5rem;">
                    <div><strong>Input:</strong> data = [1, 5, 10, 25], target = 15</div>
                    <div><strong>Expected Output:</strong> true</div>
                </div>
            </div>
        `;
    }
});

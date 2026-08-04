document.addEventListener('DOMContentLoaded', async () => {
    // Extract query parameters
    const params = new URLSearchParams(window.location.search);
    const questionId = params.get('id');
    const questionType = params.get('type') || 'Coding';

    if (!questionId) {
        document.getElementById('question-title').textContent = "Question Not Found";
        document.getElementById('question-description').innerHTML = "<p>Invalid URL parameters.</p>";
        return;
    }

    try {
        const response = await fetch('../../data/questions.json');
        if (!response.ok) throw new Error("Failed to fetch questions data");
        const data = await response.json();

        // Search in the correct array based on type
        const searchArray = questionType.toLowerCase() === 'aptitude' ? data.aptitude : data.coding;
        const question = searchArray.find(q => q.id === questionId);

        if (!question) {
            document.getElementById('question-title').textContent = "Question Not Found";
            document.getElementById('question-description').innerHTML = "<p>Could not locate the requested question in the database.</p>";
            return;
        }

        // 1. Update Title
        document.getElementById('question-title').textContent = question.title;

        // 2. Update Difficulty
        const diffEl = document.getElementById('question-difficulty');
        diffEl.textContent = question.difficulty;
        
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

        // 3. Update Company Pill
        const companiesContainer = document.getElementById('question-companies');
        companiesContainer.innerHTML = `<span class="company-pill">${question.company}</span>`;

        // 4. Update Tag Pill
        const tagsContainer = document.getElementById('question-tags');
        tagsContainer.innerHTML = `<span class="tag-pill">${question.type}</span>`;

        // 5. Provide mock description since we don't scrape actual descriptions from the CSV
        const descriptionContainer = document.getElementById('question-description');
        if (question.type === 'Coding') {
            descriptionContainer.innerHTML = `
                <p>You are given a coding problem: <strong>${question.title}</strong>.</p>
                <p style="margin-top: 1rem;">This problem has been frequently asked by <strong>${question.company}</strong> in their technical interviews.</p>
                <p style="margin-top: 1rem;">Implement an efficient solution to solve this problem. Consider edge cases and time/space complexity requirements.</p>
                <p style="margin-top: 1rem;"><em>(Note: Detailed problem descriptions would typically be fetched from the backend API, but are mocked here for frontend demonstration purposes).</em></p>
            `;
        } else {
            descriptionContainer.innerHTML = `
                <p>This is an aptitude question regarding <strong>${question.title}</strong>.</p>
                <p style="margin-top: 1rem;">Companies like <strong>${question.company}</strong> often use these types of logic and reasoning questions in their preliminary assessment rounds.</p>
                <p style="margin-top: 1rem;">Select the most appropriate answer or write down your calculated result.</p>
            `;
        }

    } catch (error) {
        console.error(error);
        document.getElementById('question-title').textContent = "Error Loading Question";
        document.getElementById('question-description').innerHTML = "<p>A network error occurred while loading the question data.</p>";
    }
});

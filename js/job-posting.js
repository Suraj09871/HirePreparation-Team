document.addEventListener('DOMContentLoaded', () => {
    if (!API.isLoggedIn()) return window.location.href = '/frontend/recruiter/recruiter-auth.html';

    const form = document.getElementById('jobPostForm');
    if (form) form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('jobTitle')?.value;
        const description = document.getElementById('jobDesc')?.value;
        const requiredSkills = document.getElementById('jobSkills')?.value;
        const experienceRequired = document.getElementById('jobExp')?.value;
        const location = document.getElementById('jobLocation')?.value;
        const salary = document.getElementById('jobSalary')?.value;
        const companyName = API.getUser()?.name || 'Company';

        try {
            await API.post('/jobs', { title, description, companyName, requiredSkills, experienceRequired, location, salary });
            showToast('Job posted successfully!');
            setTimeout(() => window.location.href = 'recruiter-dashboard.html', 1000);
        } catch (e) { showToast(e.message, 'error'); }
    });

    // Draft save
    const draftBtn = document.getElementById('saveDraftBtn');
    if (draftBtn) draftBtn.addEventListener('click', async () => {
        const title = document.getElementById('jobTitle')?.value || 'Untitled Draft';
        try {
            await API.post('/jobs', { title, companyName: API.getUser()?.name || 'Company', status: 'draft' });
            showToast('Draft saved!');
        } catch (e) { showToast(e.message, 'error'); }
    });
});

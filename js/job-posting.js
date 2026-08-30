document.addEventListener('DOMContentLoaded', () => {
    var base = (/\/frontend\/(student|recruiter|admin)\//i.test(window.location.pathname)) ? '../../' : '';
    if (!API.isLoggedIn()) return window.location.href = base + 'frontend/auth.html';

    const form = document.getElementById('jobPostForm');
    if (form) form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('jobTitle')?.value;
        const description = document.getElementById('jobDesc')?.value;
        const requiredSkills = document.getElementById('jobSkills')?.value ? document.getElementById('jobSkills').value.split(',').map(s => s.trim()) : [];
        const experienceRequired = document.getElementById('jobExp')?.value;
        const location = document.getElementById('jobLocation')?.value;
        const salary = document.getElementById('jobSalary')?.value;
        const companyName = API.getUser()?.name || 'HirePrep Partner';

        try {
            await API.post('/jobs', { title, description, companyName, requiredSkills, experienceRequired, location, salary });
            if (typeof showToast === 'function') showToast('Job posted successfully!', 'success');
            else alert('Job posted successfully!');
            setTimeout(() => window.location.href = 'recruiter-dashboard.html', 1000);
        } catch (e) {
            if (typeof showToast === 'function') showToast(e.message, 'error');
            else alert(e.message);
        }
    });

    // Draft save
    const draftBtn = document.getElementById('saveDraftBtn');
    if (draftBtn) draftBtn.addEventListener('click', async () => {
        const title = document.getElementById('jobTitle')?.value || 'Untitled Draft';
        try {
            await API.post('/jobs', { title, companyName: API.getUser()?.name || 'Company', status: 'draft' });
            if (typeof showToast === 'function') showToast('Draft saved successfully!', 'success');
            else alert('Draft saved!');
        } catch (e) {
            if (typeof showToast === 'function') showToast(e.message, 'error');
            else alert(e.message);
        }
    });
});

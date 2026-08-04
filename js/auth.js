/**
 * Auth page logic for student-auth.html and recruiter-auth.html
 */
document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already logged in
    if (API.isLoggedIn()) {
        const user = API.getUser();
        if (user.role === 'recruiter') return window.location.href = '/frontend/recruiter/recruiter-dashboard.html';
        if (user.role === 'admin') return window.location.href = '/frontend/admin/admin-dashboard.html';
        return window.location.href = '/frontend/student/student-dashboard.html';
    }

    const isRecruiterPage = window.location.pathname.includes('recruiter');
    let isLoginMode = isRecruiterPage; // Recruiter page defaults to login
    let selectedRole = isRecruiterPage ? 'recruiter' : 'student';

    const form = document.getElementById('authForm');
    const nameField = document.getElementById('nameField');
    const submitBtn = document.getElementById('submitBtn');
    const authError = document.getElementById('authError');
    const toggleLink = document.getElementById('toggleLink');
    const toggleText = document.getElementById('toggleText');
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    const roleTabs = document.querySelectorAll('.role-tab');

    // Role tab switching
    roleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            roleTabs.forEach(t => { t.style.background = 'transparent'; t.style.color = 'var(--text-muted)'; t.style.boxShadow = 'none'; });
            tab.style.background = 'white';
            tab.style.color = 'var(--text-main)';
            tab.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
            selectedRole = tab.dataset.role;
        });
    });

    // Toggle login/register
    function updateMode() {
        if (isLoginMode) {
            if (nameField) nameField.style.display = 'none';
            if (submitBtn) submitBtn.textContent = 'Sign In';
            if (pageTitle) pageTitle.textContent = 'Welcome Back';
            if (pageSubtitle) pageSubtitle.textContent = 'Enter your credentials to continue.';
            if (toggleText) toggleText.textContent = "Don't have an account? ";
            if (toggleLink) toggleLink.textContent = 'Sign Up';
        } else {
            if (nameField) nameField.style.display = 'block';
            if (submitBtn) submitBtn.textContent = 'Create Account';
            if (pageTitle) pageTitle.textContent = isRecruiterPage ? 'Register as Recruiter' : 'Join as a Student';
            if (pageSubtitle) pageSubtitle.textContent = isRecruiterPage ? 'Create your recruiter account.' : 'Create your profile to prepare and apply for jobs.';
            if (toggleText) toggleText.textContent = 'Already have an account? ';
            if (toggleLink) toggleLink.textContent = 'Sign In';
        }
    }

    if (toggleLink) {
        toggleLink.addEventListener('click', (e) => { e.preventDefault(); isLoginMode = !isLoginMode; updateMode(); });
    }

    updateMode();

    // Form submit
    if (form) form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (authError) authError.style.display = 'none';
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        const name = document.getElementById('authName')?.value || email.split('@')[0];
        if (submitBtn) { submitBtn.textContent = 'Processing...'; submitBtn.disabled = true; }

        try {
            let data;
            if (isLoginMode) {
                data = await API.post('/auth/login', { email, password });
            } else {
                data = await API.post('/auth/register', { name, email, password, role: selectedRole });
            }
            API.saveAuth(data.token, data.user);
            showToast(data.message);
            setTimeout(() => {
                if (data.user.role === 'recruiter') window.location.href = '/frontend/recruiter/recruiter-dashboard.html';
                else if (data.user.role === 'admin') window.location.href = '/frontend/admin/admin-dashboard.html';
                else window.location.href = '/frontend/student/student-dashboard.html';
            }, 500);
        } catch (error) {
            if (authError) { authError.textContent = error.message; authError.style.display = 'block'; }
        } finally {
            if (submitBtn) { submitBtn.disabled = false; updateMode(); }
        }
    });
});

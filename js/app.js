document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const closeModalBtn = document.getElementById('closeModal');
    const authForm = document.getElementById('authForm');
    const switchMode = document.getElementById('switchMode');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const submitAuth = document.getElementById('submitAuth');
    const switchText = document.getElementById('switchText');
    const authError = document.getElementById('authError');
    const userProfile = document.getElementById('userProfile');

    let isLoginMode = true;

    // Check auth state on load
    const user = API.getUser();
    if (user) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (signupBtn) signupBtn.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
        if (userProfile) { userProfile.classList.remove('hidden'); userProfile.textContent = user.name; }
    }

    // Modal logic
    const openModal = (login) => {
        isLoginMode = login;
        updateModalContent();
        if (modal) modal.classList.remove('hidden');
        if (authError) authError.classList.add('hidden');
        if (authForm) authForm.reset();
    };

    if (loginBtn) loginBtn.addEventListener('click', () => openModal(true));
    if (signupBtn) signupBtn.addEventListener('click', () => openModal(false));
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
    if (switchMode) switchMode.addEventListener('click', (e) => { e.preventDefault(); isLoginMode = !isLoginMode; updateModalContent(); });

    function updateModalContent() {
        if (isLoginMode) {
            if (modalTitle) modalTitle.textContent = 'Welcome Back';
            if (modalSubtitle) modalSubtitle.textContent = 'Enter your credentials to continue';
            if (submitAuth) submitAuth.textContent = 'Sign In';
            if (switchText) switchText.textContent = "Don't have an account?";
            if (switchMode) switchMode.textContent = 'Sign Up';
        } else {
            if (modalTitle) modalTitle.textContent = 'Create Account';
            if (modalSubtitle) modalSubtitle.textContent = 'Join HireSmart today';
            if (submitAuth) submitAuth.textContent = 'Sign Up';
            if (switchText) switchText.textContent = 'Already have an account?';
            if (switchMode) switchMode.textContent = 'Sign In';
        }
    }

    // Auth form submit
    if (authForm) authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        if (authError) authError.classList.add('hidden');
        if (submitAuth) { submitAuth.textContent = 'Processing...'; submitAuth.disabled = true; }

        try {
            let data;
            if (isLoginMode) {
                data = await API.post('/auth/login', { email, password });
            } else {
                data = await API.post('/auth/register', { name: email.split('@')[0], email, password, role: 'student' });
            }
            API.saveAuth(data.token, data.user);
            showToast(data.message);
            // Redirect based on role
            setTimeout(() => {
                if (data.user.role === 'admin') window.location.href = '/frontend/admin/admin-dashboard.html';
                else if (data.user.role === 'recruiter') window.location.href = '/frontend/recruiter/recruiter-dashboard.html';
                else window.location.href = '/frontend/student/student-dashboard.html';
            }, 500);
        } catch (error) {
            if (authError) { authError.textContent = error.message; authError.classList.remove('hidden'); }
        } finally {
            if (submitAuth) { submitAuth.textContent = isLoginMode ? 'Sign In' : 'Sign Up'; submitAuth.disabled = false; }
        }
    });

    // Logout
    if (logoutBtn) logoutBtn.addEventListener('click', () => { handleLogout(); });

    // Hero buttons
    document.querySelectorAll('.btn-primary.btn-large').forEach(btn => {
        if (btn.textContent.includes('Start Preparing') || btn.textContent.includes('Get Started')) {
            btn.addEventListener('click', () => {
                if (API.isLoggedIn()) window.location.href = '/frontend/student/student-dashboard.html';
                else openModal(false);
            });
        }
    });

    document.querySelectorAll('.btn-secondary.btn-large').forEach(btn => {
        if (btn.textContent.includes('Recruiter') || btn.textContent.includes('Explore')) {
            btn.addEventListener('click', () => {
                if (API.isLoggedIn()) window.location.href = '/frontend/recruiter/recruiter-dashboard.html';
                else window.location.href = '/frontend/recruiter/recruiter-auth.html';
            });
        }
    });
});

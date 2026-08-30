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

    // Google Sign-In button click
    const googleBtn = document.getElementById('googleBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (authError) authError.style.display = 'none';

            let isAuthActive = false;
            const handleAuth = async (token) => {
                if (!token) {
                    if (authError) { authError.textContent = 'Google sign-in was cancelled.'; authError.style.display = 'block'; }
                    return;
                }

                const adminKeyVal = document.getElementById('adminSecretKey')?.value?.trim() || document.getElementById('adminKey')?.value?.trim() || '';
                const activeRole = (typeof currentRole !== 'undefined') ? currentRole : selectedRole;
                if ((activeRole === 'developer' || activeRole === 'admin') && !adminKeyVal) {
                    if (authError) {
                        authError.textContent = '🔑 Admin Secret Key is required to sign in as Admin with Google.';
                        authError.style.display = 'block';
                    }
                    return;
                }

                isAuthActive = true;
                try {
                    const data = await API.post('/auth/google', {
                        token: token,
                        role: activeRole,
                        adminKey: adminKeyVal
                    });
                    if (data.token && data.user) {
                        API.saveAuth(data.token, data.user);
                        if (typeof showToast === 'function') showToast('Google Authentication successful!', 'success');
                        setTimeout(() => {
                            if (data.user.role === 'recruiter') window.location.href = '/frontend/recruiter/recruiter-dashboard.html';
                            else if (data.user.role === 'admin' || data.user.role === 'sub-admin') window.location.href = '/frontend/admin/admin-dashboard.html';
                            else window.location.href = '/frontend/student/student-dashboard.html';
                        }, 300);
                    } else {
                        isAuthActive = false;
                        if (authError) { authError.textContent = data.message || 'Google Auth failed'; authError.style.display = 'block'; }
                    }
                } catch (err) {
                    isAuthActive = false;
                    if (authError) { authError.textContent = err.message || 'Google Auth failed'; authError.style.display = 'block'; }
                }
            };

            if (typeof google !== 'undefined' && google.accounts) {
                try {
                    if (google.accounts.oauth2) {
                        const tokenClient = google.accounts.oauth2.initTokenClient({
                            client_id: '622950445435-o4rmk192qnuttg77mv1poo707ov6upng.apps.googleusercontent.com',
                            scope: 'email profile openid',
                            callback: function(tokenResponse) {
                                if (tokenResponse && tokenResponse.access_token) {
                                    handleAuth(tokenResponse.access_token);
                                }
                            },
                            error_callback: function(err) {
                                if (isAuthActive) return;
                                if (err && (err.type === 'popup_closed' || err.type === 'popup_blocked_by_browser')) return;
                                if (authError) { authError.textContent = 'Google Sign-In: ' + (err.message || 'Popup closed'); authError.style.display = 'block'; }
                            }
                        });
                        tokenClient.requestAccessToken({ prompt: 'select_account' });
                    } else if (google.accounts.id) {
                        google.accounts.id.initialize({
                            client_id: '622950445435-o4rmk192qnuttg77mv1poo707ov6upng.apps.googleusercontent.com',
                            callback: function(response) {
                                if (response && response.credential) {
                                    handleAuth(response.credential);
                                }
                            }
                        });
                        google.accounts.id.prompt();
                    }
                } catch (err) {
                    if (authError) { authError.textContent = 'Google Sign-In failed: ' + err.message; authError.style.display = 'block'; }
                }
            } else {
                if (authError) { authError.textContent = 'Google auth service is loading. Please try again in a moment.'; authError.style.display = 'block'; }
            }
        });
    }
});

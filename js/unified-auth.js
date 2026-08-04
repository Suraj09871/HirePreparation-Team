/**
 * Unified Authentication Logic (Student, Recruiter, Developer/Admin) + Google Auth
 * Developer tab requires Admin Secret Key for access
 */
let currentRole = 'student';
let isLoginMode = true;

function switchRole(role) {
    currentRole = role;
    
    // Update tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.className = 'auth-tab'; // reset
        if (tab.dataset.role === role) {
            tab.classList.add('active');
            if (role === 'recruiter') tab.classList.add('active-recruiter');
            if (role === 'developer') tab.classList.add('active-developer');
        }
    });

    // Update UI elements
    const icon = document.getElementById('roleIcon');
    const subtitle = document.getElementById('pageSubtitle');
    const nameField = document.getElementById('nameField');
    const nameLabel = nameField.querySelector('label');
    const adminKeyField = document.getElementById('adminKeyField');
    
    // UI Elements
    const forgotPassword = document.getElementById('forgotPassword');
    const googleDivider = document.getElementById('googleDivider');
    const googleBtn = document.getElementById('googleBtn');
    const signupSection = document.getElementById('signupSection');
    const emailLabel = document.getElementById('emailLabel');
    const passwordLabel = document.getElementById('passwordLabel');
    const submitBtn = document.getElementById('submitBtn');
    const title = document.querySelector('h1');
    
    // Reset UI state
    if (forgotPassword) forgotPassword.style.display = 'block';
    if (googleDivider) googleDivider.style.display = 'flex';
    if (googleBtn) googleBtn.style.display = 'flex';
    if (signupSection) signupSection.style.display = 'block';
    if (adminKeyField) adminKeyField.style.display = 'none';
    const authPassword = document.getElementById('authPassword');
    if (authPassword) {
        authPassword.parentElement.style.display = 'block';
        authPassword.setAttribute('required', 'true');
    }
    if (emailLabel) emailLabel.textContent = 'Email';
    if (passwordLabel) passwordLabel.textContent = 'Password';
    if (submitBtn) {
        submitBtn.style.background = '';
        submitBtn.style.color = '';
        if (isLoginMode) submitBtn.textContent = 'Sign In';
        else submitBtn.textContent = 'Create Account';
    }

    if (role === 'student') {
        icon.innerHTML = '🎓';
        icon.style.background = 'rgba(249, 115, 22, 0.1)';
        icon.style.color = 'var(--primary)';
        if(isLoginMode) title.textContent = 'Welcome Back';
        subtitle.textContent = isLoginMode ? 'Sign in to your account' : 'Create your student profile';
        nameLabel.textContent = 'Full Name';
        document.documentElement.style.setProperty('--primary', '#f97316');
    } else if (role === 'recruiter') {
        icon.innerHTML = '💼';
        icon.style.background = '#f1f5f9';
        icon.style.color = '#1e293b';
        if(isLoginMode) title.textContent = 'Welcome Back';
        subtitle.textContent = isLoginMode ? 'Sign in to your recruiter account' : 'Create your company account';
        nameLabel.textContent = 'Company Name';
        document.documentElement.style.setProperty('--primary', '#1e293b');
    } else if (role === 'developer') {
        icon.innerHTML = '⚡';
        icon.style.background = 'rgba(124, 58, 237, 0.1)';
        icon.style.color = '#7c3aed';
        if(isLoginMode) title.textContent = 'Developer Access';
        else title.textContent = 'Developer Registration';
        subtitle.textContent = isLoginMode ? 'Sign in with your admin secret key' : 'Register as a developer with admin key';
        nameLabel.textContent = 'Full Name';
        document.documentElement.style.setProperty('--primary', '#7c3aed');
        
        // Show admin key field
        if (adminKeyField) adminKeyField.style.display = 'block';
        
        // Change button style to purple
        if (submitBtn) {
            submitBtn.style.background = 'linear-gradient(135deg, #7c3aed, #6d28d9)';
            submitBtn.style.color = 'white';
        }
        
        // Hide Google sign-in for developer mode (must use key)
        if (googleDivider) googleDivider.style.display = 'none';
        if (googleBtn) googleBtn.style.display = 'none';
        
        // Hide password field and sign up options for developer
        if (authPassword) {
            authPassword.parentElement.style.display = 'none';
            authPassword.removeAttribute('required');
        }
        if (forgotPassword) forgotPassword.style.display = 'none';
        if (signupSection) signupSection.style.display = 'none';
    }
}

function toggleMode(e) {
    if (e) e.preventDefault();

    isLoginMode = !isLoginMode;
    const nameField = document.getElementById('nameField');
    const submitBtn = document.getElementById('submitBtn');
    const toggleText = document.getElementById('toggleText');
    const toggleLink = document.getElementById('toggleLink');
    const title = document.querySelector('h1');

    if (isLoginMode) {
        nameField.style.display = 'none';
        document.getElementById('authName').removeAttribute('required');
        submitBtn.textContent = 'Sign In';
        toggleText.textContent = "Don't have an account?";
        toggleLink.textContent = 'Sign Up';
        title.textContent = 'Welcome Back';
    } else {
        nameField.style.display = 'block';
        document.getElementById('authName').setAttribute('required', 'true');
        submitBtn.textContent = 'Create Account';
        toggleText.textContent = 'Already have an account?';
        toggleLink.textContent = 'Sign In';
        if (currentRole === 'developer') title.textContent = 'Developer Registration';
        else title.textContent = currentRole === 'student' ? 'Join as a Student' : 'Join as a Recruiter';
    }
    switchRole(currentRole); // refresh subtitle
}

function showError(msg) {
    const err = document.getElementById('authError');
    err.textContent = msg;
    err.style.display = 'block';
    setTimeout(() => err.style.display = 'none', 5000);
}

// Handle Standard Login/Signup
document.getElementById('authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;

    try {
        let endpoint = isLoginMode ? '/auth/login' : '/auth/register';
        let payload = { email, password };

        if (!isLoginMode) {
            payload.name = document.getElementById('authName').value;
            payload.role = currentRole;
        }

        // If developer tab is selected, use admin-login endpoint and send email + adminKey only
        if (currentRole === 'developer') {
            const adminKey = document.getElementById('adminSecretKey')?.value;
            if (!adminKey) {
                showError('Admin Secret Key is required for developer access.');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                return;
            }
            endpoint = '/auth/admin-login';
            payload = { email, adminKey };
        }

        const data = await API.post(endpoint, payload);

        if (data.token && data.user) {
            API.saveAuth(data.token, data.user);

            // Redirect based on ACTUAL role from database
            const role = data.user.role;
            if (role === 'admin' || role === 'sub-admin') {
                window.location.href = '/frontend/admin/admin-dashboard.html';
            } else if (role === 'recruiter') {
                window.location.href = '/frontend/recruiter/recruiter-dashboard.html';
            } else {
                window.location.href = '/frontend/student/student-dashboard.html';
            }
        } else {
            showError('Login failed. Please try again.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }

    } catch (err) {
        showError(err.message || 'Authentication failed. Please check your credentials.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

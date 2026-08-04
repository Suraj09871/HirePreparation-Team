document.addEventListener('DOMContentLoaded', async () => {
    if (!API.isLoggedIn()) return window.location.href = '/index.html';
    
    const user = API.getUser();
    if (document.getElementById('navName')) document.getElementById('navName').textContent = user.name;
    if (document.getElementById('sideName')) document.getElementById('sideName').textContent = user.name;
    if (document.getElementById('sideEmail')) document.getElementById('sideEmail').textContent = user.email;

    // Fetch profile to calculate progress
    try {
        const data = await API.get('/profile');
        calculateProgress(data.profile);
    } catch (e) {
        console.error('Error fetching profile:', e.message);
    }

    // Accordions
    document.querySelectorAll('.roadmap-step-header').forEach(header => {
        header.addEventListener('click', () => {
            const step = header.parentElement;
            const content = step.querySelector('.roadmap-step-content');
            const arrow = header.querySelector('div:last-child');
            
            if (step.classList.contains('active')) {
                step.classList.remove('active');
                arrow.textContent = '>';
            } else {
                document.querySelectorAll('.roadmap-step').forEach(s => {
                    s.classList.remove('active');
                    s.querySelector('.roadmap-step-header div:last-child').textContent = '>';
                });
                step.classList.add('active');
                arrow.textContent = '⌄';
            }
        });
    });
});

function calculateProgress(profile) {
    let completedSteps = 0;
    
    // Step 1: Profile Built (Basic checks)
    if (profile.name && profile.phone) {
        completedSteps++;
        document.getElementById('step1Num').style.background = '#10b981';
        document.getElementById('step1Num').style.color = 'white';
        document.getElementById('step1Num').textContent = '✓';
    }
    
    // Step 2: Resume Uploaded
    if (profile.resumeUrl) {
        completedSteps++;
        document.getElementById('step2Num').style.background = '#10b981';
        document.getElementById('step2Num').style.color = 'white';
        document.getElementById('step2Num').textContent = '✓';
    }
    
    // Mock for remaining steps
    // Step 3, 4, 5
    
    const progressPercent = (completedSteps / 5) * 100;
    
    document.getElementById('progressText').textContent = `${completedSteps}/5`;
    document.getElementById('progressBar').style.width = `${progressPercent}%`;
    
    if (completedSteps > 0) {
        document.getElementById('progressBar').style.background = '#f97316'; // Orange
        document.getElementById('progressText').style.color = '#f97316';
    }
    if (completedSteps === 5) {
        document.getElementById('progressBar').style.background = '#10b981'; // Green
        document.getElementById('progressText').style.color = '#10b981';
    }
}

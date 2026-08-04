document.addEventListener('DOMContentLoaded', () => {
    const result = JSON.parse(localStorage.getItem('lastMatchResult') || '{}');
    const params = new URLSearchParams(window.location.search);
    const isPreview = params.get('preview') === '1';

    // Update skill match
    const skillMatchEl = document.getElementById('skillMatch');
    if (skillMatchEl) skillMatchEl.textContent = (result.skillMatch || 0) + '%';

    // Update hiring probability
    const hiringEl = document.getElementById('hiringProb');
    const prob = result.hiringProbability || 0;
    if (hiringEl) {
        if (prob >= 85) { hiringEl.textContent = 'High'; hiringEl.style.color = '#10b981'; }
        else if (prob >= 60) { hiringEl.textContent = 'Medium'; hiringEl.style.color = '#f59e0b'; }
        else { hiringEl.textContent = 'Low'; hiringEl.style.color = '#ef4444'; }
    }

    // Job title
    const titleEl = document.getElementById('matchJobTitle');
    if (titleEl) titleEl.textContent = result.jobTitle || result.companyName || 'Job Position';

    // Warnings
    const warningsEl = document.getElementById('warningMessages');
    if (warningsEl) {
        let html = '';
        if (result.matchedSkills && result.matchedSkills.length > 0) {
            html += `<div style="display:flex;gap:1rem;align-items:center;padding:1rem;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);border-radius:8px;">
                <span style="color:#10b981;font-size:1.25rem;">●</span>
                <div style="color:#065f46;font-size:0.875rem;"><strong>Strong Alignment:</strong> Your skills in ${result.matchedSkills.join(', ')} match the requirements.</div>
            </div>`;
        }
        if (result.missingSkills && result.missingSkills.length > 0) {
            const color = result.missingSkills.length > 2 ? '#ef4444' : '#f59e0b';
            const bg = result.missingSkills.length > 2 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)';
            const border = result.missingSkills.length > 2 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)';
            const label = result.missingSkills.length > 2 ? 'Critical Gap' : 'Minor Gap';
            html += `<div style="display:flex;gap:1rem;align-items:center;padding:1rem;background:${bg};border:1px solid ${border};border-radius:8px;">
                <span style="color:${color};font-size:1.25rem;">●</span>
                <div style="color:#92400e;font-size:0.875rem;"><strong>${label}:</strong> Missing skills: ${result.missingSkills.join(', ')}</div>
            </div>`;
        }
        warningsEl.innerHTML = html;
    }

    // Buttons
    const submitBtn = document.getElementById('submitApplicationBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    if (cancelBtn) cancelBtn.addEventListener('click', () => window.history.back());

    if (submitBtn) {
        if (!isPreview && result.status) {
            submitBtn.textContent = 'Application Submitted ✓';
            submitBtn.disabled = true;
            submitBtn.style.background = '#10b981';
        } else if (isPreview) {
            submitBtn.textContent = 'Submit Application';
            submitBtn.addEventListener('click', async () => {
                const jobId = params.get('jobId');
                try {
                    await API.post('/applications', { jobId });
                    showToast('Application submitted!');
                    submitBtn.textContent = 'Application Submitted ✓';
                    submitBtn.disabled = true;
                    submitBtn.style.background = '#10b981';
                } catch (e) { showToast(e.message, 'error'); }
            });
        }
    }
});

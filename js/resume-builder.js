/**
 * Resume Builder — fetches profile data and builds a live preview
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Form fields
    const nameInput = document.getElementById('rbName');
    const titleInput = document.getElementById('rbTitle');
    const emailInput = document.getElementById('rbEmail');
    const phoneInput = document.getElementById('rbPhone');
    const locationInput = document.getElementById('rbLocation');
    const portfolioInput = document.getElementById('rbPortfolio');
    const summaryInput = document.getElementById('rbSummary');

    // Import from profile
    const importBtn = document.getElementById('importProfileBtn');
    if (importBtn) {
        importBtn.addEventListener('click', async () => {
            if (!API.isLoggedIn()) return showToast('Please sign in first', 'error');
            try {
                const data = await API.get('/profile');
                const p = data.profile;
                if (nameInput) nameInput.value = p.name || '';
                if (emailInput) emailInput.value = p.email || '';
                if (phoneInput) phoneInput.value = p.phone || '';
                if (locationInput) locationInput.value = p.location || '';
                if (summaryInput) summaryInput.value = p.experience || '';
                // Skills
                if (p.skills && p.skills.length > 0) {
                    const skillsDiv = document.getElementById('rbSkillsPreview');
                    if (skillsDiv) {
                        skillsDiv.innerHTML = p.skills.map(s => 
                            `<span style="background:#f1f5f9;padding:0.3rem 0.6rem;border-radius:4px;font-size:0.75rem;border:1px solid var(--border-color);">${s.name}</span>`
                        ).join('');
                    }
                }
                // Projects
                if (p.projects && p.projects.length > 0) {
                    const projDiv = document.getElementById('rbProjectsPreview');
                    if (projDiv) {
                        projDiv.innerHTML = p.projects.map(proj => `
                            <div style="margin-bottom:0.75rem;">
                                <div style="font-weight:600;font-size:0.8rem;">${proj.title}</div>
                                <div style="font-size:0.7rem;color:var(--text-muted);">${proj.description}</div>
                                <div style="font-size:0.65rem;color:#6366f1;margin-top:0.2rem;">${proj.techStack}</div>
                            </div>
                        `).join('');
                    }
                }
                updatePreview();
                showToast('Profile imported!');
            } catch (e) { showToast(e.message, 'error'); }
        });
    }

    // Auto-import on load if logged in
    if (API.isLoggedIn()) {
        try {
            const data = await API.get('/profile');
            const p = data.profile;
            if (nameInput) nameInput.value = p.name || '';
            if (emailInput) emailInput.value = p.email || '';
            if (phoneInput) phoneInput.value = p.phone || '';
            if (locationInput) locationInput.value = p.location || '';
            if (summaryInput) summaryInput.value = p.experience || '';
            updatePreview();
        } catch (e) { /* ignore */ }
    }

    // Live preview update
    const allInputs = document.querySelectorAll('#resumeForm input, #resumeForm textarea');
    allInputs.forEach(inp => {
        inp.addEventListener('input', updatePreview);
    });

    // Template selection
    document.querySelectorAll('.template-option').forEach(tmpl => {
        tmpl.addEventListener('click', () => {
            document.querySelectorAll('.template-option').forEach(t => {
                t.style.border = '1px solid var(--border-color)';
                const check = t.querySelector('.tmpl-check');
                if (check) check.style.display = 'none';
            });
            tmpl.style.border = '2px solid var(--primary)';
            const check = tmpl.querySelector('.tmpl-check');
            if (check) check.style.display = 'flex';
            const label = tmpl.querySelector('.tmpl-label');
            document.getElementById('previewTemplateName').textContent = label?.textContent || 'Modern';
            updatePreview();
        });
    });

    // Download PDF
    const downloadBtn = document.getElementById('downloadPdfBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            window.print();
        });
    }

    function updatePreview() {
        const preview = document.getElementById('resumePreviewContent');
        if (!preview) return;
        const name = nameInput?.value || 'Your Name';
        const title = titleInput?.value || 'Professional Title';
        const email = emailInput?.value || 'email@example.com';
        const phone = phoneInput?.value || '';
        const location = locationInput?.value || '';
        const summary = summaryInput?.value || '';
        const portfolio = portfolioInput?.value || '';

        preview.innerHTML = `
            <div style="background:#1e293b;color:white;padding:1.5rem;width:35%;height:100%;float:left;box-sizing:border-box;">
                <h2 style="font-size:1.25rem;margin:0 0 0.25rem 0;word-wrap:break-word;">${name}</h2>
                <div style="font-size:0.65rem;color:rgba(255,255,255,0.8);margin-bottom:1rem;">${title}</div>
                <div style="border-top:1px solid rgba(255,255,255,0.2);padding-top:0.75rem;margin-top:0.75rem;">
                    <div style="font-size:0.6rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem;color:rgba(255,255,255,0.6);">Contact</div>
                    <div style="font-size:0.55rem;color:rgba(255,255,255,0.8);display:flex;flex-direction:column;gap:0.3rem;">
                        <span>✉ ${email}</span>
                        ${phone ? `<span>📱 ${phone}</span>` : ''}
                        ${location ? `<span>📍 ${location}</span>` : ''}
                        ${portfolio ? `<span>🔗 ${portfolio}</span>` : ''}
                    </div>
                </div>
                <div style="border-top:1px solid rgba(255,255,255,0.2);padding-top:0.75rem;margin-top:0.75rem;">
                    <div style="font-size:0.6rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem;color:rgba(255,255,255,0.6);">Skills</div>
                    <div id="rbSkillsPreview" style="display:flex;flex-wrap:wrap;gap:0.25rem;"></div>
                </div>
            </div>
            <div style="padding:1.5rem;margin-left:35%;box-sizing:border-box;">
                <div style="font-size:0.6rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--primary);margin-bottom:0.5rem;">Summary</div>
                <p style="font-size:0.6rem;color:#475569;line-height:1.5;margin:0 0 1rem 0;">${summary || 'Add a professional summary...'}</p>
                <div style="font-size:0.6rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--primary);margin-bottom:0.5rem;">Projects</div>
                <div id="rbProjectsPreview"></div>
            </div>
        `;
    }

    updatePreview();
});

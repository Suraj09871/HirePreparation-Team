document.addEventListener('DOMContentLoaded', async () => {
    var base = (/\/frontend\/(student|recruiter|admin)\//i.test(window.location.pathname)) ? '../../' : '';
    if (!API.isLoggedIn()) return window.location.href = base + 'frontend/auth.html';
    
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('jobId');
    if (!jobId) return;

    try {
        const data = await API.get(`/applications/job/${jobId}`);
        const apps = data.applications || [];

        // Update ranking stats
        const high = apps.filter(a => a.hiringProbability >= 85).length;
        const med = apps.filter(a => a.hiringProbability >= 60 && a.hiringProbability < 85).length;
        const low = apps.filter(a => a.hiringProbability < 60).length;

        if (document.getElementById('highCount')) document.getElementById('highCount').textContent = high;
        if (document.getElementById('medCount')) document.getElementById('medCount').textContent = med;
        if (document.getElementById('lowCount')) document.getElementById('lowCount').textContent = low;

        // Render table
        const tbody = document.getElementById('applicantTableBody');
        if (tbody) {
            tbody.innerHTML = apps.map(app => {
                const color = app.hiringProbability >= 85 ? '#10b981' : app.hiringProbability >= 60 ? '#f59e0b' : '#ef4444';
                const rec = app.recommendation || 'N/A';
                return `<tr style="border-bottom:1px solid var(--border-color);">
                    <td style="padding:1rem 1.5rem;"><div style="font-weight:600;color:var(--text-main);">${sanitize(app.studentId?.name || 'Unknown')}</div><div style="font-size:0.75rem;color:var(--text-muted);">${sanitize(app.studentId?.email || '')}</div></td>
                    <td style="padding:1rem 1.5rem;"><div style="display:flex;align-items:center;gap:0.5rem;"><div style="font-weight:700;color:${color};">${app.skillMatch}%</div><div style="width:60px;height:6px;background:var(--bg-muted);border-radius:3px;overflow:hidden;"><div style="width:${app.skillMatch}%;height:100%;background:${color};"></div></div></div></td>
                    <td style="padding:1rem 1.5rem;"><span style="background:${color}20;color:${color};padding:0.2rem 0.6rem;border-radius:4px;font-size:0.75rem;font-weight:600;">${rec}</span></td>
                    <td style="padding:1rem 1.5rem;color:var(--text-muted);font-size:0.875rem;">${sanitize(app.studentProfile?.experience || 'N/A')}</td>
                    <td style="padding:1rem 1.5rem;"><span style="color:${app.status === 'rejected' ? '#ef4444' : 'var(--primary)'};font-weight:600;font-size:0.875rem;">${app.status}</span></td>
                    <td style="padding:1rem 1.5rem;">
                        <select onchange="updateStatus('${app._id}', this.value)" style="padding:0.3rem 0.5rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.75rem;background:var(--bg-muted);color:var(--text-main);">
                            <option value="new" ${app.status === 'new' ? 'selected' : ''}>new</option>
                            <option value="in-review" ${app.status === 'in-review' ? 'selected' : ''}>in-review</option>
                            <option value="shortlisted" ${app.status === 'shortlisted' ? 'selected' : ''}>shortlisted</option>
                            <option value="interview" ${app.status === 'interview' ? 'selected' : ''}>interview</option>
                            <option value="selected" ${app.status === 'selected' ? 'selected' : ''}>selected</option>
                            <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>rejected</option>
                        </select>
                    </td>
                </tr>`;
            }).join('');
        }
    } catch (e) { console.log('Applicants error:', e.message); }

    // Sort handler
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.addEventListener('change', () => window.location.reload());
});

window.updateStatus = async function(appId, status) {
    try {
        await API.put(`/applications/${appId}/status`, { status });
        if (typeof showToast === 'function') showToast('Status updated successfully!', 'success');
        else alert('Status updated!');
    } catch (e) {
        if (typeof showToast === 'function') showToast(e.message, 'error');
        else alert(e.message);
    }
};

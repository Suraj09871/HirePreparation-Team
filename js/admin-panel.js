const adminTitles={dashboard:'📊 Analytics Dashboard',users:'👥 User Management',companies:'🏢 Company Verification',content:'📝 Content Management',monitoring:'📡 Platform Monitoring',notifications:'🔔 Notifications',reports:'📑 Reports & Export',matching:'🎯 Matching Logic'};
document.addEventListener('DOMContentLoaded',()=>{
    if(!API.isLoggedIn())return window.location.href='/frontend/auth.html';
    const u=API.getUser();if(u.role!=='admin')return window.location.href='/index.html';
    document.getElementById('adminName').textContent=u.name;
    document.getElementById('adminAvatar').textContent=u.name.charAt(0);
    document.getElementById('adminSignOut').addEventListener('click',()=>handleLogout());
    document.querySelectorAll('.admin-sidebar .nav-item').forEach(item=>{
        item.addEventListener('click',()=>{
            document.querySelectorAll('.admin-sidebar .nav-item').forEach(n=>n.classList.remove('active'));
            item.classList.add('active');const s=item.dataset.section;
            document.getElementById('adminTitle').textContent=adminTitles[s]||s;
            loadSection(s);
        });
    });
    loadSection('dashboard');
});
function ac(){return document.getElementById('adminContent');}
async function loadSection(s){
    const c=ac();c.innerHTML='<div style="text-align:center;padding:3rem;color:var(--text-muted);">Loading...</div>';
    try{
        if(s==='dashboard')await renderDashboard(c);
        else if(s==='users')await renderUsers(c);
        else if(s==='companies')await renderCompanies(c);
        else if(s==='content')renderContent(c);
        else if(s==='questions')await renderQuestions(c);
        else if(s==='roadmaps')await renderRoadmaps(c);
        else if(s==='monitoring')await renderMonitoring(c);
        else if(s==='notifications')renderNotifications(c);
        else if(s==='reports')renderReports(c);
        else if(s==='matching')renderMatching(c);
    }catch(e){c.innerHTML=`<div style="color:#ef4444;padding:2rem;">Error: ${e.message}</div>`;}
}
async function renderDashboard(c){
    const stats=await API.get('/admin/stats');const s=stats.stats||{};
    const analytics=await API.get('/admin/analytics');
    c.innerHTML=`
    <div class="stat-grid">
        <div class="stat-card"><div class="label">🎓 Students</div><div class="value">${s.students||0}</div></div>
        <div class="stat-card"><div class="label">💼 Recruiters</div><div class="value">${s.recruiters||0}</div></div>
        <div class="stat-card"><div class="label">📋 Jobs</div><div class="value">${s.jobs||0}</div></div>
        <div class="stat-card"><div class="label">📄 Applications</div><div class="value">${s.applications||0}</div></div>
        <div class="stat-card"><div class="label">📈 Conversion</div><div class="value" style="color:#10b981;">${analytics.conversionRate||23.5}%</div></div>
    </div>
    <div class="chart-row">
        <div class="chart-box"><h3>📈 User Growth</h3><div style="position:relative; height:200px;"><canvas id="userGrowthChart"></canvas></div></div>
        <div class="chart-box"><h3>📊 Application Trend</h3><div style="position:relative; height:200px;"><canvas id="appTrendChart"></canvas></div></div>
    </div>
    <div class="chart-row">
        <div class="chart-box"><h3>👥 Role Distribution</h3><div style="position:relative; height:200px;"><canvas id="roleChart"></canvas></div></div>
        <div class="chart-box"><h3>🏆 Performance Distribution</h3><div style="position:relative; height:200px;"><canvas id="perfChart"></canvas></div></div>
    </div>
    <div class="chart-row">
        <div class="chart-box"><h3>🏢 Top Companies by Applications</h3><div style="position:relative; height:200px;"><canvas id="companyChart"></canvas></div></div>
        <div class="chart-box"><h3>🟢 Active vs Inactive Users</h3><div style="position:relative; height:200px;"><canvas id="activeChart"></canvas></div></div>
    </div>`;
    const ug=analytics.userGrowth||{labels:[],data:[]};
    new Chart(document.getElementById('userGrowthChart'),{type:'line',data:{labels:ug.labels,datasets:[{label:'Users',data:ug.data,borderColor:'#8b5cf6',backgroundColor:'rgba(139,92,246,0.1)',fill:true,tension:0.4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}}});
    const at=analytics.applicationTrend||{labels:[],data:[]};
    new Chart(document.getElementById('appTrendChart'),{type:'bar',data:{labels:at.labels,datasets:[{label:'Applications',data:at.data,backgroundColor:'#f97316'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}}});
    const rd=analytics.roleDistribution||{};
    new Chart(document.getElementById('roleChart'),{type:'doughnut',data:{labels:['Students','Recruiters','Admins'],datasets:[{data:[rd.students||0,rd.recruiters||0,rd.admins||0],backgroundColor:['#3b82f6','#f59e0b','#8b5cf6']}]},options:{responsive:true,maintainAspectRatio:false}});
    const pd=analytics.performanceDistribution||{};
    new Chart(document.getElementById('perfChart'),{type:'bar',data:{labels:['Top 10%','Top 25%','Average','Below Avg'],datasets:[{data:[pd.top10||0,pd.top25||0,pd.average||0,pd.belowAvg||0],backgroundColor:['#10b981','#3b82f6','#f59e0b','#ef4444']}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}}});
    const tc=analytics.topCompanies||[];
    new Chart(document.getElementById('companyChart'),{type:'bar',data:{labels:tc.map(x=>x.name),datasets:[{data:tc.map(x=>x.apps),backgroundColor:'#6366f1'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},indexAxis:'y'}});
    const av=analytics.activeVsInactive||{};
    new Chart(document.getElementById('activeChart'),{type:'doughnut',data:{labels:['Active','Inactive'],datasets:[{data:[av.active||0,av.inactive||0],backgroundColor:['#10b981','#94a3b8']}]},options:{responsive:true,maintainAspectRatio:false}});
}
async function renderUsers(c){
    const data=await API.get('/admin/users');const users=data.users||[];
    c.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
        <span style="font-size:0.9rem;color:var(--text-muted);">${users.length} total users</span>
        <input id="userSearch" placeholder="Search users..." style="padding:0.5rem 1rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;width:250px;">
    </div>
    <div style="background:white;border-radius:12px;border:1px solid var(--border-color);overflow:hidden;">
        <table class="tbl"><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
        <tbody id="userTableBody">${users.map(u=>`<tr>
            <td><div style="display:flex;align-items:center;gap:0.75rem;"><div style="width:32px;height:32px;border-radius:50%;background:${u.role==='admin'?'#8b5cf6':u.role==='recruiter'?'#3b82f6':'#f97316'};color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.7rem;">${u.name.charAt(0)}</div><span style="font-weight:600;">${u.name}</span></div></td>
            <td style="color:var(--text-muted);">${u.email}</td>
            <td><span style="padding:0.15rem 0.5rem;border-radius:999px;font-size:0.7rem;font-weight:600;${u.role==='admin'?'background:#8b5cf6;color:white;':u.role==='recruiter'?'background:#dbeafe;color:#2563eb;':'background:#f1f5f9;color:#475569;'}">${u.role}</span></td>
            <td style="font-size:0.8rem;color:var(--text-muted);">${new Date(u.createdAt).toLocaleDateString()}</td>
            <td>${u.role!=='admin'?`<button onclick="deleteUser('${u._id}')" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:1.1rem;" title="Delete">🗑</button>`:''}</td>
        </tr>`).join('')}</tbody></table>
    </div>`;
}
async function renderCompanies(c){
    const data=await API.get('/admin/companies');const companies=data.companies||[];
    const pending=companies.filter(x=>!x.isVerified).length;
    c.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
        <span style="font-size:0.9rem;color:var(--text-muted);">${companies.length} companies</span>
        <span style="background:#fef3c7;color:#d97706;padding:0.25rem 0.75rem;border-radius:999px;font-size:0.8rem;font-weight:600;">${pending} Pending</span>
    </div>
    <div style="background:white;border-radius:12px;border:1px solid var(--border-color);overflow:hidden;">
        <table class="tbl"><thead><tr><th>Company</th><th>Website</th><th>Industry</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${companies.map(co=>`<tr>
            <td style="font-weight:600;">${co.name}</td>
            <td><a href="https://${co.website}" target="_blank" style="color:var(--primary);text-decoration:none;font-size:0.85rem;">${co.website}</a></td>
            <td style="color:var(--text-muted);">${co.industry||'-'}</td>
            <td><span style="padding:0.15rem 0.5rem;border-radius:999px;font-size:0.7rem;font-weight:600;background:${co.isVerified?'rgba(16,185,129,0.1)':'#fef3c7'};color:${co.isVerified?'#10b981':'#d97706'};">${co.isVerified?'Verified':'Pending'}</span></td>
            <td>${!co.isVerified?`<button onclick="verifyCompany('${co._id}',true)" class="btn btn-primary" style="padding:0.3rem 0.6rem;font-size:0.7rem;margin-right:0.25rem;">✓</button><button onclick="verifyCompany('${co._id}',false)" class="btn btn-outline" style="padding:0.3rem 0.6rem;font-size:0.7rem;color:#ef4444;border-color:#ef4444;">✕</button>`:'<span style="color:var(--text-muted);font-size:0.8rem;">✓ Done</span>'}</td>
        </tr>`).join('')}</tbody></table>
    </div>`;
}
function renderContent(c){
    c.innerHTML=`<div class="chart-row"><div class="chart-box" style="grid-column:span 2;">
        <h3>📝 Content Management</h3>
        <p style="color:var(--text-muted);margin-bottom:1.5rem;">Manage companies, questions, and preparation content.</p>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;">
            <div style="background:var(--bg-muted);border-radius:12px;padding:1.5rem;text-align:center;border:1px solid var(--border-color);">
                <div style="font-size:2rem;margin-bottom:0.5rem;">🏢</div><h4 style="margin-bottom:0.5rem;">Companies</h4>
                <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem;">Add, edit, or remove companies</p>
                <button class="btn btn-primary" style="font-size:0.8rem;" onclick="loadSection('companies')">Manage</button>
            </div>
            <div style="background:var(--bg-muted);border-radius:12px;padding:1.5rem;text-align:center;border:1px solid var(--border-color);">
                <div style="font-size:2rem;margin-bottom:0.5rem;">❓</div><h4 style="margin-bottom:0.5rem;">Questions</h4>
                <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem;">Manage interview questions</p>
                <button class="btn btn-primary" style="font-size:0.8rem;" onclick="loadSection('questions')">Manage</button>
            </div>
            <div style="background:var(--bg-muted);border-radius:12px;padding:1.5rem;text-align:center;border:1px solid var(--border-color);">
                <div style="font-size:2rem;margin-bottom:0.5rem;">🗺</div><h4 style="margin-bottom:0.5rem;">Roadmaps</h4>
                <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem;">Manage preparation roadmaps</p>
                <button class="btn btn-primary" style="font-size:0.8rem;" onclick="loadSection('roadmaps')">Manage</button>
            </div>
        </div>
    </div></div>`;
}
async function renderQuestions(c){
    c.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
        <span style="font-size:0.9rem;color:var(--text-muted);">Questions Database</span>
        <button class="btn btn-primary" style="font-size:0.8rem;">+ Add Question</button>
    </div>
    <div style="background:white;border-radius:12px;border:1px solid var(--border-color);overflow:hidden;">
        <table class="tbl"><thead><tr><th>ID</th><th>Title</th><th>Topic</th><th>Type</th><th>Difficulty</th><th>Company</th></tr></thead>
        <tbody id="questionsTableBody"><tr><td colspan="6" style="text-align:center;padding:2rem;">Loading questions...</td></tr></tbody></table>
    </div>`;
    try {
        const res = await fetch('../../data/questions.json');
        const data = await res.json();
        const allQuestions = [...(data.coding||[]), ...(data.mcq||[]), ...(data.aptitude||[])].slice(0, 15);
        document.getElementById('questionsTableBody').innerHTML = allQuestions.map(q => `<tr>
            <td style="color:var(--text-muted);font-size:0.8rem;">${q.id}</td>
            <td style="font-weight:600;">${q.title}</td>
            <td><span style="background:var(--bg-muted);padding:0.2rem 0.5rem;border-radius:4px;font-size:0.75rem;">${q.topic||'-'}</span></td>
            <td>${q.type||'Coding'}</td>
            <td><span style="color:${q.difficulty==='Easy'?'#10b981':q.difficulty==='Medium'?'#f59e0b':'#ef4444'};">${q.difficulty}</span></td>
            <td>${q.company||'-'}</td>
        </tr>`).join('');
    } catch(e) { document.getElementById('questionsTableBody').innerHTML = `<tr><td colspan="6">Failed to load questions</td></tr>`; }
}
async function renderRoadmaps(c){
    const data = await API.get('/preparation');
    const paths = data.preparations || data.paths || [];
    c.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
        <span style="font-size:0.9rem;color:var(--text-muted);">${paths.length} Roadmaps</span>
        <button class="btn btn-primary" style="font-size:0.8rem;">+ Create Roadmap</button>
    </div>
    <div style="background:white;border-radius:12px;border:1px solid var(--border-color);overflow:hidden;">
        <table class="tbl"><thead><tr><th>Company / Path</th><th>Questions</th><th>Topics</th><th>Difficulty</th><th>Actions</th></tr></thead>
        <tbody>${paths.map(p=>`<tr>
            <td style="font-weight:600;"><div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:24px;height:24px;background:var(--primary);color:white;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;">${p.companyName.charAt(0)}</div>${p.companyName}</div></td>
            <td>${p.questionCount}</td>
            <td>${p.topicCount}</td>
            <td><span style="color:${p.difficulty==='Easy'?'#10b981':p.difficulty==='Medium'?'#f59e0b':'#ef4444'};">${p.difficulty}</span></td>
            <td><button class="btn btn-outline" style="padding:0.25rem 0.5rem;font-size:0.7rem;">Edit</button></td>
        </tr>`).join('')}</tbody></table>
    </div>`;
}
async function renderMonitoring(c){
    const logs=await API.get('/admin/activity-log');const items=logs.logs||[];
    c.innerHTML=`<div class="stat-grid" style="grid-template-columns:repeat(3,1fr);">
        <div class="stat-card"><div class="label">📡 API Status</div><div class="value" style="color:#10b981;font-size:1.5rem;">Healthy</div></div>
        <div class="stat-card"><div class="label">⏱ Uptime</div><div class="value" style="font-size:1.5rem;">99.9%</div></div>
        <div class="stat-card"><div class="label">⚠ Errors (24h)</div><div class="value" style="color:#f59e0b;font-size:1.5rem;">3</div></div>
    </div>
    <div style="background:white;border-radius:12px;border:1px solid var(--border-color);overflow:hidden;">
        <div style="padding:1rem 1.25rem;border-bottom:1px solid var(--border-color);"><h3 style="margin:0;font-size:1rem;">📋 Recent Activity</h3></div>
        <table class="tbl"><thead><tr><th>Action</th><th>User</th><th>Time</th></tr></thead>
        <tbody>${items.map(l=>`<tr><td style="font-weight:500;">${l.action}</td><td style="color:var(--text-muted);">${l.user}</td><td style="font-size:0.8rem;color:var(--text-muted);">${new Date(l.timestamp).toLocaleString()}</td></tr>`).join('')}</tbody></table>
    </div>`;
}
function renderNotifications(c){
    c.innerHTML=`<div class="chart-box" style="margin-bottom:1.5rem;">
        <h3>📢 Send Announcement</h3>
        <div style="margin-top:1rem;">
            <input id="notifTitle" placeholder="Title" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;margin-bottom:0.75rem;font-size:0.9rem;">
            <textarea id="notifMsg" placeholder="Message..." rows="3" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;margin-bottom:0.75rem;font-size:0.9rem;font-family:Inter;resize:vertical;"></textarea>
            <select id="notifTarget" style="padding:0.5rem;border:1px solid var(--border-color);border-radius:8px;margin-right:0.5rem;">
                <option value="all">All Users</option><option value="student">Students Only</option><option value="recruiter">Recruiters Only</option>
            </select>
            <button class="btn btn-primary" onclick="sendNotification()">Send</button>
        </div>
    </div>`;
}
function renderReports(c){
    c.innerHTML=`<div class="chart-row"><div class="chart-box" style="grid-column:span 2;">
        <h3>📑 Export Reports</h3>
        <p style="color:var(--text-muted);margin-bottom:1.5rem;">Download data as CSV files.</p>
        <div style="display:flex;gap:1rem;flex-wrap:wrap;">
            <button class="btn btn-outline" onclick="exportCSV('users')">👥 Export Users</button>
            <button class="btn btn-outline" onclick="exportCSV('applications')">📄 Export Applications</button>
            <button class="btn btn-outline" onclick="exportCSV('analytics')">📊 Export Analytics</button>
            <button class="btn btn-outline" onclick="exportCSV('jobs')">💼 Export Jobs</button>
        </div>
    </div></div>`;
}
function renderMatching(c){
    c.innerHTML=`<div class="chart-box">
        <h3>🎯 Matching Algorithm Transparency</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-top:1.5rem;">
            <div style="background:var(--bg-muted);border-radius:12px;padding:1.5rem;border:1px solid var(--border-color);">
                <h4 style="margin-bottom:1rem;">Match % Calculation</h4>
                <div style="font-size:0.85rem;color:var(--text-muted);line-height:1.8;">
                    <div>• <b>Skill Match (40%)</b>: matched_skills / required_skills</div>
                    <div>• <b>Experience Score (25%)</b>: experience level alignment</div>
                    <div>• <b>Resume Completeness (20%)</b>: profile fields filled</div>
                    <div>• <b>Education Match (15%)</b>: degree relevance</div>
                </div>
            </div>
            <div style="background:var(--bg-muted);border-radius:12px;padding:1.5rem;border:1px solid var(--border-color);">
                <h4 style="margin-bottom:1rem;">Hiring Probability</h4>
                <div style="font-size:0.85rem;color:var(--text-muted);line-height:1.8;">
                    <div>• <b>High (70-100%)</b>: Strong match across all factors</div>
                    <div>• <b>Medium (40-69%)</b>: Partial match, some gaps</div>
                    <div>• <b>Low (0-39%)</b>: Significant skill/experience gaps</div>
                </div>
            </div>
        </div>
    </div>`;
}
async function deleteUser(id){if(!confirm('Delete this user?'))return;try{await API.del(`/admin/users/${id}`);showToast('User deleted');loadSection('users');}catch(e){showToast(e.message,'error');}}
async function verifyCompany(id,approve){try{await API.put(`/admin/companies/${id}/verify`,{approve});showToast(approve?'Company approved':'Company rejected');loadSection('companies');}catch(e){showToast(e.message,'error');}}
async function sendNotification(){const t=document.getElementById('notifTitle').value;const m=document.getElementById('notifMsg').value;if(!t||!m)return showToast('Fill all fields','error');try{await API.post('/admin/notifications/send',{title:t,message:m,target:document.getElementById('notifTarget').value});showToast('Notification sent!');document.getElementById('notifTitle').value='';document.getElementById('notifMsg').value='';}catch(e){showToast(e.message,'error');}}
function exportCSV(type){const rows=[['Name','Email','Role','Date'],...(MockAPI._adminUsers().map(u=>[u.name,u.email,u.role,u.createdAt]))];const csv=rows.map(r=>r.join(',')).join('\n');const blob=new Blob([csv],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`hiresmart_${type}_export.csv`;a.click();showToast(`${type} exported!`);}

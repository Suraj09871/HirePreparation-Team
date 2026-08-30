/**
 * Resume Builder — Complete Multi-Template Engine with:
 * 1. Client-Side PDF, DOCX, TXT, MD Resume Extraction
 * 2. Overleaf-Style Code Mode (LaTeX & Markdown Compiler)
 * 3. Line Spacing, Typography & Color Controls
 * 4. Interactive Visual Form & Demo Loader
 */

// Global State
const resumeState = {
    mode: 'visual', // 'visual' | 'code'
    template: 'modern', // 'modern' | 'classic' | 'minimal' | 'executive'
    accentColor: '#f97316',
    lineSpacing: 'normal', // 'compact' | 'normal' | 'relaxed' | 'wide'
    fontSize: 'medium', // 'small' | 'medium' | 'large'
    data: {
        name: 'Suraj Kumar',
        title: 'Full Stack Software Engineer',
        email: 'suraj.kumar@hireprep.com',
        phone: '+91 98765 43210',
        location: 'Bangalore, India',
        portfolio: 'linkedin.com/in/surajkumar-dev',
        summary: 'Results-driven Full Stack Engineer with 3+ years experience building scalable web applications, real-time microservices, and AI-powered interview matching pipelines.',
        skills: ['JavaScript (ES6+)', 'Node.js', 'React', 'MongoDB', 'Express.js', 'Docker', 'REST APIs', 'System Design', 'Python', 'AWS'],
        experience: [
            { title: 'Software Engineer', company: 'TechNova Solutions', duration: '2023 - Present', location: 'Bangalore', desc: 'Architected high-throughput REST APIs handling 5M+ daily requests. Improved database indexing to reduce p99 query latency by 45%.' },
            { title: 'Full Stack Developer Intern', company: 'CloudScale Inc.', duration: '2022 - 2023', location: 'Remote', desc: 'Developed responsive React frontend dashboards and automated CI/CD deployment pipelines using Docker and GitHub Actions.' }
        ],
        education: [
            { degree: 'B.Tech in Computer Science & Engineering', institution: 'Delhi Technological University', year: '2019 - 2023', grade: '8.8 CGPA' }
        ],
        projects: [
            { title: 'HirePrep Platform', tech: 'Node.js, Express, MongoDB, Vanilla JS', desc: 'Designed and built an end-to-end placement preparation platform with intelligent candidate ranking and automated company prep pathways.' },
            { title: 'Real-Time Notification Engine', tech: 'Node.js, Redis, WebSockets, Docker', desc: 'Implemented Redis pub-sub messaging architecture capable of broadcasting 10,000 real-time events per second.' }
        ],
        certifications: [
            { name: 'AWS Certified Solutions Architect – Associate', year: '2024' },
            { name: 'MongoDB Certified Developer Associate', year: '2023' }
        ]
    }
};

// ══════════════ 1. RESUME FILE EXTRACTION (PDF, DOCX, TXT) ══════════════

function showResumeAuthModal(msg) {
    let modal = document.getElementById('resumeAuthModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'resumeAuthModal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:99999;padding:1.5rem;';
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div style="background:var(--card-bg, #ffffff);color:var(--text-main, #0f172a);border-radius:16px;padding:2rem;max-width:440px;width:100%;box-shadow:0 20px 40px rgba(0,0,0,0.3);border:1px solid var(--border-color);text-align:center;">
            <div style="font-size:2.5rem;margin-bottom:0.75rem;">🔒</div>
            <h3 style="margin:0 0 0.5rem;font-size:1.2rem;font-weight:700;">Sign In Required</h3>
            <p style="font-size:0.875rem;color:var(--text-muted);margin:0 0 1.5rem;line-height:1.5;">${msg || 'Please sign in to save your resume, extract old resumes, and download ATS-ready PDF.'}</p>
            <a href="../auth.html?redirect=resume" class="btn btn-primary" style="display:block;width:100%;padding:0.75rem;border-radius:8px;font-weight:600;text-decoration:none;margin-bottom:0.75rem;">Sign In / Sign Up →</a>
            <button onclick="document.getElementById('resumeAuthModal').style.display='none'" class="btn btn-outline" style="width:100%;padding:0.6rem;font-size:0.85rem;border-radius:8px;cursor:pointer;">Continue Previewing Templates</button>
        </div>
    `;
    modal.style.display = 'flex';
}

async function handleResumeUpload(file) {
    if (!file) return;

    if (typeof API !== 'undefined' && !API.isLoggedIn()) {
        showResumeAuthModal('Sign in to upload and auto-extract information from your previous resumes.');
        return;
    }

    const statusEl = document.getElementById('uploadStatusMessage');
    if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.textContent = `⏳ Reading & parsing "${file.name}"...`;
    }

    try {
        let extractedText = '';
        const fileName = file.name.toLowerCase();

        if (fileName.endsWith('.pdf')) {
            extractedText = await extractTextFromPDF(file);
        } else if (fileName.endsWith('.docx') && window.mammoth) {
            extractedText = await extractTextFromDOCX(file);
        } else {
            // Plain text / Markdown / JSON
            extractedText = await readFileAsText(file);
        }

        if (!extractedText || extractedText.trim().length === 0) {
            throw new Error('Could not extract text from this file. Please ensure it is not scanned/empty image.');
        }

        // Parse extracted text into structured resume fields
        parseAndPopulateResume(extractedText, file.name);

        if (statusEl) {
            statusEl.textContent = `✅ Successfully extracted & populated from "${file.name}"!`;
            setTimeout(() => { statusEl.style.display = 'none'; }, 6000);
        }
        if (typeof showToast === 'function') {
            showToast(`Resume "${file.name}" parsed! Details auto-filled into form.`, 'success');
        }
    } catch (err) {
        console.error('Resume parsing error:', err);
        if (statusEl) {
            statusEl.textContent = `❌ Parsing failed: ${err.message}`;
        }
        if (typeof showToast === 'function') {
            showToast(`Upload failed: ${err.message}`, 'error');
        }
    }
}

// Extract text using PDF.js
function extractTextFromPDF(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = async function () {
            try {
                if (!window.pdfjsLib) {
                    throw new Error('PDF.js library not loaded.');
                }
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                const typedarray = new Uint8Array(this.result);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + '\n';
                }
                resolve(fullText);
            } catch (e) {
                reject(e);
            }
        };
        fileReader.onerror = reject;
        fileReader.readAsArrayBuffer(file);
    });
}

// Extract text using Mammoth.js for DOCX
function extractTextFromDOCX(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            mammoth.extractRawText({ arrayBuffer: event.target.result })
                .then(result => resolve(result.value))
                .catch(reject);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// Intelligent Parser: Detects Name, Email, Phone, Links, Skills, Experience, Education, Projects
function parseAndPopulateResume(text, fileName) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const fullText = text;

    // 1. Email
    const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) resumeState.data.email = emailMatch[0];

    // 2. Phone
    const phoneMatch = fullText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}|\+?\d{10,13}/);
    if (phoneMatch) resumeState.data.phone = phoneMatch[0];

    // 3. Links (LinkedIn, GitHub, Portfolio)
    const linkMatch = fullText.match(/(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com\/in\/|github\.com\/)[a-zA-Z0-9_-]+/i);
    if (linkMatch) resumeState.data.portfolio = linkMatch[0].replace(/^https?:\/\//, '');

    // 4. Name (usually first clean line without email/phone/special chars)
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
        const line = lines[i];
        if (line.length > 2 && line.length < 40 && !line.includes('@') && !line.includes('http') && !/\d{5,}/.test(line) && !line.toLowerCase().includes('resume') && !line.toLowerCase().includes('curriculum')) {
            resumeState.data.name = line;
            break;
        }
    }

    // 5. Professional Title
    const titleKeywords = [
        'Full Stack Developer', 'Software Engineer', 'Frontend Developer', 'Backend Developer',
        'Data Scientist', 'DevOps Engineer', 'Machine Learning Engineer', 'Web Developer',
        'Mobile Developer', 'Product Manager', 'Cloud Engineer', 'Software Developer'
    ];
    for (const kw of titleKeywords) {
        if (new RegExp('\\b' + kw + '\\b', 'i').test(fullText)) {
            resumeState.data.title = kw;
            break;
        }
    }

    // 6. Comprehensive Tech Skills dictionary matching
    const skillDictionary = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
        'React', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'FastAPI',
        'HTML5', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'Sass', 'Redux', 'GraphQL', 'REST APIs', 'WebSockets',
        'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite', 'Oracle', 'Cassandra', 'Elasticsearch', 'DynamoDB',
        'Docker', 'Kubernetes', 'AWS', 'Google Cloud', 'GCP', 'Azure', 'Linux', 'Git', 'GitHub', 'CI/CD', 'Terraform',
        'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'Pandas', 'NumPy',
        'System Design', 'Microservices', 'Unit Testing', 'Jest', 'Mocha', 'Cypress', 'Agile', 'Scrum'
    ];

    const detectedSkills = [];
    for (const skill of skillDictionary) {
        const regex = new RegExp(`\\b${skill.replace(/[+]/g, '\\+')}\\b`, 'i');
        if (regex.test(fullText) && !detectedSkills.includes(skill)) {
            detectedSkills.push(skill);
        }
    }
    if (detectedSkills.length > 0) {
        resumeState.data.skills = detectedSkills;
    }

    // 7. Location (look for common cities or patterns like City, State)
    const locMatch = fullText.match(/\b(Bangalore|Bengaluru|New Delhi|Delhi|Mumbai|Pune|Hyderabad|Chennai|Kolkata|Noida|Gurgaon|San Francisco|New York|London|Remote|Seattle|Austin|Boston)\b/i);
    if (locMatch) {
        resumeState.data.location = locMatch[0] + (locMatch[0].toLowerCase() === 'remote' ? '' : ', India');
    }

    // 8. Summary / Objective
    const summaryMatch = fullText.match(/(?:SUMMARY|PROFESSIONAL SUMMARY|ABOUT ME|PROFILE|OBJECTIVE)[\s:]*([^\n\r]+(?:\n[^\n\r]+){1,4})/i);
    if (summaryMatch && summaryMatch[1].trim().length > 30) {
        resumeState.data.summary = summaryMatch[1].replace(/\s+/g, ' ').trim();
    }

    // Update Form Inputs in UI
    populateVisualFormFromState();
    updatePreview();
    syncVisualFormToCode();
}

// Populate UI form inputs from resumeState.data
function populateVisualFormFromState() {
    const d = resumeState.data;
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };

    setVal('rbName', d.name);
    setVal('rbTitle', d.title);
    setVal('rbEmail', d.email);
    setVal('rbPhone', d.phone);
    setVal('rbLocation', d.location);
    setVal('rbPortfolio', d.portfolio);
    setVal('rbSummary', d.summary);
    setVal('rbSkills', (d.skills || []).join(', '));

    // Rebuild Experience DOM entries
    const expContainer = document.getElementById('experienceEntries');
    if (expContainer && d.experience && d.experience.length > 0) {
        expContainer.innerHTML = '';
        d.experience.forEach(exp => {
            const div = document.createElement('div');
            div.className = 'exp-entry';
            div.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--border-color);';
            div.innerHTML = `
                <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Job Title</label><input type="text" class="rbExpTitle" value="${sanitize(exp.title || '')}" placeholder="Software Developer" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
                <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Company</label><input type="text" class="rbExpCompany" value="${sanitize(exp.company || '')}" placeholder="Company" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
                <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Duration</label><input type="text" class="rbExpDuration" value="${sanitize(exp.duration || '')}" placeholder="2023 - Present" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
                <div style="display:flex;align-items:end;gap:0.5rem;"><div style="flex:1;"><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Location</label><input type="text" class="rbExpLocation" value="${sanitize(exp.location || '')}" placeholder="Bangalore" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div><button type="button" onclick="this.closest('.exp-entry').remove(); updatePreview();" style="padding:0.55rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;cursor:pointer;font-size:0.8rem;color:#ef4444;" title="Delete Role">✕</button></div>
                <div style="grid-column: span 2;"><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Description / Responsibilities</label><textarea class="rbExpDesc" placeholder="Key responsibilities..." style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);min-height:60px;font-family:inherit;resize:vertical;">${sanitize(exp.desc || '')}</textarea></div>
            `;
            expContainer.appendChild(div);
        });
    }

    // Rebuild Education DOM entries
    const eduContainer = document.getElementById('educationEntries');
    if (eduContainer && d.education && d.education.length > 0) {
        eduContainer.innerHTML = '';
        d.education.forEach(edu => {
            const div = document.createElement('div');
            div.className = 'edu-entry';
            div.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--border-color);';
            div.innerHTML = `
                <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Degree / Course</label><input type="text" class="rbEduDegree" value="${sanitize(edu.degree || '')}" placeholder="B.Tech Computer Science" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
                <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Institution</label><input type="text" class="rbEduInstitution" value="${sanitize(edu.institution || '')}" placeholder="IIT Delhi" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
                <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Year</label><input type="text" class="rbEduYear" value="${sanitize(edu.year || '')}" placeholder="2020 - 2024" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
                <div style="display:flex;align-items:end;gap:0.5rem;"><div style="flex:1;"><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Grade / CGPA</label><input type="text" class="rbEduGrade" value="${sanitize(edu.grade || '')}" placeholder="8.5 CGPA" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div><button type="button" onclick="this.closest('.edu-entry').remove(); updatePreview();" style="padding:0.55rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;cursor:pointer;font-size:0.8rem;color:#ef4444;" title="Delete Education">✕</button></div>
            `;
            eduContainer.appendChild(div);
        });
    }
}

// ══════════════ 2. DYNAMIC FORM ENTRIES ADD HANDLERS ══════════════

function addExperienceEntry() {
    const container = document.getElementById('experienceEntries');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'exp-entry';
    div.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--border-color);';
    div.innerHTML = `
        <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Job Title</label><input type="text" class="rbExpTitle" placeholder="Frontend Developer" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
        <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Company</label><input type="text" class="rbExpCompany" placeholder="Amazon / Flipkart" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
        <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Duration</label><input type="text" class="rbExpDuration" placeholder="2023 - 2024" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
        <div style="display:flex;align-items:end;gap:0.5rem;"><div style="flex:1;"><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Location</label><input type="text" class="rbExpLocation" placeholder="Delhi" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div><button type="button" onclick="this.closest('.exp-entry').remove(); updatePreview();" style="padding:0.55rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;cursor:pointer;font-size:0.8rem;color:#ef4444;">✕</button></div>
        <div style="grid-column: span 2;"><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Description / Responsibilities</label><textarea class="rbExpDesc" placeholder="Responsibilities and accomplishments..." style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);min-height:60px;font-family:inherit;resize:vertical;"></textarea></div>
    `;
    container.appendChild(div);
    updatePreview();
}

function addEducationEntry() {
    const container = document.getElementById('educationEntries');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'edu-entry';
    div.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--border-color);';
    div.innerHTML = `
        <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Degree / Course</label><input type="text" class="rbEduDegree" placeholder="Master of Computer Applications" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
        <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Institution</label><input type="text" class="rbEduInstitution" placeholder="BITS Pilani" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
        <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Year</label><input type="text" class="rbEduYear" placeholder="2022 - 2024" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
        <div style="display:flex;align-items:end;gap:0.5rem;"><div style="flex:1;"><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Grade</label><input type="text" class="rbEduGrade" placeholder="9.0 CGPA" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div><button type="button" onclick="this.closest('.edu-entry').remove(); updatePreview();" style="padding:0.55rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;cursor:pointer;font-size:0.8rem;color:#ef4444;">✕</button></div>
    `;
    container.appendChild(div);
    updatePreview();
}

function addProjectEntry() {
    const container = document.getElementById('projectEntries');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'proj-entry';
    div.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--border-color);';
    div.innerHTML = `
        <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Project Title</label><input type="text" class="rbProjTitle" placeholder="E-Commerce Microservices" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
        <div style="display:flex;align-items:end;gap:0.5rem;"><div style="flex:1;"><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Tech Stack</label><input type="text" class="rbProjTech" placeholder="Node.js, Docker, Stripe" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div><button type="button" onclick="this.closest('.proj-entry').remove(); updatePreview();" style="padding:0.55rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;cursor:pointer;font-size:0.8rem;color:#ef4444;">✕</button></div>
        <div style="grid-column: span 2;"><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Description</label><textarea class="rbProjDesc" placeholder="Describe the system architecture and features..." style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);min-height:50px;font-family:inherit;resize:vertical;"></textarea></div>
    `;
    container.appendChild(div);
    updatePreview();
}

function addCertEntry() {
    const container = document.getElementById('certEntries');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'cert-entry';
    div.style.cssText = 'display:grid;grid-template-columns:2fr 1fr auto;gap:0.75rem;margin-bottom:0.75rem;align-items:center;';
    div.innerHTML = `
        <div><input type="text" class="rbCertName" placeholder="Certification Name" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
        <div><input type="text" class="rbCertYear" placeholder="Year" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
        <button type="button" onclick="this.closest('.cert-entry').remove(); updatePreview();" style="padding:0.55rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;cursor:pointer;font-size:0.8rem;color:#ef4444;">✕</button>
    `;
    container.appendChild(div);
    updatePreview();
}

// ══════════════ 3. OVERLEAF & CODE MODE COMPILER ══════════════

function switchEditorMode(mode) {
    resumeState.mode = mode;
    const visualContainer = document.getElementById('visualModeContainer');
    const codeContainer = document.getElementById('codeModeContainer');
    const btnVisual = document.getElementById('btnModeVisual');
    const btnCode = document.getElementById('btnModeCode');

    if (mode === 'code') {
        if (visualContainer) visualContainer.style.display = 'none';
        if (codeContainer) codeContainer.style.display = 'flex';
        if (btnVisual) btnVisual.classList.remove('active');
        if (btnCode) btnCode.classList.add('active');
        syncVisualFormToCode();
    } else {
        if (visualContainer) visualContainer.style.display = 'flex';
        if (codeContainer) codeContainer.style.display = 'none';
        if (btnVisual) btnVisual.classList.add('active');
        if (btnCode) btnCode.classList.remove('active');
        compileCodeToResume();
    }
}

// Sync Visual Form data into LaTeX Code
function syncVisualFormToCode() {
    const editor = document.getElementById('resumeCodeEditor');
    if (!editor) return;

    readFormIntoState();
    const d = resumeState.data;

    const latexCode = `% =======================================================
% HirePrep Overleaf-Style LaTeX Resume Template
% Compile live with real-time preview & PDF export
% =======================================================

\\documentclass[11pt,a4paper]{resume}

\\name{${d.name}}
\\title{${d.title}}
\\email{${d.email}}
\\phone{${d.phone}}
\\location{${d.location}}
\\portfolio{${d.portfolio}}

\\begin{document}

\\section{Professional Summary}
${d.summary}

\\section{Technical Skills}
${d.skills.join(', ')}

\\section{Work Experience}
${d.experience.map(e => `\\role{${e.title}}{${e.company}}{${e.duration}}{${e.location || ''}}
\\description{${e.desc || ''}}`).join('\n\n')}

\\section{Projects}
${d.projects.map(p => `\\project{${p.title}}{${p.tech}}
\\description{${p.desc}}`).join('\n\n')}

\\section{Education}
${d.education.map(ed => `\\education{${ed.degree}}{${ed.institution}}{${ed.year}}{${ed.grade}}`).join('\n')}

\\section{Certifications}
${d.certifications.map(c => `\\certification{${c.name}}{${c.year}}`).join('\n')}

\\end{document}
`;

    editor.value = latexCode;
    updateLineCount();
}

function updateLineCount() {
    const editor = document.getElementById('resumeCodeEditor');
    const lineCountEl = document.getElementById('codeLineCount');
    if (editor && lineCountEl) {
        const lines = editor.value.split('\n').length;
        lineCountEl.textContent = `Lines: ${lines}`;
    }
}

// Parse LaTeX / Markdown from Code Editor and render into Resume State
function compileCodeToResume() {
    const editor = document.getElementById('resumeCodeEditor');
    if (!editor) return;

    const code = editor.value;
    const matchTag = (tag) => {
        const m = code.match(new RegExp('\\\\' + tag + '\\{([^\\}]+)\\}', 'i'));
        return m ? m[1].trim() : '';
    };

    const name = matchTag('name') || resumeState.data.name;
    const title = matchTag('title') || resumeState.data.title;
    const email = matchTag('email') || resumeState.data.email;
    const phone = matchTag('phone') || resumeState.data.phone;
    const location = matchTag('location') || resumeState.data.location;
    const portfolio = matchTag('portfolio') || resumeState.data.portfolio;

    // Summary
    const sumMatch = code.match(/\\section\{Professional Summary\}\s*([^\\%]+)/i);
    const summary = sumMatch ? sumMatch[1].trim() : resumeState.data.summary;

    // Skills
    const skillMatch = code.match(/\\section\{Technical Skills\}\s*([^\\%]+)/i);
    let skills = resumeState.data.skills;
    if (skillMatch) {
        skills = skillMatch[1].split(',').map(s => s.trim()).filter(s => s);
    }

    resumeState.data.name = name;
    resumeState.data.title = title;
    resumeState.data.email = email;
    resumeState.data.phone = phone;
    resumeState.data.location = location;
    resumeState.data.portfolio = portfolio;
    resumeState.data.summary = summary;
    resumeState.data.skills = skills;

    populateVisualFormFromState();
    updatePreview();
    if (typeof showToast === 'function') showToast('Code compiled to preview!', 'success');
}

function loadCodeTemplate(type) {
    const editor = document.getElementById('resumeCodeEditor');
    if (!editor) return;

    const d = resumeState.data;

    if (type === 'markdown') {
        editor.value = `# ${d.name}
**${d.title}**
✉ ${d.email} | 📱 ${d.phone} | 📍 ${d.location} | 🔗 ${d.portfolio}

---

## 📌 Professional Summary
${d.summary}

---

## 🛠 Technical Skills
${d.skills.map(s => `- **${s}**`).join('\n')}

---

## 💼 Work Experience
${d.experience.map(e => `### ${e.title} — *${e.company}* (${e.duration})
${e.desc}`).join('\n\n')}

---

## 🎓 Education
${d.education.map(ed => `- **${ed.degree}**, ${ed.institution} (${ed.year}) — *${ed.grade}*`).join('\n')}
`;
    } else if (type === 'json') {
        editor.value = JSON.stringify(resumeState.data, null, 2);
    } else {
        syncVisualFormToCode();
    }
    updateLineCount();
    compileCodeToResume();
}

// ══════════════ 4. LIVE PREVIEW COMPILER & TEMPLATE GENERATION ══════════════

function readFormIntoState() {
    const getVal = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };

    resumeState.data.name = getVal('rbName') || resumeState.data.name;
    resumeState.data.title = getVal('rbTitle') || resumeState.data.title;
    resumeState.data.email = getVal('rbEmail') || resumeState.data.email;
    resumeState.data.phone = getVal('rbPhone') || resumeState.data.phone;
    resumeState.data.location = getVal('rbLocation') || resumeState.data.location;
    resumeState.data.portfolio = getVal('rbPortfolio') || resumeState.data.portfolio;
    resumeState.data.summary = getVal('rbSummary') || resumeState.data.summary;

    const skillsInput = getVal('rbSkills');
    if (skillsInput) {
        resumeState.data.skills = skillsInput.split(',').map(s => s.trim()).filter(s => s);
    }

    // Collect experience
    const expList = [];
    document.querySelectorAll('#experienceEntries .exp-entry').forEach(entry => {
        const title = entry.querySelector('.rbExpTitle')?.value || '';
        const company = entry.querySelector('.rbExpCompany')?.value || '';
        const duration = entry.querySelector('.rbExpDuration')?.value || '';
        const location = entry.querySelector('.rbExpLocation')?.value || '';
        const desc = entry.querySelector('.rbExpDesc')?.value || '';
        if (title || company) expList.push({ title, company, duration, location, desc });
    });
    if (expList.length > 0) resumeState.data.experience = expList;

    // Collect education
    const eduList = [];
    document.querySelectorAll('#educationEntries .edu-entry').forEach(entry => {
        const degree = entry.querySelector('.rbEduDegree')?.value || '';
        const institution = entry.querySelector('.rbEduInstitution')?.value || '';
        const year = entry.querySelector('.rbEduYear')?.value || '';
        const grade = entry.querySelector('.rbEduGrade')?.value || '';
        if (degree || institution) eduList.push({ degree, institution, year, grade });
    });
    if (eduList.length > 0) resumeState.data.education = eduList;

    // Collect projects
    const projList = [];
    document.querySelectorAll('#projectEntries .proj-entry').forEach(entry => {
        const title = entry.querySelector('.rbProjTitle')?.value || '';
        const tech = entry.querySelector('.rbProjTech')?.value || '';
        const desc = entry.querySelector('.rbProjDesc')?.value || '';
        if (title) projList.push({ title, tech, desc });
    });
    if (projList.length > 0) resumeState.data.projects = projList;

    // Collect certifications
    const certList = [];
    document.querySelectorAll('#certEntries .cert-entry').forEach(entry => {
        const name = entry.querySelector('.rbCertName')?.value || '';
        const year = entry.querySelector('.rbCertYear')?.value || '';
        if (name) certList.push({ name, year });
    });
    if (certList.length > 0) resumeState.data.certifications = certList;
}

function updatePreview() {
    const container = document.getElementById('resumePreviewContent');
    if (!container) return;

    readFormIntoState();

    const d = resumeState.data;
    const tmpl = resumeState.template;
    const accent = resumeState.accentColor;

    // Compute typography scale and line height multipliers
    const spacingMultiplier = resumeState.lineSpacing === 'compact' ? '1.25' :
                              resumeState.lineSpacing === 'relaxed' ? '1.75' :
                              resumeState.lineSpacing === 'wide' ? '2.0' : '1.5';

    const baseFontSize = resumeState.fontSize === 'small' ? '12px' :
                         resumeState.fontSize === 'large' ? '15px' : '13.5px';

    const baseStyle = `font-family:'Inter', sans-serif; font-size:${baseFontSize}; line-height:${spacingMultiplier}; color:#0f172a;`;

    // ── Template 1: Modern Split Sidebar Layout ──
    if (tmpl === 'modern') {
        container.innerHTML = `
            <div style="${baseStyle} display:flex; min-height:600px; background:#ffffff; box-sizing:border-box;">
                <!-- Dark Sidebar -->
                <div style="width:35%; background:#0f172a; color:#f8fafc; padding:1.75rem 1.25rem; box-sizing:border-box;">
                    <h2 style="font-size:1.35rem; font-weight:700; margin:0 0 0.25rem; color:#ffffff; word-break:break-word;">${sanitize(d.name)}</h2>
                    <div style="font-size:0.8rem; color:${accent}; font-weight:600; margin-bottom:1.5rem;">${sanitize(d.title)}</div>
                    
                    <!-- Contact -->
                    <div style="border-top:1px solid #334155; padding-top:1rem; margin-bottom:1.25rem;">
                        <div style="font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; margin-bottom:0.6rem;">Contact</div>
                        <div style="font-size:0.75rem; color:#cbd5e1; display:flex; flex-direction:column; gap:0.4rem; word-break:break-word;">
                            <span>✉ ${sanitize(d.email)}</span>
                            <span>📱 ${sanitize(d.phone)}</span>
                            <span>📍 ${sanitize(d.location)}</span>
                            <span>🔗 ${sanitize(d.portfolio)}</span>
                        </div>
                    </div>

                    <!-- Skills -->
                    <div style="border-top:1px solid #334155; padding-top:1rem; margin-bottom:1.25rem;">
                        <div style="font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; margin-bottom:0.6rem;">Core Skills</div>
                        <div style="display:flex; flex-wrap:wrap; gap:0.35rem;">
                            ${(d.skills || []).map(s => `<span style="background:#1e293b; color:#f1f5f9; padding:0.2rem 0.5rem; border-radius:4px; font-size:0.7rem; border:1px solid #334155; font-weight:500;">${sanitize(s)}</span>`).join('')}
                        </div>
                    </div>

                    <!-- Education in Sidebar -->
                    ${(d.education || []).length > 0 ? `
                        <div style="border-top:1px solid #334155; padding-top:1rem; margin-bottom:1.25rem;">
                            <div style="font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; margin-bottom:0.6rem;">Education</div>
                            ${d.education.map(ed => `
                                <div style="margin-bottom:0.6rem;">
                                    <div style="font-size:0.75rem; font-weight:600; color:#ffffff;">${sanitize(ed.degree)}</div>
                                    <div style="font-size:0.7rem; color:#94a3b8;">${sanitize(ed.institution)}</div>
                                    <div style="font-size:0.65rem; color:${accent};">${sanitize(ed.year)} • ${sanitize(ed.grade)}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- Certifications -->
                    ${(d.certifications || []).length > 0 ? `
                        <div style="border-top:1px solid #334155; padding-top:1rem;">
                            <div style="font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; margin-bottom:0.6rem;">Certifications</div>
                            ${d.certifications.map(c => `
                                <div style="font-size:0.7rem; color:#cbd5e1; margin-bottom:0.35rem;">📜 ${sanitize(c.name)} ${c.year ? `(${sanitize(c.year)})` : ''}</div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>

                <!-- Main Content Body -->
                <div style="width:65%; padding:1.75rem 1.5rem; box-sizing:border-box; background:#ffffff;">
                    <!-- Professional Summary -->
                    <div style="margin-bottom:1.5rem;">
                        <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:${accent}; border-bottom:2px solid ${accent}; padding-bottom:0.3rem; margin-bottom:0.6rem;">Professional Summary</div>
                        <p style="margin:0; color:#334155; font-size:0.82rem; line-height:${spacingMultiplier};">${sanitize(d.summary)}</p>
                    </div>

                    <!-- Work Experience -->
                    ${(d.experience || []).length > 0 ? `
                        <div style="margin-bottom:1.5rem;">
                            <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:${accent}; border-bottom:2px solid ${accent}; padding-bottom:0.3rem; margin-bottom:0.75rem;">Experience</div>
                            ${d.experience.map(e => `
                                <div style="margin-bottom:0.9rem;">
                                    <div style="display:flex; justify-content:space-between; align-items:baseline;">
                                        <span style="font-weight:700; font-size:0.88rem; color:#0f172a;">${sanitize(e.title)}</span>
                                        <span style="font-size:0.75rem; color:#64748b; font-weight:500;">${sanitize(e.duration)}</span>
                                    </div>
                                    <div style="font-size:0.78rem; color:${accent}; font-weight:600; margin-bottom:0.25rem;">${sanitize(e.company)} ${e.location ? '• ' + sanitize(e.location) : ''}</div>
                                    <p style="margin:0; font-size:0.78rem; color:#475569; line-height:${spacingMultiplier};">${sanitize(e.desc)}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- Projects -->
                    ${(d.projects || []).length > 0 ? `
                        <div>
                            <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:${accent}; border-bottom:2px solid ${accent}; padding-bottom:0.3rem; margin-bottom:0.75rem;">Key Projects</div>
                            ${d.projects.map(p => `
                                <div style="margin-bottom:0.9rem;">
                                    <div style="display:flex; justify-content:space-between; align-items:baseline;">
                                        <span style="font-weight:700; font-size:0.85rem; color:#0f172a;">${sanitize(p.title)}</span>
                                        <span style="font-size:0.72rem; color:${accent}; font-weight:600;">${sanitize(p.tech)}</span>
                                    </div>
                                    <p style="margin:0.2rem 0 0; font-size:0.78rem; color:#475569; line-height:${spacingMultiplier};">${sanitize(p.desc)}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // ── Template 2: Classic Traditional Layout ──
    else if (tmpl === 'classic') {
        container.innerHTML = `
            <div style="${baseStyle} padding:2.25rem 2rem; background:#ffffff; min-height:600px; box-sizing:border-box;">
                <!-- Header -->
                <div style="text-align:center; border-bottom:2px solid #0f172a; padding-bottom:1.25rem; margin-bottom:1.5rem;">
                    <h1 style="font-size:1.6rem; font-weight:800; letter-spacing:0.04em; margin:0 0 0.3rem; color:#0f172a;">${sanitize(d.name.toUpperCase())}</h1>
                    <div style="font-size:0.9rem; font-weight:600; color:${accent}; margin-bottom:0.5rem;">${sanitize(d.title)}</div>
                    <div style="font-size:0.78rem; color:#475569; display:flex; justify-content:center; gap:0.75rem; flex-wrap:wrap;">
                        <span>✉ ${sanitize(d.email)}</span> • <span>📱 ${sanitize(d.phone)}</span> • <span>📍 ${sanitize(d.location)}</span> • <span>🔗 ${sanitize(d.portfolio)}</span>
                    </div>
                </div>

                <!-- Executive Summary -->
                <div style="margin-bottom:1.35rem;">
                    <h3 style="font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#0f172a; border-bottom:1px solid #cbd5e1; padding-bottom:0.3rem; margin:0 0 0.5rem;">Executive Summary</h3>
                    <p style="margin:0; font-size:0.82rem; color:#334155; line-height:${spacingMultiplier};">${sanitize(d.summary)}</p>
                </div>

                <!-- Skills -->
                <div style="margin-bottom:1.35rem;">
                    <h3 style="font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#0f172a; border-bottom:1px solid #cbd5e1; padding-bottom:0.3rem; margin:0 0 0.5rem;">Technical Competencies</h3>
                    <div style="font-size:0.8rem; color:#334155; line-height:${spacingMultiplier}; font-weight:500;">
                        ${(d.skills || []).join(' • ')}
                    </div>
                </div>

                <!-- Experience -->
                ${(d.experience || []).length > 0 ? `
                    <div style="margin-bottom:1.35rem;">
                        <h3 style="font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#0f172a; border-bottom:1px solid #cbd5e1; padding-bottom:0.3rem; margin:0 0 0.75rem;">Professional Experience</h3>
                        ${d.experience.map(e => `
                            <div style="margin-bottom:0.9rem;">
                                <div style="display:flex; justify-content:space-between;">
                                    <span style="font-weight:700; font-size:0.88rem; color:#0f172a;">${sanitize(e.title)}</span>
                                    <span style="font-size:0.75rem; color:#64748b; font-weight:600;">${sanitize(e.duration)}</span>
                                </div>
                                <div style="font-size:0.8rem; color:${accent}; font-weight:600; margin-bottom:0.25rem;">${sanitize(e.company)} ${e.location ? '· ' + sanitize(e.location) : ''}</div>
                                <p style="margin:0; font-size:0.8rem; color:#334155; line-height:${spacingMultiplier};">${sanitize(e.desc)}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Projects -->
                ${(d.projects || []).length > 0 ? `
                    <div style="margin-bottom:1.35rem;">
                        <h3 style="font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#0f172a; border-bottom:1px solid #cbd5e1; padding-bottom:0.3rem; margin:0 0 0.75rem;">Key Projects</h3>
                        ${d.projects.map(p => `
                            <div style="margin-bottom:0.75rem;">
                                <div style="display:flex; justify-content:space-between;">
                                    <span style="font-weight:700; font-size:0.85rem; color:#0f172a;">${sanitize(p.title)}</span>
                                    <span style="font-size:0.75rem; color:#64748b;">[${sanitize(p.tech)}]</span>
                                </div>
                                <p style="margin:0.2rem 0 0; font-size:0.8rem; color:#334155; line-height:${spacingMultiplier};">${sanitize(p.desc)}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Education -->
                ${(d.education || []).length > 0 ? `
                    <div style="margin-bottom:1.35rem;">
                        <h3 style="font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#0f172a; border-bottom:1px solid #cbd5e1; padding-bottom:0.3rem; margin:0 0 0.5rem;">Education</h3>
                        ${d.education.map(ed => `
                            <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
                                <div><span style="font-weight:700; font-size:0.82rem;">${sanitize(ed.degree)}</span> — <span style="color:#475569;">${sanitize(ed.institution)}</span></div>
                                <span style="font-size:0.75rem; color:#64748b; font-weight:600;">${sanitize(ed.year)} | ${sanitize(ed.grade)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Certifications -->
                ${(d.certifications || []).length > 0 ? `
                    <div>
                        <h3 style="font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#0f172a; border-bottom:1px solid #cbd5e1; padding-bottom:0.3rem; margin:0 0 0.5rem;">Certifications</h3>
                        <div style="font-size:0.8rem; color:#334155; line-height:${spacingMultiplier};">
                            ${d.certifications.map(c => `📜 ${sanitize(c.name)} (${sanitize(c.year)})`).join(' • ')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // ── Template 3: Minimal Modern Accent Layout ──
    else if (tmpl === 'minimal') {
        container.innerHTML = `
            <div style="${baseStyle} padding:2.25rem 2rem; background:#ffffff; min-height:600px; border-left:6px solid ${accent}; box-sizing:border-box;">
                <!-- Header -->
                <div style="margin-bottom:1.5rem;">
                    <h1 style="font-size:1.55rem; font-weight:800; margin:0 0 0.25rem; color:#0f172a;">${sanitize(d.name)}</h1>
                    <div style="font-size:0.9rem; font-weight:600; color:${accent};">${sanitize(d.title)}</div>
                    <div style="font-size:0.78rem; color:#64748b; margin-top:0.4rem; display:flex; gap:1rem; flex-wrap:wrap;">
                        <span>${sanitize(d.email)}</span> | <span>${sanitize(d.phone)}</span> | <span>${sanitize(d.location)}</span> | <span>${sanitize(d.portfolio)}</span>
                    </div>
                </div>

                <!-- About -->
                <div style="margin-bottom:1.35rem;">
                    <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#64748b; margin-bottom:0.4rem;">About</div>
                    <p style="margin:0; font-size:0.82rem; color:#334155; line-height:${spacingMultiplier};">${sanitize(d.summary)}</p>
                </div>

                <!-- Skills -->
                <div style="margin-bottom:1.35rem;">
                    <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#64748b; margin-bottom:0.4rem;">Skills</div>
                    <div style="display:flex; flex-wrap:wrap; gap:0.35rem;">
                        ${(d.skills || []).map(s => `<span style="background:#f8fafc; color:#0f172a; padding:0.25rem 0.55rem; border-radius:4px; font-size:0.72rem; border:1px solid #e2e8f0; font-weight:500;">${sanitize(s)}</span>`).join('')}
                    </div>
                </div>

                <!-- Experience -->
                ${(d.experience || []).length > 0 ? `
                    <div style="margin-bottom:1.35rem;">
                        <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#64748b; margin-bottom:0.6rem;">Experience</div>
                        ${d.experience.map(e => `
                            <div style="margin-bottom:0.85rem; padding-left:0.6rem; border-left:2px solid #e2e8f0;">
                                <div style="display:flex; justify-content:space-between;">
                                    <span style="font-size:0.85rem; font-weight:700; color:#0f172a;">${sanitize(e.title)} <span style="font-weight:normal; color:#64748b;">at ${sanitize(e.company)}</span></span>
                                    <span style="font-size:0.72rem; color:#94a3b8;">${sanitize(e.duration)}</span>
                                </div>
                                <p style="margin:0.2rem 0 0; font-size:0.78rem; color:#475569; line-height:${spacingMultiplier};">${sanitize(e.desc)}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Projects -->
                ${(d.projects || []).length > 0 ? `
                    <div style="margin-bottom:1.35rem;">
                        <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#64748b; margin-bottom:0.6rem;">Projects</div>
                        ${d.projects.map(p => `
                            <div style="margin-bottom:0.75rem; padding-left:0.6rem; border-left:2px solid #e2e8f0;">
                                <div style="font-size:0.85rem; font-weight:700; color:#0f172a;">${sanitize(p.title)} <span style="font-size:0.72rem; color:${accent}; font-weight:600;">[${sanitize(p.tech)}]</span></div>
                                <p style="margin:0.15rem 0 0; font-size:0.78rem; color:#475569; line-height:${spacingMultiplier};">${sanitize(p.desc)}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Education -->
                ${(d.education || []).length > 0 ? `
                    <div style="margin-bottom:1.25rem;">
                        <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#64748b; margin-bottom:0.4rem;">Education</div>
                        ${d.education.map(ed => `
                            <div style="font-size:0.8rem; color:#334155; margin-bottom:0.3rem;"><b>${sanitize(ed.degree)}</b>, ${sanitize(ed.institution)} (${sanitize(ed.year)}) — <i>${sanitize(ed.grade)}</i></div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    // ── Template 4: Executive Gradient Banner Layout ──
    else if (tmpl === 'executive') {
        container.innerHTML = `
            <div style="${baseStyle} background:#ffffff; min-height:600px; box-sizing:border-box;">
                <!-- Header Banner -->
                <div style="background:linear-gradient(135deg, ${accent}, #0f172a); color:white; padding:1.75rem 2rem;">
                    <h1 style="font-size:1.55rem; font-weight:800; margin:0 0 0.25rem; color:#ffffff;">${sanitize(d.name)}</h1>
                    <div style="font-size:0.9rem; color:rgba(255,255,255,0.9); font-weight:600;">${sanitize(d.title)}</div>
                    <div style="font-size:0.75rem; color:rgba(255,255,255,0.85); margin-top:0.6rem; display:flex; gap:0.9rem; flex-wrap:wrap;">
                        <span>✉ ${sanitize(d.email)}</span> • <span>📱 ${sanitize(d.phone)}</span> • <span>📍 ${sanitize(d.location)}</span>
                    </div>
                </div>

                <div style="padding:1.75rem 2rem;">
                    <!-- Executive Profile -->
                    <div style="margin-bottom:1.35rem;">
                        <h3 style="font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:${accent}; margin:0 0 0.5rem;">Executive Profile</h3>
                        <p style="margin:0; font-size:0.82rem; color:#334155; line-height:${spacingMultiplier};">${sanitize(d.summary)}</p>
                    </div>

                    <!-- Technical Stack -->
                    <div style="margin-bottom:1.35rem;">
                        <h3 style="font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:${accent}; margin:0 0 0.5rem;">Core Technology Stack</h3>
                        <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                            ${(d.skills || []).map(s => `<span style="background:rgba(249,115,22,0.1); color:#0f172a; padding:0.25rem 0.6rem; border-radius:6px; font-size:0.72rem; font-weight:600; border:1px solid rgba(249,115,22,0.25);">${sanitize(s)}</span>`).join('')}
                        </div>
                    </div>

                    <!-- Experience -->
                    ${(d.experience || []).length > 0 ? `
                        <div style="margin-bottom:1.35rem;">
                            <h3 style="font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:${accent}; margin:0 0 0.6rem;">Professional Experience</h3>
                            ${d.experience.map(e => `
                                <div style="margin-bottom:0.85rem; background:#f8fafc; padding:0.75rem; border-radius:8px; border:1px solid #e2e8f0;">
                                    <div style="display:flex; justify-content:space-between;">
                                        <span style="font-weight:700; font-size:0.88rem; color:#0f172a;">${sanitize(e.title)}</span>
                                        <span style="font-size:0.75rem; color:#64748b; font-weight:600;">${sanitize(e.duration)}</span>
                                    </div>
                                    <div style="font-size:0.78rem; color:${accent}; font-weight:600; margin-bottom:0.25rem;">${sanitize(e.company)} ${e.location ? '· ' + sanitize(e.location) : ''}</div>
                                    <p style="margin:0; font-size:0.78rem; color:#475569; line-height:${spacingMultiplier};">${sanitize(e.desc)}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- Projects -->
                    ${(d.projects || []).length > 0 ? `
                        <div style="margin-bottom:1.35rem;">
                            <h3 style="font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:${accent}; margin:0 0 0.6rem;">Key Projects & Impact</h3>
                            ${d.projects.map(p => `
                                <div style="margin-bottom:0.75rem; background:#f8fafc; padding:0.7rem; border-radius:8px; border:1px solid #e2e8f0;">
                                    <div style="font-size:0.85rem; font-weight:700; color:#0f172a;">${sanitize(p.title)}</div>
                                    <p style="margin:0.2rem 0; font-size:0.78rem; color:#475569; line-height:${spacingMultiplier};">${sanitize(p.desc)}</p>
                                    <div style="font-size:0.72rem; color:${accent}; font-weight:600;">Tech: ${sanitize(p.tech)}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- Education -->
                    ${(d.education || []).length > 0 ? `
                        <div style="margin-bottom:1.25rem;">
                            <h3 style="font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:${accent}; margin:0 0 0.5rem;">Education</h3>
                            ${d.education.map(ed => `
                                <div style="font-size:0.8rem; color:#334155; margin-bottom:0.3rem;"><b>${sanitize(ed.degree)}</b> — ${sanitize(ed.institution)} (${sanitize(ed.year)}) — <i>${sanitize(ed.grade)}</i></div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
}

// ══════════════ 5. DOM INITIALIZATION & EVENT WIRING ══════════════

document.addEventListener('DOMContentLoaded', async () => {
    // Populate form with initial data
    populateVisualFormFromState();

    // Try auto-loading saved profile data if logged in
    if (typeof API !== 'undefined' && API.isLoggedIn()) {
        try {
            const data = await API.get('/profile');
            const p = data.profile || {};
            if (p.name) resumeState.data.name = p.name;
            if (p.email) resumeState.data.email = p.email;
            if (p.phone) resumeState.data.phone = p.phone;
            if (p.location) resumeState.data.location = p.location;
            if (p.experience) resumeState.data.summary = p.experience;
            if (p.skills && p.skills.length > 0) {
                resumeState.data.skills = p.skills.map(s => s.name || s);
            }
            populateVisualFormFromState();
        } catch (e) { /* ignore */ }
    }

    // Input change listeners via event delegation
    const visualForm = document.getElementById('visualModeContainer');
    if (visualForm) {
        visualForm.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea')) {
                updatePreview();
            }
        });
    }

    // Code Editor live typing listener
    const codeEditor = document.getElementById('resumeCodeEditor');
    if (codeEditor) {
        codeEditor.addEventListener('input', () => {
            updateLineCount();
            compileCodeToResume();
        });
    }

    // Template Selector Cards
    document.querySelectorAll('.template-option').forEach(tmpl => {
        tmpl.addEventListener('click', () => {
            document.querySelectorAll('.template-option').forEach(t => {
                t.style.border = '1px solid var(--border-color)';
                const check = t.querySelector('.tmpl-check');
                if (check) check.style.display = 'none';
                const lbl = t.querySelector('.tmpl-label');
                if (lbl) lbl.style.color = 'var(--text-muted)';
            });
            tmpl.style.border = '2px solid var(--primary)';
            const check = tmpl.querySelector('.tmpl-check');
            if (check) check.style.display = 'flex';
            const lbl = tmpl.querySelector('.tmpl-label');
            if (lbl) lbl.style.color = 'var(--text-main)';

            resumeState.template = tmpl.dataset.tmpl || 'modern';
            const nameEl = document.getElementById('previewTemplateName');
            if (nameEl) nameEl.textContent = resumeState.template.charAt(0).toUpperCase() + resumeState.template.slice(1);

            updatePreview();
        });
    });

    // Line Spacing Control
    const lineSpacingSelect = document.getElementById('ctrlLineSpacing');
    if (lineSpacingSelect) {
        lineSpacingSelect.addEventListener('change', (e) => {
            resumeState.lineSpacing = e.target.value;
            updatePreview();
        });
    }

    // Font Size Control
    const fontSizeSelect = document.getElementById('ctrlFontSize');
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', (e) => {
            resumeState.fontSize = e.target.value;
            updatePreview();
        });
    }

    // Accent Color Palette
    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            document.querySelectorAll('.color-dot').forEach(d => d.style.boxShadow = '0 0 0 1px #cbd5e1');
            dot.style.boxShadow = '0 0 0 3px var(--primary)';
            resumeState.accentColor = dot.dataset.color || '#f97316';
            updatePreview();
        });
    });

    // Load Demo Data Button
    const loadDemoBtn = document.getElementById('loadDemoBtn');
    if (loadDemoBtn) {
        loadDemoBtn.addEventListener('click', () => {
            resumeState.data = {
                name: 'Suraj Kumar',
                title: 'Senior Full Stack Software Engineer',
                email: 'suraj.kumar@hireprep.com',
                phone: '+91 98765 43210',
                location: 'Bangalore, India',
                portfolio: 'linkedin.com/in/surajkumar-dev',
                summary: 'Results-driven Full Stack Engineer with 4+ years of experience architecting high-performance distributed systems, AI evaluation pipelines, and responsive web applications. Proficient in Node.js, React, MongoDB, and Cloud Infrastructure.',
                skills: ['JavaScript (ES6+)', 'Node.js', 'React', 'MongoDB', 'Express.js', 'Docker', 'REST APIs', 'System Design', 'Python', 'AWS', 'PostgreSQL', 'Redis'],
                experience: [
                    { title: 'Senior Software Engineer', company: 'HirePrep Systems', duration: '2023 - Present', location: 'Bangalore', desc: 'Designed candidate-job matching algorithm improving match precision by 38%. Scaled API layer to 10k RPS with sub-50ms latency.' },
                    { title: 'Software Engineer', company: 'CloudWave Technologies', duration: '2021 - 2023', location: 'Remote', desc: 'Developed microservices in Node.js & Docker. Integrated OAuth 2.0 and automated test pipelines achieving 95% code coverage.' }
                ],
                education: [
                    { degree: 'B.Tech in Computer Science & Engineering', institution: 'Delhi Technological University', year: '2017 - 2021', grade: '9.1 CGPA' }
                ],
                projects: [
                    { title: 'Intelligent ATS Evaluator', tech: 'Node.js, Python, MongoDB, React', desc: 'Developed automated resume parser and keyword analysis scoring engine.' },
                    { title: 'Real-Time Notification Pipeline', tech: 'Redis, WebSockets, Docker', desc: 'Created WebSocket notification broker broadcasting 10,000 live updates/sec.' }
                ],
                certifications: [
                    { name: 'AWS Certified Solutions Architect – Associate', year: '2024' },
                    { name: 'MongoDB Certified Developer Associate', year: '2023' }
                ]
            };
            populateVisualFormFromState();
            updatePreview();
            syncVisualFormToCode();
            if (typeof showToast === 'function') showToast('Complete realistic resume loaded!', 'success');
        });
    }

    // Import from Profile Button
    const importProfileBtn = document.getElementById('importProfileBtn');
    if (importProfileBtn) {
        importProfileBtn.addEventListener('click', async () => {
            if (!API.isLoggedIn()) return showToast ? showToast('Please sign in first', 'error') : alert('Please sign in first');
            try {
                const data = await API.get('/profile');
                const p = data.profile || {};
                if (p.name) resumeState.data.name = p.name;
                if (p.email) resumeState.data.email = p.email;
                if (p.phone) resumeState.data.phone = p.phone;
                if (p.location) resumeState.data.location = p.location;
                if (p.experience) resumeState.data.summary = p.experience;
                if (p.skills && p.skills.length > 0) {
                    resumeState.data.skills = p.skills.map(s => s.name || s);
                }
                populateVisualFormFromState();
                updatePreview();
                syncVisualFormToCode();
                if (typeof showToast === 'function') showToast('Profile imported successfully!', 'success');
            } catch (err) {
                if (typeof showToast === 'function') showToast('Import failed: ' + err.message, 'error');
            }
        });
    }

    // Download PDF Button
    const downloadBtn = document.getElementById('downloadPdfBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (typeof API !== 'undefined' && !API.isLoggedIn()) {
                showResumeAuthModal('Sign in to download and export your high-resolution ATS-optimized resume.');
                return;
            }
            window.print();
        });
    }

    // Initial Preview Rendering
    updatePreview();
});

// Expose global helpers
window.switchEditorMode = switchEditorMode;
window.handleResumeUpload = handleResumeUpload;
window.addExperienceEntry = addExperienceEntry;
window.addEducationEntry = addEducationEntry;
window.addProjectEntry = addProjectEntry;
window.addCertEntry = addCertEntry;
window.syncFromVisualForm = syncVisualFormToCode;
window.compileCodeToResume = compileCodeToResume;
window.loadCodeTemplate = loadCodeTemplate;
window.updatePreview = updatePreview;

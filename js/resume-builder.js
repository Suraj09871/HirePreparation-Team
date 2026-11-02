/**
 * Resume Builder — Complete Multi-Template Engine with:
 * 1. Jake's Overleaf (CS / Tech ATS Standard) + 7 additional professional templates
 * 2. Overleaf LaTeX Studio (real-time compiler, line gutter, snippet shortcuts, .tex export)
 * 3. Client-Side PDF, DOCX, TXT Resume Extraction
 * 4. High-resolution ATS Print / PDF Export
 */

// Global State
const resumeState = {
    mode: 'visual', // 'visual' | 'code'
    template: 'jakes', // 'jakes' | 'deedy' | 'ivy_league' | 'tech_minimalist' | 'modern' | 'classic' | 'minimal' | 'executive'
    accentColor: '#0f172a',
    lineSpacing: 'normal', // 'compact' | 'normal' | 'relaxed' | 'wide'
    fontSize: 'medium', // 'small' | 'medium' | 'large'
    data: {
        name: 'Suraj Kumar',
        title: 'Software Developer',
        email: 'surajkr09871@gmail.com',
        phone: '+91-9871187368',
        linkedin: 'linkedin.com/in/suraj-kumar-47aa35284',
        github: 'Suraj09871',
        location: 'New Delhi, India',
        portfolio: 'surajkumar.dev',
        summary: 'Motivated Software Developer with experience in building web applications using JavaScript, HTML, CSS, and Node.js. Strong understanding of Data Structures in Java, along with knowledge of DBMS and REST APIs. Skilled in developing responsive applications, building backend services, and integrating APIs, with good problem-solving skills and a collaborative mindset.',
        education: [
            {
                institution: 'Manav Rachna International Institute of Research & Studies',
                degree: 'Bachelor of Technology in Computer Science Engineering',
                year: 'July 2023 – June 2027',
                location: 'Faridabad, India',
                grade: ''
            },
            {
                institution: 'M.S.M Samta College',
                degree: 'Intermediate (Class XII)',
                year: '2023',
                location: 'Vaishali, Bihar',
                grade: ''
            },
            {
                institution: 'Jagriti Public School',
                degree: 'Matriculation (Class X)',
                year: '2021',
                location: 'Samastipur, Bihar',
                grade: ''
            }
        ],
        coursework: [
            'Data Structures & Algorithms',
            'Object-Oriented Programming',
            'Database Management (DBMS)',
            'Operating Systems',
            'Computer Networks',
            'RESTful API Design',
            'Software Development',
            'UI/UX Design Principles'
        ],
        technicalSkills: {
            languages: 'Java, JavaScript, Python (basic)',
            frontend: 'HTML, CSS, React.js, Bootstrap, Responsive Web Design',
            backend: 'Node.js, Express.js, RESTful APIs, API Integration',
            tools: 'Git, GitHub, VS Code, Postman, Chrome DevTools, Netlify',
            database: 'MongoDB (CRUD, Schema Design)',
            soft: 'Quick Learner, Team Player, Time Management, Adaptability, Creative Problem Solving'
        },
        skills: ['Java', 'JavaScript', 'Python', 'HTML', 'CSS', 'React.js', 'Node.js', 'Express.js', 'REST APIs', 'MongoDB', 'Git', 'GitHub', 'VS Code'],
        projects: [
            {
                title: 'SwasthBazaar – Healthcare E-commerce Platform',
                tech: 'JavaScript, HTML, CSS, Node.js, MongoDB',
                duration: '2024 - 25',
                link: '',
                desc: '• Developed a full-stack healthcare web application with authentication and REST APIs for telemedicine and appointment booking.\n• Built a responsive frontend ensuring cross-device compatibility for 3+ screen sizes.\n• Designed backend services using Node.js and Express, and integrated MongoDB for efficient data management.\n• Deployed application using Netlify with CI/CD pipeline, reducing deployment time by 40%. [Live]'
            }
        ],
        experience: [
            {
                title: 'Web Development Intern',
                company: 'Prodigy InfoTech',
                duration: 'June 2025 – July 2025',
                location: 'Remote',
                desc: '• Developed and optimized 5+ responsive web applications, improving UI performance and user experience.\n• Built interactive UI, optimized performance, and collaborated using Git for clean and efficient code.'
            }
        ],
        achievements: [
            {
                title: 'Published research paper on SwasthBazaar Platform',
                link: 'https://example.com'
            },
            {
                title: 'Secured 1st position in "Waste to Wonder" at Innoskill Fest for creating useful items from waste food',
                link: 'https://example.com'
            }
        ],
        certifications: [
            { name: 'Web Development Internship', year: '2025', link: 'https://example.com' },
            { name: 'Alibaba Cloud', year: '2024', link: 'https://example.com' },
            { name: 'Matlab Workshop Certification', year: '2024', link: 'https://example.com' },
            { name: 'Research Paper Publication', year: '2024', link: 'https://example.com' },
            { name: 'Augmented Reality Workshop – Snap AR & Bharat XR', year: '2024', link: 'https://example.com' }
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
            <a href="../student-auth.html" class="btn btn-primary" style="display:block;width:100%;padding:0.75rem;border-radius:8px;font-weight:600;text-decoration:none;margin-bottom:0.75rem;">Sign In / Sign Up →</a>
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
            extractedText = await readFileAsText(file);
        }

        if (!extractedText || extractedText.trim().length === 0) {
            throw new Error('Could not extract text from this file. Please ensure it is not scanned/empty image.');
        }

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

function parseAndPopulateResume(text, fileName) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const fullText = text;

    // Email
    const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) resumeState.data.email = emailMatch[0];

    // Phone
    const phoneMatch = fullText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}|\+?\d{10,13}/);
    if (phoneMatch) resumeState.data.phone = phoneMatch[0];

    // LinkedIn
    const linkedinMatch = fullText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
    if (linkedinMatch) resumeState.data.linkedin = `linkedin.com/in/${linkedinMatch[1]}`;

    // GitHub
    const githubMatch = fullText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
    if (githubMatch) resumeState.data.github = githubMatch[1];

    // Name
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
        const line = lines[i];
        if (line.length > 2 && line.length < 40 && !line.includes('@') && !line.includes('http') && !/\d{5,}/.test(line) && !line.toLowerCase().includes('resume') && !line.toLowerCase().includes('curriculum')) {
            resumeState.data.name = line;
            break;
        }
    }

    // Title
    const titleKeywords = [
        'Software Developer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
        'Data Scientist', 'DevOps Engineer', 'Machine Learning Engineer', 'Web Developer',
        'Software Engineer', 'Mobile Developer', 'Cloud Engineer'
    ];
    for (const kw of titleKeywords) {
        if (new RegExp('\\b' + kw + '\\b', 'i').test(fullText)) {
            resumeState.data.title = kw;
            break;
        }
    }

    // Skills
    const skillDictionary = [
        'Java', 'JavaScript', 'Python', 'C++', 'C', 'C#', 'TypeScript', 'Go', 'Rust',
        'React.js', 'React', 'Node.js', 'Express.js', 'HTML', 'CSS', 'Bootstrap', 'Tailwind CSS',
        'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'Docker', 'Git', 'GitHub', 'VS Code',
        'Postman', 'Netlify', 'AWS', 'RESTful APIs', 'REST APIs', 'DBMS', 'Operating Systems'
    ];
    const detected = [];
    for (const s of skillDictionary) {
        if (new RegExp(`\\b${s.replace(/[+]/g, '\\+')}\\b`, 'i').test(fullText) && !detected.includes(s)) {
            detected.push(s);
        }
    }
    if (detected.length > 0) {
        resumeState.data.skills = detected;
    }

    // Summary / Objective
    const summaryMatch = fullText.match(/(?:CAREER OBJECTIVE|OBJECTIVE|SUMMARY|PROFESSIONAL SUMMARY)[\s:]*([^\n\r]+(?:\n[^\n\r]+){1,5})/i);
    if (summaryMatch && summaryMatch[1].trim().length > 30) {
        resumeState.data.summary = summaryMatch[1].replace(/\s+/g, ' ').trim();
    }

    populateVisualFormFromState();
    updatePreview();
    syncVisualFormToCode();
}

// ══════════════ 2. DOM POPULATION & DYNAMIC FORM BUILDER ══════════════

function populateVisualFormFromState() {
    const d = resumeState.data;
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };

    setVal('rbName', d.name);
    setVal('rbTitle', d.title);
    setVal('rbEmail', d.email);
    setVal('rbPhone', d.phone);
    setVal('rbLinkedIn', d.linkedin);
    setVal('rbGitHub', d.github);
    setVal('rbLocation', d.location);
    setVal('rbPortfolio', d.portfolio);
    setVal('rbSummary', d.summary);

    // Coursework
    setVal('rbCoursework', (d.coursework || []).join(', '));

    // Categorized Skills
    const ts = d.technicalSkills || {};
    setVal('rbSkillsLanguages', ts.languages || '');
    setVal('rbSkillsFrontend', ts.frontend || '');
    setVal('rbSkillsBackend', ts.backend || '');
    setVal('rbSkillsTools', ts.tools || '');
    setVal('rbSkillsDatabase', ts.database || '');
    setVal('rbSkillsSoft', ts.soft || '');
    setVal('rbSkills', (d.skills || []).join(', '));

    // Education DOM entries
    const eduContainer = document.getElementById('educationEntries');
    if (eduContainer && d.education && d.education.length > 0) {
        eduContainer.innerHTML = '';
        d.education.forEach(edu => {
            const div = document.createElement('div');
            div.className = 'edu-entry';
            div.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--border-color);';
            div.innerHTML = `
                <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Institution / University</label><input type="text" class="rbEduInstitution" value="${sanitize(edu.institution || '')}" placeholder="Manav Rachna International Institute" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
                <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Degree / Program</label><input type="text" class="rbEduDegree" value="${sanitize(edu.degree || '')}" placeholder="B.Tech Computer Science" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
                <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Dates / Year</label><input type="text" class="rbEduYear" value="${sanitize(edu.year || '')}" placeholder="July 2023 – June 2027" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
                <div style="display:flex;align-items:end;gap:0.5rem;"><div style="flex:1;"><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Location / Grade</label><input type="text" class="rbEduLocation" value="${sanitize(edu.location || edu.grade || '')}" placeholder="Faridabad, India" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div><button type="button" onclick="this.closest('.edu-entry').remove(); updatePreview();" style="padding:0.55rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;cursor:pointer;font-size:0.8rem;color:#ef4444;" title="Delete Education">✕</button></div>
            `;
            eduContainer.appendChild(div);
        });
    }

    // Projects DOM entries
    const projContainer = document.getElementById('projectEntries');
    if (projContainer && d.projects && d.projects.length > 0) {
        projContainer.innerHTML = '';
        d.projects.forEach(p => {
            const div = document.createElement('div');
            div.className = 'proj-entry';
            div.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--border-color);';
            div.innerHTML = `
                <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Project Title</label><input type="text" class="rbProjTitle" value="${sanitize(p.title || '')}" placeholder="SwasthBazaar – Healthcare E-commerce" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
                <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Tech Stack</label><input type="text" class="rbProjTech" value="${sanitize(p.tech || '')}" placeholder="JavaScript, Node.js, MongoDB" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
                <div style="grid-column: span 2; display:flex; gap:0.5rem; align-items:end;">
                    <div style="flex:1;"><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Date / Duration (e.g. 2024 - 25)</label><input type="text" class="rbProjDuration" value="${sanitize(p.duration || '')}" placeholder="2024 - 25" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
                    <button type="button" onclick="this.closest('.proj-entry').remove(); updatePreview();" style="padding:0.55rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;cursor:pointer;font-size:0.8rem;color:#ef4444;" title="Delete Project">✕</button>
                </div>
                <div style="grid-column: span 2;"><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Bullet Points / Description (one bullet per line starting with •)</label><textarea class="rbProjDesc" placeholder="• Built full-stack platform..." style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);min-height:75px;font-family:inherit;resize:vertical;">${sanitize(p.desc || '')}</textarea></div>
            `;
            projContainer.appendChild(div);
        });
    }

    // Experience DOM entries
    const expContainer = document.getElementById('experienceEntries');
    if (expContainer && d.experience && d.experience.length > 0) {
        expContainer.innerHTML = '';
        d.experience.forEach(exp => {
            const div = document.createElement('div');
            div.className = 'exp-entry';
            div.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--border-color);';
            div.innerHTML = `
                <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Job Title / Role</label><input type="text" class="rbExpTitle" value="${sanitize(exp.title || '')}" placeholder="Web Development Intern" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
                <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Company / Organization</label><input type="text" class="rbExpCompany" value="${sanitize(exp.company || '')}" placeholder="Prodigy InfoTech" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
                <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Duration / Dates</label><input type="text" class="rbExpDuration" value="${sanitize(exp.duration || '')}" placeholder="June 2025 – July 2025" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
                <div style="display:flex;align-items:end;gap:0.5rem;"><div style="flex:1;"><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Location</label><input type="text" class="rbExpLocation" value="${sanitize(exp.location || '')}" placeholder="Remote / Delhi" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div><button type="button" onclick="this.closest('.exp-entry').remove(); updatePreview();" style="padding:0.55rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;cursor:pointer;font-size:0.8rem;color:#ef4444;" title="Delete Role">✕</button></div>
                <div style="grid-column: span 2;"><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Responsibilities & Impact (one bullet per line starting with •)</label><textarea class="rbExpDesc" placeholder="• Developed and optimized 5+ responsive web applications..." style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);min-height:70px;font-family:inherit;resize:vertical;">${sanitize(exp.desc || '')}</textarea></div>
            `;
            expContainer.appendChild(div);
        });
    }

    // Achievements DOM entries
    const achContainer = document.getElementById('achievementEntries');
    if (achContainer && d.achievements && d.achievements.length > 0) {
        achContainer.innerHTML = '';
        d.achievements.forEach(a => {
            const div = document.createElement('div');
            div.className = 'ach-entry';
            div.style.cssText = 'display:grid;grid-template-columns:2fr 1fr auto;gap:0.6rem;margin-bottom:0.6rem;align-items:center;';
            div.innerHTML = `
                <input type="text" class="rbAchTitle" value="${sanitize(a.title || '')}" placeholder="Published research paper on..." style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                <input type="text" class="rbAchLink" value="${sanitize(a.link || '')}" placeholder="Link (optional)" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                <button type="button" onclick="this.closest('.ach-entry').remove(); updatePreview();" style="padding:0.55rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;cursor:pointer;font-size:0.8rem;color:#ef4444;">✕</button>
            `;
            achContainer.appendChild(div);
        });
    }

    // Certifications DOM entries
    const certContainer = document.getElementById('certEntries');
    if (certContainer && d.certifications && d.certifications.length > 0) {
        certContainer.innerHTML = '';
        d.certifications.forEach(c => {
            const div = document.createElement('div');
            div.className = 'cert-entry';
            div.style.cssText = 'display:grid;grid-template-columns:2fr 1fr auto;gap:0.6rem;margin-bottom:0.6rem;align-items:center;';
            div.innerHTML = `
                <input type="text" class="rbCertName" value="${sanitize(c.name || '')}" placeholder="Certification Name" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                <input type="text" class="rbCertYear" value="${sanitize(c.year || '')}" placeholder="Year (2024)" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
                <button type="button" onclick="this.closest('.cert-entry').remove(); updatePreview();" style="padding:0.55rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;cursor:pointer;font-size:0.8rem;color:#ef4444;">✕</button>
            `;
            certContainer.appendChild(div);
        });
    }
}

function addExperienceEntry() {
    const container = document.getElementById('experienceEntries');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'exp-entry';
    div.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--border-color);';
    div.innerHTML = `
        <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Job Title / Role</label><input type="text" class="rbExpTitle" placeholder="Frontend Developer" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
        <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Company / Organization</label><input type="text" class="rbExpCompany" placeholder="Google / Amazon" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
        <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Duration / Dates</label><input type="text" class="rbExpDuration" placeholder="2023 - 2024" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
        <div style="display:flex;align-items:end;gap:0.5rem;"><div style="flex:1;"><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Location</label><input type="text" class="rbExpLocation" placeholder="Delhi" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div><button type="button" onclick="this.closest('.exp-entry').remove(); updatePreview();" style="padding:0.55rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;cursor:pointer;font-size:0.8rem;color:#ef4444;">✕</button></div>
        <div style="grid-column: span 2;"><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Responsibilities & Impact (one bullet per line starting with •)</label><textarea class="rbExpDesc" placeholder="• Developed scalable web service..." style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);min-height:70px;font-family:inherit;resize:vertical;"></textarea></div>
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
        <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Institution / University</label><input type="text" class="rbEduInstitution" placeholder="IIT Delhi" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
        <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Degree / Program</label><input type="text" class="rbEduDegree" placeholder="B.Tech Computer Science" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
        <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Dates / Year</label><input type="text" class="rbEduYear" placeholder="2020 - 2024" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
        <div style="display:flex;align-items:end;gap:0.5rem;"><div style="flex:1;"><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Location / Grade</label><input type="text" class="rbEduLocation" placeholder="Delhi, India" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div><button type="button" onclick="this.closest('.edu-entry').remove(); updatePreview();" style="padding:0.55rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;cursor:pointer;font-size:0.8rem;color:#ef4444;">✕</button></div>
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
        <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Project Title</label><input type="text" class="rbProjTitle" placeholder="Project Name" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
        <div><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Tech Stack</label><input type="text" class="rbProjTech" placeholder="Node.js, Docker, Stripe" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
        <div style="grid-column: span 2; display:flex; gap:0.5rem; align-items:end;">
            <div style="flex:1;"><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Date / Duration</label><input type="text" class="rbProjDuration" placeholder="2024" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);"></div>
            <button type="button" onclick="this.closest('.proj-entry').remove(); updatePreview();" style="padding:0.55rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;cursor:pointer;font-size:0.8rem;color:#ef4444;">✕</button>
        </div>
        <div style="grid-column: span 2;"><label style="display:block;font-size:0.8rem;font-weight:500;margin-bottom:0.3rem;color:var(--text-main);">Bullet Points / Description (one bullet per line starting with •)</label><textarea class="rbProjDesc" placeholder="• Designed high-performance backend..." style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);min-height:75px;font-family:inherit;resize:vertical;"></textarea></div>
    `;
    container.appendChild(div);
    updatePreview();
}

function addAchievementEntry() {
    const container = document.getElementById('achievementEntries');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'ach-entry';
    div.style.cssText = 'display:grid;grid-template-columns:2fr 1fr auto;gap:0.6rem;margin-bottom:0.6rem;align-items:center;';
    div.innerHTML = `
        <input type="text" class="rbAchTitle" placeholder="Achievement or Award" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
        <input type="text" class="rbAchLink" placeholder="Link (optional)" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
        <button type="button" onclick="this.closest('.ach-entry').remove(); updatePreview();" style="padding:0.55rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;cursor:pointer;font-size:0.8rem;color:#ef4444;">✕</button>
    `;
    container.appendChild(div);
    updatePreview();
}

function addCertEntry() {
    const container = document.getElementById('certEntries');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'cert-entry';
    div.style.cssText = 'display:grid;grid-template-columns:2fr 1fr auto;gap:0.6rem;margin-bottom:0.6rem;align-items:center;';
    div.innerHTML = `
        <input type="text" class="rbCertName" placeholder="Certification Name" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
        <input type="text" class="rbCertYear" placeholder="Year" style="width:100%;padding:0.6rem;border:1px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--input-bg);color:var(--text-main);">
        <button type="button" onclick="this.closest('.cert-entry').remove(); updatePreview();" style="padding:0.55rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;cursor:pointer;font-size:0.8rem;color:#ef4444;">✕</button>
    `;
    container.appendChild(div);
    updatePreview();
}

// ══════════════ 3. OVERLEAF & CODE MODE ENGINE ══════════════

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

// Generate valid Overleaf LaTeX Source Code
function generateLatexCode(templateType) {
    const d = resumeState.data;
    const ts = d.technicalSkills || {};

    if (templateType === 'latex-deedy') {
        return `%----------------------------------------------------------------------------------------
% DEEDY CV — Two-Column LaTeX Resume Template
% Overleaf / LaTeX Standard
%----------------------------------------------------------------------------------------

\\documentclass[letterpaper]{article}
\\usepackage[margin=0.5in]{geometry}
\\usepackage{hyperref}
\\usepackage{paralist}
\\usepackage{color}

\\definecolor{primary}{RGB}{37, 99, 235}
\\definecolor{subdued}{RGB}{100, 116, 139}

\\begin{document}
\\begin{center}
    {\\Huge \\textbf{${d.name}}} \\\\[4pt]
    {\\large \\textcolor{primary}{${d.title}}} \\\\[4pt]
    ${d.email} $|$ ${d.phone} $|$ ${d.location} $|$ \\href{https://${d.linkedin}}{${d.linkedin}}
\\end{center}

\\vspace{8pt}
\\hrule
\\vspace{10pt}

% Column 1: 33% width
\\begin{minipage}[t]{0.33\\textwidth}
\\section*{Education}
${d.education.map(ed => `\\textbf{${ed.institution}} \\\\
\\textit{${ed.degree}} \\\\
${ed.year} $|$ ${ed.location || ed.grade} \\\\[6pt]`).join('\n')}

\\section*{Coursework}
\\begin{compactitem}
${(d.coursework || []).map(c => `  \\item ${c}`).join('\n')}
\\end{compactitem}

\\section*{Skills}
\\textbf{Languages:} ${ts.languages || ''} \\\\[3pt]
\\textbf{Frontend:} ${ts.frontend || ''} \\\\[3pt]
\\textbf{Backend:} ${ts.backend || ''} \\\\[3pt]
\\textbf{Tools:} ${ts.tools || ''} \\\\[3pt]
\\textbf{Database:} ${ts.database || ''}

\\section*{Certifications}
${d.certifications.map(c => `$\\bullet$ ${c.name} (${c.year || ''}) \\\\`).join('\n')}
\\end{minipage}
\\hfill
% Column 2: 65% width
\\begin{minipage}[t]{0.64\\textwidth}
\\section*{Career Objective}
${d.summary}

\\section*{Experience}
${d.experience.map(e => `\\textbf{${e.title}} \\hfill \\textit{${e.duration}} \\\\
\\textcolor{primary}{${e.company}} \\hfill \\textit{${e.location || ''}} \\\\
${e.desc} \\\\[6pt]`).join('\n')}

\\section*{Key Projects}
${d.projects.map(p => `\\textbf{${p.title}} \\hfill \\textit{${p.duration || ''}} \\\\
\\textit{Tech: ${p.tech}} \\\\
${p.desc} \\\\[6pt]`).join('\n')}

\\section*{Achievements}
${d.achievements.map(a => `$\\bullet$ ${a.title} \\\\`).join('\n')}
\\end{minipage}

\\end{document}
`;
    }

    if (templateType === 'latex-ivy') {
        return `%----------------------------------------------------------------------------------------
% HARVARD / IVY LEAGUE ACADEMIC RESUME
% Classic Serif LaTeX Template
%----------------------------------------------------------------------------------------

\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=0.6in]{geometry}
\\usepackage{titlesec}
\\usepackage{hyperref}

\\pagestyle{empty}
\\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0em}{}[\\titlerule]

\\begin{document}
\\begin{center}
    {\\LARGE \\textbf{\\textsc{${d.name}}}} \\\\[4pt]
    ${d.title} \\\\[3pt]
    ${d.phone} $\\cdot$ ${d.email} $\\cdot$ ${d.location} $\\cdot$ ${d.linkedin}
\\end{center}

\\section{Education}
${d.education.map(ed => `\\textbf{${ed.institution}} \\hfill ${ed.year} \\\\
\\textit{${ed.degree}} \\hfill \\textit{${ed.location || ed.grade}} \\\\[4pt]`).join('\n')}

\\section{Career Objective}
${d.summary}

\\section{Technical Competencies}
\\textbf{Languages:} ${ts.languages || ''} \\\\
\\textbf{Frontend:} ${ts.frontend || ''} \\\\
\\textbf{Backend \\& APIs:} ${ts.backend || ''} \\\\
\\textbf{Developer Tools:} ${ts.tools || ''} \\\\
\\textbf{Database:} ${ts.database || ''}

\\section{Projects}
${d.projects.map(p => `\\textbf{${p.title}} $|$ \\textit{${p.tech}} \\hfill ${p.duration || ''} \\\\
${p.desc} \\\\[4pt]`).join('\n')}

\\section{Work Experience}
${d.experience.map(e => `\\textbf{${e.title}} \\hfill ${e.duration} \\\\
\\textit{${e.company}} \\hfill \\textit{${e.location || ''}} \\\\
${e.desc} \\\\[4pt]`).join('\n')}

\\section{Honors \\& Certifications}
${d.certifications.map(c => `$\\bullet$ ${c.name} (${c.year || ''})`).join(' $\\cdot$ ')}

\\end{document}
`;
    }

    // Default: Jake's Resume (Standard Overleaf CS Format)
    return `%-------------------------
% Resume in Latex (Jake's Resume / Overleaf CS Standard)
% Author : Suraj Kumar
% License : MIT
% Ready to compile directly on Overleaf.com
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting with horizontal rule
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${d.name}} \\\\[2pt]
    \\textbf{\\large ${d.title}} \\\\[3pt]
    \\small 📞 ${d.phone} $|$ ✉ \\underline{${d.email}} $|$ 🔗 \\underline{${d.linkedin}} $|$ 🐙 \\underline{${d.github}} $|$ 📍 ${d.location}
\\end{center}

%-----------CAREER OBJECTIVE-----------
\\section{CAREER OBJECTIVE}
  \\small{${d.summary}}

%-----------EDUCATION-----------
\\section{EDUCATION}
  \\resumeSubHeadingListStart
${d.education.map(ed => `    \\resumeSubheading
      {${ed.institution}}{${ed.year}}
      {${ed.degree}}{${ed.location || ed.grade || ''}}`).join('\n')}
  \\resumeSubHeadingListEnd

%-----------COURSEWORK / SKILLS-----------
\\section{COURSEWORK / SKILLS}
  \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
      ${(d.coursework || []).map(c => `$\\bullet$ ${c}`).join(' & ')}
    }}
  \\end{itemize}

%-----------TECHNICAL SKILLS-----------
\\section{TECHNICAL SKILLS}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     \\textbf{Languages:}{ ${ts.languages || ''}} \\\\
     \\textbf{Frontend:}{ ${ts.frontend || ''}} \\\\
     \\textbf{Backend \\& APIs:}{ ${ts.backend || ''}} \\\\
     \\textbf{Developer Tools:}{ ${ts.tools || ''}} \\\\
     \\textbf{Database:}{ ${ts.database || ''}} \\\\
     \\textbf{Soft Skills:}{ ${ts.soft || ''}}
    }}
 \\end{itemize}

%-----------PROJECTS-----------
\\section{PROJECTS}
  \\resumeSubHeadingListStart
${d.projects.map(p => `    \\resumeProjectHeading
        {\\textbf{${p.title}} $|$ \\emph{${p.tech}}}{${p.duration || ''}}
        \\resumeItemListStart
${splitBullets(p.desc).map(b => `          \\resumeItem{${b}}`).join('\n')}
        \\resumeItemListEnd`).join('\n')}
  \\resumeSubHeadingListEnd

%-----------EXPERIENCE-----------
\\section{EXPERIENCE}
  \\resumeSubHeadingListStart
${d.experience.map(e => `    \\resumeSubheading
      {${e.title}}{${e.duration}}
      {${e.company}}{${e.location || ''}}
      \\resumeItemListStart
${splitBullets(e.desc).map(b => `        \\resumeItem{${b}}`).join('\n')}
      \\resumeItemListEnd`).join('\n')}
  \\resumeSubHeadingListEnd

%-----------ACHIEVEMENTS-----------
\\section{ACHIEVEMENTS}
  \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${d.achievements.map(a => `      $\\bullet$ ${a.title} \\href{${a.link || 'https://example.com'}}{[link]}`).join(' \\\\\n')}
    }}
  \\end{itemize}

%-----------CERTIFICATIONS-----------
\\section{CERTIFICATIONS}
  \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${d.certifications.map(c => `      $\\bullet$ ${c.name} (${c.year || ''}) \\href{${c.link || 'https://example.com'}}{[link]}`).join(' \\\\\n')}
    }}
  \\end{itemize}

\\end{document}
`;
}

function syncVisualFormToCode() {
    const editor = document.getElementById('resumeCodeEditor');
    if (!editor) return;

    readFormIntoState();
    const select = document.getElementById('codeTemplateSelect');
    const selectedTemplate = select ? select.value : 'latex-jakes';

    editor.value = generateLatexCode(selectedTemplate);
    updateLineNumbers();
}

function updateLineNumbers() {
    const editor = document.getElementById('resumeCodeEditor');
    const gutter = document.getElementById('codeLineGutter');
    const lineCountEl = document.getElementById('codeLineCount');
    const charCountEl = document.getElementById('codeCharCount');

    if (!editor || !gutter) return;

    const lines = editor.value.split('\n');
    const lineCount = lines.length;

    let numbersHtml = '';
    for (let i = 1; i <= lineCount; i++) {
        numbersHtml += i + '\n';
    }
    gutter.textContent = numbersHtml;

    if (lineCountEl) lineCountEl.textContent = `Lines: ${lineCount}`;
    if (charCountEl) charCountEl.textContent = `Chars: ${editor.value.length}`;
}

// Advanced LaTeX & Markdown Live Parser
function compileCodeToResume() {
    const editor = document.getElementById('resumeCodeEditor');
    if (!editor) return;

    const startTime = performance.now();
    const code = editor.value;

    try {
        // 1. Extract Name & Title
        const nameMatch = code.match(/\\textbf\{\\Huge[^}]*\\scshape\s*([^}]+)\}/i) ||
                          code.match(/\\name\{([^}]+)\}/i) ||
                          code.match(/\\textbf\{([^}]+)\}\s*\\\\(?:\[\d+pt\])?\s*\\textbf\{\\large/i) ||
                          code.match(/^#\s+(.+)$/m);
        if (nameMatch) resumeState.data.name = nameMatch[1].trim();

        const titleMatch = code.match(/\\textbf\{\\large\s*([^}]+)\}/i) ||
                           code.match(/\\title\{([^}]+)\}/i) ||
                           code.match(/\\textcolor\{primary\}\{([^}]+)\}/i);
        if (titleMatch) resumeState.data.title = titleMatch[1].trim();

        // 2. Extract Contact Info
        const emailMatch = code.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) resumeState.data.email = emailMatch[0];

        const phoneMatch = code.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}|\+?\d{10,13}/);
        if (phoneMatch) resumeState.data.phone = phoneMatch[0];

        const linkedinMatch = code.match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
        if (linkedinMatch) resumeState.data.linkedin = `linkedin.com/in/${linkedinMatch[1]}`;

        const githubMatch = code.match(/github\.com\/([a-zA-Z0-9_-]+)/i) || code.match(/🐙\s*\\underline\{([^}]+)\}/i);
        if (githubMatch) resumeState.data.github = githubMatch[1];

        const locMatch = code.match(/📍\s*([^\n\\$|]+)/i) || code.match(/\\location\{([^}]+)\}/i);
        if (locMatch) resumeState.data.location = locMatch[1].trim();

        // 3. Extract Career Objective / Summary
        const objMatch = code.match(/\\section\{CAREER OBJECTIVE\}\s*\\small\{([^}]+)\}/i) ||
                         code.match(/\\section\{CAREER OBJECTIVE\}\s*([^\\]+)/i) ||
                         code.match(/\\section\{(?:Summary|Professional Summary)\}\s*([^\\%]+)/i);
        if (objMatch) resumeState.data.summary = objMatch[1].replace(/\\small\{|\\par/g, '').trim();

        // 4. Extract Technical Skills
        const ts = resumeState.data.technicalSkills || {};
        const langMatch = code.match(/\\textbf\{Languages:\}\s*\{?([^}\\\n]+)/i);
        if (langMatch) ts.languages = langMatch[1].trim();

        const frontMatch = code.match(/\\textbf\{Frontend:\}\s*\{?([^}\\\n]+)/i);
        if (frontMatch) ts.frontend = frontMatch[1].trim();

        const backMatch = code.match(/\\textbf\{Backend\s*(?:\\&|&)\s*APIs:\}\s*\{?([^}\\\n]+)/i);
        if (backMatch) ts.backend = backMatch[1].trim();

        const toolsMatch = code.match(/\\textbf\{Developer Tools:\}\s*\{?([^}\\\n]+)/i);
        if (toolsMatch) ts.tools = toolsMatch[1].trim();

        const dbMatch = code.match(/\\textbf\{Database:\}\s*\{?([^}\\\n]+)/i);
        if (dbMatch) ts.database = dbMatch[1].trim();

        const softMatch = code.match(/\\textbf\{Soft Skills:\}\s*\{?([^}\\\n]+)/i);
        if (softMatch) ts.soft = softMatch[1].trim();

        resumeState.data.technicalSkills = ts;

        // 5. Extract Education
        const eduRegex = /\\resumeSubheading\s*\{([^}]+)\}\s*\{([^}]+)\}\s*\{([^}]+)\}\s*\{([^}]*)\}/g;
        const parsedEdu = [];
        let eMatch;
        while ((eMatch = eduRegex.exec(code)) !== null) {
            parsedEdu.push({
                institution: eMatch[1].trim(),
                year: eMatch[2].trim(),
                degree: eMatch[3].trim(),
                location: eMatch[4].trim()
            });
        }
        if (parsedEdu.length > 0) resumeState.data.education = parsedEdu;

        // 6. Extract Projects
        const projRegex = /\\resumeProjectHeading\s*\{(?:\s*\\textbf\{([^}]+)\}\s*\$\|\$\s*\\emph\{([^}]+)\})\}\s*\{([^}]*)\}/g;
        const parsedProj = [];
        let pMatch;
        while ((pMatch = projRegex.exec(code)) !== null) {
            parsedProj.push({
                title: pMatch[1].trim(),
                tech: pMatch[2].trim(),
                duration: pMatch[3].trim(),
                desc: ''
            });
        }
        if (parsedProj.length > 0) {
            // Also grab item bullets if present
            const items = [];
            const itemRegex = /\\resumeItem\{([^}]+)\}/g;
            let itm;
            while ((itm = itemRegex.exec(code)) !== null) {
                items.push(itm[1].trim());
            }
            if (items.length > 0 && parsedProj.length > 0) {
                parsedProj[0].desc = items.map(i => `• ${i}`).join('\n');
            }
            resumeState.data.projects = parsedProj;
        }

        const elapsed = Math.round(performance.now() - startTime);
        const statusMsg = document.getElementById('codeStatusMsg');
        if (statusMsg) statusMsg.textContent = `✓ Compiled (${elapsed}ms)`;

        populateVisualFormFromState();
        updatePreview();
    } catch (err) {
        console.warn('LaTeX parse error:', err);
    }
}

function loadCodeTemplate(type) {
    const editor = document.getElementById('resumeCodeEditor');
    if (!editor) return;

    const d = resumeState.data;

    if (type === 'markdown') {
        editor.value = `# ${d.name}
**${d.title}**
📞 ${d.phone} | ✉ ${d.email} | 🔗 ${d.linkedin} | 🐙 ${d.github} | 📍 ${d.location}

---

## 🎯 Career Objective
${d.summary}

---

## 🎓 Education
${d.education.map(ed => `- **${ed.institution}** (${ed.year})\n  *${ed.degree}* — ${ed.location || ed.grade}`).join('\n\n')}

---

## 🛠 Technical Skills
- **Languages:** ${d.technicalSkills?.languages || ''}
- **Frontend:** ${d.technicalSkills?.frontend || ''}
- **Backend & APIs:** ${d.technicalSkills?.backend || ''}
- **Developer Tools:** ${d.technicalSkills?.tools || ''}
- **Database:** ${d.technicalSkills?.database || ''}

---

## 🚀 Projects
${d.projects.map(p => `### ${p.title} (${p.duration || ''})
*Tech: ${p.tech}*
${p.desc}`).join('\n\n')}

---

## 💼 Experience
${d.experience.map(e => `### ${e.title} — *${e.company}* (${e.duration})
${e.desc}`).join('\n\n')}
`;
    } else if (type === 'json') {
        editor.value = JSON.stringify(resumeState.data, null, 2);
    } else {
        editor.value = generateLatexCode(type);
    }

    updateLineNumbers();
    compileCodeToResume();
}

function copyLatexCode() {
    const editor = document.getElementById('resumeCodeEditor');
    if (!editor) return;
    navigator.clipboard.writeText(editor.value).then(() => {
        if (typeof showToast === 'function') {
            showToast('LaTeX source code copied to clipboard!', 'success');
        } else {
            alert('LaTeX copied to clipboard!');
        }
    });
}

function exportTexFile() {
    const editor = document.getElementById('resumeCodeEditor');
    if (!editor) return;
    const blob = new Blob([editor.value], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${(resumeState.data.name || 'resume').toLowerCase().replace(/\s+/g, '_')}_overleaf.tex`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (typeof showToast === 'function') {
        showToast('Downloaded .tex file! Ready to upload to Overleaf.com', 'success');
    }
}

function beautifyLatexCode() {
    const editor = document.getElementById('resumeCodeEditor');
    if (!editor) return;
    const lines = editor.value.split('\n');
    let indent = 0;
    const formatted = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('\\end{') || trimmed.startsWith('}')) {
            indent = Math.max(0, indent - 2);
        }
        const indented = ' '.repeat(indent) + trimmed;
        if (trimmed.startsWith('\\begin{') || trimmed.endsWith('{')) {
            indent += 2;
        }
        return indented;
    });
    editor.value = formatted.join('\n');
    updateLineNumbers();
    if (typeof showToast === 'function') {
        showToast('LaTeX code formatted cleanly!', 'info');
    }
}

function insertLatexSnippet(snippet) {
    const editor = document.getElementById('resumeCodeEditor');
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const val = editor.value;
    editor.value = val.substring(0, start) + snippet + val.substring(end);
    editor.selectionStart = editor.selectionEnd = start + snippet.length;
    editor.focus();
    updateLineNumbers();
    compileCodeToResume();
}

// ══════════════ 4. LIVE PREVIEW COMPILER & TEMPLATES ══════════════

function splitBullets(text) {
    if (!text) return [];
    return text.split('\n')
        .map(l => l.replace(/^[•\-\*]\s*/, '').trim())
        .filter(l => l.length > 0);
}

function readFormIntoState() {
    const getVal = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };

    resumeState.data.name = getVal('rbName') || resumeState.data.name;
    resumeState.data.title = getVal('rbTitle') || resumeState.data.title;
    resumeState.data.email = getVal('rbEmail') || resumeState.data.email;
    resumeState.data.phone = getVal('rbPhone') || resumeState.data.phone;
    resumeState.data.linkedin = getVal('rbLinkedIn') || resumeState.data.linkedin;
    resumeState.data.github = getVal('rbGitHub') || resumeState.data.github;
    resumeState.data.location = getVal('rbLocation') || resumeState.data.location;
    resumeState.data.portfolio = getVal('rbPortfolio') || resumeState.data.portfolio;
    resumeState.data.summary = getVal('rbSummary') || resumeState.data.summary;

    const cw = getVal('rbCoursework');
    if (cw) {
        resumeState.data.coursework = cw.split(',').map(s => s.trim()).filter(Boolean);
    }

    resumeState.data.technicalSkills = {
        languages: getVal('rbSkillsLanguages') || resumeState.data.technicalSkills?.languages || '',
        frontend: getVal('rbSkillsFrontend') || resumeState.data.technicalSkills?.frontend || '',
        backend: getVal('rbSkillsBackend') || resumeState.data.technicalSkills?.backend || '',
        tools: getVal('rbSkillsTools') || resumeState.data.technicalSkills?.tools || '',
        database: getVal('rbSkillsDatabase') || resumeState.data.technicalSkills?.database || '',
        soft: getVal('rbSkillsSoft') || resumeState.data.technicalSkills?.soft || ''
    };

    // Education
    const eduList = [];
    document.querySelectorAll('#educationEntries .edu-entry').forEach(entry => {
        const inst = entry.querySelector('.rbEduInstitution')?.value || '';
        const deg = entry.querySelector('.rbEduDegree')?.value || '';
        const yr = entry.querySelector('.rbEduYear')?.value || '';
        const loc = entry.querySelector('.rbEduLocation')?.value || '';
        if (inst || deg) eduList.push({ institution: inst, degree: deg, year: yr, location: loc });
    });
    if (eduList.length > 0) resumeState.data.education = eduList;

    // Projects
    const projList = [];
    document.querySelectorAll('#projectEntries .proj-entry').forEach(entry => {
        const title = entry.querySelector('.rbProjTitle')?.value || '';
        const tech = entry.querySelector('.rbProjTech')?.value || '';
        const duration = entry.querySelector('.rbProjDuration')?.value || '';
        const desc = entry.querySelector('.rbProjDesc')?.value || '';
        if (title) projList.push({ title, tech, duration, desc });
    });
    if (projList.length > 0) resumeState.data.projects = projList;

    // Experience
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

    // Achievements
    const achList = [];
    document.querySelectorAll('#achievementEntries .ach-entry').forEach(entry => {
        const title = entry.querySelector('.rbAchTitle')?.value || '';
        const link = entry.querySelector('.rbAchLink')?.value || '';
        if (title) achList.push({ title, link });
    });
    if (achList.length > 0) resumeState.data.achievements = achList;

    // Certifications
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
    const ts = d.technicalSkills || {};

    const spacingMult = resumeState.lineSpacing === 'compact' ? '1.25' :
                         resumeState.lineSpacing === 'relaxed' ? '1.75' :
                         resumeState.lineSpacing === 'wide' ? '2.0' : '1.4';

    const baseFontSize = resumeState.fontSize === 'small' ? '12px' :
                          resumeState.fontSize === 'large' ? '14.5px' : '13px';

    // ══════════════════════════════════════════════════════════
    // TEMPLATE 1: JAKE'S OVERLEAF RESUME (CS / TECH ATS STANDARD)
    // Modeled exactly on LaTeX / Overleaf Computer Science Standard
    // ══════════════════════════════════════════════════════════
    if (tmpl === 'jakes') {
        container.innerHTML = `
            <div style="font-family:'Latin Modern Roman', 'Computer Modern', 'EB Garamond', 'Times New Roman', Times, serif; font-size:${baseFontSize}; line-height:${spacingMult}; color:#111827; padding:2.25rem 2.25rem; background:#ffffff; box-sizing:border-box;">
                
                <!-- Centered Header -->
                <div style="text-align:center; margin-bottom:1rem;">
                    <div style="font-size:1.75rem; font-weight:700; letter-spacing:0.02em; color:#0f172a; text-transform:none; margin-bottom:0.15rem;">${sanitize(d.name)}</div>
                    <div style="font-size:1rem; font-weight:700; color:#111827; margin-bottom:0.35rem;">${sanitize(d.title)}</div>
                    <div style="font-size:0.78rem; color:#1e293b; display:flex; justify-content:center; align-items:center; gap:0.6rem; flex-wrap:wrap;">
                        ${d.phone ? `<span>📞 ${sanitize(d.phone)}</span>` : ''}
                        ${d.email ? `<span>✉ <u style="text-decoration:underline;">${sanitize(d.email)}</u></span>` : ''}
                        ${d.linkedin ? `<span>🔗 <u style="text-decoration:underline;">${sanitize(d.linkedin)}</u></span>` : ''}
                        ${d.github ? `<span>🐙 <u style="text-decoration:underline;">${sanitize(d.github)}</u></span>` : ''}
                        ${d.location ? `<span>📍 ${sanitize(d.location)}</span>` : ''}
                    </div>
                </div>

                <!-- Career Objective -->
                ${d.summary ? `
                    <div style="margin-bottom:0.9rem;">
                        <div style="font-size:0.85rem; font-weight:800; text-transform:uppercase; letter-spacing:0.04em; color:#0f172a; border-bottom:1px solid #111827; padding-bottom:0.15rem; margin-bottom:0.35rem;">CAREER OBJECTIVE</div>
                        <p style="margin:0; font-size:0.8rem; text-align:justify; color:#1f2937; line-height:${spacingMult};">${sanitize(d.summary)}</p>
                    </div>
                ` : ''}

                <!-- Education -->
                ${(d.education || []).length > 0 ? `
                    <div style="margin-bottom:0.9rem;">
                        <div style="font-size:0.85rem; font-weight:800; text-transform:uppercase; letter-spacing:0.04em; color:#0f172a; border-bottom:1px solid #111827; padding-bottom:0.15rem; margin-bottom:0.4rem;">EDUCATION</div>
                        ${d.education.map(ed => `
                            <div style="margin-bottom:0.4rem;">
                                <div style="display:flex; justify-content:space-between; align-items:baseline;">
                                    <span style="font-size:0.84rem; font-weight:700; color:#0f172a;">${sanitize(ed.institution)}</span>
                                    <span style="font-size:0.8rem; color:#1f2937;">${sanitize(ed.year)}</span>
                                </div>
                                <div style="display:flex; justify-content:space-between; align-items:baseline;">
                                    <span style="font-size:0.8rem; font-style:italic; color:#374151;">${sanitize(ed.degree)}</span>
                                    <span style="font-size:0.8rem; font-style:italic; color:#374151;">${sanitize(ed.location || ed.grade || '')}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Coursework / Skills (4-column grid) -->
                ${(d.coursework || []).length > 0 ? `
                    <div style="margin-bottom:0.9rem;">
                        <div style="font-size:0.85rem; font-weight:800; text-transform:uppercase; letter-spacing:0.04em; color:#0f172a; border-bottom:1px solid #111827; padding-bottom:0.15rem; margin-bottom:0.35rem;">COURSEWORK / SKILLS</div>
                        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.25rem 0.5rem; font-size:0.78rem; color:#1f2937;">
                            ${d.coursework.map(c => `<div>• ${sanitize(c)}</div>`).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Technical Skills -->
                <div style="margin-bottom:0.9rem;">
                    <div style="font-size:0.85rem; font-weight:800; text-transform:uppercase; letter-spacing:0.04em; color:#0f172a; border-bottom:1px solid #111827; padding-bottom:0.15rem; margin-bottom:0.35rem;">TECHNICAL SKILLS</div>
                    <div style="font-size:0.8rem; color:#1f2937; line-height:1.5;">
                        ${ts.languages ? `<div><b>Languages:</b> ${sanitize(ts.languages)}</div>` : ''}
                        ${ts.frontend ? `<div><b>Frontend:</b> ${sanitize(ts.frontend)}</div>` : ''}
                        ${ts.backend ? `<div><b>Backend & APIs:</b> ${sanitize(ts.backend)}</div>` : ''}
                        ${ts.tools ? `<div><b>Developer Tools:</b> ${sanitize(ts.tools)}</div>` : ''}
                        ${ts.database ? `<div><b>Database:</b> ${sanitize(ts.database)}</div>` : ''}
                        ${ts.soft ? `<div><b>Soft Skills:</b> ${sanitize(ts.soft)}</div>` : ''}
                    </div>
                </div>

                <!-- Projects -->
                ${(d.projects || []).length > 0 ? `
                    <div style="margin-bottom:0.9rem;">
                        <div style="font-size:0.85rem; font-weight:800; text-transform:uppercase; letter-spacing:0.04em; color:#0f172a; border-bottom:1px solid #111827; padding-bottom:0.15rem; margin-bottom:0.45rem;">PROJECTS</div>
                        ${d.projects.map(p => `
                            <div style="margin-bottom:0.55rem;">
                                <div style="display:flex; justify-content:space-between; align-items:baseline;">
                                    <span style="font-size:0.84rem;"><b style="font-weight:700; color:#0f172a;">${sanitize(p.title)}</b> ${p.tech ? `| <i style="font-style:italic;">${sanitize(p.tech)}</i>` : ''}</span>
                                    <span style="font-size:0.8rem; color:#1f2937;">${sanitize(p.duration || '')}</span>
                                </div>
                                <ul style="margin:0.2rem 0 0 1.25rem; padding:0; font-size:0.79rem; color:#1f2937; line-height:${spacingMult};">
                                    ${splitBullets(p.desc).map(b => `<li style="margin-bottom:0.15rem;">${sanitize(b)}</li>`).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Experience -->
                ${(d.experience || []).length > 0 ? `
                    <div style="margin-bottom:0.9rem;">
                        <div style="font-size:0.85rem; font-weight:800; text-transform:uppercase; letter-spacing:0.04em; color:#0f172a; border-bottom:1px solid #111827; padding-bottom:0.15rem; margin-bottom:0.45rem;">EXPERIENCE</div>
                        ${d.experience.map(e => `
                            <div style="margin-bottom:0.55rem;">
                                <div style="display:flex; justify-content:space-between; align-items:baseline;">
                                    <span style="font-size:0.84rem; font-weight:700; color:#0f172a;">${sanitize(e.title)}</span>
                                    <span style="font-size:0.8rem; color:#1f2937;">${sanitize(e.duration)}</span>
                                </div>
                                <div style="display:flex; justify-content:space-between; align-items:baseline;">
                                    <span style="font-size:0.8rem; font-style:italic; color:#374151;">${sanitize(e.company)}</span>
                                    <span style="font-size:0.8rem; font-style:italic; color:#374151;">${sanitize(e.location || '')}</span>
                                </div>
                                <ul style="margin:0.2rem 0 0 1.25rem; padding:0; font-size:0.79rem; color:#1f2937; line-height:${spacingMult};">
                                    ${splitBullets(e.desc).map(b => `<li style="margin-bottom:0.15rem;">${sanitize(b)}</li>`).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Achievements -->
                ${(d.achievements || []).length > 0 ? `
                    <div style="margin-bottom:0.9rem;">
                        <div style="font-size:0.85rem; font-weight:800; text-transform:uppercase; letter-spacing:0.04em; color:#0f172a; border-bottom:1px solid #111827; padding-bottom:0.15rem; margin-bottom:0.35rem;">ACHIEVEMENTS</div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.35rem 1rem; font-size:0.78rem; color:#1f2937;">
                            ${d.achievements.map(a => `<div>• ${sanitize(a.title)} <span style="font-size:0.7rem; color:#2563eb;">⤤</span></div>`).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Certifications -->
                ${(d.certifications || []).length > 0 ? `
                    <div>
                        <div style="font-size:0.85rem; font-weight:800; text-transform:uppercase; letter-spacing:0.04em; color:#0f172a; border-bottom:1px solid #111827; padding-bottom:0.15rem; margin-bottom:0.35rem;">CERTIFICATIONS</div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.35rem 1rem; font-size:0.78rem; color:#1f2937;">
                            ${d.certifications.map(c => `<div>• ${sanitize(c.name)} <span style="font-size:0.7rem; color:#2563eb;">⤤</span></div>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // ══════════════════════════════════════════════════════════
    // TEMPLATE 2: DEEDY CV (TWO-COLUMN LATEX / OVERLEAF)
    // ══════════════════════════════════════════════════════════
    else if (tmpl === 'deedy') {
        container.innerHTML = `
            <div style="font-family:'Latin Modern Roman', 'Inter', sans-serif; font-size:${baseFontSize}; line-height:${spacingMult}; color:#0f172a; padding:2rem; background:#ffffff; box-sizing:border-box;">
                <!-- Header -->
                <div style="border-bottom:2px solid #2563eb; padding-bottom:1rem; margin-bottom:1.25rem;">
                    <div style="display:flex; justify-content:space-between; align-items:baseline; flex-wrap:wrap; gap:0.5rem;">
                        <div>
                            <h1 style="font-size:1.85rem; font-weight:800; margin:0; color:#0f172a; letter-spacing:-0.02em;">${sanitize(d.name)}</h1>
                            <div style="font-size:0.95rem; color:#2563eb; font-weight:600;">${sanitize(d.title)}</div>
                        </div>
                        <div style="font-size:0.75rem; color:#64748b; text-align:right;">
                            <div>✉ ${sanitize(d.email)} | 📱 ${sanitize(d.phone)}</div>
                            <div>🔗 ${sanitize(d.linkedin)} | 📍 ${sanitize(d.location)}</div>
                        </div>
                    </div>
                </div>

                <!-- 2 Columns -->
                <div style="display:flex; gap:1.75rem;">
                    <!-- Left Sidebar (35%) -->
                    <div style="width:35%; border-right:1px solid #e2e8f0; padding-right:1.25rem;">
                        <!-- Education -->
                        <div style="margin-bottom:1.25rem;">
                            <div style="font-size:0.78rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:#2563eb; margin-bottom:0.5rem;">Education</div>
                            ${d.education.map(ed => `
                                <div style="margin-bottom:0.6rem;">
                                    <div style="font-weight:700; font-size:0.8rem; color:#0f172a;">${sanitize(ed.institution)}</div>
                                    <div style="font-size:0.75rem; color:#475569; font-style:italic;">${sanitize(ed.degree)}</div>
                                    <div style="font-size:0.7rem; color:#64748b;">${sanitize(ed.year)} | ${sanitize(ed.location || '')}</div>
                                </div>
                            `).join('')}
                        </div>

                        <!-- Coursework -->
                        ${(d.coursework || []).length > 0 ? `
                            <div style="margin-bottom:1.25rem;">
                                <div style="font-size:0.78rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:#2563eb; margin-bottom:0.5rem;">Coursework</div>
                                <ul style="margin:0; padding-left:1.1rem; font-size:0.74rem; color:#334155;">
                                    ${d.coursework.map(c => `<li>${sanitize(c)}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}

                        <!-- Skills -->
                        <div style="margin-bottom:1.25rem;">
                            <div style="font-size:0.78rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:#2563eb; margin-bottom:0.5rem;">Skills</div>
                            <div style="font-size:0.74rem; color:#334155; display:flex; flex-direction:column; gap:0.4rem;">
                                ${ts.languages ? `<div><b>Languages:</b><br>${sanitize(ts.languages)}</div>` : ''}
                                ${ts.frontend ? `<div><b>Frontend:</b><br>${sanitize(ts.frontend)}</div>` : ''}
                                ${ts.backend ? `<div><b>Backend:</b><br>${sanitize(ts.backend)}</div>` : ''}
                                ${ts.tools ? `<div><b>Tools:</b><br>${sanitize(ts.tools)}</div>` : ''}
                                ${ts.database ? `<div><b>DB:</b><br>${sanitize(ts.database)}</div>` : ''}
                            </div>
                        </div>

                        <!-- Certifications -->
                        ${(d.certifications || []).length > 0 ? `
                            <div>
                                <div style="font-size:0.78rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:#2563eb; margin-bottom:0.5rem;">Certifications</div>
                                <div style="font-size:0.72rem; color:#475569;">
                                    ${d.certifications.map(c => `<div>📜 ${sanitize(c.name)}</div>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Right Column (65%) -->
                    <div style="width:65%;">
                        <!-- Summary -->
                        <div style="margin-bottom:1.25rem;">
                            <div style="font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:#0f172a; border-bottom:1px solid #cbd5e1; padding-bottom:0.25rem; margin-bottom:0.5rem;">Career Objective</div>
                            <p style="margin:0; font-size:0.79rem; color:#334155; line-height:${spacingMult};">${sanitize(d.summary)}</p>
                        </div>

                        <!-- Experience -->
                        ${(d.experience || []).length > 0 ? `
                            <div style="margin-bottom:1.25rem;">
                                <div style="font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:#0f172a; border-bottom:1px solid #cbd5e1; padding-bottom:0.25rem; margin-bottom:0.6rem;">Experience</div>
                                ${d.experience.map(e => `
                                    <div style="margin-bottom:0.75rem;">
                                        <div style="display:flex; justify-content:space-between; align-items:baseline;">
                                            <span style="font-weight:700; font-size:0.84rem; color:#0f172a;">${sanitize(e.title)}</span>
                                            <span style="font-size:0.72rem; color:#64748b;">${sanitize(e.duration)}</span>
                                        </div>
                                        <div style="font-size:0.76rem; color:#2563eb; font-weight:600; margin-bottom:0.25rem;">${sanitize(e.company)} ${e.location ? '• ' + sanitize(e.location) : ''}</div>
                                        <ul style="margin:0.2rem 0 0 1.15rem; padding:0; font-size:0.77rem; color:#475569; line-height:${spacingMult};">
                                            ${splitBullets(e.desc).map(b => `<li>${sanitize(b)}</li>`).join('')}
                                        </ul>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}

                        <!-- Projects -->
                        ${(d.projects || []).length > 0 ? `
                            <div style="margin-bottom:1.25rem;">
                                <div style="font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:#0f172a; border-bottom:1px solid #cbd5e1; padding-bottom:0.25rem; margin-bottom:0.6rem;">Projects</div>
                                ${d.projects.map(p => `
                                    <div style="margin-bottom:0.75rem;">
                                        <div style="display:flex; justify-content:space-between; align-items:baseline;">
                                            <span style="font-weight:700; font-size:0.84rem; color:#0f172a;">${sanitize(p.title)}</span>
                                            <span style="font-size:0.72rem; color:#64748b;">${sanitize(p.duration || '')}</span>
                                        </div>
                                        <div style="font-size:0.75rem; color:#2563eb; font-style:italic;">Tech: ${sanitize(p.tech)}</div>
                                        <ul style="margin:0.2rem 0 0 1.15rem; padding:0; font-size:0.77rem; color:#475569; line-height:${spacingMult};">
                                            ${splitBullets(p.desc).map(b => `<li>${sanitize(b)}</li>`).join('')}
                                        </ul>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}

                        <!-- Achievements -->
                        ${(d.achievements || []).length > 0 ? `
                            <div>
                                <div style="font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:#0f172a; border-bottom:1px solid #cbd5e1; padding-bottom:0.25rem; margin-bottom:0.5rem;">Achievements</div>
                                <ul style="margin:0; padding-left:1.15rem; font-size:0.76rem; color:#334155;">
                                    ${d.achievements.map(a => `<li>${sanitize(a.title)}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // ══════════════════════════════════════════════════════════
    // TEMPLATE 3: IVY LEAGUE ACADEMIC CLASSIC LATEX
    // ══════════════════════════════════════════════════════════
    else if (tmpl === 'ivy_league') {
        container.innerHTML = `
            <div style="font-family:'Latin Modern Roman', 'EB Garamond', 'Times New Roman', serif; font-size:${baseFontSize}; line-height:${spacingMult}; color:#111827; padding:2.5rem 2.25rem; background:#ffffff; box-sizing:border-box;">
                <!-- Double rule header -->
                <div style="text-align:center; margin-bottom:1.25rem;">
                    <div style="font-size:1.75rem; font-weight:800; letter-spacing:0.05em; color:#0f172a; text-transform:uppercase;">${sanitize(d.name)}</div>
                    <div style="font-size:0.95rem; font-weight:600; color:#334155; margin:0.15rem 0 0.4rem;">${sanitize(d.title)}</div>
                    <div style="border-top:2px solid #0f172a; border-bottom:1px solid #0f172a; padding:0.25rem 0; font-size:0.78rem; color:#1e293b; display:flex; justify-content:center; gap:0.9rem; flex-wrap:wrap;">
                        <span>${sanitize(d.phone)}</span> • <span>${sanitize(d.email)}</span> • <span>${sanitize(d.location)}</span> • <span>${sanitize(d.linkedin)}</span>
                    </div>
                </div>

                <!-- Education -->
                ${(d.education || []).length > 0 ? `
                    <div style="margin-bottom:1rem;">
                        <div style="font-size:0.85rem; font-weight:800; text-transform:uppercase; letter-spacing:0.04em; color:#0f172a; border-bottom:1px solid #0f172a; padding-bottom:0.15rem; margin-bottom:0.4rem;">Education</div>
                        ${d.education.map(ed => `
                            <div style="margin-bottom:0.4rem; padding-left:0.5rem;">
                                <div style="display:flex; justify-content:space-between;">
                                    <span style="font-weight:700; font-size:0.84rem;">${sanitize(ed.institution)}</span>
                                    <span style="font-size:0.8rem;">${sanitize(ed.year)}</span>
                                </div>
                                <div style="display:flex; justify-content:space-between;">
                                    <span style="font-size:0.8rem; font-style:italic;">${sanitize(ed.degree)}</span>
                                    <span style="font-size:0.8rem; font-style:italic;">${sanitize(ed.location || '')}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Career Objective -->
                <div style="margin-bottom:1rem;">
                    <div style="font-size:0.85rem; font-weight:800; text-transform:uppercase; letter-spacing:0.04em; color:#0f172a; border-bottom:1px solid #0f172a; padding-bottom:0.15rem; margin-bottom:0.35rem;">Career Objective</div>
                    <p style="margin:0; font-size:0.8rem; padding-left:0.5rem; text-align:justify; line-height:${spacingMult};">${sanitize(d.summary)}</p>
                </div>

                <!-- Skills -->
                <div style="margin-bottom:1rem;">
                    <div style="font-size:0.85rem; font-weight:800; text-transform:uppercase; letter-spacing:0.04em; color:#0f172a; border-bottom:1px solid #0f172a; padding-bottom:0.15rem; margin-bottom:0.35rem;">Technical Skills</div>
                    <div style="font-size:0.8rem; padding-left:0.5rem; line-height:1.45;">
                        <div><b>Languages:</b> ${sanitize(ts.languages || '')}</div>
                        <div><b>Frontend & Backend:</b> ${sanitize(ts.frontend || '')}, ${sanitize(ts.backend || '')}</div>
                        <div><b>Tools & Database:</b> ${sanitize(ts.tools || '')}, ${sanitize(ts.database || '')}</div>
                    </div>
                </div>

                <!-- Projects -->
                ${(d.projects || []).length > 0 ? `
                    <div style="margin-bottom:1rem;">
                        <div style="font-size:0.85rem; font-weight:800; text-transform:uppercase; letter-spacing:0.04em; color:#0f172a; border-bottom:1px solid #0f172a; padding-bottom:0.15rem; margin-bottom:0.4rem;">Projects</div>
                        ${d.projects.map(p => `
                            <div style="margin-bottom:0.5rem; padding-left:0.5rem;">
                                <div style="display:flex; justify-content:space-between;">
                                    <span><b>${sanitize(p.title)}</b> | <i>${sanitize(p.tech)}</i></span>
                                    <span>${sanitize(p.duration || '')}</span>
                                </div>
                                <ul style="margin:0.2rem 0 0 1.2rem; padding:0; font-size:0.79rem; line-height:${spacingMult};">
                                    ${splitBullets(p.desc).map(b => `<li>${sanitize(b)}</li>`).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Experience -->
                ${(d.experience || []).length > 0 ? `
                    <div>
                        <div style="font-size:0.85rem; font-weight:800; text-transform:uppercase; letter-spacing:0.04em; color:#0f172a; border-bottom:1px solid #0f172a; padding-bottom:0.15rem; margin-bottom:0.4rem;">Professional Experience</div>
                        ${d.experience.map(e => `
                            <div style="margin-bottom:0.5rem; padding-left:0.5rem;">
                                <div style="display:flex; justify-content:space-between;">
                                    <b>${sanitize(e.title)} — <i>${sanitize(e.company)}</i></b>
                                    <span>${sanitize(e.duration)}</span>
                                </div>
                                <ul style="margin:0.2rem 0 0 1.2rem; padding:0; font-size:0.79rem; line-height:${spacingMult};">
                                    ${splitBullets(e.desc).map(b => `<li>${sanitize(b)}</li>`).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    // ══════════════════════════════════════════════════════════
    // TEMPLATE 4: TECH MINIMALIST (FAANG SINGLE-COLUMN ATS)
    // ══════════════════════════════════════════════════════════
    else if (tmpl === 'tech_minimalist') {
        container.innerHTML = `
            <div style="font-family:'Inter', sans-serif; font-size:${baseFontSize}; line-height:${spacingMult}; color:#0f172a; padding:2rem 2.25rem; background:#ffffff; box-sizing:border-box;">
                <!-- Header -->
                <div style="margin-bottom:1.25rem;">
                    <h1 style="font-size:1.75rem; font-weight:800; letter-spacing:-0.03em; margin:0 0 0.2rem; color:#0f172a;">${sanitize(d.name)}</h1>
                    <div style="font-size:0.9rem; font-weight:600; color:#059669; margin-bottom:0.35rem;">${sanitize(d.title)}</div>
                    <div style="font-size:0.76rem; color:#64748b; display:flex; gap:0.75rem; flex-wrap:wrap;">
                        <span>📞 ${sanitize(d.phone)}</span> | <span>✉ ${sanitize(d.email)}</span> | <span>🔗 ${sanitize(d.linkedin)}</span> | <span>📍 ${sanitize(d.location)}</span>
                    </div>
                </div>

                <!-- Summary -->
                <div style="margin-bottom:1rem; padding-bottom:0.75rem; border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0; font-size:0.8rem; color:#334155; line-height:${spacingMult};">${sanitize(d.summary)}</p>
                </div>

                <!-- Skills -->
                <div style="margin-bottom:1rem;">
                    <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#059669; margin-bottom:0.35rem;">Technical Skills</div>
                    <div style="display:flex; flex-wrap:wrap; gap:0.35rem;">
                        ${(d.skills || []).map(s => `<span style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; padding:0.15rem 0.5rem; border-radius:4px; font-size:0.72rem; font-weight:600;">${sanitize(s)}</span>`).join('')}
                    </div>
                </div>

                <!-- Experience -->
                ${(d.experience || []).length > 0 ? `
                    <div style="margin-bottom:1rem;">
                        <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#059669; margin-bottom:0.5rem;">Experience</div>
                        ${d.experience.map(e => `
                            <div style="margin-bottom:0.75rem;">
                                <div style="display:flex; justify-content:space-between;">
                                    <span style="font-weight:700; font-size:0.84rem; color:#0f172a;">${sanitize(e.title)} <span style="font-weight:normal; color:#64748b;">— ${sanitize(e.company)}</span></span>
                                    <span style="font-size:0.75rem; color:#64748b;">${sanitize(e.duration)}</span>
                                </div>
                                <ul style="margin:0.2rem 0 0 1.15rem; padding:0; font-size:0.78rem; color:#475569; line-height:${spacingMult};">
                                    ${splitBullets(e.desc).map(b => `<li>${sanitize(b)}</li>`).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Projects -->
                ${(d.projects || []).length > 0 ? `
                    <div style="margin-bottom:1rem;">
                        <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#059669; margin-bottom:0.5rem;">Projects</div>
                        ${d.projects.map(p => `
                            <div style="margin-bottom:0.75rem;">
                                <div style="display:flex; justify-content:space-between;">
                                    <span style="font-weight:700; font-size:0.84rem; color:#0f172a;">${sanitize(p.title)} <span style="font-size:0.72rem; color:#059669; font-weight:600;">[${sanitize(p.tech)}]</span></span>
                                    <span style="font-size:0.75rem; color:#64748b;">${sanitize(p.duration || '')}</span>
                                </div>
                                <ul style="margin:0.2rem 0 0 1.15rem; padding:0; font-size:0.78rem; color:#475569; line-height:${spacingMult};">
                                    ${splitBullets(p.desc).map(b => `<li>${sanitize(b)}</li>`).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Education -->
                ${(d.education || []).length > 0 ? `
                    <div>
                        <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#059669; margin-bottom:0.4rem;">Education</div>
                        ${d.education.map(ed => `
                            <div style="display:flex; justify-content:space-between; font-size:0.79rem; margin-bottom:0.25rem;">
                                <span><b>${sanitize(ed.degree)}</b>, ${sanitize(ed.institution)}</span>
                                <span style="color:#64748b;">${sanitize(ed.year)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    // ── Template 5: Modern Split Sidebar Layout ──
    else if (tmpl === 'modern') {
        container.innerHTML = `
            <div style="font-family:'Inter', sans-serif; font-size:${baseFontSize}; line-height:${spacingMult}; color:#0f172a; display:flex; min-height:600px; background:#ffffff; box-sizing:border-box;">
                <div style="width:35%; background:#0f172a; color:#f8fafc; padding:1.75rem 1.25rem; box-sizing:border-box;">
                    <h2 style="font-size:1.35rem; font-weight:700; margin:0 0 0.25rem; color:#ffffff; word-break:break-word;">${sanitize(d.name)}</h2>
                    <div style="font-size:0.8rem; color:${accent}; font-weight:600; margin-bottom:1.5rem;">${sanitize(d.title)}</div>
                    
                    <div style="border-top:1px solid #334155; padding-top:1rem; margin-bottom:1.25rem;">
                        <div style="font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; margin-bottom:0.6rem;">Contact</div>
                        <div style="font-size:0.75rem; color:#cbd5e1; display:flex; flex-direction:column; gap:0.4rem; word-break:break-word;">
                            <span>✉ ${sanitize(d.email)}</span>
                            <span>📱 ${sanitize(d.phone)}</span>
                            <span>📍 ${sanitize(d.location)}</span>
                            <span>🔗 ${sanitize(d.linkedin || d.portfolio)}</span>
                        </div>
                    </div>

                    <div style="border-top:1px solid #334155; padding-top:1rem; margin-bottom:1.25rem;">
                        <div style="font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; margin-bottom:0.6rem;">Skills</div>
                        <div style="display:flex; flex-wrap:wrap; gap:0.35rem;">
                            ${(d.skills || []).map(s => `<span style="background:#1e293b; color:#f1f5f9; padding:0.2rem 0.5rem; border-radius:4px; font-size:0.7rem; border:1px solid #334155; font-weight:500;">${sanitize(s)}</span>`).join('')}
                        </div>
                    </div>

                    ${(d.education || []).length > 0 ? `
                        <div style="border-top:1px solid #334155; padding-top:1rem;">
                            <div style="font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; margin-bottom:0.6rem;">Education</div>
                            ${d.education.map(ed => `
                                <div style="margin-bottom:0.6rem;">
                                    <div style="font-size:0.75rem; font-weight:600; color:#ffffff;">${sanitize(ed.degree)}</div>
                                    <div style="font-size:0.7rem; color:#94a3b8;">${sanitize(ed.institution)}</div>
                                    <div style="font-size:0.65rem; color:${accent};">${sanitize(ed.year)}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>

                <div style="width:65%; padding:1.75rem 1.5rem; box-sizing:border-box; background:#ffffff;">
                    <div style="margin-bottom:1.5rem;">
                        <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:${accent}; border-bottom:2px solid ${accent}; padding-bottom:0.3rem; margin-bottom:0.6rem;">Summary</div>
                        <p style="margin:0; color:#334155; font-size:0.82rem; line-height:${spacingMult};">${sanitize(d.summary)}</p>
                    </div>

                    ${(d.experience || []).length > 0 ? `
                        <div style="margin-bottom:1.5rem;">
                            <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:${accent}; border-bottom:2px solid ${accent}; padding-bottom:0.3rem; margin-bottom:0.75rem;">Experience</div>
                            ${d.experience.map(e => `
                                <div style="margin-bottom:0.9rem;">
                                    <div style="display:flex; justify-content:space-between; align-items:baseline;">
                                        <span style="font-weight:700; font-size:0.88rem; color:#0f172a;">${sanitize(e.title)}</span>
                                        <span style="font-size:0.75rem; color:#64748b; font-weight:500;">${sanitize(e.duration)}</span>
                                    </div>
                                    <div style="font-size:0.78rem; color:${accent}; font-weight:600; margin-bottom:0.25rem;">${sanitize(e.company)}</div>
                                    <p style="margin:0; font-size:0.78rem; color:#475569; line-height:${spacingMult};">${sanitize(e.desc)}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${(d.projects || []).length > 0 ? `
                        <div>
                            <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:${accent}; border-bottom:2px solid ${accent}; padding-bottom:0.3rem; margin-bottom:0.75rem;">Key Projects</div>
                            ${d.projects.map(p => `
                                <div style="margin-bottom:0.9rem;">
                                    <div style="display:flex; justify-content:space-between; align-items:baseline;">
                                        <span style="font-weight:700; font-size:0.85rem; color:#0f172a;">${sanitize(p.title)}</span>
                                        <span style="font-size:0.72rem; color:${accent}; font-weight:600;">${sanitize(p.tech)}</span>
                                    </div>
                                    <p style="margin:0.2rem 0 0; font-size:0.78rem; color:#475569; line-height:${spacingMult};">${sanitize(p.desc)}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // ── Template 6: Classic Corporate ──
    else if (tmpl === 'classic') {
        container.innerHTML = `
            <div style="font-family:'Inter', sans-serif; font-size:${baseFontSize}; line-height:${spacingMult}; padding:2.25rem 2rem; background:#ffffff; min-height:600px; box-sizing:border-box;">
                <div style="text-align:center; border-bottom:2px solid #0f172a; padding-bottom:1.25rem; margin-bottom:1.5rem;">
                    <h1 style="font-size:1.6rem; font-weight:800; letter-spacing:0.04em; margin:0 0 0.3rem; color:#0f172a;">${sanitize(d.name.toUpperCase())}</h1>
                    <div style="font-size:0.9rem; font-weight:600; color:${accent}; margin-bottom:0.5rem;">${sanitize(d.title)}</div>
                    <div style="font-size:0.78rem; color:#475569; display:flex; justify-content:center; gap:0.75rem; flex-wrap:wrap;">
                        <span>✉ ${sanitize(d.email)}</span> • <span>📱 ${sanitize(d.phone)}</span> • <span>📍 ${sanitize(d.location)}</span> • <span>🔗 ${sanitize(d.linkedin || d.portfolio)}</span>
                    </div>
                </div>

                <div style="margin-bottom:1.35rem;">
                    <h3 style="font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#0f172a; border-bottom:1px solid #cbd5e1; padding-bottom:0.3rem; margin:0 0 0.5rem;">Career Objective</h3>
                    <p style="margin:0; font-size:0.82rem; color:#334155; line-height:${spacingMult};">${sanitize(d.summary)}</p>
                </div>

                <div style="margin-bottom:1.35rem;">
                    <h3 style="font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#0f172a; border-bottom:1px solid #cbd5e1; padding-bottom:0.3rem; margin:0 0 0.5rem;">Technical Skills</h3>
                    <div style="font-size:0.8rem; color:#334155; line-height:${spacingMult}; font-weight:500;">
                        ${(d.skills || []).join(' • ')}
                    </div>
                </div>

                ${(d.experience || []).length > 0 ? `
                    <div style="margin-bottom:1.35rem;">
                        <h3 style="font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#0f172a; border-bottom:1px solid #cbd5e1; padding-bottom:0.3rem; margin:0 0 0.75rem;">Experience</h3>
                        ${d.experience.map(e => `
                            <div style="margin-bottom:0.9rem;">
                                <div style="display:flex; justify-content:space-between;">
                                    <span style="font-weight:700; font-size:0.88rem; color:#0f172a;">${sanitize(e.title)}</span>
                                    <span style="font-size:0.75rem; color:#64748b; font-weight:600;">${sanitize(e.duration)}</span>
                                </div>
                                <div style="font-size:0.8rem; color:${accent}; font-weight:600; margin-bottom:0.25rem;">${sanitize(e.company)} ${e.location ? '· ' + sanitize(e.location) : ''}</div>
                                <p style="margin:0; font-size:0.8rem; color:#334155; line-height:${spacingMult};">${sanitize(e.desc)}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                ${(d.projects || []).length > 0 ? `
                    <div style="margin-bottom:1.35rem;">
                        <h3 style="font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#0f172a; border-bottom:1px solid #cbd5e1; padding-bottom:0.3rem; margin:0 0 0.75rem;">Key Projects</h3>
                        ${d.projects.map(p => `
                            <div style="margin-bottom:0.75rem;">
                                <div style="display:flex; justify-content:space-between;">
                                    <span style="font-weight:700; font-size:0.85rem; color:#0f172a;">${sanitize(p.title)}</span>
                                    <span style="font-size:0.75rem; color:#64748b;">[${sanitize(p.tech)}]</span>
                                </div>
                                <p style="margin:0.2rem 0 0; font-size:0.8rem; color:#334155; line-height:${spacingMult};">${sanitize(p.desc)}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                ${(d.education || []).length > 0 ? `
                    <div>
                        <h3 style="font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#0f172a; border-bottom:1px solid #cbd5e1; padding-bottom:0.3rem; margin:0 0 0.5rem;">Education</h3>
                        ${d.education.map(ed => `
                            <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
                                <div><span style="font-weight:700; font-size:0.82rem;">${sanitize(ed.degree)}</span> — <span style="color:#475569;">${sanitize(ed.institution)}</span></div>
                                <span style="font-size:0.75rem; color:#64748b; font-weight:600;">${sanitize(ed.year)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    // ── Template 7: Minimal Clean Accent ──
    else if (tmpl === 'minimal') {
        container.innerHTML = `
            <div style="font-family:'Inter', sans-serif; font-size:${baseFontSize}; line-height:${spacingMult}; padding:2.25rem 2rem; background:#ffffff; min-height:600px; border-left:6px solid ${accent}; box-sizing:border-box;">
                <div style="margin-bottom:1.5rem;">
                    <h1 style="font-size:1.55rem; font-weight:800; margin:0 0 0.25rem; color:#0f172a;">${sanitize(d.name)}</h1>
                    <div style="font-size:0.9rem; font-weight:600; color:${accent};">${sanitize(d.title)}</div>
                    <div style="font-size:0.78rem; color:#64748b; margin-top:0.4rem; display:flex; gap:1rem; flex-wrap:wrap;">
                        <span>${sanitize(d.email)}</span> | <span>${sanitize(d.phone)}</span> | <span>${sanitize(d.location)}</span> | <span>${sanitize(d.linkedin || d.portfolio)}</span>
                    </div>
                </div>

                <div style="margin-bottom:1.35rem;">
                    <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#64748b; margin-bottom:0.4rem;">Career Objective</div>
                    <p style="margin:0; font-size:0.82rem; color:#334155; line-height:${spacingMult};">${sanitize(d.summary)}</p>
                </div>

                <div style="margin-bottom:1.35rem;">
                    <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#64748b; margin-bottom:0.4rem;">Skills</div>
                    <div style="display:flex; flex-wrap:wrap; gap:0.35rem;">
                        ${(d.skills || []).map(s => `<span style="background:#f8fafc; color:#0f172a; padding:0.25rem 0.55rem; border-radius:4px; font-size:0.72rem; border:1px solid #e2e8f0; font-weight:500;">${sanitize(s)}</span>`).join('')}
                    </div>
                </div>

                ${(d.experience || []).length > 0 ? `
                    <div style="margin-bottom:1.35rem;">
                        <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#64748b; margin-bottom:0.6rem;">Experience</div>
                        ${d.experience.map(e => `
                            <div style="margin-bottom:0.85rem; padding-left:0.6rem; border-left:2px solid #e2e8f0;">
                                <div style="display:flex; justify-content:space-between;">
                                    <span style="font-size:0.85rem; font-weight:700; color:#0f172a;">${sanitize(e.title)} <span style="font-weight:normal; color:#64748b;">at ${sanitize(e.company)}</span></span>
                                    <span style="font-size:0.72rem; color:#94a3b8;">${sanitize(e.duration)}</span>
                                </div>
                                <p style="margin:0.2rem 0 0; font-size:0.78rem; color:#475569; line-height:${spacingMult};">${sanitize(e.desc)}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                ${(d.projects || []).length > 0 ? `
                    <div style="margin-bottom:1.35rem;">
                        <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#64748b; margin-bottom:0.6rem;">Projects</div>
                        ${d.projects.map(p => `
                            <div style="margin-bottom:0.75rem; padding-left:0.6rem; border-left:2px solid #e2e8f0;">
                                <div style="font-size:0.85rem; font-weight:700; color:#0f172a;">${sanitize(p.title)} <span style="font-size:0.72rem; color:${accent}; font-weight:600;">[${sanitize(p.tech)}]</span></div>
                                <p style="margin:0.15rem 0 0; font-size:0.78rem; color:#475569; line-height:${spacingMult};">${sanitize(p.desc)}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                ${(d.education || []).length > 0 ? `
                    <div>
                        <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#64748b; margin-bottom:0.4rem;">Education</div>
                        ${d.education.map(ed => `
                            <div style="font-size:0.8rem; color:#334155; margin-bottom:0.3rem;"><b>${sanitize(ed.degree)}</b>, ${sanitize(ed.institution)} (${sanitize(ed.year)})</div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    // ── Template 8: Executive Banner ──
    else if (tmpl === 'executive') {
        container.innerHTML = `
            <div style="font-family:'Inter', sans-serif; font-size:${baseFontSize}; line-height:${spacingMult}; background:#ffffff; min-height:600px; box-sizing:border-box;">
                <div style="background:linear-gradient(135deg, ${accent}, #0f172a); color:white; padding:1.75rem 2rem;">
                    <h1 style="font-size:1.55rem; font-weight:800; margin:0 0 0.25rem; color:#ffffff;">${sanitize(d.name)}</h1>
                    <div style="font-size:0.9rem; color:rgba(255,255,255,0.9); font-weight:600;">${sanitize(d.title)}</div>
                    <div style="font-size:0.75rem; color:rgba(255,255,255,0.85); margin-top:0.6rem; display:flex; gap:0.9rem; flex-wrap:wrap;">
                        <span>✉ ${sanitize(d.email)}</span> • <span>📱 ${sanitize(d.phone)}</span> • <span>📍 ${sanitize(d.location)}</span> • <span>🔗 ${sanitize(d.linkedin || d.portfolio)}</span>
                    </div>
                </div>

                <div style="padding:1.75rem 2rem;">
                    <div style="margin-bottom:1.35rem;">
                        <h3 style="font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:${accent}; margin:0 0 0.5rem;">Career Objective</h3>
                        <p style="margin:0; font-size:0.82rem; color:#334155; line-height:${spacingMult};">${sanitize(d.summary)}</p>
                    </div>

                    <div style="margin-bottom:1.35rem;">
                        <h3 style="font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:${accent}; margin:0 0 0.5rem;">Core Technology Stack</h3>
                        <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                            ${(d.skills || []).map(s => `<span style="background:rgba(249,115,22,0.1); color:#0f172a; padding:0.25rem 0.6rem; border-radius:6px; font-size:0.72rem; font-weight:600; border:1px solid rgba(249,115,22,0.25);">${sanitize(s)}</span>`).join('')}
                        </div>
                    </div>

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
                                    <p style="margin:0; font-size:0.78rem; color:#475569; line-height:${spacingMult};">${sanitize(e.desc)}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${(d.projects || []).length > 0 ? `
                        <div style="margin-bottom:1.35rem;">
                            <h3 style="font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:${accent}; margin:0 0 0.6rem;">Key Projects</h3>
                            ${d.projects.map(p => `
                                <div style="margin-bottom:0.75rem; background:#f8fafc; padding:0.7rem; border-radius:8px; border:1px solid #e2e8f0;">
                                    <div style="font-size:0.85rem; font-weight:700; color:#0f172a;">${sanitize(p.title)}</div>
                                    <p style="margin:0.2rem 0; font-size:0.78rem; color:#475569; line-height:${spacingMult};">${sanitize(p.desc)}</p>
                                    <div style="font-size:0.72rem; color:${accent}; font-weight:600;">Tech: ${sanitize(p.tech)}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${(d.education || []).length > 0 ? `
                        <div>
                            <h3 style="font-size:0.82rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:${accent}; margin:0 0 0.5rem;">Education</h3>
                            ${d.education.map(ed => `
                                <div style="font-size:0.8rem; color:#334155; margin-bottom:0.3rem;"><b>${sanitize(ed.degree)}</b> — ${sanitize(ed.institution)} (${sanitize(ed.year)})</div>
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
    populateVisualFormFromState();

    // Check saved profile data if logged in
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

    // Input change listeners on Visual Form
    const visualForm = document.getElementById('visualModeContainer');
    if (visualForm) {
        visualForm.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea')) {
                updatePreview();
            }
        });
    }

    // Code Editor live typing with debounce & gutter scroll synchronization
    const codeEditor = document.getElementById('resumeCodeEditor');
    const gutter = document.getElementById('codeLineGutter');
    let compileDebounceTimer = null;

    if (codeEditor) {
        // Sync scroll
        codeEditor.addEventListener('scroll', () => {
            if (gutter) gutter.scrollTop = codeEditor.scrollTop;
        });

        // Tab key support: indent 2 spaces
        codeEditor.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = codeEditor.selectionStart;
                const end = codeEditor.selectionEnd;
                codeEditor.value = codeEditor.value.substring(0, start) + '  ' + codeEditor.value.substring(end);
                codeEditor.selectionStart = codeEditor.selectionEnd = start + 2;
                updateLineNumbers();
            }
        });

        // Input handler
        codeEditor.addEventListener('input', () => {
            updateLineNumbers();
            const autoCompile = document.getElementById('chkAutoCompile');
            if (!autoCompile || autoCompile.checked) {
                clearTimeout(compileDebounceTimer);
                compileDebounceTimer = setTimeout(() => {
                    compileCodeToResume();
                }, 250);
            }
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

            resumeState.template = tmpl.dataset.tmpl || 'jakes';
            const nameEl = document.getElementById('previewTemplateName');
            if (nameEl) {
                const mapNames = {
                    jakes: "Jake's Overleaf ⭐",
                    deedy: 'Deedy CV',
                    ivy_league: 'Ivy League',
                    tech_minimalist: 'Tech Minimalist',
                    modern: 'Modern Split',
                    classic: 'Classic',
                    minimal: 'Minimal',
                    executive: 'Executive'
                };
                nameEl.textContent = mapNames[resumeState.template] || resumeState.template;
            }

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
            resumeState.accentColor = dot.dataset.color || '#0f172a';
            updatePreview();
        });
    });

    // Load Demo Data Button
    const loadDemoBtn = document.getElementById('loadDemoBtn');
    if (loadDemoBtn) {
        loadDemoBtn.addEventListener('click', () => {
            resumeState.data = {
                name: 'Suraj Kumar',
                title: 'Software Developer',
                email: 'surajkr09871@gmail.com',
                phone: '+91-9871187368',
                linkedin: 'linkedin.com/in/suraj-kumar-47aa35284',
                github: 'Suraj09871',
                location: 'New Delhi, India',
                portfolio: 'surajkumar.dev',
                summary: 'Motivated Software Developer with experience in building web applications using JavaScript, HTML, CSS, and Node.js. Strong understanding of Data Structures in Java, along with knowledge of DBMS and REST APIs. Skilled in developing responsive applications, building backend services, and integrating APIs, with good problem-solving skills and a collaborative mindset.',
                education: [
                    {
                        institution: 'Manav Rachna International Institute of Research & Studies',
                        degree: 'Bachelor of Technology in Computer Science Engineering',
                        year: 'July 2023 – June 2027',
                        location: 'Faridabad, India',
                        grade: ''
                    },
                    {
                        institution: 'M.S.M Samta College',
                        degree: 'Intermediate (Class XII)',
                        year: '2023',
                        location: 'Vaishali, Bihar',
                        grade: ''
                    },
                    {
                        institution: 'Jagriti Public School',
                        degree: 'Matriculation (Class X)',
                        year: '2021',
                        location: 'Samastipur, Bihar',
                        grade: ''
                    }
                ],
                coursework: [
                    'Data Structures & Algorithms',
                    'Object-Oriented Programming',
                    'Database Management (DBMS)',
                    'Operating Systems',
                    'Computer Networks',
                    'RESTful API Design',
                    'Software Development',
                    'UI/UX Design Principles'
                ],
                technicalSkills: {
                    languages: 'Java, JavaScript, Python (basic)',
                    frontend: 'HTML, CSS, React.js, Bootstrap, Responsive Web Design',
                    backend: 'Node.js, Express.js, RESTful APIs, API Integration',
                    tools: 'Git, GitHub, VS Code, Postman, Chrome DevTools, Netlify',
                    database: 'MongoDB (CRUD, Schema Design)',
                    soft: 'Quick Learner, Team Player, Time Management, Adaptability, Creative Problem Solving'
                },
                skills: ['Java', 'JavaScript', 'Python', 'HTML', 'CSS', 'React.js', 'Node.js', 'Express.js', 'REST APIs', 'MongoDB', 'Git', 'GitHub', 'VS Code'],
                projects: [
                    {
                        title: 'SwasthBazaar – Healthcare E-commerce Platform',
                        tech: 'JavaScript, HTML, CSS, Node.js, MongoDB',
                        duration: '2024 - 25',
                        link: '',
                        desc: '• Developed a full-stack healthcare web application with authentication and REST APIs for telemedicine and appointment booking.\n• Built a responsive frontend ensuring cross-device compatibility for 3+ screen sizes.\n• Designed backend services using Node.js and Express, and integrated MongoDB for efficient data management.\n• Deployed application using Netlify with CI/CD pipeline, reducing deployment time by 40%. [Live]'
                    }
                ],
                experience: [
                    {
                        title: 'Web Development Intern',
                        company: 'Prodigy InfoTech',
                        duration: 'June 2025 – July 2025',
                        location: 'Remote',
                        desc: '• Developed and optimized 5+ responsive web applications, improving UI performance and user experience.\n• Built interactive UI, optimized performance, and collaborated using Git for clean and efficient code.'
                    }
                ],
                achievements: [
                    {
                        title: 'Published research paper on SwasthBazaar Platform',
                        link: 'https://example.com'
                    },
                    {
                        title: 'Secured 1st position in "Waste to Wonder" at Innoskill Fest for creating useful items from waste food',
                        link: 'https://example.com'
                    }
                ],
                certifications: [
                    { name: 'Web Development Internship', year: '2025', link: 'https://example.com' },
                    { name: 'Alibaba Cloud', year: '2024', link: 'https://example.com' },
                    { name: 'Matlab Workshop Certification', year: '2024', link: 'https://example.com' },
                    { name: 'Research Paper Publication', year: '2024', link: 'https://example.com' },
                    { name: 'Augmented Reality Workshop – Snap AR & Bharat XR', year: '2024', link: 'https://example.com' }
                ]
            };
            populateVisualFormFromState();
            updatePreview();
            syncVisualFormToCode();
            if (typeof showToast === 'function') showToast("Loaded Jake's Overleaf sample resume!", 'success');
        });
    }

    // Download PDF Button — Clean A4 PDF Only
    const downloadBtn = document.getElementById('downloadPdfBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            downloadResumePDF();
        });
    }

    // Initial Rendering
    updatePreview();
});

// ══════════════ 6. CLEAN A4 PDF EXPORT & ISOLATED PRINT ══════════════

async function downloadResumePDF() {
    if (typeof API !== 'undefined' && !API.isLoggedIn()) {
        showResumeAuthModal('Sign in to download and export your high-resolution ATS-optimized resume.');
        return;
    }

    const resumeEl = document.getElementById('resumePreviewContent');
    if (!resumeEl) return;

    const btn = document.getElementById('downloadPdfBtn');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span style="font-size: 1rem;">⏳</span> Exporting A4 PDF...`;
    }

    const rawName = (resumeState.data.name || 'Resume').trim();
    const cleanFileName = rawName.replace(/[^a-zA-Z0-9_-]/g, '_') + '_Resume.pdf';

    // If html2pdf bundle is available, download direct A4 PDF without opening print dialog
    if (window.html2pdf) {
        try {
            // Create an isolated off-screen wrapper formatted strictly as an A4 page
            const a4Wrapper = document.createElement('div');
            a4Wrapper.style.cssText = `
                width: 210mm;
                min-height: 297mm;
                background: #ffffff;
                color: #000000;
                padding: 12mm 14mm;
                box-sizing: border-box;
                position: absolute;
                left: -9999px;
                top: 0;
            `;
            a4Wrapper.innerHTML = resumeEl.innerHTML;
            document.body.appendChild(a4Wrapper);

            const opt = {
                margin: [0, 0, 0, 0],
                filename: cleanFileName,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2.5,
                    useCORS: true,
                    letterRendering: true,
                    scrollY: 0,
                    scrollX: 0
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait'
                }
            };

            await html2pdf().set(opt).from(a4Wrapper).save();
            document.body.removeChild(a4Wrapper);

            if (typeof showToast === 'function') {
                showToast(`Downloaded "${cleanFileName}" as A4 PDF!`, 'success');
            }
        } catch (err) {
            console.warn('html2pdf failed, falling back to isolated print window:', err);
            printResumeOnly();
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }
    } else {
        // Fallback: Isolated iframe print containing strictly the resume
        printResumeOnly();
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

function printResumeOnly() {
    const resumeEl = document.getElementById('resumePreviewContent');
    if (!resumeEl) return;

    // Create an invisible iframe to isolate resume content completely from main page
    const iframe = document.createElement('iframe');
    iframe.id = 'resumeIsolatedPrintFrame';
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:none;visibility:hidden;';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>${(resumeState.data.name || 'Resume') + ' - HirePrep Resume'}</title>
            <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>
                @page {
                    size: A4 portrait;
                    margin: 8mm 10mm;
                }
                html, body {
                    margin: 0 !important;
                    padding: 0 !important;
                    background: #ffffff !important;
                    color: #000000 !important;
                    width: 100% !important;
                    height: auto !important;
                }
                * {
                    box-sizing: border-box !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .resume-page-wrapper {
                    width: 100% !important;
                    max-width: 210mm !important;
                    margin: 0 auto !important;
                    padding: 0 !important;
                    background: #ffffff !important;
                }
            </style>
        </head>
        <body>
            <div class="resume-page-wrapper">
                ${resumeEl.innerHTML}
            </div>
        </body>
        </html>
    `);
    doc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
        iframe.contentWindow.print();
        setTimeout(() => {
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
        }, 3000);
    }, 500);
}

// Expose global helpers
window.switchEditorMode = switchEditorMode;
window.handleResumeUpload = handleResumeUpload;
window.addExperienceEntry = addExperienceEntry;
window.addEducationEntry = addEducationEntry;
window.addProjectEntry = addProjectEntry;
window.addAchievementEntry = addAchievementEntry;
window.addCertEntry = addCertEntry;
window.syncFromVisualForm = syncVisualFormToCode;
window.compileCodeToResume = compileCodeToResume;
window.loadCodeTemplate = loadCodeTemplate;
window.copyLatexCode = copyLatexCode;
window.exportTexFile = exportTexFile;
window.beautifyLatexCode = beautifyLatexCode;
window.insertLatexSnippet = insertLatexSnippet;
window.updatePreview = updatePreview;
window.downloadResumePDF = downloadResumePDF;
window.printResumeOnly = printResumeOnly;

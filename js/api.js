/**
 * HireSmart API Client with Mock Fallback for Netlify Static Hosting
 */
const API = {
    BASE_URL: window.location.origin + '/api',
    getToken() { return localStorage.getItem('hiresmart_token'); },
    getUser() { const u = localStorage.getItem('hiresmart_user'); return u ? JSON.parse(u) : null; },
    saveAuth(token, user) { localStorage.setItem('hiresmart_token', token); localStorage.setItem('hiresmart_user', JSON.stringify(user)); },
    clearAuth() { localStorage.removeItem('hiresmart_token'); localStorage.removeItem('hiresmart_user'); },
    isLoggedIn() { return !!this.getToken(); },

    async request(endpoint, options = {}) {
        const url = `${this.BASE_URL}${endpoint}`;
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        const token = this.getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Auth endpoints must hit real backend - no mock fallback
        const isAuthEndpoint = endpoint.startsWith('/auth/');

        try {
            const res = await fetch(url, { ...options, headers });
            const ct = res.headers.get("content-type");
            if (!res.ok) {
                if (ct && ct.includes("application/json")) { 
                    const d = await res.json(); 
                    throw new Error(d.message || 'Request failed'); 
                }
                if (isAuthEndpoint) throw new Error('Server unavailable. Please try again.');
                throw new Error("Need Mock");
            }
            if (ct && ct.includes("application/json")) return await res.json();
            if (isAuthEndpoint) throw new Error('Invalid server response');
            throw new Error("Need Mock");
        } catch (error) {
            if (isAuthEndpoint) throw error;
            return MockAPI.handle(endpoint, options);
        }
    },

    get(endpoint) { return this.request(endpoint); },
    post(endpoint, body) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); },
    put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); },
    del(endpoint) { return this.request(endpoint, { method: 'DELETE' }); },
    async upload(endpoint, formData) {
        const url = `${this.BASE_URL}${endpoint}`;
        const headers = {}; const token = this.getToken(); if (token) headers['Authorization'] = `Bearer ${token}`;
        try { const res = await fetch(url, { method: 'POST', headers, body: formData }); const data = await res.json(); if (!res.ok) throw new Error(data.message); return data; }
        catch(e) { return MockAPI.handle(endpoint, {}); }
    }
};

// ============ COMPREHENSIVE MOCK API ============
const MockAPI = {
    async handle(endpoint, options) {
        const body = options.body ? JSON.parse(options.body) : {};
        console.warn(`[Mock API] ${endpoint}`);

        // Auth
        if (endpoint.includes('/auth/login')) {
            let role = 'student';
            if (body.email && (body.email.includes('admin') || body.email === 'surajkr09871@gmail.com')) role = 'admin';
            else if (body.email && (body.email.includes('recruiter') || body.email.includes('hr@'))) role = 'recruiter';
            const name = role === 'admin' ? 'Suraj Kumar' : role === 'recruiter' ? 'Acme Corp HR' : 'Ujjwal Kumar';
            return { token: 'mock-jwt-token-' + Date.now(), user: { id: 'u_' + role, name, email: body.email, role } };
        }
        if (endpoint.includes('/auth/register')) {
            let role = body.role || 'student';
            return { token: 'mock-jwt-token-' + Date.now(), user: { id: 'u_new', name: body.name || 'New User', email: body.email, role } };
        }
        if (endpoint.includes('/auth/google')) {
            let role = body.role || 'student'; if (role === 'developer') role = 'admin';
            return { token: 'mock-jwt-token-' + Date.now(), user: { id: 'u_g', name: 'Google User', email: 'google@demo.com', role } };
        }

        // Profile
        if (endpoint.includes('/profile')) {
            if (options.method === 'PUT') return { success: true, message: 'Profile updated' };
            return { user: { id: 'u1', name: 'Ujjwal Kumar', email: 'ujjwal@demo.com', role: 'student', phone: '+91 98765 43210', education: 'B.Tech CSE, 2024', experience: '1 year React & Node.js', location: 'New Delhi', resumeScore: 82, skills: [{name:'React',level:'Intermediate'},{name:'Node.js',level:'Advanced'},{name:'JavaScript',level:'Advanced'},{name:'MongoDB',level:'Intermediate'}], projects: [{title:'E-Commerce Platform',description:'Full-stack e-commerce',techStack:'React, Node.js, Stripe'}] } };
        }

        // Preparation
        if (endpoint === '/preparation' || endpoint === '/preparation/') {
            return { success: true, preparations: MockAPI._preparations() };
        }
        if (endpoint.match(/\/preparation\/.+/)) {
            const id = endpoint.split('/').pop();
            const allPreps = MockAPI._preparations();
            let p = allPreps.find(x => x._id === id) || allPreps.find(x => x.companyName.toLowerCase() === id.toLowerCase()) || allPreps[0];
            return { success: true, preparation: p };
        }

        // Jobs
        if (endpoint.includes('/jobs/recruiter/my')) {
            return { jobs: MockAPI._recruiterJobs() };
        }
        if (endpoint.includes('/jobs')) {
            return { jobs: MockAPI._allJobs() };
        }

        // Applications
        if (endpoint.includes('/applications/compare')) {
            return { candidates: MockAPI._compareCandidates() };
        }
        if (endpoint.includes('/recommended')) {
            return { recommended: MockAPI._recommended() };
        }
        if (endpoint.includes('/applications/job/')) {
            return { applications: MockAPI._applications() };
        }
        if (endpoint.includes('/applications')) {
            if (options.method === 'POST') return { success: true, message: 'Applied successfully' };
            if (options.method === 'PUT') return { success: true, message: 'Status updated' };
            return { applications: MockAPI._applications() };
        }

        // Admin
        if (endpoint.includes('/admin/stats')) return { stats: { students: 156, recruiters: 24, jobs: 42, applications: 312, admins: 2, companies: 28, pendingVerifications: 2, activeJobs: 35, activeUsers: 134, inactiveUsers: 48, totalUsers: 182, conversionRate: 8, shortlistRate: 23 } };
        if (endpoint.includes('/admin/analytics/advanced')) return MockAPI._adminAdvancedAnalytics();
        if (endpoint.includes('/admin/matching-logic')) return MockAPI._matchingLogic();
        if (endpoint.includes('/admin/analytics')) return MockAPI._adminAnalytics();
        if (endpoint.includes('/admin/companies') && endpoint.includes('/verify')) return { success: true };
        if (endpoint.includes('/admin/companies')) return { companies: MockAPI._companies() };
        if (endpoint.includes('/admin/users') && endpoint.includes('/role')) return { success: true, message: 'Role updated' };
        if (endpoint.includes('/admin/users') && options.method === 'DELETE') return { success: true };
        if (endpoint.includes('/admin/users')) return { users: MockAPI._adminUsers() };
        if (endpoint.includes('/admin/jobs')) return { jobs: MockAPI._allJobs() };
        if (endpoint.includes('/admin/top-performers')) return { performers: MockAPI._topPerformers() };
        if (endpoint.includes('/admin/activity-log')) return { logs: MockAPI._activityLogs() };
        if (endpoint.includes('/admin/notifications/bulk')) return { success: true, message: 'Bulk notification sent to 48 users.' };
        if (endpoint.includes('/admin/notifications/send')) return { success: true };
        if (endpoint.includes('/admin/export')) return { success: true, message: 'Export started' };

        // Notifications
        if (endpoint.includes('/notifications/unread-count')) return { count: 3 };
        if (endpoint.includes('/notifications')) return { notifications: [{_id:'n1',title:'Welcome!',message:'Welcome to HireSmart!',isRead:false,createdAt:new Date().toISOString()},{_id:'n2',title:'Profile Viewed',message:'Your profile was viewed by a recruiter.',isRead:true,createdAt:new Date(Date.now()-86400000).toISOString()}] };

        return { success: true, message: 'Mock response' };
    },

    _preparations() {
        // Question generator for 50+ questions per company
        function genQs(company, cats, count) {
            const titles = {
                'Coding': ['Two Sum','Merge Intervals','Valid Parentheses','Longest Palindrome Substring','Container With Most Water','3Sum','Remove Nth Node From End','Generate Parentheses','Merge K Sorted Lists','Search in Rotated Sorted Array','Combination Sum','Trapping Rain Water','Jump Game','Unique Paths','Climbing Stairs','Word Search','Decode Ways','Validate BST','Binary Tree Level Order','LRU Cache','Min Stack','Number of Islands','Course Schedule','Implement Trie','Word Break','House Robber','Invert Binary Tree','Kth Smallest Element BST','Sliding Window Maximum','Find Median Data Stream','Serialize Binary Tree','Coin Change','Top K Frequent','Product of Array Except Self','Group Anagrams','Clone Graph','Pacific Atlantic Water Flow','Longest Increasing Subsequence','Alien Dictionary','Graph Valid Tree','Meeting Rooms II','Palindrome Partitioning','Maximum Subarray','Rotate Image','Spiral Matrix','Set Matrix Zeroes','Word Ladder','Surrounded Regions','Gas Station','Candy Distribution'],
                'System Design': ['Design URL Shortener','Design Rate Limiter','Design Chat System','Design News Feed','Design Web Crawler','Design Notification System','Design Search Autocomplete','Design Video Streaming','Design File Storage','Design Payment System','Design Social Network','Design E-commerce','Design Ride Sharing','Design Food Delivery','Design Job Board'],
                'Behavioral': ['Leadership Example','Conflict Resolution','Failure and Learning','Tight Deadline','Disagree with Manager','Innovative Solution','Mentoring Others','Handling Ambiguity','Cross-team Collaboration','Customer Focus'],
                'Aptitude': ['Percentage Problems','Profit and Loss','Time and Work','Ratio Proportion','Number Series','Logical Puzzles','Data Interpretation','Probability','Permutations','Blood Relations']
            };
            const diffs = ['Easy','Easy','Medium','Medium','Medium','Hard','Hard'];
            const qs = [];
            for (const cat of cats) {
                const pool = titles[cat] || titles['Coding'];
                pool.forEach((t, i) => {
                    if (qs.length >= count) return;
                    qs.push({ id: t.toLowerCase().replace(/[^a-z0-9]+/g,'-'), title: t, question: t, topic: cat, category: cat, difficulty: diffs[i % diffs.length], company });
                });
            }
            return qs.slice(0, count);
        }
        const companies = [
            { _id:'p_amazon', companyName:'Amazon', difficulty:'Hard', description:'Leadership Principle-driven interviews with strong focus on system design and behavioral questions. Expect 4-5 rounds including coding, system design, and LP-based behavioral rounds.', questionCount:50, topicCount:6, avgSalary:'$170K', roles:['SDE I','SDE II','SDE III','TPM','Solutions Architect'] },
            { _id:'p_google', companyName:'Google', difficulty:'Hard', description:'Algorithm-heavy interviews focusing on problem-solving ability, code quality, and Googleyness. Typically 5 rounds with 2 coding, 1 system design, and 1 behavioral.', questionCount:50, topicCount:5, avgSalary:'$185K', roles:['L3 SWE','L4 SWE','L5 Senior','L6 Staff'] },
            { _id:'p_microsoft', companyName:'Microsoft', difficulty:'Medium', description:'Balanced technical interviews combining coding, system design and behavioral rounds. Growth mindset is a key evaluation criterion.', questionCount:50, topicCount:4, avgSalary:'$160K', roles:['SDE','SDE II','Senior SDE','Principal SDE'] },
            { _id:'p_meta', companyName:'Meta', difficulty:'Hard', description:'Fast-paced coding interviews with focus on optimization, system design, and product sense. Move fast culture reflected in interview pace.', questionCount:50, topicCount:4, avgSalary:'$178K', roles:['E3 SWE','E4 SWE','E5 Senior','E6 Staff'] },
            { _id:'p_netflix', companyName:'Netflix', difficulty:'Hard', description:'Culture-fit focused interviews emphasizing freedom and responsibility. Strong focus on system design and senior-level problem solving.', questionCount:50, topicCount:5, avgSalary:'$195K', roles:['Senior SWE','Staff SWE','Engineering Manager'] },
            { _id:'p_adobe', companyName:'Adobe', difficulty:'Medium', description:'Well-structured interview process with coding, design, and behavioral rounds. Focus on creative problem-solving and product thinking.', questionCount:50, topicCount:4, avgSalary:'$155K', roles:['SDE','SDE II','Senior SDE','MTS'] },
            { _id:'p_uber', companyName:'Uber', difficulty:'Hard', description:'System design heavy interviews for senior roles. Strong emphasis on distributed systems, real-time processing, and scalability.', questionCount:50, topicCount:5, avgSalary:'$172K', roles:['SDE I','SDE II','Senior SDE','Staff SDE'] },
            { _id:'p_infosys', companyName:'Infosys', difficulty:'Easy', description:'Aptitude-based selection process with basic coding, verbal reasoning, and logical ability rounds. Mass recruitment focused.', questionCount:50, topicCount:3, avgSalary:'₹3.6L', roles:['SE','SSE','Technology Lead','Specialist Programmer'] },
            { _id:'p_razorpay', companyName:'Razorpay', difficulty:'Medium', description:'Full-stack focused interviews with emphasis on JavaScript ecosystem and system architecture for fintech domain.', questionCount:50, topicCount:4, avgSalary:'₹22L', roles:['SDE','SDE II','Staff Engineer','Engineering Manager'] }
        ];
        const topicBank = {
            'Amazon': [{title:'Leadership Principles',items:['Customer Obsession','Ownership','Bias for Action','Dive Deep','Earn Trust'],order:1},{title:'Data Structures',items:['Trees','Graphs','Hash Maps','Heaps','Tries'],order:2},{title:'System Design',items:['Distributed Systems','Microservices','Database Sharding','Message Queues'],order:3},{title:'Algorithms',items:['Dynamic Programming','BFS/DFS','Sliding Window','Two Pointers'],order:4},{title:'Behavioral Prep',items:['STAR Method','Conflict Resolution','Teamwork Examples','Failure Stories'],order:5},{title:'AWS Services',items:['S3','Lambda','DynamoDB','SQS','EC2'],order:6}],
            'Google': [{title:'Algorithms',items:['Graph Algorithms','Dynamic Programming','Divide & Conquer','Greedy Methods'],order:1},{title:'Data Structures',items:['Trees','Tries','Union-Find','Segment Trees','Heaps'],order:2},{title:'System Design',items:['Scalability Patterns','Load Balancing','Caching Strategies','MapReduce'],order:3},{title:'Math & Logic',items:['Probability','Combinatorics','Bit Manipulation','Number Theory'],order:4},{title:'Code Quality',items:['Clean Code Practices','Testing Strategies','Edge Case Handling','Complexity Analysis'],order:5}],
            'Microsoft': [{title:'Problem Solving',items:['Arrays & Strings','Trees & Graphs','Linked Lists','Stack & Queue'],order:1},{title:'OOP Concepts',items:['SOLID Principles','Design Patterns','Inheritance','Polymorphism'],order:2},{title:'System Design',items:['Cloud Architecture','API Design','Microservices','Azure Services'],order:3},{title:'Behavioral',items:['Growth Mindset','Collaboration','Innovation','Customer Focus'],order:4}],
            'Meta': [{title:'Coding Speed',items:['Two Pointer Technique','Sliding Window','BFS/DFS','Backtracking'],order:1},{title:'System Design',items:['Social Graph','Real-time Messaging','Feed Ranking','Content Delivery'],order:2},{title:'Product Sense',items:['Metrics Definition','User Impact Analysis','Trade-off Decisions','A/B Testing'],order:3},{title:'Culture Fit',items:['Move Fast','Be Bold','Focus on Impact','Build Social Value'],order:4}],
            'Netflix': [{title:'System Design',items:['Streaming Architecture','Content Delivery','Recommendation Engine','Microservices'],order:1},{title:'Distributed Systems',items:['Chaos Engineering','Circuit Breakers','Service Mesh','Event Sourcing'],order:2},{title:'Coding',items:['Graph Problems','Dynamic Programming','Concurrency','Optimization'],order:3},{title:'Culture',items:['Freedom & Responsibility','Context Not Control','High Performance','Candor'],order:4},{title:'Data Engineering',items:['Data Pipelines','Stream Processing','A/B Testing Infrastructure','Analytics'],order:5}],
            'Adobe': [{title:'DSA Fundamentals',items:['Arrays','Trees','Graphs','Dynamic Programming'],order:1},{title:'System Design',items:['Document Processing','Media Streaming','Plugin Architecture','Cloud Services'],order:2},{title:'Product Thinking',items:['User Experience','Creative Solutions','Cross-Platform Design','Accessibility'],order:3},{title:'Behavioral',items:['Innovation Examples','Teamwork','Problem Solving','Communication'],order:4}],
            'Uber': [{title:'System Design',items:['Ride Matching','Real-time Location','Surge Pricing','Map Services'],order:1},{title:'Distributed Systems',items:['Geo-spatial Indexing','Stream Processing','Consistency Models','Service Discovery'],order:2},{title:'Algorithms',items:['Graph Algorithms','Optimization','Caching','Rate Limiting'],order:3},{title:'Data Structures',items:['Priority Queues','Spatial Trees','Hash Maps','Bloom Filters'],order:4},{title:'Behavioral',items:['Ownership','Scaling Challenges','Cross-team Work','Technical Decisions'],order:5}],
            'Infosys': [{title:'Aptitude',items:['Quantitative Reasoning','Logical Reasoning','Verbal Ability','Data Interpretation'],order:1},{title:'Basic Coding',items:['Arrays & Strings','Sorting Algorithms','Basic Recursion','Pattern Programs'],order:2},{title:'Communication',items:['Email Writing','Presentation Skills','Group Discussion','HR Interview'],order:3}],
            'Razorpay': [{title:'JavaScript Deep Dive',items:['Closures & Scope','Promises & Async/Await','Event Loop','Prototypal Inheritance'],order:1},{title:'System Design',items:['Payment Processing','Idempotency','Webhooks','Fraud Detection'],order:2},{title:'Full Stack',items:['React Patterns','Node.js Internals','PostgreSQL','Redis & Caching'],order:3},{title:'Fintech Domain',items:['UPI Architecture','PCI Compliance','Settlement Systems','Reconciliation'],order:4}]
        };
        const qCats = {
            'Amazon':['Coding','System Design','Behavioral'],'Google':['Coding','System Design'],'Microsoft':['Coding','System Design','Behavioral'],
            'Meta':['Coding','System Design'],'Netflix':['Coding','System Design'],'Adobe':['Coding','System Design','Behavioral'],
            'Uber':['Coding','System Design'],'Infosys':['Coding','Aptitude'],'Razorpay':['Coding','System Design']
        };
        return companies.map(c => ({...c, questions: genQs(c.companyName, qCats[c.companyName], 50), topics: topicBank[c.companyName] || []}));
    },

    _recruiterJobs() {
        return [
            {_id:'rj1',title:'Senior Frontend Engineer',companyName:'Acme Corp',location:'Remote',salary:'$120k-$150k',status:'active',applicantCount:124,requiredSkills:['React','TypeScript','CSS','GraphQL'],experienceRequired:'3-5 years',createdAt:new Date(Date.now()-7*86400000).toISOString()},
            {_id:'rj2',title:'Backend Developer (Node.js)',companyName:'Acme Corp',location:'Bangalore',salary:'₹12L-₹18L',status:'active',applicantCount:86,requiredSkills:['Node.js','Express','MongoDB','Docker'],experienceRequired:'1-3 years',createdAt:new Date(Date.now()-14*86400000).toISOString()},
            {_id:'rj3',title:'Full Stack Developer',companyName:'TechNova',location:'Remote',salary:'₹10L-₹15L',status:'active',applicantCount:42,requiredSkills:['React','Node.js','MongoDB','AWS'],experienceRequired:'1-3 years',createdAt:new Date(Date.now()-21*86400000).toISOString()},
            {_id:'rj4',title:'DevOps Engineer',companyName:'Razorpay',location:'Bangalore',salary:'₹18L-₹28L',status:'closed',applicantCount:34,requiredSkills:['AWS','Docker','Kubernetes','Terraform'],experienceRequired:'3-5 years',createdAt:new Date(Date.now()-30*86400000).toISOString()}
        ];
    },

    _allJobs() {
        return [...MockAPI._recruiterJobs(), {_id:'aj5',title:'Data Analyst',companyName:'Swiggy',location:'Bangalore',salary:'₹8L-₹12L',status:'active',applicantCount:112,requiredSkills:['Python','SQL','Tableau'],experienceRequired:'0-1 years',createdAt:new Date(Date.now()-5*86400000).toISOString()}];
    },

    _applications() {
        const names = ['Ujjwal Kumar','Priya Sharma','Rahul Verma','Ananya Singh','Karan Patel'];
        const statuses = ['new','in-review','shortlisted','interview','selected','rejected'];
        return names.map((name, i) => ({
            _id: 'app_'+i, studentId: {_id:'s'+i, name},
            studentProfile: {education:'B.Tech CSE',location:['Delhi','Bangalore','Hyderabad','Mumbai','Pune'][i],resumeScore:[82,91,68,88,45][i],experience:['1yr React','2yr ML','Intern','1.5yr FS','Fresher'][i]},
            skillMatch: [85,72,45,90,30][i], hiringProbability: [78,65,35,88,20][i],
            matchedSkills: [['React','JavaScript'],['Python','SQL'],['Java'],['React','Node.js','AWS'],['HTML']][i],
            missingSkills: [['GraphQL'],['React'],['Docker','React'],['GraphQL'],['React','Node.js','Docker']][i],
            status: statuses[i % statuses.length], appliedAt: new Date(Date.now()-i*3*86400000).toISOString(),
            rankingBreakdown: {rankReason: ['Strong frontend skills','ML expertise matches','Partial skill overlap','Excellent full-stack profile','Skills gap - needs training'][i]}
        }));
    },

    _compareCandidates() {
        return [{name:'Ujjwal Kumar',email:'ujjwal@demo.com',skillMatch:85,hiringProbability:78,matchedSkills:['React','JavaScript'],missingSkills:['GraphQL'],recommendation:'High',profile:{resumeScore:82,education:'B.Tech CSE',experience:'1yr React'}},
            {name:'Ananya Singh',email:'ananya@demo.com',skillMatch:90,hiringProbability:88,matchedSkills:['React','Node.js','AWS'],missingSkills:['GraphQL'],recommendation:'High',profile:{resumeScore:88,education:'B.Tech IT',experience:'1.5yr FS'}},
            {name:'Priya Sharma',email:'priya@demo.com',skillMatch:72,hiringProbability:65,matchedSkills:['Python','SQL'],missingSkills:['React'],recommendation:'Medium',profile:{resumeScore:91,education:'M.Tech AI/ML',experience:'2yr ML'}}];
    },

    _recommended() {
        return [{name:'Ananya Singh',education:'B.Tech IT',skillMatch:90,hiringProbability:88,resumeScore:88,alreadyApplied:true},{name:'Ujjwal Kumar',education:'B.Tech CSE',skillMatch:85,hiringProbability:78,resumeScore:82,alreadyApplied:true},{name:'Priya Sharma',education:'M.Tech AI/ML',skillMatch:72,hiringProbability:65,resumeScore:91,alreadyApplied:false}];
    },

    _companies() {
        return [
            {_id:'c1',name:'Google',website:'google.com',industry:'Technology',isVerified:true},
            {_id:'c2',name:'Amazon',website:'amazon.com',industry:'E-Commerce',isVerified:true},
            {_id:'c3',name:'Microsoft',website:'microsoft.com',industry:'Technology',isVerified:true},
            {_id:'c4',name:'TechNova Inc.',website:'technova.io',industry:'Startup',isVerified:false},
            {_id:'c5',name:'Global Solutions',website:'globalsol.com',industry:'IT Services',isVerified:false}
        ];
    },

    _adminUsers() {
        return [
            {_id:'u1',name:'Suraj Kumar',email:'surajkr09871@gmail.com',role:'admin',createdAt:new Date(Date.now()-90*86400000).toISOString()},
            {_id:'u2',name:'Ujjwal Kumar',email:'ujjwal@demo.com',role:'student',createdAt:new Date(Date.now()-60*86400000).toISOString()},
            {_id:'u3',name:'Priya Sharma',email:'priya@demo.com',role:'student',createdAt:new Date(Date.now()-55*86400000).toISOString()},
            {_id:'u4',name:'Acme Corp HR',email:'hr@acme.com',role:'recruiter',createdAt:new Date(Date.now()-45*86400000).toISOString()},
            {_id:'u5',name:'Rahul Verma',email:'rahul@demo.com',role:'student',createdAt:new Date(Date.now()-30*86400000).toISOString()},
            {_id:'u6',name:'TechHire Team',email:'hr@techhire.com',role:'recruiter',createdAt:new Date(Date.now()-20*86400000).toISOString()}
        ];
    },

    _adminAnalytics() {
        return {
            analytics: {
                monthLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                studentGrowth: [12, 28, 45, 67, 98, 156],
                recruiterGrowth: [2, 5, 8, 12, 18, 24],
                roleDistribution: { students: 156, recruiters: 24, admins: 2 },
                appStatuses: [{ _id: 'new', count: 45 }, { _id: 'in-review', count: 38 }, { _id: 'shortlisted', count: 22 }, { _id: 'selected', count: 12 }],
                topCompanies: [{ _id: 'Acme Corp', jobCount: 3, totalApplicants: 252 }, { _id: 'Swiggy', jobCount: 1, totalApplicants: 112 }]
            }
        };
    },

    _adminAdvancedAnalytics() {
        return {
            advanced: {
                growth: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], students: [12, 28, 45, 67, 98, 156], recruiters: [2, 5, 8, 12, 18, 24] },
                activeVsInactive: { active: 134, inactive: 48 },
                conversionFunnel: { applied: 312, inReview: 85, shortlisted: 48, interviewed: 22, selected: 12, rejected: 35 },
                performanceDistribution: { buckets: [22, 38, 56, 40], labels: ['0-25%', '25-50%', '50-75%', '75-100%'], avgScore: 58, top10AvgScore: 91 },
                resumeDistribution: { buckets: [8, 15, 28, 42, 63], labels: ['0-20', '20-40', '40-60', '60-80', '80-100'] },
                skillGapTrends: [{ skill: 'Docker', count: 45 }, { skill: 'Kubernetes', count: 38 }, { skill: 'GraphQL', count: 32 }, { skill: 'TypeScript', count: 28 }, { skill: 'AWS', count: 24 }, { skill: 'System Design', count: 20 }],
                appsPerDay: { labels: Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 29 + i); return `${d.getMonth() + 1}/${d.getDate()}`; }), data: [3, 5, 2, 8, 6, 4, 7, 9, 5, 11, 8, 6, 12, 10, 7, 14, 9, 11, 8, 15, 13, 10, 16, 12, 9, 18, 14, 11, 20, 15] }
            }
        };
    },

    _matchingLogic() {
        return {
            success: true,
            formula: {
                name: 'Hiring Probability Algorithm',
                equation: 'Final Score = (Skill Match × 60%) + (Experience Score × 20%) + (Resume Completeness × 20%)',
                weights: {
                    skillMatch: { weight: 0.6, description: 'Percentage of required skills the candidate possesses' },
                    experienceScore: { weight: 0.2, description: 'How well candidate experience matches job requirements' },
                    resumeCompleteness: { weight: 0.2, description: 'Profile completeness score based on filled fields' }
                },
                recommendationThresholds: {
                    high: { min: 85, label: 'Highly Recommended', color: '#10b981' },
                    medium: { min: 60, label: 'Medium Potential', color: '#f59e0b' },
                    low: { min: 0, label: 'Low Match', color: '#ef4444' }
                },
                resumeWeights: { phone: 10, education: 15, experience: 20, location: 5, resumeUrl: 20, skills: 20, projects: 10 },
                sampleCalculation: { candidate: 'Ananya Singh', job: 'Senior Frontend Engineer', skillMatch: 90, hiringProbability: 88, matchedSkills: ['React', 'Node.js', 'AWS'], missingSkills: ['GraphQL', 'TypeScript'] }
            }
        };
    },

    _topPerformers() {
        return [
            { _id: 'u4', name: 'Ananya Singh', email: 'ananya@demo.com', compositeScore: 92, skillCount: 4, skills: ['React', 'Node.js', 'AWS', 'Docker'], resumeScore: 88, location: 'Mumbai', education: 'B.Tech IT' },
            { _id: 'u2', name: 'Priya Sharma', email: 'priya@demo.com', compositeScore: 88, skillCount: 3, skills: ['Python', 'TensorFlow', 'SQL'], resumeScore: 91, location: 'Bangalore', education: 'M.Tech AI/ML' },
            { _id: 'u1', name: 'Ujjwal Kumar', email: 'ujjwal@demo.com', compositeScore: 82, skillCount: 4, skills: ['React', 'JavaScript', 'MongoDB', 'Node.js'], resumeScore: 82, location: 'New Delhi', education: 'B.Tech CSE' },
            { _id: 'u3', name: 'Rahul Verma', email: 'rahul@demo.com', compositeScore: 65, skillCount: 2, skills: ['Java', 'Spring Boot'], resumeScore: 68, location: 'Hyderabad', education: 'B.Tech CSE' },
            { _id: 'u5', name: 'Karan Patel', email: 'karan@demo.com', compositeScore: 40, skillCount: 3, skills: ['HTML', 'CSS', 'JavaScript'], resumeScore: 45, location: 'Pune', education: 'BCA' }
        ];
    },

    _activityLogs() {
        return [
            { action: 'login', userId: { name: 'Ujjwal Kumar' }, details: 'Student login from Chrome/Windows', createdAt: new Date().toISOString() },
            { action: 'job_posted', userId: { name: 'Acme Corp HR' }, details: 'Posted "Senior Frontend Engineer"', createdAt: new Date(Date.now() - 3600000).toISOString() },
            { action: 'application', userId: { name: 'Priya Sharma' }, details: 'Applied to Backend Developer (Node.js)', createdAt: new Date(Date.now() - 7200000).toISOString() },
            { action: 'status_change', userId: { name: 'Acme Corp HR' }, details: 'Moved Ananya Singh to interview stage', createdAt: new Date(Date.now() - 14400000).toISOString() },
            { action: 'profile_update', userId: { name: 'Rahul Verma' }, details: 'Updated skills and resume', createdAt: new Date(Date.now() - 28800000).toISOString() },
            { action: 'company_verified', userId: { name: 'Suraj Kumar' }, details: 'Verified TechNova Inc.', createdAt: new Date(Date.now() - 43200000).toISOString() }
        ];
    }
};

// Google Sign-In credential handler
function handleGoogleCredential(response) {
    API.post('/auth/google', { token: response.credential })
        .then(data => {
            if (data.token && data.user) {
                API.saveAuth(data.token, data.user);
                showToast('Google Sign-In successful!', 'success');
                const role = data.user.role;
                if (role === 'admin') window.location.href = '/frontend/admin/admin-dashboard.html';
                else if (role === 'recruiter') window.location.href = '/frontend/recruiter/recruiter-dashboard.html';
                else window.location.href = '/frontend/student/student-dashboard.html';
            }
        })
        .catch(err => {
            showToast(err.message || 'Google Sign-In failed', 'error');
        });
}

// Toast notification system
function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// Update navbar auth state
function updateNavAuth() {
    const user = API.getUser();
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;
    if (user) {
        const profileLink = user.role === 'student' ? '/frontend/student/student-profile.html' : '#';
        navActions.innerHTML = `
            <span id="themeToggle" onclick="toggleTheme()" style="font-size:1.25rem;color:var(--text-muted);cursor:pointer;margin-right:0.5rem;">☼</span>
            <a href="${profileLink}" style="display:flex;align-items:center;gap:0.5rem;font-weight:500;font-size:0.875rem;text-decoration:none;color:var(--text-main);">
                <span style="width:28px;height:28px;background:var(--primary);color:white;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:bold;">${user.name.charAt(0).toUpperCase()}</span>
                ${user.name}
            </a>
            <button class="btn btn-outline" onclick="handleLogout()"><span style="margin-right:0.25rem;">↪</span> Sign Out</button>`;
    } else {
        navActions.innerHTML = `
            <span id="themeToggle" onclick="toggleTheme()" style="font-size:1.25rem;color:var(--text-muted);cursor:pointer;margin-right:0.5rem;">☼</span>
            <button class="btn btn-outline" onclick="window.location.href='/frontend/auth.html'">Sign In</button>
            <button class="btn btn-dark" onclick="window.location.href='/frontend/auth.html'">Get Started</button>`;
    }
    const savedTheme = localStorage.getItem('hiresmart_theme') || 'light';
    if (savedTheme === 'dark') { document.documentElement.setAttribute('data-theme', 'dark'); const t = document.getElementById('themeToggle'); if(t) t.innerHTML = '🌙'; }
}

function handleLogout() { API.clearAuth(); showToast('Logged out successfully'); setTimeout(() => window.location.href = '/index.html', 500); }
document.addEventListener('DOMContentLoaded', () => { updateNavAuth(); });

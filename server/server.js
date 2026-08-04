const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Request logging
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per windowMs
    message: { success: false, message: 'Too many attempts, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Serve static frontend files from root
app.use(express.static(path.join(__dirname, '..')));

// Serve uploaded files (with basic protection)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Apply rate limiting to auth routes
app.use('/api/auth', authLimiter);

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/preparation', require('./routes/preparation'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

// Resume routes (new)
try {
    app.use('/api/resume', require('./routes/resume'));
} catch (e) {
    console.log('⚠️ Resume routes not loaded:', e.message);
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'HireSmart API is running',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// Global error handling middleware (no stack trace leaks)
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Internal Server Error'
            : err.message || 'Internal Server Error'
    });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        // Connect to real MongoDB (Atlas or local)
        await connectDB();

        // Auto-seed if database is empty (only in development or first run)
        const User = require('./models/User');
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log('📦 Database is empty - seeding with demo data...');
            await runSeed();
        }

        app.listen(PORT, () => {
            console.log(`🚀 HireSmart server running on http://localhost:${PORT}`);
            console.log(`📂 Frontend served from: ${path.join(__dirname, '..')}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('\n📋 Demo Login Credentials:');
            console.log('   Admin:     surajkr09871@gmail.com / admin123');
            console.log('   Student:   ujjwal@demo.com / student123');
            console.log('   Recruiter: hr@acme.com / recruiter123');
        });
    } catch (err) {
        console.error('❌ Server start error:', err.message);
        process.exit(1);
    }
}

async function runSeed() {
    const User = require('./models/User');
    const StudentProfile = require('./models/StudentProfile');
    const Company = require('./models/Company');
    const Job = require('./models/Job');
    const PreparationPath = require('./models/PreparationPath');
    const Notification = require('./models/Notification');

    // Create admin
    const admin = new User({ name: 'Suraj Kumar', email: 'surajkr09871@gmail.com', password: 'admin123', role: 'admin' });
    await admin.save();

    // Create students
    const studentData = [
        { name: 'Ujjwal Kumar', email: 'ujjwal@demo.com', password: 'student123' },
        { name: 'Priya Sharma', email: 'priya@demo.com', password: 'student123' },
        { name: 'Rahul Verma', email: 'rahul@demo.com', password: 'student123' },
        { name: 'Ananya Singh', email: 'ananya@demo.com', password: 'student123' },
        { name: 'Karan Patel', email: 'karan@demo.com', password: 'student123' }
    ];
    const students = [];
    for (const sd of studentData) {
        const s = new User({ ...sd, role: 'student' });
        await s.save();
        students.push(s);
    }

    // Create profiles
    const profileData = [
        { userId: students[0]._id, phone: '+91 98765 43210', education: 'B.Tech CSE, 2024', experience: '1 year React & Node.js', location: 'New Delhi', resumeScore: 82, skills: [{ name: 'React', level: 'Intermediate' }, { name: 'Node.js', level: 'Advanced' }, { name: 'JavaScript', level: 'Advanced' }, { name: 'MongoDB', level: 'Intermediate' }], projects: [{ title: 'E-Commerce Platform', description: 'Full-stack e-commerce', techStack: 'React, Node.js, Stripe' }] },
        { userId: students[1]._id, phone: '+91 98765 11111', education: 'M.Tech AI/ML, 2024', experience: '2 years ML', location: 'Bangalore', resumeScore: 91, skills: [{ name: 'Python', level: 'Advanced' }, { name: 'TensorFlow', level: 'Intermediate' }, { name: 'SQL', level: 'Advanced' }], projects: [{ title: 'Sentiment Analyzer', description: 'NLP tool', techStack: 'Python, TensorFlow' }] },
        { userId: students[2]._id, phone: '+91 98765 22222', education: 'B.Tech CSE, 2025', experience: 'Intern at Infosys', location: 'Hyderabad', resumeScore: 68, skills: [{ name: 'Java', level: 'Advanced' }, { name: 'Spring Boot', level: 'Intermediate' }], projects: [] },
        { userId: students[3]._id, phone: '+91 98765 33333', education: 'B.Tech IT, 2024', experience: '1.5 years full-stack', location: 'Mumbai', resumeScore: 88, skills: [{ name: 'React', level: 'Advanced' }, { name: 'Node.js', level: 'Intermediate' }, { name: 'AWS', level: 'Intermediate' }, { name: 'Docker', level: 'Intermediate' }], projects: [{ title: 'Social Dashboard', description: 'Analytics dashboard', techStack: 'React, D3.js' }] },
        { userId: students[4]._id, phone: '+91 98765 44444', education: 'BCA, 2025', experience: 'Fresher', location: 'Pune', resumeScore: 45, skills: [{ name: 'HTML', level: 'Advanced' }, { name: 'CSS', level: 'Intermediate' }, { name: 'JavaScript', level: 'Beginner' }], projects: [] }
    ];
    for (const p of profileData) { await new StudentProfile(p).save(); }

    // Create recruiters
    const recruiter = new User({ name: 'Acme Corp HR', email: 'hr@acme.com', password: 'recruiter123', role: 'recruiter' });
    await recruiter.save();
    const recruiter2 = new User({ name: 'TechHire Team', email: 'hr@techhire.com', password: 'recruiter123', role: 'recruiter' });
    await recruiter2.save();

    // Companies
    await Company.insertMany([
        { name: 'Google', website: 'google.com', domain: 'product', industry: 'Technology', size: 'enterprise', headquarter: 'Mountain View, CA', description: 'Search, cloud, AI leader', isVerified: true },
        { name: 'Amazon', website: 'amazon.com', domain: 'product', industry: 'E-Commerce', size: 'enterprise', headquarter: 'Seattle, WA', description: 'E-commerce and cloud giant', isVerified: true },
        { name: 'Microsoft', website: 'microsoft.com', domain: 'product', industry: 'Technology', size: 'enterprise', headquarter: 'Redmond, WA', description: 'Enterprise software leader', isVerified: true },
        { name: 'Meta', website: 'meta.com', domain: 'product', industry: 'Social Media', size: 'enterprise', headquarter: 'Menlo Park, CA', description: 'Social media and VR', isVerified: true },
        { name: 'Apple', website: 'apple.com', domain: 'product', industry: 'Consumer Electronics', size: 'enterprise', headquarter: 'Cupertino, CA', isVerified: true },
        { name: 'Netflix', website: 'netflix.com', domain: 'product', industry: 'Entertainment', size: 'enterprise', headquarter: 'Los Gatos, CA', isVerified: true },
        { name: 'Stripe', website: 'stripe.com', domain: 'product', industry: 'Fintech', size: 'enterprise', headquarter: 'San Francisco, CA', isVerified: true },
        { name: 'Uber', website: 'uber.com', domain: 'product', industry: 'Transportation', size: 'enterprise', headquarter: 'San Francisco, CA', isVerified: true },
        { name: 'Spotify', website: 'spotify.com', domain: 'product', industry: 'Music', size: 'enterprise', headquarter: 'Stockholm, Sweden', isVerified: true },
        { name: 'LinkedIn', website: 'linkedin.com', domain: 'product', industry: 'Professional Network', size: 'enterprise', headquarter: 'Sunnyvale, CA', isVerified: true },
        { name: 'Salesforce', website: 'salesforce.com', domain: 'product', industry: 'CRM', size: 'enterprise', headquarter: 'San Francisco, CA', isVerified: true },
        { name: 'Adobe', website: 'adobe.com', domain: 'product', industry: 'Creative Software', size: 'enterprise', headquarter: 'San Jose, CA', isVerified: true },
        { name: 'Oracle', website: 'oracle.com', domain: 'product', industry: 'Enterprise Software', size: 'enterprise', headquarter: 'Austin, TX', isVerified: true },
        { name: 'Atlassian', website: 'atlassian.com', domain: 'product', industry: 'Developer Tools', size: 'enterprise', headquarter: 'Sydney, Australia', isVerified: true },
        { name: 'Airbnb', website: 'airbnb.com', domain: 'product', industry: 'Travel', size: 'enterprise', headquarter: 'San Francisco, CA', isVerified: true },
        { name: 'Infosys', website: 'infosys.com', domain: 'service', industry: 'IT Services', size: 'enterprise', headquarter: 'Bangalore, India', isVerified: true },
        { name: 'TCS', website: 'tcs.com', domain: 'service', industry: 'IT Services', size: 'enterprise', headquarter: 'Mumbai, India', isVerified: true },
        { name: 'Wipro', website: 'wipro.com', domain: 'service', industry: 'IT Services', size: 'enterprise', headquarter: 'Bangalore, India', isVerified: true },
        { name: 'Accenture', website: 'accenture.com', domain: 'service', industry: 'Consulting', size: 'enterprise', headquarter: 'Dublin, Ireland', isVerified: true },
        { name: 'Cognizant', website: 'cognizant.com', domain: 'service', industry: 'IT Services', size: 'enterprise', headquarter: 'Teaneck, NJ', isVerified: true },
        { name: 'HCLTech', website: 'hcltech.com', domain: 'service', industry: 'IT Services', size: 'enterprise', headquarter: 'Noida, India', isVerified: true },
        { name: 'Razorpay', website: 'razorpay.com', domain: 'startup', industry: 'Fintech', size: 'mid', headquarter: 'Bangalore, India', isVerified: true },
        { name: 'CRED', website: 'cred.club', domain: 'startup', industry: 'Fintech', size: 'startup', headquarter: 'Bangalore, India', isVerified: true },
        { name: 'PhonePe', website: 'phonepe.com', domain: 'startup', industry: 'Fintech', size: 'mid', headquarter: 'Bangalore, India', isVerified: true },
        { name: 'Swiggy', website: 'swiggy.com', domain: 'startup', industry: 'Food Delivery', size: 'mid', headquarter: 'Bangalore, India', isVerified: true },
        { name: 'Zerodha', website: 'zerodha.com', domain: 'startup', industry: 'Fintech', size: 'mid', headquarter: 'Bangalore, India', isVerified: true },
        { name: 'TechNova Inc.', website: 'technova.io', isVerified: false, submittedBy: recruiter._id, domain: 'startup', size: 'startup' },
        { name: 'Global Solutions', website: 'globalsol.com', isVerified: false, submittedBy: recruiter._id, domain: 'service', size: 'mid' }
    ]);

    // Jobs
    await Job.insertMany([
        { recruiterId: recruiter._id, companyName: 'Acme Corp', title: 'Senior Frontend Engineer', description: 'Build modern web UIs.', requiredSkills: ['React', 'TypeScript', 'CSS'], experienceRequired: '3-5 years (Mid-level)', location: 'Remote', salary: '$120k - $150k', status: 'active', applicantCount: 124 },
        { recruiterId: recruiter._id, companyName: 'Acme Corp', title: 'Backend Developer (Node.js)', description: 'Build scalable APIs.', requiredSkills: ['Node.js', 'Express', 'MongoDB', 'Docker'], experienceRequired: '1-3 years (Junior)', location: 'Bangalore', salary: '₹12L - ₹18L', status: 'active', applicantCount: 86 },
        { recruiterId: recruiter._id, companyName: 'TechNova', title: 'Full Stack Developer', description: 'End to end features.', requiredSkills: ['React', 'Node.js', 'MongoDB', 'AWS'], experienceRequired: '1-3 years (Junior)', location: 'Remote', salary: '₹10L - ₹15L', status: 'active', applicantCount: 42 },
        { recruiterId: recruiter2._id, companyName: 'Razorpay', title: 'DevOps Engineer', description: 'CI/CD and cloud.', requiredSkills: ['AWS', 'Docker', 'Kubernetes'], experienceRequired: '3-5 years (Mid-level)', location: 'Bangalore', salary: '₹18L - ₹28L', status: 'active', applicantCount: 34 },
        { recruiterId: recruiter2._id, companyName: 'Swiggy', title: 'Data Analyst', description: 'Business data insights.', requiredSkills: ['Python', 'SQL', 'Tableau'], experienceRequired: '0-1 years (Fresher)', location: 'Bangalore', salary: '₹8L - ₹12L', status: 'active', applicantCount: 112 }
    ]);

    // Preparation paths with real questions
    await PreparationPath.insertMany([
        { companyName: 'Amazon', difficulty: 'Hard', description: 'LP-driven interviews with strong focus on system design and behavioral questions.', questionCount: 30, topicCount: 6, avgSalary: '$170K', roles: ['SDE I', 'SDE II', 'SDE III'], topics: [{ title: 'Leadership Principles', items: ['Customer Obsession', 'Ownership', 'Bias for Action', 'Dive Deep', 'Earn Trust'], order: 1 }, { title: 'Data Structures', items: ['Trees', 'Graphs', 'Hash Maps', 'Heaps', 'Tries'], order: 2 }, { title: 'System Design', items: ['Distributed Systems', 'Microservices', 'Database Sharding'], order: 3 }], questions: [{ question: 'Two Sum', category: 'Coding', difficulty: 'Easy' }, { question: 'Design a URL shortener', category: 'System Design', difficulty: 'Hard' }, { question: 'LRU Cache', category: 'Coding', difficulty: 'Medium' }, { question: 'Number of Islands', category: 'Coding', difficulty: 'Medium' }, { question: 'Merge K Sorted Lists', category: 'Coding', difficulty: 'Hard' }, { question: 'Design Amazon search autocomplete', category: 'System Design', difficulty: 'Hard' }, { question: 'Tell me about a time you disagreed with your manager', category: 'Behavioral', difficulty: 'Medium' }, { question: 'Word Ladder', category: 'Coding', difficulty: 'Hard' }, { question: 'Trapping Rain Water', category: 'Coding', difficulty: 'Hard' }, { question: 'Design a notification system', category: 'System Design', difficulty: 'Hard' }, { question: 'Course Schedule', category: 'Coding', difficulty: 'Medium' }, { question: 'Validate BST', category: 'Coding', difficulty: 'Medium' }, { question: 'Describe a project you led from start to finish', category: 'Behavioral', difficulty: 'Medium' }, { question: 'Sliding Window Maximum', category: 'Coding', difficulty: 'Hard' }, { question: 'Design Amazon order processing pipeline', category: 'System Design', difficulty: 'Hard' }] },
        { companyName: 'Google', difficulty: 'Hard', description: 'Algorithm-heavy interviews with focus on problem-solving and code quality.', questionCount: 30, topicCount: 5, avgSalary: '$185K', roles: ['L3 SWE', 'L4 SWE', 'L5 Senior'], topics: [{ title: 'Algorithms', items: ['Graph Algorithms', 'Dynamic Programming', 'Divide & Conquer', 'Greedy'], order: 1 }, { title: 'Data Structures', items: ['Trees', 'Tries', 'Union-Find', 'Segment Trees'], order: 2 }, { title: 'System Design', items: ['Scalability', 'Load Balancing', 'Caching', 'MapReduce'], order: 3 }], questions: [{ question: 'Longest Substring Without Repeating Characters', category: 'Coding', difficulty: 'Medium' }, { question: 'Median of Two Sorted Arrays', category: 'Coding', difficulty: 'Hard' }, { question: 'Design Google Search', category: 'System Design', difficulty: 'Hard' }, { question: 'Word Break', category: 'Coding', difficulty: 'Medium' }, { question: 'Serialize and Deserialize Binary Tree', category: 'Coding', difficulty: 'Hard' }, { question: 'Design YouTube', category: 'System Design', difficulty: 'Hard' }, { question: 'Find Median from Data Stream', category: 'Coding', difficulty: 'Hard' }, { question: 'Edit Distance', category: 'Coding', difficulty: 'Hard' }, { question: 'Design Google Maps', category: 'System Design', difficulty: 'Hard' }, { question: 'Regular Expression Matching', category: 'Coding', difficulty: 'Hard' }, { question: 'Clone Graph', category: 'Coding', difficulty: 'Medium' }, { question: 'Coin Change', category: 'Coding', difficulty: 'Medium' }, { question: 'Design a web crawler', category: 'System Design', difficulty: 'Hard' }, { question: 'Longest Increasing Subsequence', category: 'Coding', difficulty: 'Medium' }, { question: 'Alien Dictionary', category: 'Coding', difficulty: 'Hard' }] },
        { companyName: 'Microsoft', difficulty: 'Medium', description: 'Balanced technical interviews combining coding, system design and behavioral.', questionCount: 25, topicCount: 4, avgSalary: '$160K', roles: ['SDE', 'SDE II', 'Senior SDE'], topics: [{ title: 'Problem Solving', items: ['Arrays & Strings', 'Trees & Graphs', 'Linked Lists'], order: 1 }, { title: 'OOP', items: ['SOLID Principles', 'Design Patterns'], order: 2 }, { title: 'System Design', items: ['Cloud Architecture', 'API Design', 'Azure Services'], order: 3 }], questions: [{ question: 'Reverse Linked List', category: 'Coding', difficulty: 'Easy' }, { question: 'Valid Parentheses', category: 'Coding', difficulty: 'Easy' }, { question: 'Merge Intervals', category: 'Coding', difficulty: 'Medium' }, { question: 'Design a chat application', category: 'System Design', difficulty: 'Hard' }, { question: 'Binary Tree Level Order Traversal', category: 'Coding', difficulty: 'Medium' }, { question: 'Rotate Image', category: 'Coding', difficulty: 'Medium' }, { question: 'Design Excel', category: 'System Design', difficulty: 'Hard' }, { question: 'Spiral Matrix', category: 'Coding', difficulty: 'Medium' }, { question: 'House Robber', category: 'Coding', difficulty: 'Medium' }, { question: 'Min Stack', category: 'Coding', difficulty: 'Medium' }, { question: 'Design a file sharing system', category: 'System Design', difficulty: 'Hard' }, { question: 'Group Anagrams', category: 'Coding', difficulty: 'Medium' }] },
        { companyName: 'Meta', difficulty: 'Hard', description: 'Speed-focused coding with system design and product sense evaluation.', questionCount: 25, topicCount: 4, avgSalary: '$178K', roles: ['E3 SWE', 'E4 SWE', 'E5 Senior'], topics: [{ title: 'Coding Speed', items: ['Two Pointer', 'Sliding Window', 'BFS/DFS', 'Backtracking'], order: 1 }, { title: 'System Design', items: ['Social Graph', 'Real-time Messaging', 'Feed Ranking'], order: 2 }], questions: [{ question: 'Design Facebook News Feed', category: 'System Design', difficulty: 'Hard' }, { question: 'Subsets', category: 'Coding', difficulty: 'Medium' }, { question: '3Sum', category: 'Coding', difficulty: 'Medium' }, { question: 'Container With Most Water', category: 'Coding', difficulty: 'Medium' }, { question: 'Design Instagram', category: 'System Design', difficulty: 'Hard' }, { question: 'Product of Array Except Self', category: 'Coding', difficulty: 'Medium' }, { question: 'Word Search', category: 'Coding', difficulty: 'Medium' }, { question: 'Design WhatsApp', category: 'System Design', difficulty: 'Hard' }, { question: 'Top K Frequent Elements', category: 'Coding', difficulty: 'Medium' }, { question: 'Unique Paths', category: 'Coding', difficulty: 'Medium' }, { question: 'Design a rate limiter', category: 'System Design', difficulty: 'Hard' }, { question: 'Maximum Subarray', category: 'Coding', difficulty: 'Medium' }] },
        { companyName: 'Infosys', difficulty: 'Easy', description: 'Aptitude-based selection with basic coding and communication rounds.', questionCount: 20, topicCount: 3, avgSalary: '₹3.6L', roles: ['SE', 'SSE', 'Technology Lead'], topics: [{ title: 'Aptitude', items: ['Quantitative', 'Logical Reasoning', 'Verbal Ability'], order: 1 }, { title: 'Basic Coding', items: ['Arrays', 'Strings', 'Sorting', 'Pattern Programs'], order: 2 }], questions: [{ question: 'Find missing number in array', category: 'Coding', difficulty: 'Easy' }, { question: 'Reverse a string', category: 'Coding', difficulty: 'Easy' }, { question: 'Check palindrome', category: 'Coding', difficulty: 'Easy' }, { question: 'Fibonacci series', category: 'Coding', difficulty: 'Easy' }, { question: 'Bubble sort implementation', category: 'Coding', difficulty: 'Easy' }, { question: 'Find factorial', category: 'Coding', difficulty: 'Easy' }, { question: 'Remove duplicates from array', category: 'Coding', difficulty: 'Easy' }, { question: 'Binary search', category: 'Coding', difficulty: 'Easy' }, { question: 'Check Armstrong number', category: 'Coding', difficulty: 'Easy' }, { question: 'Pattern printing (pyramid)', category: 'Coding', difficulty: 'Easy' }] },
        { companyName: 'Razorpay', difficulty: 'Medium', description: 'Full-stack focused interviews with fintech domain knowledge.', questionCount: 18, topicCount: 4, avgSalary: '₹22L', roles: ['SDE', 'SDE II', 'Staff Engineer'], topics: [{ title: 'JavaScript', items: ['Closures', 'Promises', 'Event Loop', 'Prototypal Inheritance'], order: 1 }, { title: 'System Design', items: ['Payment Processing', 'Idempotency', 'Webhooks'], order: 2 }], questions: [{ question: 'Design a payment gateway', category: 'System Design', difficulty: 'Hard' }, { question: 'Implement debounce and throttle', category: 'Coding', difficulty: 'Medium' }, { question: 'LRU Cache', category: 'Coding', difficulty: 'Medium' }, { question: 'Design webhook delivery system', category: 'System Design', difficulty: 'Hard' }, { question: 'Flatten nested object', category: 'Coding', difficulty: 'Medium' }, { question: 'Promise.all implementation', category: 'Coding', difficulty: 'Medium' }, { question: 'Design idempotent payment API', category: 'System Design', difficulty: 'Hard' }, { question: 'Event emitter implementation', category: 'Coding', difficulty: 'Medium' }] }
    ]);

    const Application = require('./models/Application');
    const { calculateSkillMatch, calculateExperienceScore, calculateResumeCompleteness, calculateHiringProbability } = require('./utils/matchingAlgorithm');

    // Welcome notification
    await new Notification({ type: 'announcement', title: 'Welcome to HireSmart!', message: 'Start your preparation journey today.', targetRole: 'all', createdBy: admin._id }).save();

    // Seed sample applications for pipeline demo
    const allJobs = await Job.find();
    const allProfiles = await StudentProfile.find().populate('userId');
    const statuses = ['new', 'in-review', 'shortlisted', 'interview', 'selected', 'rejected'];
    let appIdx = 0;
    for (const job of allJobs.slice(0, 3)) {
        for (const profile of allProfiles) {
            const skillResult = calculateSkillMatch(profile.skills, job.requiredSkills);
            const expScore = calculateExperienceScore(profile.experience, job.experienceRequired);
            const resumeComp = calculateResumeCompleteness(profile);
            const prob = calculateHiringProbability(skillResult.matchPercentage, expScore, resumeComp);
            const status = statuses[appIdx % statuses.length];
            const daysAgo = Math.floor(Math.random() * 28) + 1;
            await new Application({
                studentId: profile.userId._id, jobId: job._id,
                skillMatch: skillResult.matchPercentage, hiringProbability: prob,
                matchedSkills: skillResult.matchedSkills, missingSkills: skillResult.missingSkills,
                status, appliedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
                statusUpdatedAt: new Date(Date.now() - (daysAgo - 1) * 24 * 60 * 60 * 1000),
                interviewDate: status === 'interview' ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) : undefined,
                interviewType: status === 'interview' ? 'video' : '',
                interviewNotes: status === 'interview' ? 'Technical round with team lead' : ''
            }).save();
            appIdx++;
        }
    }

    console.log('✅ Database seeded!');
}

startServer();

module.exports = app;

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const Company = require('./models/Company');
const Job = require('./models/Job');
const PreparationPath = require('./models/PreparationPath');
const Notification = require('./models/Notification');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        await User.deleteMany({});
        await StudentProfile.deleteMany({});
        await Company.deleteMany({});
        await Job.deleteMany({});
        await PreparationPath.deleteMany({});
        await Notification.deleteMany({});

        // === USERS ===
        const admin = new User({ name: 'Suraj Kumar', email: 'surajkr09871@gmail.com', password: 'admin123', role: 'admin' });
        await admin.save();

        const students = [];
        const studentData = [
            { name: 'Ujjwal Kumar', email: 'ujjwal@demo.com', password: 'student123' },
            { name: 'Priya Sharma', email: 'priya@demo.com', password: 'student123' },
            { name: 'Rahul Verma', email: 'rahul@demo.com', password: 'student123' },
            { name: 'Ananya Singh', email: 'ananya@demo.com', password: 'student123' },
            { name: 'Karan Patel', email: 'karan@demo.com', password: 'student123' }
        ];
        for (const sd of studentData) {
            const s = new User({ ...sd, role: 'student' });
            await s.save();
            students.push(s);
        }

        const profiles = [
            { userId: students[0]._id, phone: '+91 98765 43210', education: 'B.Tech CSE, 2024', experience: '1 year React & Node.js', location: 'New Delhi', resumeScore: 82, skills: [{ name: 'React', level: 'Intermediate' }, { name: 'Node.js', level: 'Advanced' }, { name: 'JavaScript', level: 'Advanced' }, { name: 'MongoDB', level: 'Intermediate' }, { name: 'TypeScript', level: 'Beginner' }, { name: 'Python', level: 'Intermediate' }], projects: [{ title: 'E-Commerce Platform', description: 'Full-stack e-commerce with Stripe', techStack: 'React, Node.js, Stripe, MongoDB' }] },
            { userId: students[1]._id, phone: '+91 98765 11111', education: 'M.Tech AI/ML, 2024', experience: '2 years ML & data science', location: 'Bangalore', resumeScore: 91, skills: [{ name: 'Python', level: 'Advanced' }, { name: 'TensorFlow', level: 'Intermediate' }, { name: 'SQL', level: 'Advanced' }, { name: 'Docker', level: 'Intermediate' }, { name: 'AWS', level: 'Beginner' }], projects: [{ title: 'Sentiment Analyzer', description: 'NLP-based sentiment analysis tool', techStack: 'Python, TensorFlow, Flask' }] },
            { userId: students[2]._id, phone: '+91 98765 22222', education: 'B.Tech CSE, 2025', experience: 'Intern at Infosys (6 months)', location: 'Hyderabad', resumeScore: 68, skills: [{ name: 'Java', level: 'Advanced' }, { name: 'Spring Boot', level: 'Intermediate' }, { name: 'MySQL', level: 'Intermediate' }, { name: 'React', level: 'Beginner' }], projects: [{ title: 'Task Manager API', description: 'REST API with Spring Boot', techStack: 'Java, Spring Boot, MySQL' }] },
            { userId: students[3]._id, phone: '+91 98765 33333', education: 'B.Tech IT, 2024', experience: '1.5 years full-stack', location: 'Mumbai', resumeScore: 88, skills: [{ name: 'React', level: 'Advanced' }, { name: 'Node.js', level: 'Intermediate' }, { name: 'Python', level: 'Intermediate' }, { name: 'AWS', level: 'Intermediate' }, { name: 'GraphQL', level: 'Beginner' }, { name: 'Docker', level: 'Intermediate' }], projects: [{ title: 'Social Media Dashboard', description: 'Analytics dashboard for social media', techStack: 'React, D3.js, Node.js, PostgreSQL' }] },
            { userId: students[4]._id, phone: '+91 98765 44444', education: 'BCA, 2025', experience: 'Fresher', location: 'Pune', resumeScore: 45, skills: [{ name: 'HTML', level: 'Advanced' }, { name: 'CSS', level: 'Intermediate' }, { name: 'JavaScript', level: 'Beginner' }], projects: [] }
        ];
        for (const p of profiles) { await new StudentProfile(p).save(); }

        const recruiter = new User({ name: 'Acme Corp HR', email: 'hr@acme.com', password: 'recruiter123', role: 'recruiter' });
        await recruiter.save();
        const recruiter2 = new User({ name: 'TechHire Team', email: 'hr@techhire.com', password: 'recruiter123', role: 'recruiter' });
        await recruiter2.save();
        console.log('✅ Users created');

        // === COMPANIES ===
        // No fake mock companies seeded. Real companies are registered directly by recruiters.

        // === JOBS ===
        const jobs = [
            { recruiterId: recruiter._id, companyName: 'Acme Corp', title: 'Senior Frontend Engineer', description: 'Build modern web UIs with React and TypeScript.', requiredSkills: ['React', 'TypeScript', 'CSS', 'GraphQL', 'Jest'], experienceRequired: '3-5 years (Mid-level)', location: 'Remote', salary: '$120k - $150k', status: 'active', applicantCount: 124 },
            { recruiterId: recruiter._id, companyName: 'Acme Corp', title: 'Backend Developer (Node.js)', description: 'Design and build scalable APIs and microservices.', requiredSkills: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Docker'], experienceRequired: '1-3 years (Junior)', location: 'Bangalore, India', salary: '₹12L - ₹18L', status: 'active', applicantCount: 86 },
            { recruiterId: recruiter._id, companyName: 'Acme Corp', title: 'Product Manager', description: 'Drive product strategy and roadmap.', requiredSkills: ['Product Strategy', 'Agile', 'SQL', 'Data Analysis'], experienceRequired: '5+ years (Senior)', location: 'New York, USA', salary: '$140k - $180k', status: 'closed', applicantCount: 215 },
            { recruiterId: recruiter._id, companyName: 'TechNova', title: 'Full Stack Developer', description: 'Build features end to end using modern stack.', requiredSkills: ['React', 'Node.js', 'MongoDB', 'AWS'], experienceRequired: '1-3 years (Junior)', location: 'Remote', salary: '₹10L - ₹15L', status: 'active', applicantCount: 42 },
            { recruiterId: recruiter._id, companyName: 'Global Solutions', title: 'Python Developer', description: 'Backend services with Python and Django.', requiredSkills: ['Python', 'Django', 'PostgreSQL', 'REST APIs'], experienceRequired: '0-1 years (Fresher)', location: 'Hyderabad, India', salary: '₹6L - ₹10L', status: 'active', applicantCount: 67 },
            { recruiterId: recruiter2._id, companyName: 'Razorpay', title: 'DevOps Engineer', description: 'Manage CI/CD pipelines and cloud infrastructure.', requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Linux'], experienceRequired: '3-5 years (Mid-level)', location: 'Bangalore, India', salary: '₹18L - ₹28L', status: 'active', applicantCount: 34 },
            { recruiterId: recruiter2._id, companyName: 'CRED', title: 'React Native Developer', description: 'Build cross-platform mobile applications.', requiredSkills: ['React Native', 'JavaScript', 'TypeScript', 'Redux'], experienceRequired: '1-3 years (Junior)', location: 'Bangalore, India', salary: '₹14L - ₹22L', status: 'active', applicantCount: 58 },
            { recruiterId: recruiter2._id, companyName: 'Swiggy', title: 'Data Analyst', description: 'Analyze business data and generate insights.', requiredSkills: ['Python', 'SQL', 'Tableau', 'Excel', 'Statistics'], experienceRequired: '0-1 years (Fresher)', location: 'Bangalore, India', salary: '₹8L - ₹12L', status: 'active', applicantCount: 112 },
            { recruiterId: recruiter._id, companyName: 'Acme Corp', title: 'ML Engineer', description: 'Build and deploy machine learning models.', requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Docker'], experienceRequired: '3-5 years (Mid-level)', location: 'Remote', salary: '$130k - $170k', status: 'active', applicantCount: 76 },
            { recruiterId: recruiter2._id, companyName: 'PhonePe', title: 'Android Developer', description: 'Build and maintain Android applications.', requiredSkills: ['Kotlin', 'Java', 'Android SDK', 'MVVM'], experienceRequired: '1-3 years (Junior)', location: 'Bangalore, India', salary: '₹12L - ₹20L', status: 'active', applicantCount: 93 }
        ];
        await Job.insertMany(jobs);
        console.log('✅ Jobs created (' + jobs.length + ')');

        // === PREPARATION PATHS ===
        const preps = [
            { companyName: 'Amazon', difficulty: 'Hard', description: 'Leadership principles-driven interviews.', questionCount: 25, topicCount: 4, avgSalary: '$170K', roles: ['SDE I', 'SDE II', 'Data Engineer'], domain: 'product',
              topics: [{ title: 'Leadership Principles', items: ['Customer Obsession', 'Ownership', 'Bias for Action', 'Dive Deep'], order: 1 }, { title: 'Technical Fundamentals', items: ['Scalable Systems', 'Distributed Computing', 'AWS Services'], order: 2 }, { title: 'Bar Raiser Round', items: ['LP-based Stories', 'Bar Raiser Prep', 'Writing Exercise'], order: 3 }, { title: 'Mock Loop', items: ['4-Round Simulation', 'System Design Deep Dive'], order: 4 }],
              questions: [{ question: 'Tell me about a time you disagreed with your manager', category: 'Behavioral', difficulty: 'Medium' }, { question: 'Design a URL shortener like bit.ly', category: 'System Design', difficulty: 'Hard' }, { question: 'Implement LRU Cache', category: 'Coding', difficulty: 'Medium' }, { question: 'Find k closest points to origin', category: 'Coding', difficulty: 'Medium' }, { question: 'Design Amazon order processing system', category: 'System Design', difficulty: 'Hard' }] },
            { companyName: 'Google', difficulty: 'Hard', description: 'Algorithm-heavy interviews.', questionCount: 30, topicCount: 4, avgSalary: '$180K', roles: ['L3 SWE', 'L4 SWE', 'L5 Senior'], domain: 'product',
              topics: [{ title: 'Data Structures', items: ['Arrays & Strings', 'Trees & Graphs', 'Hash Maps', 'Heaps'], order: 1 }, { title: 'Algorithms', items: ['Dynamic Programming', 'Binary Search', 'BFS/DFS', 'Greedy'], order: 2 }, { title: 'System Design', items: ['Distributed Systems', 'Caching', 'Database Sharding'], order: 3 }, { title: 'Googleyness', items: ['Collaboration', 'Ambiguity handling', 'Impact stories'], order: 4 }],
              questions: [{ question: 'Longest substring without repeating chars', category: 'Coding', difficulty: 'Medium' }, { question: 'Design Google Maps', category: 'System Design', difficulty: 'Hard' }, { question: 'Median of two sorted arrays', category: 'Coding', difficulty: 'Hard' }, { question: 'Word ladder problem', category: 'Coding', difficulty: 'Hard' }] },
            { companyName: 'Microsoft', difficulty: 'Medium', description: 'Balanced coding and culture interviews.', questionCount: 22, topicCount: 3, avgSalary: '$160K', roles: ['SDE', 'SDE II', 'Senior SDE'], domain: 'product',
              topics: [{ title: 'Problem Solving', items: ['Arrays', 'Linked Lists', 'Trees', 'Stacks & Queues'], order: 1 }, { title: 'System Design', items: ['Microservices', 'API Design', 'Cloud Architecture'], order: 2 }, { title: 'Values', items: ['Growth Mindset', 'Customer Focus', 'Diversity'], order: 3 }],
              questions: [{ question: 'Design OneDrive file sync service', category: 'System Design', difficulty: 'Hard' }, { question: 'Reverse a linked list', category: 'Coding', difficulty: 'Easy' }, { question: 'Binary tree level order traversal', category: 'Coding', difficulty: 'Medium' }] },
            { companyName: 'Meta', difficulty: 'Hard', description: 'Coding speed and system design.', questionCount: 25, topicCount: 3, avgSalary: '$175K', roles: ['E3 SWE', 'E4 SWE', 'E5 Senior'], domain: 'product',
              topics: [{ title: 'Coding', items: ['Graph Problems', 'String Manipulation', 'Recursion'], order: 1 }, { title: 'System Design', items: ['News Feed Design', 'Chat System', 'Content Delivery'], order: 2 }, { title: 'Behavioral', items: ['Move Fast', 'Collaboration', 'Impact'], order: 3 }],
              questions: [{ question: 'Design Facebook News Feed', category: 'System Design', difficulty: 'Hard' }, { question: 'Clone graph', category: 'Coding', difficulty: 'Medium' }, { question: 'Valid parentheses combinations', category: 'Coding', difficulty: 'Medium' }] },
            { companyName: 'Apple', difficulty: 'Hard', description: 'Deep technical knowledge and design sense.', questionCount: 20, topicCount: 3, avgSalary: '$175K', roles: ['ICT2', 'ICT3', 'ICT4'], domain: 'product',
              topics: [{ title: 'Coding', items: ['Data Structures', 'Algorithms', 'Optimization'], order: 1 }, { title: 'System Design', items: ['iOS Architecture', 'Distributed Storage', 'Real-time Systems'], order: 2 }, { title: 'Domain Knowledge', items: ['OS Internals', 'Networking', 'Security'], order: 3 }],
              questions: [{ question: 'Design iCloud storage system', category: 'System Design', difficulty: 'Hard' }, { question: 'Implement a thread-safe queue', category: 'Coding', difficulty: 'Medium' }] },
            { companyName: 'Netflix', difficulty: 'Hard', description: 'Culture-fit heavy with senior expectations.', questionCount: 15, topicCount: 3, avgSalary: '$200K', roles: ['Senior SWE', 'Staff SWE'], domain: 'product',
              topics: [{ title: 'Technical', items: ['Streaming Architecture', 'Microservices', 'Data Pipelines'], order: 1 }, { title: 'Culture Fit', items: ['Freedom & Responsibility', 'Context not Control'], order: 2 }, { title: 'System Design', items: ['Video Streaming', 'Recommendation Engine'], order: 3 }],
              questions: [{ question: 'Design Netflix streaming architecture', category: 'System Design', difficulty: 'Hard' }] },
            { companyName: 'Stripe', difficulty: 'Medium', description: 'API design and code quality focus.', questionCount: 18, topicCount: 3, avgSalary: '$165K', roles: ['SWE', 'Senior SWE'], domain: 'product',
              topics: [{ title: 'Coding', items: ['Real-world problems', 'Bug-fixing', 'Code review'], order: 1 }, { title: 'Integration', items: ['Payment APIs', 'Webhooks', 'Idempotency'], order: 2 }, { title: 'Architecture', items: ['Event-driven Systems', 'Rate Limiting'], order: 3 }],
              questions: [{ question: 'Design a payment processing system', category: 'System Design', difficulty: 'Hard' }] },
            { companyName: 'Infosys', difficulty: 'Easy', description: 'Aptitude and basic coding round.', questionCount: 20, topicCount: 3, avgSalary: '₹3.6L - ₹8L', roles: ['SE', 'SSE', 'Technology Analyst'], domain: 'service',
              topics: [{ title: 'Aptitude', items: ['Quantitative', 'Logical Reasoning', 'Verbal'], order: 1 }, { title: 'Coding', items: ['Basic DSA', 'Simple Programs', 'SQL Queries'], order: 2 }, { title: 'HR Round', items: ['Tell me about yourself', 'Strengths/Weaknesses'], order: 3 }],
              questions: [{ question: 'Find the missing number in array 1 to N', category: 'Coding', difficulty: 'Easy' }, { question: 'Write a SQL query to find second highest salary', category: 'Coding', difficulty: 'Easy' }] },
            { companyName: 'TCS', difficulty: 'Easy', description: 'TCS NQT based hiring.', questionCount: 20, topicCount: 3, avgSalary: '₹3.3L - ₹7L', roles: ['ASE', 'SE', 'IT Analyst'], domain: 'service',
              topics: [{ title: 'NQT Aptitude', items: ['Numerical Ability', 'Reasoning', 'Verbal'], order: 1 }, { title: 'NQT Coding', items: ['Basic Programs', 'Pattern Printing', 'String Operations'], order: 2 }, { title: 'Interview', items: ['Technical Q&A', 'HR Round'], order: 3 }],
              questions: [{ question: 'Reverse a string without built-in functions', category: 'Coding', difficulty: 'Easy' }, { question: 'Check if a number is palindrome', category: 'Coding', difficulty: 'Easy' }] },
            { companyName: 'Razorpay', difficulty: 'Medium', description: 'Full-stack and system design.', questionCount: 15, topicCount: 3, avgSalary: '₹15L - ₹30L', roles: ['SDE', 'SDE II', 'Senior SDE'], domain: 'startup',
              topics: [{ title: 'Coding', items: ['DSA', 'Problem Solving', 'JavaScript'], order: 1 }, { title: 'System Design', items: ['Payment Gateway', 'Transaction Systems'], order: 2 }, { title: 'Culture', items: ['Startup mindset', 'Ownership'], order: 3 }],
              questions: [{ question: 'Design a payment gateway', category: 'System Design', difficulty: 'Hard' }, { question: 'Implement debounce function', category: 'Coding', difficulty: 'Medium' }] },
            { companyName: 'CRED', difficulty: 'Medium', description: 'Product thinking and clean code.', questionCount: 12, topicCount: 2, avgSalary: '₹18L - ₹35L', roles: ['SDE', 'Senior SDE'], domain: 'startup',
              topics: [{ title: 'Coding', items: ['Clean Code', 'Design Patterns', 'DSA'], order: 1 }, { title: 'Product', items: ['Product Sense', 'User Experience'], order: 2 }],
              questions: [{ question: 'Design a reward points system', category: 'System Design', difficulty: 'Medium' }] },
            { companyName: 'Swiggy', difficulty: 'Medium', description: 'Real-world problem solving.', questionCount: 15, topicCount: 3, avgSalary: '₹12L - ₹25L', roles: ['SDE I', 'SDE II'], domain: 'startup',
              topics: [{ title: 'Coding', items: ['DSA', 'Graphs', 'Dynamic Programming'], order: 1 }, { title: 'System Design', items: ['Order Management', 'Delivery Routing'], order: 2 }, { title: 'HR', items: ['Culture fit', 'Problem-solving approach'], order: 3 }],
              questions: [{ question: 'Design a food delivery routing system', category: 'System Design', difficulty: 'Hard' }, { question: 'Shortest path in weighted graph', category: 'Coding', difficulty: 'Medium' }] }
        ];
        await PreparationPath.insertMany(preps);
        console.log('✅ Preparation paths created (' + preps.length + ')');

        // === WELCOME NOTIFICATION ===
        await new Notification({ type: 'announcement', title: 'Welcome to HirePrep!', message: 'Start your interview preparation journey today. Explore company-wise prep guides and practice questions.', targetRole: 'all', createdBy: admin._id }).save();

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('   Admin:     surajkr09871@gmail.com / admin123');
        console.log('   Student:   ujjwal@demo.com / student123');
        console.log('   Recruiter: hr@acme.com / recruiter123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
}

seed();

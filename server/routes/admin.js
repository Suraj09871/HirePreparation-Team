const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Company = require('../models/Company');
const StudentProfile = require('../models/StudentProfile');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const { auth, roleCheck } = require('../middleware/auth');

// GET /api/admin/stats
router.get('/stats', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const students = await User.countDocuments({ role: 'student' });
        const recruiters = await User.countDocuments({ role: 'recruiter' });
        const jobs = await Job.countDocuments();
        const applications = await Application.countDocuments();
        const companies = await Company.countDocuments();
        const pendingVerifications = await Company.countDocuments({ isVerified: false });
        const activeJobs = await Job.countDocuments({ status: 'active' });

        // Active vs inactive (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const activeUsers = await User.countDocuments({ lastLogin: { $gte: sevenDaysAgo } });
        const totalUsers = await User.countDocuments();
        const inactiveUsers = totalUsers - activeUsers;

        // Conversion rates
        const shortlisted = await Application.countDocuments({ status: { $in: ['shortlisted', 'interview', 'selected'] } });
        const selected = await Application.countDocuments({ status: 'selected' });
        const conversionRate = applications > 0 ? Math.round((selected / applications) * 100) : 0;
        const shortlistRate = applications > 0 ? Math.round((shortlisted / applications) * 100) : 0;

        res.json({
            success: true, stats: {
                students, recruiters, jobs, applications, companies, pendingVerifications, activeJobs,
                activeUsers, inactiveUsers, totalUsers, conversionRate, shortlistRate, selected, shortlisted
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/analytics - Growth and trend data
router.get('/analytics', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const users = await User.find({ createdAt: { $gte: sixMonthsAgo } }).select('createdAt role');
        const monthLabels = [];
        const studentGrowth = [];
        const recruiterGrowth = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
            monthLabels.push(label);
            const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            studentGrowth.push(users.filter(u => u.role === 'student' && u.createdAt >= monthStart && u.createdAt <= monthEnd).length);
            recruiterGrowth.push(users.filter(u => u.role === 'recruiter' && u.createdAt >= monthStart && u.createdAt <= monthEnd).length);
        }

        // Role distribution
        const roleDistribution = {
            students: await User.countDocuments({ role: 'student' }),
            recruiters: await User.countDocuments({ role: 'recruiter' }),
            admins: await User.countDocuments({ role: { $in: ['admin', 'sub-admin'] } })
        };

        // Application status distribution
        const appStatuses = await Application.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Top companies by jobs
        const topCompanies = await Job.aggregate([
            { $group: { _id: '$companyName', jobCount: { $sum: 1 }, totalApplicants: { $sum: '$applicantCount' } } },
            { $sort: { jobCount: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            analytics: { monthLabels, studentGrowth, recruiterGrowth, roleDistribution, appStatuses, topCompanies }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/analytics/advanced - Deep analytics
router.get('/analytics/advanced', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const { granularity = 'monthly' } = req.query;

        // --- User growth by granularity ---
        let periods = [];
        const now = new Date();
        if (granularity === 'daily') {
            for (let i = 29; i >= 0; i--) {
                const d = new Date(now); d.setDate(d.getDate() - i);
                const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
                periods.push({ label: `${d.getMonth()+1}/${d.getDate()}`, start, end });
            }
        } else if (granularity === 'weekly') {
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now); d.setDate(d.getDate() - i * 7);
                const start = new Date(d); start.setDate(start.getDate() - 6);
                const end = new Date(d); end.setDate(end.getDate() + 1);
                periods.push({ label: `W${12-i}`, start, end });
            }
        } else {
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now); d.setMonth(d.getMonth() - i);
                const start = new Date(d.getFullYear(), d.getMonth(), 1);
                const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
                periods.push({ label: d.toLocaleString('default', { month: 'short' }), start, end });
            }
        }

        const earliest = periods[0].start;
        const allUsers = await User.find({ createdAt: { $gte: earliest } }).select('createdAt role lastLogin');
        const growthLabels = periods.map(p => p.label);
        const studentGrowth = periods.map(p => allUsers.filter(u => u.role === 'student' && u.createdAt >= p.start && u.createdAt < p.end).length);
        const recruiterGrowth = periods.map(p => allUsers.filter(u => u.role === 'recruiter' && u.createdAt >= p.start && u.createdAt < p.end).length);

        // --- Active vs Inactive ---
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const activeCount = await User.countDocuments({ lastLogin: { $gte: sevenDaysAgo } });
        const totalUsers = await User.countDocuments();

        // --- Conversion funnel ---
        const totalApps = await Application.countDocuments();
        const inReview = await Application.countDocuments({ status: 'in-review' });
        const shortlisted = await Application.countDocuments({ status: { $in: ['shortlisted', 'interview', 'selected'] } });
        const interviewed = await Application.countDocuments({ status: { $in: ['interview', 'selected'] } });
        const selected = await Application.countDocuments({ status: 'selected' });
        const rejected = await Application.countDocuments({ status: 'rejected' });

        // --- Student performance distribution ---
        const profiles = await StudentProfile.find().populate('userId', 'name');
        const perfBuckets = [0, 0, 0, 0]; // 0-25, 25-50, 50-75, 75-100
        const resumeBuckets = [0, 0, 0, 0, 0]; // 0-20, 20-40, 40-60, 60-80, 80-100
        const allScores = [];
        profiles.forEach(p => {
            const skillScore = Math.min(p.skills.length * 15, 100);
            const resumeScore = p.resumeScore || 0;
            const projectScore = Math.min(p.projects.length * 25, 100);
            const completionPct = p.getCompletionPercentage();
            const composite = Math.round(resumeScore * 0.3 + skillScore * 0.3 + projectScore * 0.2 + completionPct * 0.2);
            allScores.push(composite);
            if (composite < 25) perfBuckets[0]++;
            else if (composite < 50) perfBuckets[1]++;
            else if (composite < 75) perfBuckets[2]++;
            else perfBuckets[3]++;

            if (resumeScore < 20) resumeBuckets[0]++;
            else if (resumeScore < 40) resumeBuckets[1]++;
            else if (resumeScore < 60) resumeBuckets[2]++;
            else if (resumeScore < 80) resumeBuckets[3]++;
            else resumeBuckets[4]++;
        });
        const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
        const top10Pct = allScores.length > 0 ? allScores.sort((a, b) => b - a).slice(0, Math.max(1, Math.ceil(allScores.length * 0.1))) : [];
        const top10AvgScore = top10Pct.length > 0 ? Math.round(top10Pct.reduce((a, b) => a + b, 0) / top10Pct.length) : 0;

        // --- Skill gap trends (top missing skills across all applications) ---
        const allApps = await Application.find().select('missingSkills');
        const skillGap = {};
        allApps.forEach(app => {
            (app.missingSkills || []).forEach(skill => {
                skillGap[skill] = (skillGap[skill] || 0) + 1;
            });
        });
        const topMissingSkills = Object.entries(skillGap).sort((a, b) => b[1] - a[1]).slice(0, 10)
            .map(([skill, count]) => ({ skill, count }));

        // --- Applications per day (last 30 days) ---
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentApps = await Application.find({ appliedAt: { $gte: thirtyDaysAgo } }).select('appliedAt');
        const appsPerDay = {};
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now); d.setDate(d.getDate() - i);
            const key = `${d.getMonth()+1}/${d.getDate()}`;
            appsPerDay[key] = 0;
        }
        recentApps.forEach(a => {
            const d = new Date(a.appliedAt);
            const key = `${d.getMonth()+1}/${d.getDate()}`;
            if (appsPerDay[key] !== undefined) appsPerDay[key]++;
        });

        res.json({
            success: true,
            advanced: {
                growth: { labels: growthLabels, students: studentGrowth, recruiters: recruiterGrowth },
                activeVsInactive: { active: activeCount, inactive: totalUsers - activeCount },
                conversionFunnel: { applied: totalApps, inReview, shortlisted, interviewed, selected, rejected },
                performanceDistribution: { buckets: perfBuckets, labels: ['0-25%', '25-50%', '50-75%', '75-100%'], avgScore, top10AvgScore },
                resumeDistribution: { buckets: resumeBuckets, labels: ['0-20', '20-40', '40-60', '60-80', '80-100'] },
                skillGapTrends: topMissingSkills,
                appsPerDay: { labels: Object.keys(appsPerDay), data: Object.values(appsPerDay) }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/activity-log
router.get('/activity-log', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const logs = await ActivityLog.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('userId', 'name email role');
        res.json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/matching-logic - Return the matching formula
router.get('/matching-logic', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        // Get a sample calculation
        const sampleApp = await Application.findOne({ skillMatch: { $gt: 0 } })
            .populate('studentId', 'name')
            .populate('jobId', 'title requiredSkills');

        res.json({
            success: true,
            formula: {
                name: 'Hiring Probability Algorithm',
                equation: 'Final Score = (Skill Match × 60%) + (Experience Score × 20%) + (Resume Completeness × 20%)',
                weights: {
                    skillMatch: { weight: 0.6, description: 'Percentage of required skills the candidate possesses' },
                    experienceScore: { weight: 0.2, description: 'How well candidate experience matches job requirements' },
                    resumeCompleteness: { weight: 0.2, description: 'Profile completeness score based on filled fields' }
                },
                skillMatchFormula: 'Skill Match % = (Matched Skills / Required Skills) × 100',
                recommendationThresholds: {
                    high: { min: 85, label: 'Highly Recommended', color: '#10b981' },
                    medium: { min: 60, label: 'Medium Potential', color: '#f59e0b' },
                    low: { min: 0, label: 'Low Match', color: '#ef4444' }
                },
                resumeWeights: {
                    phone: 10, education: 15, experience: 20, location: 5,
                    resumeUrl: 20, skills: 20, projects: 10
                },
                sampleCalculation: sampleApp ? {
                    candidate: sampleApp.studentId?.name || 'N/A',
                    job: sampleApp.jobId?.title || 'N/A',
                    skillMatch: sampleApp.skillMatch,
                    hiringProbability: sampleApp.hiringProbability,
                    matchedSkills: sampleApp.matchedSkills,
                    missingSkills: sampleApp.missingSkills
                } : null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/top-performers
router.get('/top-performers', auth, roleCheck('admin', 'sub-admin', 'recruiter'), async (req, res) => {
    try {
        const profiles = await StudentProfile.find().populate('userId', 'name email createdAt');
        const ranked = profiles
            .filter(p => p.userId)
            .map(p => {
                const skillScore = Math.min(p.skills.length * 15, 100);
                const resumeScore = p.resumeScore || 0;
                const projectScore = Math.min(p.projects.length * 25, 100);
                const completionPct = p.getCompletionPercentage();
                const compositeScore = Math.round(resumeScore * 0.3 + skillScore * 0.3 + projectScore * 0.2 + completionPct * 0.2);
                return {
                    _id: p.userId._id,
                    name: p.userId.name,
                    email: p.userId.email,
                    resumeScore,
                    skillCount: p.skills.length,
                    skills: p.skills.map(s => s.name),
                    projectCount: p.projects.length,
                    completionPct,
                    compositeScore,
                    location: p.location,
                    education: p.education
                };
            })
            .sort((a, b) => b.compositeScore - a.compositeScore);
        res.json({ success: true, performers: ranked });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/users
router.get('/users', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const { role, search } = req.query;
        const filter = {};
        if (role && role !== 'all') filter.role = role;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        const users = await User.find(filter).sort({ createdAt: -1 });
        const enriched = await Promise.all(users.map(async (u) => {
            const profile = await StudentProfile.findOne({ userId: u._id });
            return { ...u.toJSON(), skillCount: profile ? profile.skills.length : 0, resumeScore: profile ? profile.resumeScore : 0 };
        }));
        res.json({ success: true, users: enriched });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', auth, roleCheck('admin'), async (req, res) => {
    try {
        const { role, permissions } = req.body;
        if (!['student', 'recruiter', 'admin', 'sub-admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }
        const update = { role };
        if (permissions) update.permissions = permissions;
        await User.findByIdAndUpdate(req.params.id, update);
        res.json({ success: true, message: 'User role updated.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', auth, roleCheck('admin'), async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        await StudentProfile.findOneAndDelete({ userId: req.params.id });
        res.json({ success: true, message: 'User deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/companies
router.get('/companies', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const companies = await Company.find().populate('submittedBy', 'name email').sort({ createdAt: -1 });
        res.json({ success: true, companies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/admin/companies
router.post('/companies', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const company = new Company({ ...req.body, isVerified: true });
        await company.save();
        res.status(201).json({ success: true, message: 'Company added!', company });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/companies/:id
router.put('/companies/:id', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, message: 'Company updated!', company });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/companies/:id
router.delete('/companies/:id', auth, roleCheck('admin'), async (req, res) => {
    try {
        await Company.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Company deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/companies/:id/verify
router.put('/companies/:id/verify', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const { approve } = req.body;
        if (approve) {
            await Company.findByIdAndUpdate(req.params.id, { isVerified: true });
            res.json({ success: true, message: 'Company approved.' });
        } else {
            await Company.findByIdAndDelete(req.params.id);
            res.json({ success: true, message: 'Company rejected and removed.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/admin/notifications/bulk
router.post('/notifications/bulk', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const { type } = req.body; // 'inactive' or 'top-performers'

        if (type === 'inactive') {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const inactiveUsers = await User.find({ lastLogin: { $lt: sevenDaysAgo }, role: 'student' }).select('_id name');
            await new Notification({
                type: 'reminder', title: '🔔 We miss you!',
                message: `Hey! You haven't logged in for a while. Come back and continue your preparation journey. ${inactiveUsers.length} inactive students notified.`,
                targetRole: 'student', createdBy: req.userId
            }).save();
            res.json({ success: true, message: `Notification sent to ${inactiveUsers.length} inactive students.` });
        } else if (type === 'top-performers') {
            const profiles = await StudentProfile.find().populate('userId', 'name');
            const scored = profiles.filter(p => p.userId).map(p => {
                const s = Math.min(p.skills.length * 15, 100);
                return { name: p.userId.name, score: Math.round((p.resumeScore || 0) * 0.3 + s * 0.3 + Math.min(p.projects.length * 25, 100) * 0.2 + p.getCompletionPercentage() * 0.2) };
            }).sort((a, b) => b.score - a.score);
            const topCount = Math.max(1, Math.ceil(scored.length * 0.1));
            const topNames = scored.slice(0, topCount).map(s => s.name).join(', ');
            await new Notification({
                type: 'achievement', title: '🏆 Congratulations Top Performers!',
                message: `Great job ${topNames}! You're among the top ${topCount} performers on HireSmart. Keep up the excellent work!`,
                targetRole: 'student', createdBy: req.userId
            }).save();
            res.json({ success: true, message: `Congratulated top ${topCount} performers.` });
        } else {
            res.status(400).json({ success: false, message: 'Invalid bulk type' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/export/users - CSV export
router.get('/export/users', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        let csv = 'Name,Email,Role,Joined,Last Login\n';
        users.forEach(u => {
            csv += `"${u.name}","${u.email}","${u.role}","${new Date(u.createdAt).toLocaleDateString()}","${u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}"\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/export/applications - CSV export
router.get('/export/applications', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const apps = await Application.find()
            .populate('studentId', 'name email')
            .populate('jobId', 'title companyName')
            .sort({ appliedAt: -1 });
        let csv = 'Student,Email,Job Title,Company,Skill Match %,Hiring Probability %,Status,Matched Skills,Missing Skills,Applied Date\n';
        apps.forEach(a => {
            csv += `"${a.studentId?.name || ''}","${a.studentId?.email || ''}","${a.jobId?.title || ''}","${a.jobId?.companyName || ''}",${a.skillMatch},${a.hiringProbability},"${a.status}","${(a.matchedSkills||[]).join('; ')}","${(a.missingSkills||[]).join('; ')}","${new Date(a.appliedAt).toLocaleDateString()}"\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=applications_export.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/export/performance - CSV export
router.get('/export/performance', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const profiles = await StudentProfile.find().populate('userId', 'name email');
        let csv = 'Name,Email,Resume Score,Skills Count,Projects Count,Completion %,Composite Score,Location,Education\n';
        profiles.filter(p => p.userId).forEach(p => {
            const skillScore = Math.min(p.skills.length * 15, 100);
            const composite = Math.round((p.resumeScore || 0) * 0.3 + skillScore * 0.3 + Math.min(p.projects.length * 25, 100) * 0.2 + p.getCompletionPercentage() * 0.2);
            csv += `"${p.userId.name}","${p.userId.email}",${p.resumeScore || 0},${p.skills.length},${p.projects.length},${p.getCompletionPercentage()},${composite},"${p.location || ''}","${p.education || ''}"\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=performance_export.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/site-health
router.get('/site-health', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();
    const dbState = mongoose.connection.readyState; // 0=disconnected, 1=connected, 2=connecting
    
    res.json({
        success: true,
        health: {
            status: dbState === 1 ? 'healthy' : 'degraded',
            uptime: Math.floor(uptime),
            uptimeFormatted: `${Math.floor(uptime/3600)}h ${Math.floor((uptime%3600)/60)}m ${Math.floor(uptime%60)}s`,
            memory: {
                heapUsed: (memUsage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
                heapTotal: (memUsage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
                rss: (memUsage.rss / 1024 / 1024).toFixed(2) + ' MB'
            },
            database: { state: ['disconnected','connected','connecting','disconnecting'][dbState], host: mongoose.connection.host || 'N/A' },
            nodeVersion: process.version,
            platform: process.platform,
            environment: process.env.NODE_ENV || 'development'
        }
    });
});

// GET /api/admin/db-status  
router.get('/db-status', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const stats = await mongoose.connection.db.stats();
        
        const collectionDetails = [];
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            collectionDetails.push({ name: col.name, documents: count });
        }
        
        res.json({
            success: true,
            database: {
                name: mongoose.connection.name,
                host: mongoose.connection.host,
                collections: collectionDetails,
                totalSize: (stats.dataSize / 1024).toFixed(2) + ' KB',
                storageSize: (stats.storageSize / 1024).toFixed(2) + ' KB',
                indexes: stats.indexes
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/security-overview
router.get('/security-overview', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    const User = require('../models/User');
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const googleUsers = await User.countDocuments({ authProvider: 'google' });
    const recentLogins = await User.find({ lastLogin: { $gte: new Date(Date.now() - 24*60*60*1000) } }).countDocuments();
    
    res.json({
        success: true,
        security: {
            totalUsers,
            adminUsers,
            googleAuthUsers: googleUsers,
            localAuthUsers: totalUsers - googleUsers,
            activeIn24h: recentLogins,
            securityHeaders: 'Helmet enabled',
            rateLimiting: '50 requests / 15 min on auth routes',
            jwtExpiry: process.env.JWT_EXPIRES_IN || '7d'
        }
    });
});

module.exports = router;

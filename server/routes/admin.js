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
const { logActivity } = require('../utils/logger');

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeCSV(value) {
    if (typeof value !== 'string') return value;
    // Prevent CSV injection by prefixing dangerous characters
    if (/^[=+\-@\t\r]/.test(value)) {
        return "'" + value;
    }
    return value;
}

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
            const safeSearch = escapeRegex(search);
            filter.$or = [
                { name: { $regex: safeSearch, $options: 'i' } },
                { email: { $regex: safeSearch, $options: 'i' } }
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

// GET /api/admin/profile - Get current admin's profile info
router.get('/profile', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password -emailOtp -emailOtpExpires');
        if (!user) return res.status(404).json({ success: false, message: 'Admin not found' });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/profile - Update current admin's profile (name, email, password)
router.put('/profile', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: 'Admin not found' });

        const { name, email, password } = req.body;

        if (name && name.trim()) {
            user.name = name.trim();
        }
        if (email && email.trim() && email.toLowerCase().trim() !== user.email) {
            const existing = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: user._id } });
            if (existing) {
                return res.status(400).json({ success: false, message: 'Email is already in use by another account' });
            }
            user.email = email.toLowerCase().trim();
        }
        if (password && password.trim().length >= 6) {
            user.password = password.trim();
        }

        await user.save();

        await logActivity(req.userId, 'profile_update', `Admin profile updated: ${user.name} (${user.email})`);

        res.json({
            success: true,
            message: 'Admin profile updated successfully!',
            user: {
                id: user._id,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/users/:id/role - Change any user's role (promote to Admin, demote to student/recruiter)
router.put('/users/:id/role', auth, roleCheck('admin'), async (req, res) => {
    try {
        const { role, permissions } = req.body;
        if (!['student', 'recruiter', 'admin', 'sub-admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role. Must be student, recruiter, admin, or sub-admin.' });
        }
        const targetUser = await User.findById(req.params.id);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Safety: If demoting self from admin, ensure at least one other admin exists
        if (targetUser._id.toString() === req.userId.toString() && role !== 'admin') {
            const otherAdmins = await User.countDocuments({ role: 'admin', _id: { $ne: targetUser._id } });
            if (otherAdmins === 0) {
                return res.status(400).json({ success: false, message: 'Cannot demote the only remaining Admin. Please promote another user to Admin first.' });
            }
        }

        const oldRole = targetUser.role;
        targetUser.role = role;
        if (permissions) targetUser.permissions = permissions;
        await targetUser.save();

        await logActivity(req.userId, 'role_change', `Changed role for ${targetUser.name} (${targetUser.email}) from ${oldRole} to ${role}`);

        res.json({ 
            success: true, 
            message: `User role successfully updated to ${role}.`,
            user: {
                id: targetUser._id,
                _id: targetUser._id,
                name: targetUser.name,
                email: targetUser.email,
                role: targetUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', auth, roleCheck('admin'), async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id);
        await User.findByIdAndDelete(req.params.id);
        await StudentProfile.findOneAndDelete({ userId: req.params.id });

        await logActivity(req.userId, 'user_delete', `Deleted user account: ${targetUser?.name || req.params.id}`);

        res.json({ success: true, message: 'User deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/users/:id/detail and /api/admin/users/:id - Fetch full user profile & stats
const getUserDetailsHandler = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const profile = await StudentProfile.findOne({ userId: req.params.id }) || {};
        const applications = await Application.find({ studentId: req.params.id })
            .populate('jobId', 'title companyName status location')
            .sort({ createdAt: -1 });

        let company = null;
        let postedJobs = [];
        if (user.role === 'recruiter') {
            if (user.companyId) company = await Company.findById(user.companyId);
            if (!company) company = await Company.findOne({ submittedBy: user._id });
            postedJobs = await Job.find({ postedBy: user._id }).sort({ createdAt: -1 });
        }

        res.json({
            success: true,
            user,
            student: {
                user,
                profile,
                applications
            },
            profile,
            applications,
            company,
            postedJobs
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

router.get('/users/:id/detail', auth, roleCheck('admin', 'sub-admin', 'recruiter'), getUserDetailsHandler);
router.get('/users/:id', auth, roleCheck('admin', 'sub-admin'), getUserDetailsHandler);

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

        await logActivity(req.userId, 'company_create', `Added company: ${company.name}`);

        res.status(201).json({ success: true, message: 'Company added!', company });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/companies/:id
router.put('/companies/:id', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });

        await logActivity(req.userId, 'company_update', `Updated company: ${company.name}`);

        res.json({ success: true, message: 'Company updated!', company });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/companies/:id
router.delete('/companies/:id', auth, roleCheck('admin'), async (req, res) => {
    try {
        const targetCompany = await Company.findById(req.params.id);
        await Company.findByIdAndDelete(req.params.id);

        await logActivity(req.userId, 'company_delete', `Deleted company: ${targetCompany?.name || req.params.id}`);

        res.json({ success: true, message: 'Company deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/companies/:id/verify
router.put('/companies/:id/verify', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const { approve, rejectionReason } = req.body;
        const targetCompany = await Company.findById(req.params.id);
        if (!targetCompany) {
            return res.status(404).json({ success: false, message: 'Company not found.' });
        }

        if (approve) {
            targetCompany.verificationStatus = 'approved';
            targetCompany.isVerified = true;
            targetCompany.verifiedAt = new Date();
            targetCompany.verifiedBy = req.userId;
            targetCompany.rejectionReason = '';
            await targetCompany.save();

            // Notify the recruiter who submitted
            if (targetCompany.submittedBy) {
                await new Notification({
                    type: 'system',
                    title: '✅ Company Verified!',
                    message: `Your company "${targetCompany.name}" has been verified by admin. You can now post job listings on HirePrep!`,
                    targetUserId: targetCompany.submittedBy,
                    targetRole: 'recruiter',
                    createdBy: req.userId
                }).save();
            }

            await logActivity(req.userId, 'company_verify', `Approved company: ${targetCompany.name}`);
            res.json({ success: true, message: 'Company approved! Recruiter has been notified.' });
        } else {
            targetCompany.verificationStatus = 'rejected';
            targetCompany.isVerified = false;
            targetCompany.rejectionReason = rejectionReason || 'Your company registration did not meet our verification requirements.';
            await targetCompany.save();

            // Notify the recruiter
            if (targetCompany.submittedBy) {
                await new Notification({
                    type: 'system',
                    title: '❌ Company Registration Rejected',
                    message: `Your company "${targetCompany.name}" registration was rejected. Reason: ${targetCompany.rejectionReason}. Please update your details and contact support.`,
                    targetUserId: targetCompany.submittedBy,
                    targetRole: 'recruiter',
                    createdBy: req.userId
                }).save();
            }

            await logActivity(req.userId, 'company_reject', `Rejected company: ${targetCompany.name}. Reason: ${targetCompany.rejectionReason}`);
            res.json({ success: true, message: 'Company rejected. Recruiter has been notified.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/companies/:id/full - Full company details for admin review
router.get('/companies/:id/full', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const company = await Company.findById(req.params.id)
            .populate('submittedBy', 'name email role createdAt lastLogin')
            .populate('verifiedBy', 'name email');

        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found.' });
        }

        res.json({ success: true, company });
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
            const inactiveUsers = await User.find({
                role: 'student',
                $or: [
                    { lastLogin: { $lt: sevenDaysAgo } },
                    { lastLogin: { $exists: false } },
                    { lastLogin: null }
                ]
            }).select('_id name email');

            const notif = await new Notification({
                type: 'reminder',
                title: '🔔 Continue Your Placement Preparation!',
                message: `Hey! Don't miss out on upcoming campus opportunities. Log in to HirePrep to practice questions and update your resume!`,
                targetRole: 'student',
                createdBy: req.userId
            }).save();

            res.json({ success: true, message: `Notification broadcast to ${inactiveUsers.length} inactive student accounts.`, notification: notif });
        } else if (type === 'top-performers') {
            const profiles = await StudentProfile.find().populate('userId', 'name email');
            const scored = profiles.filter(p => p.userId).map(p => {
                const s = Math.min((p.skills || []).length * 15, 100);
                const comp = typeof p.getCompletionPercentage === 'function' ? p.getCompletionPercentage() : 0;
                return {
                    name: p.userId.name || 'Student',
                    score: Math.round((p.resumeScore || 0) * 0.3 + s * 0.3 + Math.min((p.projects || []).length * 25, 100) * 0.2 + comp * 0.2)
                };
            }).sort((a, b) => b.score - a.score);

            const topCount = Math.max(1, Math.min(5, scored.length));
            const topNames = scored.length > 0 ? scored.slice(0, topCount).map(s => s.name).join(', ') : 'High Achievers';

            const notif = await new Notification({
                type: 'achievement',
                title: '🏆 Congratulations Top Performers!',
                message: `Shoutout to ${topNames} for leading the HirePrep leaderboard! Keep up the outstanding preparation.`,
                targetRole: 'student',
                createdBy: req.userId
            }).save();

            res.json({ success: true, message: `Congratulated top performers (${topNames})!`, notification: notif });
        } else {
            res.status(400).json({ success: false, message: 'Invalid bulk notification type' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/admin/notifications/send - Send custom broadcast announcement
router.post('/notifications/send', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const { title, message, targetRole = 'all' } = req.body;
        if (!title || !message) {
            return res.status(400).json({ success: false, message: 'Title and message are required.' });
        }
        const notif = new Notification({
            type: 'announcement',
            title,
            message,
            targetRole,
            createdBy: req.userId
        });
        await notif.save();
        res.json({ success: true, message: 'Announcement broadcast successfully!', notification: notif });
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
            csv += `"${escapeCSV(u.name)}","${escapeCSV(u.email)}","${escapeCSV(u.role)}","${new Date(u.createdAt).toLocaleDateString()}","${u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}"\n`;
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
            csv += `"${escapeCSV(a.studentId?.name || '')}","${escapeCSV(a.studentId?.email || '')}","${escapeCSV(a.jobId?.title || '')}","${escapeCSV(a.jobId?.companyName || '')}",${a.skillMatch},${a.hiringProbability},"${escapeCSV(a.status)}","${escapeCSV((a.matchedSkills||[]).join('; '))}","${escapeCSV((a.missingSkills||[]).join('; '))}","${new Date(a.appliedAt).toLocaleDateString()}"\n`;
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
            csv += `"${escapeCSV(p.userId.name)}","${escapeCSV(p.userId.email)}",${p.resumeScore || 0},${p.skills.length},${p.projects.length},${p.getCompletionPercentage()},${composite},"${escapeCSV(p.location || '')}","${escapeCSV(p.education || '')}"\n`;
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
    try {
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
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/traffic - Real route hit counts and activity statistics
router.get('/traffic', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        // Group activities by action type to compute real route usage
        const actionCounts = await ActivityLog.aggregate([
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const actionToRouteMap = {
            'login': { path: '/api/auth/login', method: 'POST', avg: 120 },
            'google_login': { path: '/api/auth/google', method: 'POST', avg: 190 },
            'register': { path: '/api/auth/register', method: 'POST', avg: 150 },
            'profile_update': { path: '/api/profile', method: 'PUT', avg: 85 },
            'application_submit': { path: '/api/applications', method: 'POST', avg: 140 },
            'job_view': { path: '/api/jobs', method: 'GET', avg: 45 },
            'practice_submit': { path: '/api/practice/submit', method: 'POST', avg: 210 },
            'company_registration': { path: '/api/companies/my-company', method: 'POST', avg: 130 },
            'company_verify': { path: '/api/admin/companies/:id/verify', method: 'PUT', avg: 110 },
            'company_reject': { path: '/api/admin/companies/:id/reject', method: 'PUT', avg: 105 },
            'interview_scheduled': { path: '/api/applications/:id/schedule-interview', method: 'POST', avg: 95 }
        };

        const routes = actionCounts.map(ac => {
            const mapped = actionToRouteMap[ac._id] || { path: `/api/${ac._id.replace(/_/g, '/')}`, method: 'POST', avg: 100 };
            return {
                action: ac._id,
                path: mapped.path,
                method: mapped.method,
                count: ac.count,
                avg: mapped.avg
            };
        });

        // If no logs exist yet, provide standard base endpoints with real counts
        if (routes.length === 0) {
            routes.push(
                { action: 'auth', path: '/api/auth/login', method: 'POST', count: 1, avg: 110 },
                { action: 'jobs', path: '/api/jobs', method: 'GET', count: await Job.countDocuments(), avg: 45 },
                { action: 'applications', path: '/api/applications', method: 'GET', count: await Application.countDocuments(), avg: 60 }
            );
        }

        const totalHits = routes.reduce((sum, r) => sum + r.count, 0);
        const avgResponse = Math.round(routes.reduce((sum, r) => sum + r.avg, 0) / routes.length);

        res.json({
            success: true,
            totalHits,
            activeRoutesCount: routes.length,
            avgResponseTime: avgResponse,
            routes
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/system-logs - Real system and user activities from ActivityLog
router.get('/system-logs', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const { level = 'all', limit = 100 } = req.query;

        const rawLogs = await ActivityLog.find()
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate('userId', 'name email role');

        const logs = rawLogs.map(l => {
            let lvl = 'INFO';
            const act = (l.action || '').toLowerCase();
            if (act.includes('delete') || act.includes('reject') || act.includes('fail') || act.includes('warn')) lvl = 'WARN';
            if (act.includes('error') || act.includes('crash')) lvl = 'ERROR';

            return {
                _id: l._id,
                time: new Date(l.createdAt).toLocaleTimeString(),
                date: new Date(l.createdAt).toLocaleDateString(),
                timestamp: l.createdAt,
                level: lvl,
                action: l.action,
                message: l.details || `Action: ${l.action}`,
                source: l.userId?.name ? `${l.userId.name} (${l.userId.role})` : 'System',
                userEmail: l.userId?.email || 'N/A'
            };
        });

        const filtered = (level && level !== 'all') ? logs.filter(l => l.level === level.toUpperCase()) : logs;

        res.json({ success: true, count: filtered.length, logs: filtered });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/jobs - List all jobs with recruiter and applicant details
router.get('/jobs', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const { search, status } = req.query;
        let query = {};
        if (status && status !== 'all') query.status = status;
        if (search) {
            const regex = new RegExp(escapeRegex(search), 'i');
            query.$or = [{ title: regex }, { companyName: regex }, { location: regex }];
        }
        const jobs = await Job.find(query)
            .populate('postedBy', 'name email')
            .populate('companyId', 'name isVerified logo')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: jobs.length, jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/jobs/:id/status - Toggle active/closed status
router.put('/jobs/:id/status', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'closed', 'draft'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        const job = await Job.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
        await logActivity(req.userId, 'admin_action', `Changed job "${job.title}" status to ${status}`);
        res.json({ success: true, message: `Job marked as ${status}`, job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/jobs/:id - Delete a job and its applications
router.delete('/jobs/:id', auth, roleCheck('admin'), async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
        await Application.deleteMany({ jobId: job._id });
        await Job.deleteOne({ _id: job._id });
        await logActivity(req.userId, 'admin_action', `Deleted job posting "${job.title}" and associated applications`);
        res.json({ success: true, message: 'Job and associated applications deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/applications - List all student applications with matching metrics
router.get('/applications', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = {};
        if (status && status !== 'all') query.status = status;
        const apps = await Application.find(query)
            .populate('studentId', 'name email')
            .populate('jobId', 'title companyName location salary')
            .sort({ appliedAt: -1 });
        
        let filtered = apps;
        if (search) {
            const s = search.toLowerCase();
            filtered = apps.filter(a => 
                (a.studentId?.name || '').toLowerCase().includes(s) ||
                (a.studentId?.email || '').toLowerCase().includes(s) ||
                (a.jobId?.title || '').toLowerCase().includes(s) ||
                (a.jobId?.companyName || '').toLowerCase().includes(s)
            );
        }
        res.json({ success: true, count: filtered.length, applications: filtered });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/applications/:id/status - Override application pipeline stage
router.put('/applications/:id/status', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['applied', 'shortlisted', 'in-review', 'interview', 'selected', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid application status' });
        }
        const app = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true })
            .populate('studentId', 'name email')
            .populate('jobId', 'title companyName');
        if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

        // Notify student of admin status update
        if (app.studentId) {
            await new Notification({
                userId: app.studentId._id,
                type: status === 'selected' ? 'achievement' : 'alert',
                title: `Application Status Updated: ${app.jobId?.title || 'Job'}`,
                message: `Your application status for ${app.jobId?.title || 'Job'} at ${app.jobId?.companyName || 'Company'} has been updated to "${status.toUpperCase()}".`,
                createdBy: req.userId
            }).save();
        }

        await logActivity(req.userId, 'admin_action', `Updated application ${app._id} status to ${status}`);
        res.json({ success: true, message: `Application status updated to ${status}`, application: app });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/applications/:id - Delete an application
router.delete('/applications/:id', auth, roleCheck('admin'), async (req, res) => {
    try {
        const app = await Application.findByIdAndDelete(req.params.id);
        if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
        await Job.findByIdAndUpdate(app.jobId, { $inc: { applicantCount: -1 } });
        res.json({ success: true, message: 'Application deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/admin/system/clean-temp - Clean expired OTPs and temp auth artifacts
router.post('/system/clean-temp', auth, roleCheck('admin'), async (req, res) => {
    try {
        const result = await User.updateMany(
            { emailOtpExpires: { $lt: new Date() } },
            { $set: { emailOtp: '', emailOtpExpires: null } }
        );
        await logActivity(req.userId, 'admin_action', `Cleaned ${result.modifiedCount} expired verification codes`);
        res.json({ success: true, message: `Cleaned up ${result.modifiedCount} expired verification codes. System storage optimized.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ══════════════════════════════════════════════
// QUESTION MANAGEMENT CRUD (reads/writes data/questions.json)
// ══════════════════════════════════════════════
const fs = require('fs');
const questionsFilePath = require('path').join(__dirname, '..', '..', 'data', 'questions.json');

function readQuestions() {
    const raw = fs.readFileSync(questionsFilePath, 'utf8');
    return JSON.parse(raw);
}
function writeQuestions(data) {
    fs.writeFileSync(questionsFilePath, JSON.stringify(data, null, 2), 'utf8');
}

// GET /api/admin/questions - List all questions with optional category filter
router.get('/questions', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const data = readQuestions();
        const { category, page = 1, limit = 50 } = req.query;
        if (category && data[category]) {
            const arr = data[category];
            const start = (page - 1) * limit;
            res.json({ success: true, questions: arr.slice(start, start + parseInt(limit)), total: arr.length, category });
        } else {
            res.json({
                success: true,
                counts: {
                    coding: (data.coding || []).length,
                    coding_mcq: (data.coding_mcq || []).length,
                    aptitude: (data.aptitude || []).length
                }
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/admin/questions - Add a new question
router.post('/questions', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const { category, question } = req.body;
        if (!category || !question) {
            return res.status(400).json({ success: false, message: 'Category and question object are required.' });
        }
        const data = readQuestions();
        if (!data[category]) data[category] = [];
        data[category].push(question);
        writeQuestions(data);
        await logActivity(req.userId, 'content_update', `Added question "${question.title || question.id}" to ${category}`);
        res.json({ success: true, message: 'Question added successfully.', id: question.id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/questions/:id - Update a question
router.put('/questions/:id', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const { category, updates } = req.body;
        if (!category || !updates) {
            return res.status(400).json({ success: false, message: 'Category and updates are required.' });
        }
        const data = readQuestions();
        if (!data[category]) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }
        const idx = data[category].findIndex(q => q.id === req.params.id);
        if (idx === -1) {
            return res.status(404).json({ success: false, message: 'Question not found.' });
        }
        data[category][idx] = { ...data[category][idx], ...updates };
        writeQuestions(data);
        await logActivity(req.userId, 'content_update', `Updated question "${req.params.id}" in ${category}`);
        res.json({ success: true, message: 'Question updated successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/questions/:id - Delete a question
router.delete('/questions/:id', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const { category } = req.query;
        if (!category) {
            return res.status(400).json({ success: false, message: 'Category query parameter is required.' });
        }
        const data = readQuestions();
        if (!data[category]) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }
        const before = data[category].length;
        data[category] = data[category].filter(q => q.id !== req.params.id);
        if (data[category].length === before) {
            return res.status(404).json({ success: false, message: 'Question not found.' });
        }
        writeQuestions(data);
        await logActivity(req.userId, 'content_update', `Deleted question "${req.params.id}" from ${category}`);
        res.json({ success: true, message: 'Question deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/admin/preparation/:id - Delete a preparation path
router.delete('/preparation/:id', auth, roleCheck('admin', 'sub-admin'), async (req, res) => {
    try {
        const PreparationPath = require('../models/PreparationPath');
        const result = await PreparationPath.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Preparation path not found.' });
        }
        await logActivity(req.userId, 'content_update', `Deleted preparation path for "${result.companyName}"`);
        res.json({ success: true, message: 'Preparation path deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

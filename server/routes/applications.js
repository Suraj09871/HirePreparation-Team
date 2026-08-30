const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const Job = require('../models/Job');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth, roleCheck } = require('../middleware/auth');
const {
    calculateSkillMatch,
    calculateExperienceScore,
    calculateResumeCompleteness,
    calculateHiringProbability,
    getRecommendationLabel,
    getWarningColor
} = require('../utils/matchingAlgorithm');
const { logActivity } = require('../utils/logger');

// POST /api/applications - Apply for job (triggers skill matching)
router.post('/', auth, roleCheck('student'), [
    body('jobId').notEmpty().withMessage('Job ID is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const { jobId } = req.body;
        const existing = await Application.findOne({ studentId: req.userId, jobId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Already applied for this job.' });
        }
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found.' });
        }
        const profile = await StudentProfile.findOne({ userId: req.userId });
        if (!profile) {
            return res.status(400).json({ success: false, message: 'Complete your profile first.' });
        }
        const skillResult = calculateSkillMatch(profile.skills, job.requiredSkills);
        const experienceScore = calculateExperienceScore(profile.experience, job.experienceRequired);
        const resumeCompleteness = calculateResumeCompleteness(profile);
        const hiringProbability = calculateHiringProbability(skillResult.matchPercentage, experienceScore, resumeCompleteness);

        const application = new Application({
            studentId: req.userId, jobId,
            skillMatch: skillResult.matchPercentage, hiringProbability,
            matchedSkills: skillResult.matchedSkills, missingSkills: skillResult.missingSkills
        });
        await application.save();
        await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

        await logActivity(req.userId, 'apply', `Applied for ${job.title} at ${job.companyName}`);

        res.status(201).json({
            success: true, message: 'Application submitted!',
            application: {
                ...application.toObject(),
                recommendation: getRecommendationLabel(hiringProbability),
                warningColor: getWarningColor(hiringProbability)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/applications/preview/:jobId
router.get('/preview/:jobId', auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
        const profile = await StudentProfile.findOne({ userId: req.userId });
        if (!profile) return res.status(400).json({ success: false, message: 'Complete your profile first.' });

        const skillResult = calculateSkillMatch(profile.skills, job.requiredSkills);
        const experienceScore = calculateExperienceScore(profile.experience, job.experienceRequired);
        const resumeCompleteness = calculateResumeCompleteness(profile);
        const hiringProbability = calculateHiringProbability(skillResult.matchPercentage, experienceScore, resumeCompleteness);

        res.json({
            success: true,
            preview: {
                jobTitle: job.title, companyName: job.companyName,
                skillMatch: skillResult.matchPercentage, hiringProbability,
                matchedSkills: skillResult.matchedSkills, missingSkills: skillResult.missingSkills,
                recommendation: getRecommendationLabel(hiringProbability),
                warningColor: getWarningColor(hiringProbability)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/applications/my
router.get('/my', auth, async (req, res) => {
    try {
        const applications = await Application.find({ studentId: req.userId })
            .populate('jobId').sort({ appliedAt: -1 });
        res.json({ success: true, applications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/applications/detail/:id - Get single application detail (recruiter/admin)
router.get('/detail/:id', auth, roleCheck('recruiter', 'admin'), async (req, res) => {
    try {
        const app = await Application.findById(req.params.id)
            .populate('studentId', 'name email avatar')
            .populate('jobId', 'title companyName requiredSkills');
        if (!app) {
            return res.status(404).json({ success: false, message: 'Application not found.' });
        }
        // Verify recruiter owns this job (unless admin)
        if (req.user.role === 'recruiter') {
            const job = await Job.findById(app.jobId?._id || app.jobId);
            if (!job || job.recruiterId.toString() !== req.userId.toString()) {
                return res.status(403).json({ success: false, message: 'Not authorized.' });
            }
        }
        let profileData = null;
        if (app.studentId?._id) {
            const profile = await StudentProfile.findOne({ userId: app.studentId._id });
            if (profile) {
                profileData = {
                    experience: profile.experience,
                    skills: profile.skills,
                    education: profile.education,
                    resumeScore: profile.resumeScore || 0,
                    location: profile.location,
                    projects: profile.projects,
                    phone: profile.phone
                };
            }
        }
        res.json({
            success: true,
            application: {
                ...app.toObject(),
                studentProfile: profileData,
                recommendation: getRecommendationLabel(app.hiringProbability)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/applications/:id - Withdraw application (student)
router.delete('/:id', auth, roleCheck('student'), async (req, res) => {
    try {
        const application = await Application.findOne({ _id: req.params.id, studentId: req.userId });
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found.' });
        }
        await Application.findByIdAndDelete(req.params.id);
        if (application.jobId) {
            await Job.findByIdAndUpdate(application.jobId, { $inc: { applicantCount: -1 } });
        }
        res.json({ success: true, message: 'Application withdrawn successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/applications/job/:jobId - Withdraw application by jobId (student)
router.delete('/job/:jobId', auth, roleCheck('student'), async (req, res) => {
    try {
        const application = await Application.findOne({ jobId: req.params.jobId, studentId: req.userId });
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found.' });
        }
        await Application.findByIdAndDelete(application._id);
        await Job.findByIdAndUpdate(req.params.jobId, { $inc: { applicantCount: -1 } });
        res.json({ success: true, message: 'Application withdrawn successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/applications/job/:jobId - Get all applicants for a job (recruiter)
router.get('/job/:jobId', auth, roleCheck('recruiter', 'admin'), async (req, res) => {
    try {
        const { sort = 'hiringProbability', minMatch, maxMatch, skills, experience, education } = req.query;

        let sortObj = {};
        if (sort === 'hiringProbability') sortObj = { hiringProbability: -1 };
        else if (sort === 'skillMatch') sortObj = { skillMatch: -1 };
        else if (sort === 'appliedAt') sortObj = { appliedAt: -1 };
        else sortObj = { hiringProbability: -1 };

        const filter = { jobId: req.params.jobId };
        if (minMatch) filter.skillMatch = { ...filter.skillMatch, $gte: parseInt(minMatch) };
        if (maxMatch) filter.skillMatch = { ...filter.skillMatch, $lte: parseInt(maxMatch) };

        // Verify recruiter owns this job (unless admin)
        if (req.user.role === 'recruiter') {
            const job = await Job.findById(req.params.jobId);
            if (!job || job.recruiterId.toString() !== req.userId.toString()) {
                return res.status(403).json({ success: false, message: 'Not authorized to view these applicants.' });
            }
        }

        const applications = await Application.find(filter)
            .populate('studentId', 'name email')
            .sort(sortObj);

        // Filter out applications where student was deleted (null studentId)
        const validApplications = applications.filter(app => app.studentId && app.studentId._id);

        // Enrich with profile data and ranking breakdown
        let enriched = await Promise.all(validApplications.map(async (app) => {
            const profile = await StudentProfile.findOne({ userId: app.studentId._id });
            const experienceScore = profile ? calculateExperienceScore(profile.experience, '') : 0;
            const resumeCompleteness = profile ? calculateResumeCompleteness(profile) : 0;

            return {
                ...app.toObject(),
                studentProfile: profile ? {
                    experience: profile.experience,
                    skills: profile.skills,
                    education: profile.education,
                    resumeScore: profile.resumeScore || 0,
                    location: profile.location,
                    projects: profile.projects
                } : null,
                recommendation: getRecommendationLabel(app.hiringProbability),
                rankingBreakdown: {
                    skillMatchWeight: '60%',
                    experienceWeight: '20%',
                    resumeWeight: '20%',
                    skillMatchValue: app.skillMatch,
                    experienceScoreValue: experienceScore,
                    resumeCompletenessValue: resumeCompleteness,
                    matchedSkills: app.matchedSkills,
                    missingSkills: app.missingSkills,
                    rankReason: app.hiringProbability >= 85
                        ? `Strong overall match (${app.skillMatch}% skill match, ${app.matchedSkills.length} skills matched)`
                        : app.hiringProbability >= 60
                        ? `Moderate match (${app.skillMatch}% skill match, missing: ${app.missingSkills.join(', ') || 'none'})`
                        : `Low match — missing key skills: ${app.missingSkills.join(', ') || 'N/A'}`
                }
            };
        }));

        // Post-filter by profile fields
        if (skills) {
            const filterSkills = skills.split(',').map(s => s.trim().toLowerCase());
            enriched = enriched.filter(e => {
                if (!e.studentProfile) return false;
                const studentSkills = e.studentProfile.skills.map(s => (s.name || s).toLowerCase());
                return filterSkills.some(fs => studentSkills.some(ss => ss.includes(fs)));
            });
        }
        if (experience) {
            enriched = enriched.filter(e => e.studentProfile?.experience?.toLowerCase().includes(experience.toLowerCase()));
        }
        if (education) {
            enriched = enriched.filter(e => e.studentProfile?.education?.toLowerCase().includes(education.toLowerCase()));
        }

        res.json({ success: true, applications: enriched });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/applications/job/:jobId/recommended - Auto-recommended top candidates
router.get('/job/:jobId/recommended', auth, roleCheck('recruiter', 'admin'), async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

        // Find all student profiles and score them against this job
        const profiles = await StudentProfile.find().populate('userId', 'name email');
        const candidates = profiles.filter(p => p.userId).map(profile => {
            const skillResult = calculateSkillMatch(profile.skills, job.requiredSkills);
            const experienceScore = calculateExperienceScore(profile.experience, job.experienceRequired);
            const resumeCompleteness = calculateResumeCompleteness(profile);
            const hiringProbability = calculateHiringProbability(skillResult.matchPercentage, experienceScore, resumeCompleteness);

            return {
                studentId: profile.userId._id,
                name: profile.userId.name,
                email: profile.userId.email,
                skillMatch: skillResult.matchPercentage,
                hiringProbability,
                matchedSkills: skillResult.matchedSkills,
                missingSkills: skillResult.missingSkills,
                recommendation: getRecommendationLabel(hiringProbability),
                experience: profile.experience,
                education: profile.education,
                resumeScore: profile.resumeScore || 0,
                skills: profile.skills.map(s => s.name),
                location: profile.location,
                alreadyApplied: false
            };
        }).sort((a, b) => b.hiringProbability - a.hiringProbability).slice(0, 10);

        // Mark already-applied candidates
        const existingApps = await Application.find({ jobId: req.params.jobId }).select('studentId');
        const appliedIds = new Set(existingApps.map(a => a.studentId.toString()));
        candidates.forEach(c => { c.alreadyApplied = appliedIds.has(c.studentId.toString()); });

        res.json({ success: true, recommended: candidates, jobTitle: job.title });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/applications/compare - Compare 2-3 candidates
router.post('/compare', auth, roleCheck('recruiter', 'admin'), async (req, res) => {
    try {
        const { applicationIds } = req.body;
        if (!applicationIds || applicationIds.length < 2 || applicationIds.length > 3) {
            return res.status(400).json({ success: false, message: 'Provide 2-3 application IDs.' });
        }

        const apps = await Application.find({ _id: { $in: applicationIds } })
            .populate('studentId', 'name email')
            .populate('jobId', 'title requiredSkills');

        const compared = await Promise.all(apps.map(async (app) => {
            const profile = await StudentProfile.findOne({ userId: app.studentId._id });
            return {
                applicationId: app._id,
                name: app.studentId.name,
                email: app.studentId.email,
                jobTitle: app.jobId?.title,
                skillMatch: app.skillMatch,
                hiringProbability: app.hiringProbability,
                matchedSkills: app.matchedSkills,
                missingSkills: app.missingSkills,
                status: app.status,
                recommendation: getRecommendationLabel(app.hiringProbability),
                profile: profile ? {
                    experience: profile.experience,
                    education: profile.education,
                    resumeScore: profile.resumeScore || 0,
                    skills: profile.skills.map(s => ({ name: s.name, level: s.level })),
                    projects: profile.projects,
                    location: profile.location
                } : null
            };
        }));

        res.json({ success: true, candidates: compared });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/applications/:id/status - Update application status (pipeline)
router.put('/:id/status', auth, roleCheck('recruiter', 'admin'), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['new', 'in-review', 'shortlisted', 'interview', 'selected', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status.' });
        }
        const application = await Application.findByIdAndUpdate(
            req.params.id, { status, statusUpdatedAt: new Date() }, { new: true }
        );
        if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });
        res.json({ success: true, message: 'Status updated!', application });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/applications/:id/interview - Schedule interview
router.put('/:id/interview', auth, roleCheck('recruiter', 'admin'), [
    body('interviewDate').optional().isISO8601().withMessage('Invalid date format'),
    body('interviewType').optional().isIn(['phone', 'video', 'onsite', '']).withMessage('Invalid interview type')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        const { interviewDate, interviewNotes, interviewType } = req.body;
        const application = await Application.findByIdAndUpdate(
            req.params.id,
            { interviewDate, interviewNotes, interviewType, status: 'interview', statusUpdatedAt: new Date() },
            { new: true }
        ).populate('studentId', 'name email');
        if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });
        res.json({ success: true, message: 'Interview scheduled!', application });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/applications/job/:jobId/analytics - Job performance analytics
router.get('/job/:jobId/analytics', auth, roleCheck('recruiter', 'admin'), async (req, res) => {
    try {
        const apps = await Application.find({ jobId: req.params.jobId });
        const total = apps.length;
        const avgMatch = total > 0 ? Math.round(apps.reduce((s, a) => s + a.skillMatch, 0) / total) : 0;
        const avgProbability = total > 0 ? Math.round(apps.reduce((s, a) => s + a.hiringProbability, 0) / total) : 0;

        const statusCounts = {};
        apps.forEach(a => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1; });

        const selected = statusCounts['selected'] || 0;
        const conversionRate = total > 0 ? Math.round((selected / total) * 100) : 0;

        // Match distribution
        const matchBuckets = { high: 0, medium: 0, low: 0 };
        apps.forEach(a => {
            if (a.hiringProbability >= 85) matchBuckets.high++;
            else if (a.hiringProbability >= 60) matchBuckets.medium++;
            else matchBuckets.low++;
        });

        res.json({
            success: true,
            analytics: { totalApplicants: total, avgMatch, avgProbability, conversionRate, statusCounts, matchBuckets }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/applications/recruiter/all - Get all candidates across all recruiter's jobs with top-performer rankings
router.get('/recruiter/all', auth, roleCheck('recruiter', 'admin'), async (req, res) => {
    try {
        let jobQuery = {};
        if (req.user.role === 'recruiter') {
            jobQuery = { recruiterId: req.userId };
        }

        const myJobs = await Job.find(jobQuery).select('_id title department location type companyName');
        const jobIds = myJobs.map(j => j._id);

        const { jobId, status, search, minMatch, sort = 'rank' } = req.query;

        let appFilter = { jobId: { $in: jobIds } };
        if (jobId && jobId !== 'all') {
            appFilter.jobId = jobId;
        }
        if (status && status !== 'all') {
            appFilter.status = status;
        }
        if (minMatch) {
            appFilter.skillMatch = { ...appFilter.skillMatch, $gte: parseInt(minMatch) };
        }

        const applications = await Application.find(appFilter)
            .populate('studentId', 'name email phone avatar')
            .populate('jobId', 'title department location type companyName')
            .sort({ appliedAt: -1 });

        // Enrich each application with candidate profile & top performer evaluation
        let enriched = await Promise.all(applications.map(async (app) => {
            if (!app.studentId) return null;

            const profile = await StudentProfile.findOne({ userId: app.studentId._id });
            const isTopPerformer = (app.hiringProbability >= 80) || (app.skillMatch >= 80) || (profile?.resumeScore >= 85);
            
            let badges = [];
            if (app.skillMatch >= 85) badges.push('🎯 High Skill Match');
            if (app.hiringProbability >= 85) badges.push('⭐ Strong Hire');
            if (profile?.resumeScore >= 85) badges.push('📄 ATS Optimized');
            if (isTopPerformer && badges.length === 0) badges.push('🏆 Top Performer');

            return {
                _id: app._id,
                studentId: app.studentId,
                jobId: app.jobId,
                skillMatch: app.skillMatch || 0,
                hiringProbability: app.hiringProbability || 0,
                matchedSkills: app.matchedSkills || [],
                missingSkills: app.missingSkills || [],
                status: app.status || 'applied',
                interviewDate: app.interviewDate,
                interviewType: app.interviewType,
                meetingLink: app.meetingLink,
                roundName: app.roundName,
                interviewNotes: app.interviewNotes,
                appliedAt: app.appliedAt,
                isTopPerformer,
                badges,
                recommendation: getRecommendationLabel(app.hiringProbability),
                profile: profile ? {
                    education: profile.education || '',
                    experience: profile.experience || '',
                    skills: profile.skills || [],
                    resumeScore: profile.resumeScore || 0,
                    location: profile.location || '',
                    projects: profile.projects || [],
                    certifications: profile.certifications || []
                } : null
            };
        }));

        enriched = enriched.filter(Boolean);

        // Client search filter (by candidate name, email, skills, college)
        if (search) {
            const s = search.toLowerCase();
            enriched = enriched.filter(a => 
                (a.studentId?.name || '').toLowerCase().includes(s) ||
                (a.studentId?.email || '').toLowerCase().includes(s) ||
                (a.jobId?.title || '').toLowerCase().includes(s) ||
                (a.profile?.education || '').toLowerCase().includes(s) ||
                (a.matchedSkills || []).some(sk => sk.toLowerCase().includes(s))
            );
        }

        // Sorting
        if (sort === 'rank') {
            enriched.sort((a, b) => (b.hiringProbability + b.skillMatch) - (a.hiringProbability + a.skillMatch));
        } else if (sort === 'match') {
            enriched.sort((a, b) => b.skillMatch - a.skillMatch);
        } else if (sort === 'date') {
            enriched.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        }

        const totalApplicants = enriched.length;
        const topPerformers = enriched.filter(a => a.isTopPerformer);
        const shortlistedCount = enriched.filter(a => ['shortlisted', 'interview', 'selected'].includes(a.status)).length;
        const interviewCount = enriched.filter(a => a.status === 'interview').length;
        const selectedCount = enriched.filter(a => a.status === 'selected').length;

        res.json({
            success: true,
            totalApplicants,
            topPerformersCount: topPerformers.length,
            stats: {
                totalApplicants,
                topPerformersCount: topPerformers.length,
                shortlistedCount,
                interviewCount,
                selectedCount
            },
            jobs: myJobs,
            applications: enriched
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/applications/recruiter/interviews - Get all scheduled interviews
router.get('/recruiter/interviews', auth, roleCheck('recruiter', 'admin'), async (req, res) => {
    try {
        let jobQuery = {};
        if (req.user.role === 'recruiter') jobQuery = { recruiterId: req.userId };
        const myJobs = await Job.find(jobQuery).select('_id');
        const jobIds = myJobs.map(j => j._id);

        const interviews = await Application.find({
            jobId: { $in: jobIds },
            $or: [{ status: 'interview' }, { interviewDate: { $ne: null } }]
        })
        .populate('studentId', 'name email phone avatar')
        .populate('jobId', 'title companyName location')
        .sort({ interviewDate: 1 });

        res.json({ success: true, count: interviews.length, interviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/applications/:id/schedule-interview - Schedule interview & notify student
router.post('/:id/schedule-interview', auth, roleCheck('recruiter', 'admin'), async (req, res) => {
    try {
        const { interviewDate, interviewType, meetingLink, roundName, interviewNotes } = req.body;

        const application = await Application.findById(req.params.id)
            .populate('studentId', 'name email')
            .populate('jobId', 'title companyName');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found.' });
        }

        application.interviewDate = interviewDate ? new Date(interviewDate) : new Date();
        application.interviewType = interviewType || 'video';
        application.meetingLink = meetingLink || '';
        application.roundName = roundName || 'Technical Interview Round';
        application.interviewNotes = interviewNotes || '';
        application.status = 'interview';
        application.statusUpdatedAt = new Date();
        await application.save();

        // Create student notification
        if (application.studentId) {
            const formattedDate = new Date(application.interviewDate).toLocaleString();
            await Notification.create({
                type: 'alert',
                title: `📅 Interview Scheduled: ${application.jobId?.title || 'Job Application'}`,
                message: `Congratulations ${application.studentId.name}! You have been invited to ${application.roundName} on ${formattedDate}.${meetingLink ? ' Meeting link: ' + meetingLink : ''}`,
                targetRole: 'student',
                targetUserId: application.studentId._id,
                createdBy: req.userId
            });
        }

        await logActivity(req.userId, 'interview_scheduled', `Scheduled interview with candidate ${application.studentId?.name || ''} for ${application.jobId?.title || ''}`);

        res.json({ success: true, message: 'Interview scheduled and candidate notified successfully!', application });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/applications/export/recruiter - Export recruiter applicants to CSV
router.get('/export/recruiter', auth, roleCheck('recruiter', 'admin'), async (req, res) => {
    try {
        let jobQuery = {};
        if (req.user.role === 'recruiter') jobQuery = { recruiterId: req.userId };
        const myJobs = await Job.find(jobQuery).select('_id');
        const jobIds = myJobs.map(j => j._id);

        const apps = await Application.find({ jobId: { $in: jobIds } })
            .populate('studentId', 'name email phone')
            .populate('jobId', 'title companyName')
            .sort({ appliedAt: -1 });

        const rows = [
            ['Candidate Name', 'Email', 'Job Title', 'Company', 'Skill Match %', 'Hiring Probability %', 'Status', 'Applied Date', 'Interview Date', 'Meeting Link']
        ];

        apps.forEach(a => {
            rows.push([
                `"${(a.studentId?.name || '').replace(/"/g, '""')}"`,
                `"${(a.studentId?.email || '').replace(/"/g, '""')}"`,
                `"${(a.jobId?.title || '').replace(/"/g, '""')}"`,
                `"${(a.jobId?.companyName || '').replace(/"/g, '""')}"`,
                a.skillMatch || 0,
                a.hiringProbability || 0,
                `"${a.status || 'applied'}"`,
                `"${new Date(a.appliedAt).toISOString()}"`,
                `"${a.interviewDate ? new Date(a.interviewDate).toISOString() : ''}"`,
                `"${(a.meetingLink || '').replace(/"/g, '""')}"`
            ]);
        });

        const csvContent = rows.map(r => r.join(',')).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=recruiter-applicants-${Date.now()}.csv`);
        res.status(200).send(csvContent);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

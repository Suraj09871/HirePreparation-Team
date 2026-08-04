const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const { auth, roleCheck } = require('../middleware/auth');
const {
    calculateSkillMatch,
    calculateExperienceScore,
    calculateResumeCompleteness,
    calculateHiringProbability,
    getRecommendationLabel,
    getWarningColor
} = require('../utils/matchingAlgorithm');

// POST /api/applications - Apply for job (triggers skill matching)
router.post('/', auth, async (req, res) => {
    try {
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

        const applications = await Application.find(filter)
            .populate('studentId', 'name email')
            .sort(sortObj);

        // Enrich with profile data and ranking breakdown
        let enriched = await Promise.all(applications.map(async (app) => {
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
router.put('/:id/interview', auth, roleCheck('recruiter', 'admin'), async (req, res) => {
    try {
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

module.exports = router;

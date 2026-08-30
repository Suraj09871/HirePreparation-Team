const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const User = require('../models/User');
const Company = require('../models/Company');
const { auth, roleCheck } = require('../middleware/auth');
const { logActivity } = require('../utils/logger');

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/jobs - List all active jobs
router.get('/', async (req, res) => {
    try {
        // Public preview mode for landing page
        if (req.query.preview === 'true') {
            const jobs = await Job.find({ status: 'active' })
                .select('title companyName location experienceRequired requiredSkills status description createdAt')
                .sort({ createdAt: -1 })
                .limit(6)
                .lean();
            // Truncate descriptions for preview
            const previewJobs = jobs.map(j => ({
                ...j,
                description: j.description ? j.description.substring(0, 150) + (j.description.length > 150 ? '...' : '') : '',
                requiredSkills: (j.requiredSkills || []).slice(0, 5)
            }));
            return res.json({ success: true, jobs: previewJobs, total: previewJobs.length });
        }

        const { search, location, experience, page = 1, limit = 20 } = req.query;

        const filter = { status: 'active' };

        if (search) {
            const safeSearch = escapeRegex(search);
            filter.$or = [
                { title: { $regex: safeSearch, $options: 'i' } },
                { companyName: { $regex: safeSearch, $options: 'i' } },
                { requiredSkills: { $in: [new RegExp(safeSearch, 'i')] } }
            ];
        }
        if (location) {
            filter.location = { $regex: escapeRegex(location), $options: 'i' };
        }
        if (experience) {
            filter.experienceRequired = experience;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const jobs = await Job.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('recruiterId', 'name email');

        const total = await Job.countDocuments(filter);

        res.json({
            success: true,
            jobs,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/jobs/recruiter/my - Get recruiter's own jobs
router.get('/recruiter/my', auth, roleCheck('recruiter', 'admin'), async (req, res) => {
    try {
        const jobs = await Job.find({ recruiterId: req.userId }).sort({ createdAt: -1 });
        res.json({ success: true, jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/jobs/:id - Get single job
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('recruiterId', 'name email');

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found.' });
        }

        res.json({ success: true, job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/jobs - Create job (recruiter only, company must be verified)
router.post('/', auth, roleCheck('recruiter', 'admin'), [
    body('title').trim().notEmpty().withMessage('Job title is required').isLength({ max: 200 }),
    body('companyName').trim().notEmpty().withMessage('Company name is required').isLength({ max: 200 }),
    body('description').optional().isLength({ max: 5000 }).withMessage('Description too long'),
    body('location').optional().isLength({ max: 200 }),
    body('salary').optional().isLength({ max: 100 }),
    body('status').optional().isIn(['active', 'closed', 'draft']).withMessage('Invalid status')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        // Company verification gate — recruiters must have a verified company
        const recruiterUser = await User.findById(req.userId);
        if (recruiterUser.role === 'recruiter') {
            if (!recruiterUser.companyId) {
                return res.status(403).json({
                    success: false,
                    message: 'You must register a company before posting jobs. Please complete your company registration.'
                });
            }
            const company = await Company.findById(recruiterUser.companyId);
            if (!company || company.verificationStatus !== 'approved') {
                const statusMsg = company?.verificationStatus === 'rejected'
                    ? 'Your company registration was rejected. Reason: ' + (company.rejectionReason || 'Not specified') + '. Please contact admin.'
                    : 'Your company is pending admin verification. You will be able to post jobs once your company is approved.';
                return res.status(403).json({ success: false, message: statusMsg });
            }
        }

        const { title, description, companyName, requiredSkills, experienceRequired, location, salary, status } = req.body;

        // Parse skills from comma-separated string if needed
        let skills = requiredSkills;
        if (typeof requiredSkills === 'string') {
            skills = requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
        }

        const job = new Job({
            recruiterId: req.userId,
            title,
            description,
            companyName,
            requiredSkills: skills,
            experienceRequired,
            location,
            salary,
            status: status || 'active'
        });

        await job.save();

        await logActivity(req.userId, 'job_create', `Created job posting: ${job.title} at ${job.companyName}`);

        res.status(201).json({ success: true, message: 'Job posted successfully!', job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/jobs/:id - Update job
router.put('/:id', auth, roleCheck('recruiter', 'admin'), async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found.' });
        }

        // Only owner or admin can update
        if (job.recruiterId.toString() !== req.userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized.' });
        }

        const updates = req.body;
        if (typeof updates.requiredSkills === 'string') {
            updates.requiredSkills = updates.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
        }

        Object.assign(job, updates);
        await job.save();

        await logActivity(req.userId, 'job_update', `Updated job posting: ${job.title}`);

        res.json({ success: true, message: 'Job updated!', job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/jobs/:id - Delete job
router.delete('/:id', auth, roleCheck('recruiter', 'admin'), async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found.' });
        }

        if (job.recruiterId.toString() !== req.userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized.' });
        }

        await Job.findByIdAndDelete(req.params.id);

        await logActivity(req.userId, 'job_delete', `Deleted job posting: ${job.title}`);

        res.json({ success: true, message: 'Job deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

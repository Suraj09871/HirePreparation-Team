const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { auth, roleCheck } = require('../middleware/auth');

// GET /api/jobs - List all active jobs
router.get('/', async (req, res) => {
    try {
        const { search, location, experience, page = 1, limit = 20 } = req.query;

        const filter = { status: 'active' };

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } },
                { requiredSkills: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        if (location) {
            filter.location = { $regex: location, $options: 'i' };
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

// POST /api/jobs - Create job (recruiter only)
router.post('/', auth, roleCheck('recruiter', 'admin'), async (req, res) => {
    try {
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
        res.json({ success: true, message: 'Job deleted!' });
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

module.exports = router;

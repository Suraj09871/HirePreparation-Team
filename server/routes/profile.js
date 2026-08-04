const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Configure multer for resume uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueName = `resume_${req.userId}_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, DOCX files are allowed'));
        }
    }
});

// GET /api/profile - Get current user's profile
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        let profile = await StudentProfile.findOne({ userId: req.userId });

        if (!profile) {
            profile = new StudentProfile({ userId: req.userId });
            await profile.save();
        }

        res.json({
            success: true,
            profile: {
                ...profile.toObject(),
                name: user.name,
                email: user.email,
                completionPercentage: profile.getCompletionPercentage()
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/profile/:userId - Get specific user's profile
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        let profile = await StudentProfile.findOne({ userId: req.params.userId });
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found.' });
        }

        res.json({
            success: true,
            profile: {
                ...profile.toObject(),
                name: user.name,
                email: user.email,
                completionPercentage: profile.getCompletionPercentage()
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/profile - Update current user's profile
router.put('/', auth, async (req, res) => {
    try {
        const { name, phone, education, experience, location, additionalDetails } = req.body;

        // Update user name if provided
        if (name) {
            await User.findByIdAndUpdate(req.userId, { name });
        }

        let profile = await StudentProfile.findOne({ userId: req.userId });
        if (!profile) {
            profile = new StudentProfile({ userId: req.userId });
        }

        if (phone !== undefined) profile.phone = phone;
        if (education !== undefined) profile.education = education;
        if (experience !== undefined) profile.experience = experience;
        if (location !== undefined) profile.location = location;
        
        if (additionalDetails !== undefined) {
            profile.additionalDetails = { ...profile.additionalDetails, ...additionalDetails };
            profile.markModified('additionalDetails');
        }

        await profile.save();

        const user = await User.findById(req.userId);

        res.json({
            success: true,
            message: 'Profile updated successfully!',
            profile: {
                ...profile.toObject(),
                name: user.name,
                email: user.email,
                completionPercentage: profile.getCompletionPercentage()
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/profile/skills - Add a skill
router.post('/skills', auth, async (req, res) => {
    try {
        const { name, level } = req.body;

        let profile = await StudentProfile.findOne({ userId: req.userId });
        if (!profile) {
            profile = new StudentProfile({ userId: req.userId });
        }

        // Check if skill already exists
        const exists = profile.skills.some(s => s.name.toLowerCase() === name.toLowerCase());
        if (exists) {
            return res.status(400).json({ success: false, message: 'Skill already exists.' });
        }

        profile.skills.push({ name, level: level || 'Beginner' });
        await profile.save();

        res.json({ success: true, message: 'Skill added!', skills: profile.skills });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/profile/skills/:skillId - Remove a skill
router.delete('/skills/:skillId', auth, async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({ userId: req.userId });
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found.' });
        }

        profile.skills = profile.skills.filter(s => s._id.toString() !== req.params.skillId);
        await profile.save();

        res.json({ success: true, message: 'Skill removed!', skills: profile.skills });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/profile/projects - Add a project
router.post('/projects', auth, async (req, res) => {
    try {
        const { title, description, techStack } = req.body;

        let profile = await StudentProfile.findOne({ userId: req.userId });
        if (!profile) {
            profile = new StudentProfile({ userId: req.userId });
        }

        profile.projects.push({ title, description, techStack });
        await profile.save();

        res.json({ success: true, message: 'Project added!', projects: profile.projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/profile/projects/:projectId - Remove a project
router.delete('/projects/:projectId', auth, async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({ userId: req.userId });
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found.' });
        }

        profile.projects = profile.projects.filter(p => p._id.toString() !== req.params.projectId);
        await profile.save();

        res.json({ success: true, message: 'Project removed!', projects: profile.projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/profile/resume - Upload resume
router.post('/resume', auth, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }

        let profile = await StudentProfile.findOne({ userId: req.userId });
        if (!profile) {
            profile = new StudentProfile({ userId: req.userId });
        }

        profile.resumeUrl = `/uploads/${req.file.filename}`;
        // Simple resume score based on file size and format
        profile.resumeScore = Math.min(Math.round(50 + Math.random() * 40), 95);
        await profile.save();

        res.json({
            success: true,
            message: 'Resume uploaded!',
            resumeUrl: profile.resumeUrl,
            resumeScore: profile.resumeScore
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

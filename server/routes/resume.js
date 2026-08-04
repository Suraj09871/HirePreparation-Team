const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const { auth } = require('../middleware/auth');

// GET /api/resume - Get user's resume
router.get('/', auth, async (req, res) => {
    try {
        const resume = await Resume.findOne({ userId: req.userId });
        if (!resume) {
            return res.status(404).json({ success: false, message: 'Resume not found' });
        }
        res.json({ success: true, resume });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/resume - Create new resume
router.post('/', auth, async (req, res) => {
    try {
        const existing = await Resume.findOne({ userId: req.userId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Resume already exists. Use PUT to update.' });
        }
        
        const resume = new Resume({
            userId: req.userId,
            ...req.body
        });
        await resume.save();
        
        res.status(201).json({ success: true, resume });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/resume - Update user's resume
router.put('/', auth, async (req, res) => {
    try {
        const resume = await Resume.findOneAndUpdate(
            { userId: req.userId },
            { ...req.body },
            { new: true, runValidators: true }
        );
        
        if (!resume) {
            return res.status(404).json({ success: false, message: 'Resume not found' });
        }
        
        res.json({ success: true, resume });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

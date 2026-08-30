const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

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
router.post('/', auth, [
    body('template').optional().isIn(['modern', 'classic', 'minimal', 'creative']).withMessage('Invalid template'),
    body('data').optional().isObject().withMessage('Data must be an object')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const existing = await Resume.findOne({ userId: req.userId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Resume already exists. Use PUT to update.' });
        }
        
        const { template, data } = req.body;
        const resume = new Resume({ userId: req.userId, template, data });
        await resume.save();
        
        res.status(201).json({ success: true, resume });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/resume - Update user's resume
router.put('/', auth, [
    body('template').optional().isIn(['modern', 'classic', 'minimal', 'creative']).withMessage('Invalid template'),
    body('data').optional().isObject().withMessage('Data must be an object')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const update = {};
        if (req.body.template) update.template = req.body.template;
        if (req.body.data) update.data = req.body.data;
        const resume = await Resume.findOneAndUpdate(
            { userId: req.userId },
            update,
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

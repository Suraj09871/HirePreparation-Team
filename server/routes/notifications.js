const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth, roleCheck } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// GET /api/notifications/my - Get notifications for current user
router.get('/my', auth, async (req, res) => {
    try {
        const user = req.user;
        const filter = {
            $or: [
                { targetUserId: user._id },
                { targetRole: user.role, targetUserId: null },
                { targetRole: user.role, targetUserId: { $exists: false } },
                { targetRole: 'all', targetUserId: null },
                { targetRole: 'all', targetUserId: { $exists: false } }
            ]
        };
        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('createdBy', 'name');
        
        const enriched = notifications.map(n => ({
            ...n.toObject(),
            isRead: (n.readBy || []).some(id => id.toString() === user._id.toString())
        }));

        res.json({ success: true, notifications: enriched });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/notifications/unread-count
router.get('/unread-count', auth, async (req, res) => {
    try {
        const user = req.user;
        const filter = {
            $or: [
                { targetUserId: user._id },
                { targetRole: user.role, targetUserId: null },
                { targetRole: user.role, targetUserId: { $exists: false } },
                { targetRole: 'all', targetUserId: null },
                { targetRole: 'all', targetUserId: { $exists: false } }
            ],
            readBy: { $ne: user._id }
        };
        const count = await Notification.countDocuments(filter);
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', auth, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, {
            $addToSet: { readBy: req.user._id }
        });
        res.json({ success: true, message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/notifications/:id - Get single notification details
router.get('/:id', auth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id).populate('createdBy', 'name email role');
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        res.json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/notifications - Create notification (admin / sub-admin)
router.post('/', auth, roleCheck('admin', 'sub-admin'), [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }),
    body('targetRole').optional().isIn(['all', 'student', 'recruiter', 'admin']),
    body('type').optional().isIn(['announcement', 'alert', 'recommendation', 'system', 'reminder', 'achievement'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array(), message: errors.array()[0]?.msg || 'Validation failed' });
        }
        const { title, message, targetRole, type } = req.body;
        const notification = new Notification({
            title, message,
            targetRole: targetRole || 'all',
            type: type || 'announcement',
            createdBy: req.user._id
        });
        await notification.save();
        res.status(201).json({ success: true, message: 'Notification sent successfully!', notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

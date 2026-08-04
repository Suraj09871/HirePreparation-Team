const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth, roleCheck } = require('../middleware/auth');

// GET /api/notifications/my - Get notifications for current user
router.get('/my', auth, async (req, res) => {
    try {
        const user = req.user;
        const filter = {
            $or: [
                { targetRole: 'all' },
                { targetRole: user.role },
                { targetUserId: user._id }
            ]
        };
        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('createdBy', 'name');
        
        const enriched = notifications.map(n => ({
            ...n.toObject(),
            isRead: n.readBy.some(id => id.toString() === user._id.toString())
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
                { targetRole: 'all' },
                { targetRole: user.role },
                { targetUserId: user._id }
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

// POST /api/notifications - Create notification (admin only)
router.post('/', auth, roleCheck('admin'), async (req, res) => {
    try {
        const { title, message, targetRole, type } = req.body;
        const notification = new Notification({
            title, message,
            targetRole: targetRole || 'all',
            type: type || 'announcement',
            createdBy: req.user._id
        });
        await notification.save();
        res.status(201).json({ success: true, message: 'Notification sent!', notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

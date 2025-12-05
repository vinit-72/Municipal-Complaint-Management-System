const express = require('express');
const router = express.Router();

const Notification = require('../models/Notification');
const { authMiddleware } = require('../middleware/auth');

// GET /api/notifications - get user's notifications
router.get('/', authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (err) {
        console.error('[API] /api/notifications GET error:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/notifications/:id/read - mark notification as read
router.put('/:id/read', authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findOne({ 
            _id: req.params.id, 
            userId: req.user.id 
        });
        
        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }

        notification.isRead = true;
        await notification.save();
        res.json(notification);
    } catch (err) {
        console.error('[API] /api/notifications PUT error:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/notifications/read-all - mark all as read
router.put('/read-all/mark', authMiddleware, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, isRead: false },
            { isRead: true }
        );
        res.json({ msg: 'All notifications marked as read' });
    } catch (err) {
        console.error('[API] /api/notifications read-all error:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/notifications/:id - delete notification
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.user.id 
        });
        
        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }

        res.json({ msg: 'Notification deleted' });
    } catch (err) {
        console.error('[API] /api/notifications DELETE error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

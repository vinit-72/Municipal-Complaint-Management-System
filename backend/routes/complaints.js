const express = require('express');
const router = express.Router();

const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// POST /api/complaints - create complaint (auth required)
router.post('/', authMiddleware, async (req, res) => {
    const { title, description, category } = req.body;
    try {
        const newComplaint = new Complaint({
            userId: req.user.id,
            title,
            description,
            category
        });
        await newComplaint.save();

        // Create notification for all admins
        const admins = await User.find({ role: 'admin' });
        const adminNotifications = admins.map(admin => ({
            userId: admin._id,
            message: `New complaint filed: "${title}"`,
            type: 'complaint_filed',
            complaintId: newComplaint._id
        }));
        
        if (adminNotifications.length > 0) {
            await Notification.insertMany(adminNotifications);
        }

        res.status(201).json(newComplaint);
    } catch (err) {
        console.error('[API] /api/complaints POST error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/complaints - list complaints (auth required)
router.get('/', authMiddleware, async (req, res) => {
    try {
        let complaints;
        if (req.user.role === 'admin') {
            complaints = await Complaint.find().populate('userId', 'username email').sort({ createdAt: -1 });
        } else {
            complaints = await Complaint.find({ userId: req.user.id }).sort({ createdAt: -1 });
        }
        res.json(complaints);
    } catch (err) {
        console.error('[API] /api/complaints GET error:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/complaints/:id/resolve - admin only
router.put('/:id/resolve', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id).populate('userId', 'username');
        if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });

        complaint.status = 'Resolved';
        await complaint.save();

        // Create notification for the citizen who filed the complaint
        if (complaint.userId) {
            await Notification.create({
                userId: complaint.userId._id,
                message: `Your complaint "${complaint.title}" has been resolved`,
                type: 'complaint_resolved',
                complaintId: complaint._id
            });
        }

        res.json(complaint);
    } catch (err) {
        console.error('[API] /api/complaints PUT error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

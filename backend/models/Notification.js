const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message:     { type: String, required: true },
    type:        { type: String, enum: ['complaint_filed', 'complaint_resolved', 'info'], default: 'info' },
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
    isRead:      { type: Boolean, default: false },
    createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);

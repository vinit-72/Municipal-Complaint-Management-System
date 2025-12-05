const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title:       { type: String, required: true },
    description: { type: String, required: true },
    category:    { type: String, default: 'General' },
    status:      { type: String, enum: ['Pending', 'Resolved'], default: 'Pending' },
    createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', complaintSchema);

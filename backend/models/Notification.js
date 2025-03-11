const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    taskTitle: { type: String, required: true },
    userEmail: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isRead: { type: Boolean, default: false },
    isAdminNotification: { type: Boolean, default: false }, // New field
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', NotificationSchema);
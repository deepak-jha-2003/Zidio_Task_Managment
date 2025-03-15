const Notification = require('../models/Notification');
const User = require('../models/User');
const Task = require('../models/Task');

exports.createNotification = async (req, res) => {
    const { taskTitle, userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        const notification = new Notification({
            taskTitle,
            userEmail: user.email,
            userId,
        });
        await notification.save();
        res.json(notification);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id, isRead: false });
        res.json(notifications);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ msg: 'Notification not found' });
        notification.isRead = true;
        await notification.save();
        res.json({ msg: 'Notification marked as read' });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.getAdminNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ isRead: false }).populate('userId', 'email');
        res.json(notifications);
    } catch (err) {
        res.status(500).send('Server error');
    }
};
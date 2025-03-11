const Notification = require('../models/Notification');
const User = require('../models/User');
const TaskModel = require('../models/Task');

// Create a notification when a task is created
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

// Get all notifications for a user
exports.getUserNotifications = async (req, res) => {
    try {
        // Fetch only user notifications (not admin notifications)
        const notifications = await Notification.find({ userId: req.user.id, isAdminNotification: { $ne: true } });
        res.json(notifications);
    } catch (err) {
        res.status(500).send('Server error');
    }
};


// Mark a notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ msg: 'Notification not found' });

        // Mark the user's notification as read
        notification.isRead = true;
        await notification.save();

        // Create a new notification for the admin
        const adminNotification = new Notification({
            taskTitle: notification.taskTitle,
            userEmail: notification.userEmail,
            userId: notification.userId,
            isRead: false, // Admin notification is unread initially
            isAdminNotification: true, // Add a flag to distinguish admin notifications
        });

        await adminNotification.save();

        res.json({ msg: 'Notification marked as read and sent to admin' });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// Get all notifications for admin
exports.getAdminNotifications = async (req, res) => {
    try {
        // Fetch only admin notifications
        const notifications = await Notification.find({ isAdminNotification: true }).populate('userId', 'email');
        res.json(notifications);
    } catch (err) {
        res.status(500).send('Server error');
    }
};


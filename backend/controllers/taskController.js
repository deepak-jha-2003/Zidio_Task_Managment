const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.createTask = async (req, res) => {
    const { title, description, startTime, endTime, userId, broadcast } = req.body;
    try {
        let task;
        if (broadcast) {
            task = new Task({
                title,
                description,
                startTime,
                endTime,
                broadcast: true,
            });
            const users = await User.find({ role: 'user' });
            for (const user of users) {
                const notification = new Notification({
                    taskTitle: title,
                    userEmail: user.email,
                    userId: user._id,
                });
                await notification.save();
            }
        } else {
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ msg: 'User not found' });
            task = new Task({
                title,
                description,
                startTime,
                endTime,
                user: userId,
                broadcast: false,
            });
            const notification = new Notification({
                taskTitle: title,
                userEmail: user.email,
                userId: user._id,
            });
            await notification.save();
        }
        await task.save();
        res.json(task);
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).send('Server error');
    }
};

exports.getUserTasks = async (req, res) => {
    try {
        const tasks = await Task.find({
            $or: [{ user: req.user.id }, { broadcast: true }],
        });
        res.json(tasks);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate('user', 'name email');
        res.json(tasks);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.updateTask = async (req, res) => {
    const { title, description, startTime, endTime, userId, broadcast } = req.body;
    try {
        let task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        task.title = title;
        task.description = description;
        task.startTime = startTime;
        task.endTime = endTime;
        task.user = userId;
        task.broadcast = broadcast;
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        await task.deleteOne();
        res.json({ msg: 'Task deleted' });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.completeTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        // Check if the user has already completed the task
        if (task.completedBy.includes(req.user.id)) {
            return res.status(400).json({ msg: 'Task already completed by this user' });
        }

        // Add the user's ID to the completedBy array
        task.completedBy.push(req.user.id);
        await task.save();

        // Return the updated task
        res.json(task);
    } catch (err) {
        console.error('Error completing task:', err);
        res.status(500).send('Server error');
    }
};


// Get all tasks with completion status for all users (admin only)
exports.getAllTasksWithCompletionStatus = async (req, res) => {
    try {
        const tasks = await Task.find().populate('user', 'email').populate('completedBy', 'email');
        res.json(tasks);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// Get tasks with completion status for a specific user (admin only)
exports.getUserTasksWithCompletionStatus = async (req, res) => {
    try {
        const tasks = await Task.find({
            $or: [{ user: req.params.userId }, { broadcast: true }],
        }).populate('user', 'email').populate('completedBy', 'email');
        res.json(tasks);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

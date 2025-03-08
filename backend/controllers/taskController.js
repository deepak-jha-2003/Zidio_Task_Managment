const Task = require('../models/Task');
const User = require('../models/User');

// Create a task (admin only)
exports.createTask = async (req, res) => {
    const { title, description, startTime, endTime, userId, broadcast } = req.body;
    try {
        let task;

        if (broadcast) {
            // Broadcast the task to all users
            task = new Task({
                title,
                description,
                startTime,
                endTime,
                broadcast: true,
            });
        } else {
            // Assign the task to a specific user
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
        }

        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// Get all tasks for a user (including broadcasted tasks)
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

// Get all tasks (admin only)
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate('user', 'name email');
        res.json(tasks);
    } catch (err) {
        res.status(500).send('Server error');
    }
};
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.createTask = async (req, res) => {
    const { title, description, startTime, endTime, userIds, broadcast } = req.body;

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
            const users = await User.find({ _id: { $in: userIds } });
            if (!users.length) return res.status(404).json({ msg: 'Users not found' });

            task = new Task({
                title,
                description,
                startTime,
                endTime,
                users: userIds,
                broadcast: false,
            });

            for (const user of users) {
                const notification = new Notification({
                    taskTitle: title,
                    userEmail: user.email,
                    userId: user._id,
                });
                await notification.save();
            }
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
            $or: [
                { users: req.user.id }, // Tasks assigned to the logged-in user
                { broadcast: true },    // Broadcast tasks
            ],
        }).populate('users', 'name email'); // Populate the 'users' field
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching user tasks:', err);
        res.status(500).send('Server error');
    }
};

exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate('users', 'name email');
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
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
        const tasks = await Task.find()
            .populate('users', 'name email') // Populate the 'users' field
            .populate('completedBy', 'name email'); // Populate the 'completedBy' field
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching performance data:', err);
        res.status(500).send('Server error');
    }
};

// Get tasks with completion status for a specific user (admin only)
exports.getUserTasksWithCompletionStatus = async (req, res) => {
    try {
        const tasks = await Task.find({
            $or: [
                { users: req.params.userId }, // Tasks assigned to the user
                { broadcast: true }, // Broadcast tasks
            ],
        })
            .populate('users', 'name email') // Populate the 'users' field
            .populate('completedBy', 'name email'); // Populate the 'completedBy' field
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching user performance data:', err);
        res.status(500).send('Server error');
    }
};

const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');

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

            // Create notifications for all users
            const users = await User.find({ role: 'user' });
            for (const user of users) {
                const notification = new Notification({
                    taskTitle: title,
                    userEmail: user.email,
                    userId: user._id,
                });
                await notification.save(); // Save the notification to the database
            }
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

            // Create a notification for the assigned user
            const notification = new Notification({
                taskTitle: title,
                userEmail: user.email,
                userId: user._id,
            });
            await notification.save(); // Save the notification to the database
        }

        await task.save(); // Save the task to the database
        res.json(task);
    } catch (err) {
        console.error('Error creating task:', err);
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

// Update a task
exports.updateTask = async (req, res) => {
    // console.log('Updating task with ID:', req.params.id); 
    // console.log('Request body:', req.body); 

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
        // console.error('Error updating task:', err); 
        res.status(500).send('Server error');
    }
};

// Delete a task
exports.deleteTask = async (req, res) => {
    // console.log('Deleting task with ID:', req.params.id); 
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        await task.deleteOne();
        res.json({ msg: 'Task deleted' });
    } catch (err) {
        // console.error('Error deleting task:', err); 
        res.status(500).send('Server error');
    }
};
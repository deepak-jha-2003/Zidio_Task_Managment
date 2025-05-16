const Comment = require('../models/Comment');
const Task = require('../models/Task');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.addComment = async (req, res) => {
    const { taskId, comment } = req.body;
    try {
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        const newComment = new Comment({
            taskId,
            userId: req.user.id,
            comment,
            isAdmin: req.user.role === 'admin'
        });

        await newComment.save();
        res.json(newComment);
    } catch (err) {
        console.error('Error adding comment:', err);
        res.status(500).send('Server error');
    }
};

exports.getComments = async (req, res) => {
    const { taskId } = req.params;
    try {
        const comments = await Comment.find({ taskId }).populate('userId', 'name email');
        res.json(comments);
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).send('Server error');
    }
};
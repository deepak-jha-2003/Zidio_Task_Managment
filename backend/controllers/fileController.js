const File = require('../models/File');
const Task = require('../models/Task');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.uploadFile = async (req, res) => {
    const { taskId } = req.body;
    try {
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        const newFile = new File({
            taskId,
            userId: req.user.id,
            fileName: req.file.originalname,
            filePath: req.file.path,
            isAdmin: req.user.role === 'admin'
        });

        await newFile.save();
        res.json(newFile);
    } catch (err) {
        console.error('Error uploading file:', err);
        res.status(500).send('Server error');
    }
};

exports.getFiles = async (req, res) => {
    const { taskId } = req.params;
    try {
        const files = await File.find({ taskId }).populate('userId', 'name email');
        res.json(files);
    } catch (err) {
        console.error('Error fetching files:', err);
        res.status(500).send('Server error');
    }
};
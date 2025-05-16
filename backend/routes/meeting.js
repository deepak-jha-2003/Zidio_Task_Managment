const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Meeting = require('../models/Meeting');
const mongoose = require('mongoose');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Create a new meeting
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, startTime, endTime, participants = [], isBroadcast = false } = req.body;

        // Validate required fields
        if (!title || !startTime || !endTime) {
            return res.status(400).json({ msg: 'Title, start time, and end time are required' });
        }

        // Validate creator is a proper ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
            return res.status(400).json({ msg: 'Invalid creator ID' });
        }

        // Generate a unique room name
        const roomName = `meeting-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Create the meeting
        const meeting = new Meeting({
            title,
            description,
            startTime,
            endTime,
            roomName,
            createdBy: req.user.id, // This is now a proper ObjectId
            participants: isBroadcast ? [] : participants,
            isBroadcast
        });

        await meeting.save();

        // Send response with populated data
        const populatedMeeting = await Meeting.findById(meeting._id)
            .populate('createdBy', 'name email')
            .populate('participants', 'name email');

        res.status(201).json(populatedMeeting);
    } catch (err) {
        console.error('Meeting creation error:', err);
        res.status(500).json({
            msg: 'Server error',
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});


// Get all meetings for admin
router.get('/admin', auth, async (req, res) => {
    try {
        // Verify admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Unauthorized' });
        }

        const meetings = await Meeting.find()
            .populate('createdBy', 'name email')
            .populate('participants', 'name email');
        res.json(meetings);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Get meetings for a user
router.get('/user', auth, async (req, res) => {
    try {
        const meetings = await Meeting.find({
            $or: [
                { participants: req.user.id },
                { isBroadcast: true }
            ]
        }).populate('createdBy', 'name email');
        res.json(meetings);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Delete a meeting
router.delete('/:id', auth, async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) return res.status(404).json({ msg: 'Meeting not found' });

        if (meeting.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Unauthorized' });
        }

        await meeting.deleteOne();
        res.json({ msg: 'Meeting deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
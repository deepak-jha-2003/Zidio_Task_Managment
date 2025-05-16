const mongoose = require('mongoose');

exports.createMeeting = async (req, res) => {
    try {
        const { title, description, startTime, endTime, participants = [], isBroadcast = false } = req.body;

        // Validate participants are proper ObjectIds
        if (!isBroadcast) {
            for (const participantId of participants) {
                if (!mongoose.Types.ObjectId.isValid(participantId)) {
                    return res.status(400).json({ msg: 'Invalid participant ID format' });
                }
            }
        }

        const roomName = `meeting-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const meeting = new Meeting({
            title,
            description,
            startTime,
            endTime,
            roomName,
            createdBy: req.user.id,
            participants: isBroadcast ? [] : participants,
            isBroadcast
        });

        await meeting.save();
        res.status(201).json(meeting);
    } catch (err) {
        console.error('Meeting creation error:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.getAdminMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.find({ createdBy: req.user.id })
            .populate('createdBy', 'name email')
            .populate('participants', 'name email');
        res.json(meetings);
    } catch (err) {
        console.error('Error fetching meetings:', err);
        res.status(500).send('Server error');
    }
};
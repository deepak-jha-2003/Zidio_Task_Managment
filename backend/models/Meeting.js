const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    roomName: { type: String, required: true, unique: true },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isBroadcast: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', MeetingSchema);
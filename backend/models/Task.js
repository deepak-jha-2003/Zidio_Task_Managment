const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Assigned user (if not broadcasted)
    broadcast: { type: Boolean, default: false }, // Indicates if the task is broadcasted
    completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who completed the task
});

module.exports = mongoose.model('Task', TaskSchema);
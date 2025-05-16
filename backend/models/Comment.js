const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    isAdmin: { type: Boolean, default: false }
});

module.exports = mongoose.model('Comment', CommentSchema);
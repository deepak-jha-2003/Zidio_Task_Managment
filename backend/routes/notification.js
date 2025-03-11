const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createNotification,
    getUserNotifications,
    markAsRead,
    getAdminNotifications,
} = require('../controllers/notificationController');

// Ensure you are not importing Task again here
// const Task = require('../models/Task'); // <-- Remove this line if it exists

router.post('/', auth, createNotification);
router.get('/user', auth, getUserNotifications);
router.put('/:id/mark-as-read', auth, markAsRead);
router.get('/admin', auth, getAdminNotifications);

module.exports = router;
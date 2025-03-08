const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createTask, getUserTasks, getAllTasks } = require('../controllers/taskController');

router.post('/', auth, createTask); // Create a task (admin only)
router.get('/', auth, getUserTasks); // Get tasks for a user
router.get('/all', auth, getAllTasks); // Get all tasks (admin only)

module.exports = router;
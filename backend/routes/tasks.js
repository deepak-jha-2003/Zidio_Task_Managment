const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createTask, getUserTasks, getAllTasks, updateTask, deleteTask } = require('../controllers/taskController');

router.post('/', auth, createTask); // Create a task
router.get('/', auth, getUserTasks); // Get tasks for a user
router.get('/all', auth, getAllTasks); // Get all tasks (admin only)
router.put('/:id', auth, updateTask); // Update a task
router.delete('/:id', auth, deleteTask); // Delete a task

module.exports = router;
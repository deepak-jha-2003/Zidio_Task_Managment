const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createTask,
    getUserTasks,
    getAllTasks,
    updateTask,
    deleteTask,
    completeTask,
    getAllTasksWithCompletionStatus,
    getUserTasksWithCompletionStatus,
} = require('../controllers/taskController');

router.post('/', auth, createTask);
router.get('/', auth, getUserTasks);
router.get('/all', auth, getAllTasks);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);
router.put('/:id/complete', auth, completeTask);
router.get('/admin/performance', auth, getAllTasksWithCompletionStatus);
router.get('/admin/performance/:userId', auth, getUserTasksWithCompletionStatus);

module.exports = router;
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAllUsers, deleteUser, getAllTasks, deleteTask } = require('../controllers/adminController');

router.get('/users', auth, getAllUsers);
router.delete('/users/:id', auth, deleteUser);
router.get('/tasks', auth, getAllTasks);
router.delete('/tasks/:id', auth, deleteTask);

module.exports = router;
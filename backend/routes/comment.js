const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { addComment, getComments } = require('../controllers/commentController');

router.post('/', auth, addComment);
router.get('/:taskId', auth, getComments);

module.exports = router;
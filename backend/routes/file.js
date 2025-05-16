const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadFile, getFiles } = require('../controllers/fileController');

router.post('/', auth, upload.single('file'), uploadFile);
router.get('/:taskId', auth, getFiles);

module.exports = router;
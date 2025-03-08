const multer = require('multer');
const path = require('path');

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Files will be stored in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        // Generate a unique filename using the current timestamp and the original file extension
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

// Initialize multer
const upload = multer({ storage });

module.exports = upload;
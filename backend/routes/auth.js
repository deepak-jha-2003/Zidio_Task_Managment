const express = require('express');
const router = express.Router();
const { userSignup } = require('../controllers/authController');
const upload = require('../middleware/upload'); // Import the upload middleware
const { userLogin } = require('../controllers/authController'); // Import the userLogin function
const { adminLogin } = require('../controllers/authController'); // Import the adminLogin function

// Signup route with file upload
router.post('/user/signup', upload.single('photograph'), userSignup);

// User Login Route
router.post('/user/login', userLogin);

// Admin Login Route
router.post('/admin/login', adminLogin);

module.exports = router;
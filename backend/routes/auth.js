const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); // Import the upload middleware
const { userSignup, userLogin, adminLogin, forgotPassword, resetPassword, getCurrentUser } = require('../controllers/authController');
const auth = require('../middleware/auth');


// Signup route with file upload
router.post('/user/signup', upload.single('photograph'), userSignup);

// User Login Route
router.post('/user/login', userLogin);

// Admin Login Route
router.post('/admin/login', adminLogin);

router.post('/forgot-password', forgotPassword);

router.put('/reset-password/:resetToken', resetPassword);

router.get('/user', auth, getCurrentUser);


module.exports = router;
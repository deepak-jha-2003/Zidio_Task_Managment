const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// User Signup with Image Upload
exports.userSignup = async (req, res) => {
    const { name, occupation, address, phoneNumber, socialLinks, email, password } = req.body;
    const photograph = req.file ? `/uploads/${req.file.filename}` : ''; // Store the file path

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({
            name,
            occupation,
            photograph,
            address,
            phoneNumber,
            socialLinks: socialLinks.split(',').map(link => link.trim()), // Convert socialLinks to array
            email,
            password,
            role: 'user',
        });

        await user.save();
        res.json({ msg: 'User registered successfully' });
    } catch (err) {
        res.status(500).send('Server error');
    }
};


// User Login
exports.userLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id, role: user.role } };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, email: user.email } }); // Include user ID in the response
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send('Server error');
    }
};

// Admin Login
exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Get or create admin user
        const admin = await User.createAdminUser();

        if (email !== admin.email || password !== process.env.ADMIN_PASSWORD) {
            return res.status(400).json({ msg: 'Invalid Admin Credentials' });
        }

        const payload = {
            user: {
                id: admin._id, // Proper ObjectId from the database
                role: 'admin'
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).send('Server error');
    }
};
// Forgot Password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes

        await user.save();

        // Send email with reset token
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset Request',
            text: `You are receiving this email because you have requested a password reset. Please click the following link to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ msg: 'Email sent with reset instructions' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).send('Server error');
    }
};
exports.resetPassword = async (req, res) => {
    const { password } = req.body;
    const resetToken = req.params.resetToken;

    try {
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid or expired token' });
        }

        // Update password and clear reset token
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ msg: 'Password reset successful' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).send('Server error');
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).send('Server error');
    }
};
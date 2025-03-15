const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

    // console.log('Admin login request received:', { email, password }); // Debugging: Log the request

    try {
        // Check if the provided credentials match the admin credentials in .env
        if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
            // console.log('Invalid admin credentials:', { email, password }); // Debugging: Log invalid credentials
            return res.status(400).json({ msg: 'Invalid Admin Credentials' });
        }

        // Generate a JWT token
        const payload = { user: { id: 'admin', role: 'admin' } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            // console.log('Admin login successful:', { email }); // Debugging: Log successful login
            res.json({ token });
        });
    } catch (err) {
        // console.error('Admin login error:', err); // Debugging: Log any errors
        res.status(500).send('Server error');
    }
};
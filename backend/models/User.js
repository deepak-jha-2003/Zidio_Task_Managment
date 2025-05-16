const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    occupation: { type: String },
    photograph: { type: String },
    address: { type: String },
    phoneNumber: { type: String },
    socialLinks: { type: [String] },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    resetPasswordToken: { type: String }, // Add this field
    resetPasswordExpire: { type: Date },  // Add this field
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

UserSchema.statics.createAdminUser = async function () {
    const adminEmail = process.env.ADMIN_EMAIL;
    let admin = await this.findOne({ email: adminEmail });

    if (!admin) {
        admin = new this({
            name: 'Admin',
            email: adminEmail,
            password: process.env.ADMIN_PASSWORD,
            role: 'admin',
            isAdmin: true
        });
        await admin.save();
    }
    return admin;
};

module.exports = mongoose.model('User', UserSchema);
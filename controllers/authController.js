const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../models');
const { sendEmail } = require('../utils/email');
const crypto = require('crypto');

const generateTokens = (userId) => {
    const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
);

const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE }
);

return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
    try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
    });
    }

    const { email, password, firstName, lastName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return res.status(400).json({
        success: false,
        message: 'User already exists'
    });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        verificationToken
    });

    // Send verification email
    await sendEmail({
        to: email,
        subject: 'Verify Your Email',
        template: 'email-verification',
        data: {
        name: firstName,
        verificationUrl: `${process.env.CLIENT_URL}/verify-email/${verificationToken}`
    }
    });

    res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification.'
    });
} catch (error) {
    res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
    });
}
};

exports.login = async (req, res) => {
    try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
    });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user || !await user.comparePassword(password)) {
        return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
    });
    }

    // Check if user is verified
    if (!user.isVerified) {
        return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in'
    });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
        success: true,
        message: 'Login successful',
        data: {
        accessToken,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        }
    }
    });
} catch (error) {
    res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
    });
}
};
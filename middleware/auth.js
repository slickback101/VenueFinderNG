const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../models');
const { sendEmail } = require('../utils/email');
const crypto = require('crypto');


const authenticate = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

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

exports.logout = async (req, res) => {
    try {
        // Clear the refresh token cookie
        res.clearCookie('refreshToken');
        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: error.message
        });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not provided'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

        // Set new refresh token cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: { accessToken }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token',
            error: error.message
        });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            // Don't reveal if user exists or not
            return res.json({
                success: true,
                message: 'If an account with that email exists, we have sent a password reset link.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save reset token to user
        await user.update({
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetTokenExpiry
        });

        // Send reset email
        await sendEmail({
            to: email,
            subject: 'Password Reset Request',
            template: 'password-reset',
            data: {
                name: user.firstName,
                resetUrl: `${process.env.CLIENT_URL}/reset-password/${resetToken}`
            }
        });

        res.json({
            success: true,
            message: 'Password reset email sent'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Forgot password failed',
            error: error.message
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }

        // Find user with valid reset token
        const user = await User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password and clear reset token
        await user.update({
            password: password, // This should be hashed in the User model
            resetPasswordToken: null,
            resetPasswordExpires: null
        });

        res.json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Password reset failed',
            error: error.message
        });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        // Find user with verification token
        const user = await User.findOne({
            where: { verificationToken: token }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification token'
            });
        }

        // Mark user as verified
        await user.update({
            isVerified: true,
            verificationToken: null
        });

        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Email verification failed',
            error: error.message
        });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId, {
            attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken'] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User data retrieved',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get user data',
            error: error.message
        });
    }
};

module.exports = { authenticate };
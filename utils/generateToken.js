const jwt = require('jsonwebtoken');

// Generate access token (short-lived)
const generateAccessToken = (user) => {
    return jwt.sign(
    {
    userId: user.id || user._id,
    email: user.email,
    role: user.role || 'user'
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }  );
};

// Generate refresh token
const generateRefreshToken = (user) => {
    return jwt.sign(
    {
    userId: user.id || user._id,
    email: user.email
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // 7 days
    );
};

// Generate both tokens
const generateTokenPair = (user) => {
    return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user)
    };
};

// Verify access token
const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

// Verify refresh token
const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

// Generate password reset token (short-lived)
const generateResetToken = (user) => {
    return jwt.sign(
    { 
    userId: user.id || user._id,
    purpose: 'password-reset'
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' } // 1 hour
    );
};

// Generate email verification token
const generateVerificationToken = (user) => {
    return jwt.sign(
    {
    userId: user.id || user._id,
    purpose: 'email-verification'
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' } // 24 hours
    );
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateTokenPair,
    verifyAccessToken,
    verifyRefreshToken,
    generateResetToken,
    generateVerificationToken
};
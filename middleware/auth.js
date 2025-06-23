const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
    return res.status(401).json({
        success: false,
        message: 'Access token required'
    });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database (optional - for fresh user data)
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
    return res.status(401).json({
        success: false,
        message: 'User not found'
    });
    }

    // Attach user to request object
    req.user = user;
    req.userId = decoded.userId;
    
    next();
    } catch (error) {
    if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
        success: false,
        message: 'Invalid token'
    });
    }
    if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
        success: false,
        message: 'Token expired'
    });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
    success: false,
    message: 'Authentication failed'
    });
    }
};


// Middleware to optionally authenticate (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (user) {
        req.user = user;
        req.userId = decoded.userId;
    }
    }

    // Continue regardless of token presence
    next();
    } catch (error) {
    // Ignore token errors in optional auth
    next();
    }
};

// Middleware to verify refresh token
const verifyRefreshToken = async (req, res, next) => {
    try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
    return res.status(401).json({ 
        success: false, 
        message: 'Refresh token required' 
    });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Get user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
    return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
    });
    }

    req.user = user;
    req.userId = decoded.userId;
    
    next();
    } catch (error) {
    if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
        success: false, 
        message: 'Invalid refresh token' 
    });
    }
    if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ 
        success: false, 
        message: 'Refresh token expired' 
    });
    }
    
    console.error('Refresh token middleware error:', error);
    return res.status(500).json({ 
    success: false, 
    message: 'Token verification failed' 
    });
    }
};

module.exports = {
    authenticateToken,
    optionalAuth,
    verifyRefreshToken
};

const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authenticateToken: verifyRefreshToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();


// Safe imports with error handling
//let authController = {};
//let authenticate = (req, res, next) => next(); // Default no-op middleware

try {
    authController = require('../controllers/authController');
    console.log('✓ Successfully imported authController');
} catch (error) {
    console.error('✗ Failed to import authController:', error.message);
}

try {
    const authMiddleware = require('../middleware/auth');
    authenticate = authMiddleware.authenticateToken || authMiddleware.authenticate || authenticate;
    console.log('✓ Successfully imported auth middleware');
} catch (error) {
    console.error('✗ Failed to import auth middleware:', error.message);
}

// Debug: Check what we have
console.log('=== DEBUGGING IMPORTS ===');
console.log('authController type:', typeof authController);
console.log('authenticate type:', typeof authenticate);
console.log('Available authController methods:', Object.keys(authController));
console.log('========================');

// Validation rules
const registerValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').trim().isLength({ min: 2 }),
    body('lastName').trim().isLength({ min: 2 })
];

const loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
];

// Create stub handler for missing methods
const createStub = (methodName) => (req, res) => {
    console.log(`Stub handler called for: ${methodName}`);
    res.status(501).json({
        success: false,
        message: `${methodName} not implemented yet`
    });
};

// Safely get handler or return stub
const getHandler = (methodName) => {
    if (typeof authController[methodName] === 'function') {
        console.log(`✓ Using real handler for ${methodName}`);
        return authController[methodName];
    } else {
        console.log(`✗ Using stub handler for ${methodName} (type: ${typeof authController[methodName]})`);
        return createStub(methodName);
    }
};

// Routes with safe handlers
console.log('Registering routes...');

router.post('/register', registerValidation, getHandler('register'));
console.log('✓ /register route registered');

router.post('/login', loginValidation, getHandler('login'));
console.log('✓ /login route registered');

// Check if authenticate is a function before using it
if (typeof authenticate === 'function') {
    router.post('/logout', authenticate, getHandler('logout'));
    console.log('✓ /logout route registered with auth');
    
    router.get('/me', authenticate, getHandler('getMe'));
    console.log('✓ /me route registered with auth');
} else {
    console.error('✗ authenticate middleware is not a function, skipping protected routes');
    router.post('/logout', getHandler('logout'));
    router.get('/me', getHandler('getMe'));
}

router.post('/refresh', getHandler('refreshToken'));
console.log('✓ /refresh route registered');

router.post('/forgot-password', getHandler('forgotPassword'));
console.log('✓ /forgot-password route registered');

router.post('/reset-password/:token', getHandler('resetPassword'));
console.log('✓ /reset-password route registered');

router.get('/verify-email/:token', getHandler('verifyEmail'));
console.log('✓ /verify-email route registered');

console.log('All auth routes registered successfully!');



















// DEBUG: Check what's available in authController
// console.log('=== DEBUG authController ===');
// console.log('authController:', authController);
// console.log('authController.register type:', typeof authController.register);
// console.log('authController.login type:', typeof authController.login);
// console.log('authController.logout type:', typeof authController.logout);
// console.log('authController.refreshToken type:', typeof authController.refreshToken);
// console.log('authController.forgotPassword type:', typeof authController.forgotPassword);
// console.log('authController.resetPassword type:', typeof authController.resetPassword);
// console.log('authController.verifyEmail type:', typeof authController.verifyEmail);
// console.log('authController.getMe type:', typeof authController.getMe);
// console.log('=== END DEBUG ===');





// const router = express.Router();

// // Validation rules
// const registerValidation = [
//   body('email').isEmail().normalizeEmail(),
//   body('password').isLength({ min: 8 }),
//   body('firstName').trim().isLength({ min: 2 }),
//   body('lastName').trim().isLength({ min: 2 })
// ];

// const loginValidation = [
//   body('email').isEmail().normalizeEmail(),
//   body('password').exists()
// ];



// // Routes
// if (typeof authController.register === 'function') {
//     router.post('/register', registerValidation, authController.register);
// } else {
//     console.error('authController.register is not a function:', typeof authController.register);
// }

// if (typeof authController.login === 'function') {
//     router.post('/login', loginValidation, authController.login);
// } else {
//     console.error('authController.login is not a function:', typeof authController.login);
// }

// if (typeof authController.logout === 'function') {
//     router.post('/logout', authenticate, authController.logout);
// } else {
//     console.error('authController.logout is not a function:', typeof authController.logout);
// }

// if (typeof authController.refreshToken === 'function') {
//     router.post('/refresh', authController.refreshToken);
// } else {
//     console.error('authController.refreshToken is not a function:', typeof authController.refreshToken);
// }

// if (typeof authController.forgotPassword === 'function') {
//     router.post('/forgot-password', authController.forgotPassword);
// } else {
//     console.error('authController.forgotPassword is not a function:', typeof authController.forgotPassword);
// }

// if (typeof authController.resetPassword === 'function') {
//     router.post('/reset-password/:token([a-fA-F0-9]{64})', authController.resetPassword);
// } else {
//     console.error('authController.resetPassword is not a function:', typeof authController.resetPassword);
// }

// if (typeof authController.verifyEmail === 'function') {
//     router.get('/verify-email/:token([a-fA-F0-9]{64})', authController.verifyEmail);
// } else {
//     console.error('authController.verifyEmail is not a function:', typeof authController.verifyEmail);
// }

// if (typeof authController.getMe === 'function') {
//     router.get('/me', authenticate, authController.getMe);
// } else {
//     console.error('authController.getMe is not a function:', typeof authController.getMe);
// }



// Routes
// router.post('/register', registerValidation, authController.register);
// router.post('/login', loginValidation, authController.login);
// router.post('/logout', authenticate, authController.logout);
// router.post('/refresh', authController.refreshToken);
// router.post('/forgot-password', authController.forgotPassword);
// router.post('/reset-password', authController.resetPassword);
// router.get('/verify-email', authController.verifyEmail);
// router.get('/me', authenticate, authController.getMe);
// //router.post('/refresh', verifyRefreshToken, authController.refreshToken);

module.exports = router;
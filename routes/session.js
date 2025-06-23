const express = require('express');
const router = express.Router();
const { 
  refreshToken, 
  logout, 
  getCurrentUser, 
  verifyEmail, 
  checkSession, 
  logoutAllDevices 
} = require('../controllers/sessionController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/verify-email/:token', verifyEmail);
router.post('/refresh-token', refreshToken);

// Protected routes (require authentication)
router.post('/logout', authenticateToken, logout);
router.post('/logout-all', authenticateToken, logoutAllDevices);
router.get('/me', authenticateToken, getCurrentUser);
router.get('/check', authenticateToken, checkSession);

module.exports = router;
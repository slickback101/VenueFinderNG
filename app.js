const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// Session middleware for Google OAuth
app.use(session({
    secret: process.env.SESSION_SECRET || '90d0060e37cef3edebc9fac4e2b36ed52ea0235d6024baf779d1ebaafe31e171f93d99f8820b13c066b0c63f60aa8772d9e2e6e598580db98250e3da7153bddc',
    resave: false,
    saveUninitialized: false,
    cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
    
}
}));




// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/events', require('./routes/events'));
app.use('/api/v1/tickets', require('./routes/tickets'));
//app.use('/api/v1/payments', require('./routes/payments'));
app.use('/api/v1/venues', require('./routes/venues'));
app.use('/api/v1/categories', require('./routes/categories'));
app.use('/api/v1/notifications', require('./routes/notifications'));
app.use('/api/v1/analytics', require('./routes/analytics'));




// Google Calendar Integration Routes
app.use('/api/v1/calendar', require('./routes/calendar'));
app.use('/api/v1/google-calendar', require('./routes/google-calendar'));




// Error handling middleware
app.use(require('./middleware/errorHandler'));

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
    success: false,
    message: 'Route not found'

});
});

module.exports = app;
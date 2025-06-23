const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
const userRoutes = require('./routes/users');



if (!process.env.SESSION_SECRET) {
    console.error('SESSION_SECRET environment variable is required');
    process.exit(1);
}


// Security middleware (should be first)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


// Rate limiting with different limits for different endpoints
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth attempts per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
    }
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/v1/auth', authLimiter);





// Middleware
app.use(express.json());


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




// Test route to see if basic setup works
// app.get('/test', (req, res) => {
//     res.json({ success: true, message: 'Server is working' });
// });

// Add routes one by one to identify the problematic one
// try {
//     console.log('Loading auth routes...');
//     app.use('/api/v1/auth', require('./routes/auth'));
//     console.log('Auth routes loaded successfully');
// } catch (error) {
//     console.error('Error loading auth routes:', error.message);
// }

// try {
//     console.log('Loading user routes...');
//     app.use('/api/v1/users', require('./routes/users'));
//     console.log('User routes loaded successfully');
// } catch (error) {
//     console.error('Error loading user routes:', error.message);
// }

// try {
//     console.log('Loading event routes...');
//     app.use('/api/v1/events', require('./routes/events'));
//     console.log('Event routes loaded successfully');
// } catch (error) {
//     console.error('Error loading event routes:', error.message);
// }

// try {
//     console.log('Loading venue routes...');
//     app.use('/api/v1/venues', require('./routes/venues'));
//     console.log('Venue routes loaded successfully');
// } catch (error) {
//     console.error('Error loading venue routes:', error.message);
// }

// try {
//     console.log('Loading category routes...');
//     app.use('/api/v1/categories', require('./routes/categories'));
//     console.log('Category routes loaded successfully');
// } catch (error) {
//     console.error('Error loading category routes:', error.message);
// }

// try {
//     console.log('Loading notification routes...');
//     app.use('/api/v1/notifications', require('./routes/notifications'));
//     console.log('Notification routes loaded successfully');
// } catch (error) {
//     console.error('Error loading notification routes:', error.message);
// }


// try {
//     console.log('Loading calendar routes...');
//     app.use('/api/v1/calendar', require('./routes/calendar'));
//     console.log('Calendar routes loaded successfully');
// } catch (error) {
//     console.error('Error loading calendar routes:', error.message);
// }

// try {
//     console.log('Loading google-calendar routes...');
//     app.use('/api/v1/google-calendar', require('./routes/google-calendar'));
//     console.log('Google-calendar routes loaded successfully');
// } catch (error) {
//     console.error('Error loading google-calendar routes:', error.message);
// }






// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/events', require('./routes/events'));
//app.use('/api/v1/tickets', require('./routes/tickets'));
//app.use('/api/v1/payments', require('./routes/payments'));
app.use('/api/v1/venues', require('./routes/venues'));
app.use('/api/v1/categories', require('./routes/categories'));
app.use('/api/v1/notifications', require('./routes/notifications'));
//app.use('/api/v1/analytics', require('./routes/analytics'));




// Google Calendar Integration Routes
app.use('/api/v1/calendar', require('./routes/calendar'));
app.use('/api/v1/google-calendar', require('./routes/google-calendar'));




// Error handling middleware
app.use(require('./middleware/errorHandler'));

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
    success: false,
    message: 'Something went wrong'

});
});

module.exports = app;
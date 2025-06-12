const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const initializeSocket = (server) => {
    const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

  // Authentication middleware for socket connections
    io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
        return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
        return next(new Error('User not found'));
    }
    
    socket.userId = user.id;
    socket.user = user;
    next();
    } catch (error) {
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    console.log(`User ${socket.user.email} connected`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle event-specific rooms
    socket.on('join_event', (eventId) => {
        socket.join(`event_${eventId}`);
        console.log(`User ${socket.user.email} joined event ${eventId}`);
    });

    socket.on('leave_event', (eventId) => {
        socket.leave(`event_${eventId}`);
        console.log(`User ${socket.user.email} left event ${eventId}`);
    });

    socket.on('disconnect', () => {
        console.log(`User ${socket.user.email} disconnected`);
    });
});

return io;
};

module.exports = initializeSocket;
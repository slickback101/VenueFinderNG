#!/usr/bin/env node

const app = require('./app');
const { sequelize } = require('./models');
const logger = require('./utils/logger');
const initializeSocket = require('./socket');
const initializeJobs = require('./jobs');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Sync database (only in development)
    if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: true });
        logger.info('Database synchronized');
    }

    // Start HTTP server
    const server = app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });

    // Initialize Socket.IO
    const io = initializeSocket(server);
    app.set('io', io);

    // Initialize background jobs
    initializeJobs();

    // Graceful shutdown
    process.on('SIGTERM', () => {
        logger.info('SIGTERM received, shutting down gracefully');
        server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
    });

} catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
}
}

startServer();
//Model Initialization

const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database'); // Remove duplicate import
const customLogger = require('../utils/logger');
const env = process.env.NODE_ENV || 'development';

console.log('Environment:', env);
console.log('dbConfig:', dbConfig);
console.log('dbConfig.dialect:', dbConfig?.dialect);



//DEBUG
// Check if dbConfig is defined and has the required properties
if (!dbConfig || !dbConfig.database || !dbConfig.username || !dbConfig.password) {
    throw new Error('Database configuration is missing or incomplete');
}
// Check if dbConfig.dialect is defined
if (!dbConfig.dialect) {
    throw new Error('Database dialect is not defined in the configuration');
}
// Check if dbConfig.host is defined
if (!dbConfig.host) {
    throw new Error('Database host is not defined in the configuration');
}
// Check if dbConfig.port is defined, if not set a default value
if (!dbConfig.port) {
    dbConfig.port = 5432; // Default PostgreSQL port
}

// Initialize Sequelize
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port || 5432,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging ? customLogger.info : false, 
        
        define: {
            timestamps: true,
            underscored: true,
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Test the connection
async function testConnection() {
    try {
        await sequelize.authenticate();
        customLogger.info('Database connection has been established successfully.');
    } catch (error) {
        customLogger.error('Unable to connect to the database:', error);
    }
}

// Call the test function
testConnection();

// Example usage of the customLogger
customLogger.info('Starting application...');
customLogger.debug('Debugging application startup');
customLogger.warn('This is a warning message');
customLogger.info('Database connection established');

// Import models
const User = require('./User')(sequelize);
const Event = require('./Event')(sequelize);
const Category = require('./Category')(sequelize);
const Venue = require('./Venue')(sequelize);
const Notification = require('./Notification')(sequelize);
const Review = require('./Review')(sequelize);




// Set up associations
require('./associations')(sequelize);

const db = {
    sequelize,
    Sequelize,
    User,
    Event,
    Category,
    Venue,
    Notification,
    Review,
};

// Define associations here
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    sequelize,
    User,
    Review
};

module.exports = db;
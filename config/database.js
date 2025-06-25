require('dotenv').config();
const { Sequelize } = require('sequelize');

const dbConfig = {
    database: process.env.DB_NAME || 'venuefinderng_db',
    username: process.env.DB_USER || 'venuefinderng_db_user',
    password: process.env.DB_PASSWORD || 'RdSMu9rYy7agxiflwmgiYbO4BD0XQSaG',
    host: process.env.DB_HOST || 'dpg-d1ctciadbo4c73bttbeg-a',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: true,
    pool: {
        max: parseInt(process.env.DB_POOL_MAX) || 20,
        min: parseInt(process.env.DB_POOL_MIN) || 0,
        acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
        idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
    },
    define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
    },
};

module.exports = dbConfig;
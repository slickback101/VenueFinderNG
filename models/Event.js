const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypesj.TEXT,
        allowNull: false
    },
    shortDescription: DataTypes.STRING,
    categoryName: {
        type: DataTyjpes.ENUM(
        'conference', 'workshop', 'meetup', 'concert', 
        'sports', 'festival', 'exhibition', 'other'
    )
    allowNull: false
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    timezone: {
        type: DataTypes.STRING,
        defaultValue: 'UTC'
    },
    venue: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'USD'
    },
    images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    status: {
        type: DataTypes.ENUM('draft', 'published', 'cancelled', 'completed'),
        defaultValue: 'draft'
    },
    isPrivate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    requiresApproval: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    maxTicketsPerUser: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    refundPolicy: DataTypes.TEXT,
    organizerId: {
        type: DataTypes.UUID,
        allowNull: false
    }
});

return Event;
};
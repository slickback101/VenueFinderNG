const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Notification = sequelize.define('Notification', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 100]
            }
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM(
                'event_reminder',
                'ticket_purchase',
                'event_update',
                'event_cancelled',
                'payment_success',
                'payment_failed',
                'account_verification',
                'password_reset',
                'review_request',
                'system_update',
                'promotional',
                'general'
            ),
            allowNull: false,
            defaultValue: 'general'
        },
        priority: {
            type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
            allowNull: false,
            defaultValue: 'medium'
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        readAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        data: {
            type: DataTypes.JSON,
            allowNull: true
            // Additional data related to the notification
            // Example: { eventId: 'uuid', ticketId: 'uuid', actionUrl: '/events/123' }
        },
        actionUrl: {
            type: DataTypes.STRING,
            allowNull: true
            // URL to redirect when notification is clicked
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: true
            // When the notification should expire/auto-delete
        },
        channel: {
            type: DataTypes.ENUM('in_app', 'email', 'sms', 'push'),
            allowNull: false,
            defaultValue: 'in_app'
        },
        sentAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        deliveryStatus: {
            type: DataTypes.ENUM('pending', 'sent', 'delivered', 'failed'),
            defaultValue: 'pending'
        }
    }, {
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['type']
            },
            {
                fields: ['isRead']
            },
            {
                fields: ['priority']
            },
            {
                fields: ['createdAt']
            },
            {
                fields: ['expiresAt']
            }
        ]
    });

    // Instance method to mark as read
    Notification.prototype.markAsRead = async function() {
        this.isRead = true;
        this.readAt = new Date();
        return await this.save();
    };

    // Instance method to check if expired
    Notification.prototype.isExpired = function() {
        return this.expiresAt && new Date() > this.expiresAt;
    };

    // Hook to set readAt when isRead changes to true
    Notification.beforeUpdate(async (notification) => {
        if (notification.changed('isRead') && notification.isRead && !notification.readAt) {
            notification.readAt = new Date();
        }
    });

    // Static method to get unread count for user
    Notification.getUnreadCount = async function(userId) {
        return await this.count({
            where: {
                userId: userId,
                isRead: false
            }
        });
    };

    // Static method to mark all as read for user
    Notification.markAllAsReadForUser = async function(userId) {
        return await this.update(
            { 
                isRead: true, 
                readAt: new Date() 
            },
            {
                where: {
                    userId: userId,
                    isRead: false
                }
            }
        );
    };

    return Notification;
};
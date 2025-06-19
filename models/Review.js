const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Review = sequelize.define('Review', {
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
        eventId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Events',
                key: 'id'
            }
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [0, 100]
            }
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: {
                len: [0, 1000]
            }
        },
        aspects: {
            type: DataTypes.JSON,
            allowNull: true
            // Detailed ratings for different aspects
            // Example: { 
            //   organization: 5, 
            //   venue: 4, 
            //   value_for_money: 3, 
            //   entertainment: 5 
            // }
        },
        attendedEvent: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
            // Did the user actually attend the event?
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
            // Is this review verified
        },
        isAnonymous: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
            // Should the reviewer's name be hidden?
        },
        helpfulVotes: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        reportCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected', 'flagged'),
            defaultValue: 'pending'
        },
        moderatorNotes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        images: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: []
            // Array of image URLs uploaded with the review
        },
        reviewDate: {
            type: DataTypes.DATE,
            allowNull: true
            // When the event was attended (might be different from createdAt)
        }
    }, {
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['eventId']
            },
            {
                fields: ['rating']
            },
            {
                fields: ['status']
            },
            {
                fields: ['isVerified']
            },
            {
                fields: ['createdAt']
            },
            {
                // Prevent duplicate reviews from same user for same event
                unique: true,
                fields: ['userId', 'eventId']
            }
        ]
    });

    // Instance method to calculate helpfulness ratio
    Review.prototype.getHelpfulnessRatio = function() {
        const totalVotes = this.helpfulVotes + this.reportCount;
        return totalVotes > 0 ? (this.helpfulVotes / totalVotes) : 0;
    };

    // Instance method to check if review is recent
    Review.prototype.isRecent = function(days = 30) {
        const daysDiff = (new Date() - this.createdAt) / (1000 * 60 * 60 * 24);
        return daysDiff <= days;
    };

    // Static method to get average rating for an event
    Review.getAverageRating = async function(eventId) {
        const result = await this.findOne({
            attributes: [
                [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews']
            ],
            where: {
                eventId: eventId,
                status: 'approved'
            }
        });
        
        return {
            averageRating: result ? parseFloat(result.dataValues.avgRating || 0).toFixed(1) : 0,
            totalReviews: result ? parseInt(result.dataValues.totalReviews || 0) : 0
        };
    };

    // Static method to get rating distribution for an event
    Review.getRatingDistribution = async function(eventId) {
        const distribution = await this.findAll({
            attributes: [
                'rating',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                eventId: eventId,
                status: 'approved'
            },
            group: ['rating'],
            order: [['rating', 'DESC']]
        });

        // Initialize with zeros
        const result = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        
        distribution.forEach(item => {
            result[item.rating] = parseInt(item.dataValues.count);
        });

        return result;
    };

    // Hook to set reviewDate if not provided
    Review.beforeCreate(async (review) => {
        if (!review.reviewDate) {
            review.reviewDate = new Date();
        }
    });

    return Review;
};
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Venue = sequelize.define('Venue', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [2, 100]
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Nigeria'
        },
        postalCode: {
            type: DataTypes.STRING,
            allowNull: true
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: true,
            validate: {
                min: -90,
                max: 90
            }
        },
        longitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: true,
            validate: {
                min: -180,
                max: 180
            }
        },
        capacity: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1
            }
        },
        venueType: {
            type: DataTypes.ENUM(
                'conference_center',
                'hotel',
                'restaurant',
                'outdoor',
                'theater',
                'stadium',
                'hall',
                'auditorium',
                'club',
                'other'
            ),
            allowNull: false,
            defaultValue: 'other'
        },
        facilities: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: []
            // Example: ["parking", "wifi", "ac", "sound_system", "catering"]
        },
        contactPhone: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                is: /^[\+]?[0-9\-\(\)\s]+$/
            }
        },
        contactEmail: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true
            }
        },
        website: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isUrl: true
            }
        },
        images: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: []
            // Array of image URLs
        },
        priceRange: {
            type: DataTypes.ENUM('budget', 'mid-range', 'luxury'),
            allowNull: true
        },
        rating: {
            type: DataTypes.DECIMAL(2, 1),
            allowNull: true,
            defaultValue: 0.0,
            validate: {
                min: 0,
                max: 5
            }
        },
        totalReviews: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        indexes: [
            {
                fields: ['name']
            },
            {
                fields: ['city', 'state']
            },
            {
                fields: ['venueType']
            },
            {
                fields: ['isActive']
            },
            {
                fields: ['latitude', 'longitude']
            }
        ]
    });

    // Instance method to get full address
    Venue.prototype.getFullAddress = function() {
        let address = this.address;
        if (this.city) address += `, ${this.city}`;
        if (this.state) address += `, ${this.state}`;
        if (this.country) address += `, ${this.country}`;
        return address;
    };

    // Instance method to check if venue has specific facility
    Venue.prototype.hasFacility = function(facility) {
        return this.facilities && this.facilities.includes(facility);
    };

    return Venue;
};
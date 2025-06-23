const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Category = sequelize.define('Category', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                len: [2, 50]
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isLowercase: true,
                is: /^[a-z0-9-]+$/i 
            }
        },
        color: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                is: /^#[0-9A-F]{6}$/i // Hex color code
            }
        },
        icon: {
            type: DataTypes.STRING,
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        sortOrder: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        indexes: [
            {
                fields: ['name']
            },
            {
                fields: ['slug']
            },
            {
                fields: ['isActive']
            }
        ]
    });

    // Generate slug from name before creating
    Category.beforeCreate(async (category) => {
        if (!category.slug && category.name) {
            category.slug = category.name
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
        }
    });

    // Update slug when name changes
    Category.beforeUpdate(async (category) => {
        if (category.changed('name') && !category.changed('slug')) {
            category.slug = category.name
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
        }
    });

    return Category;
};
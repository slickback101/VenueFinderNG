const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
    id: {
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('user', 'organizer', 'admin'),
        defaultValue: 'user'
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    verificationToken: DataTypes.STRING,
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpire: DataTypes.DATE,
    profileImage: DataTypes.STRING,
    phone: DataTypes.STRING,
    dateOfBirth: DataTypes.DATE,
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

User.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, 12);
});

User.prototype.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

return User;
};
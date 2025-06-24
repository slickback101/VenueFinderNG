 const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Registration model
const Registration = sequelize.define('Registration', {
id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
    },
    registrationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
    },
    quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
    min: 1,
    max: 10
    }
    },
    totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
    min: 0
    }
    },
    status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'attended'),
    allowNull: false,
    defaultValue: 'pending'
    },
    paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    allowNull: false,
    defaultValue: 'pending'
    },
    paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'bank_transfer', 'paystack', 'flutterwave'),
    allowNull: true
    },
    paymentReference: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
    },
    notes: {
    type: DataTypes.TEXT,
    allowNull: true
    },
    attendeeInfo: {
    type: DataTypes.JSON, // Store attendee details
    allowNull: true,
    defaultValue: {}
    },
    qrCode: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
    },
    checkInTime: {
    type: DataTypes.DATE,
    allowNull: true
    },
    isCheckedIn: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
    },
    specialRequests: {
    type: DataTypes.TEXT,
    allowNull: true
    },
    emergencyContact: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
    },
  // Foreign keys
    userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
    model: 'users',
    key: 'id'
    }
    },
    eventId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
    model: 'events',
    key: 'id'
    }
    }
    
}, {
    tableName: 'registrations',
    timestamps: true,
  paranoid: true, // Soft delete
    indexes: [
    {
    fields: ['userId']
    },
    {
    fields: ['eventId']
    },
    {
    fields: ['registrationDate']
    },
    {
    fields: ['status']
    },
    {
    fields: ['paymentStatus']
    },
    {
    fields: ['paymentReference']
    },
    {
    fields: ['qrCode']
    }

    ]
});


Registration.prototype.generateQRCode = function() {
    const crypto = require('crypto');
    this.qrCode = crypto.createHash('sha256')
    .update(`${this.id}-${this.userId}-${this.eventId}-${Date.now()}`)
    .digest('hex');
    return this.save();
};

Registration.prototype.checkIn = function() {
    this.isCheckedIn = true;
    this.checkInTime = new Date();
    this.status = 'attended';
    return this.save();
};

Registration.prototype.cancel = function() {
    this.status = 'cancelled';
    return this.save();
};

Registration.prototype.confirm = function() {
    this.status = 'confirmed';
    this.paymentStatus = 'paid';
    return this.save();
};




Registration.findByUser = function(userId) {
    return this.findAll({
    where: { userId },
    include: ['Event']
    });
};

Registration.findByEvent = function(eventId) {
    return this.findAll({
    where: { eventId },
    include: ['User']
    });
};

Registration.findByStatus = function(status) {
    return this.findAll({
    where: { status },
    include: ['User', 'Event']
    });
};

Registration.findByPaymentStatus = function(paymentStatus) {
    return this.findAll({
    where: { paymentStatus },
    include: ['User', 'Event']
    });
};



module.exports = { Registration };
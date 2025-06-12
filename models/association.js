//Model Relationship

module.exports = (sequelize) => {
    const { User, Event, Ticket, Payment, Category, Venue, Notification, Review, Wishlist } = sequelize.models;

  // User associations

    User.hasMany(Event, { as: 'organizedEvents', foreignKey: 'organizerId' });
    User.hasMany(Ticket, { as: 'tickets', foreignKey: 'userId' });
    User.hasMany(Payment, { as: 'payments', foreignKey: 'userId' });
    User.hasMany(Notification, { as: 'notifications', foreignKey: 'userId' });
    User.hasMany(Review, { as: 'reviews', foreignKey: 'userId' });
    User.hasMany(Wishlist, { as: 'wishlists', foreignKey: 'userId' });

  // Event associations


    Event.belongsTo(User, { as: 'organizer', foreignKey: 'organizerId' });
    Event.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });
    Event.belongsTo(Venue, { as: 'venue', foreignKey: 'venueId' });
    Event.hasMany(Ticket, { as: 'tickets', foreignKey: 'eventId' });
    Event.hasMany(Review, { as: 'reviews', foreignKey: 'eventId' });
    Event.hasMany(Wishlist, { as: 'wishlists', foreignKey: 'eventId' });

   // Ticket associations

//     Ticket.belongsTo(User, { as: 'user', foreignKey: 'userId' });
//     Ticket.belongsTo(Event, { as: 'event', foreignKey: 'eventId' });
//   Ticket.hasOne(Payment, { as: 'payment', foreignKey: 'ticketId' });

   // Payment associations
//   Payment.belongsTo(User, { as: 'user', foreignKey: 'userId' });
//   Payment.belongsTo(Ticket, { as: 'ticket', foreignKey: 'ticketId' });


  // Review associations

    Review.belongsTo(User, { as: 'user', foreignKey: 'userId' });
    Review.belongsTo(Event, { as: 'event', foreignKey: 'eventId' });

  // Wishlist associations

    Wishlist.belongsTo(User, { as: 'user', foreignKey: 'userId' });
    Wishlist.belongsTo(Event, { as: 'event', foreignKey: 'eventId' });

  // Category associations

    Category.hasMany(Event, { as: 'events', foreignKey: 'categoryId' });

  // Venue associations
    Venue.hasMany(Event, { as: 'events', foreignKey: 'venueId' });
};
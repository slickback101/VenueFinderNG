//Model Relationship

module.exports = (sequelize) => {
  const { User, Event, Payment, Category, Venue, Notification, Review } = sequelize.models;

  // User associations

    User.hasMany(Event, { as: 'organizedEvents', foreignKey: 'organizerId' });
    //User.hasMany(Payment, { as: 'payments', foreignKey: 'userId' });
    User.hasMany(Notification, { as: 'notifications', foreignKey: 'userId' });
    User.hasMany(Review, { as: 'reviews', foreignKey: 'userId' });

  // Event associations


    Event.belongsTo(User, { as: 'organizer', foreignKey: 'organizerId' });
    Event.belongsTo(Category, { as: 'eventCategory', foreignKey: 'categoryId' });
    Event.belongsTo(Venue, { as: 'eventVenue', foreignKey: 'venueId' });
    Event.hasMany(Review, { as: 'reviews', foreignKey: 'eventId' });
  



   // Payment associations
//   Payment.belongsTo(User, { as: 'user', foreignKey: 'userId' });
//   Payment.belongsTo(Ticket, { as: 'ticket', foreignKey: 'ticketId' });


  // Review associations

    Review.belongsTo(User, { as: 'user', foreignKey: 'userId' });
    Review.belongsTo(Event, { as: 'event', foreignKey: 'eventId' });



  // Category associations

    Category.hasMany(Event, { as: 'events', foreignKey: 'categoryId' });

  // Venue associations
    Venue.hasMany(Event, { as: 'events', foreignKey: 'venueId' });
};
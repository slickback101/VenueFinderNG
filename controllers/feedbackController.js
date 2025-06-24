const {Review} = require('../models');


//create a new review
export const createReview = async (req, res) => {
  const { rating, title, comment, aspect, attendedEvent, isVerified, isAnonymous, helpfulVotes, reportCount, status, moderatorNotes, images, reviewDate } = req.body;
  const eventId = Number(req.params.eventId);

  const checkevent = await Book.findByPk(eventId);

  if (!checkevent) {
    return res.status(404).json({
      status: false,
      message: "Could not find the event",
      data: [],
    });
  }

  const review = await Review.create({  rating, title, comment, aspect, attendedEvent, isVerified, isAnonymous, helpfulVotes, reportCount, status, moderatorNotes, images, reviewDate});

  if (!review) {
    return res.status(400).json({
      status: false,
      message: "Could not create the review",
      data: [],
    });
  }

  return res.status(201).json({
    status: true,
    message: "review created successfully",
    data: review,
  });
};



// Get all review
export const getAllReviews = async (req, res) => {
    const eventId = Number(req.params.eventId);
  
    const checkevent = await Event.findByPk(eventId);
  
    const { venue, area } = req.query;
  
    if (!checkevent) {
  
      return res.status(404).json({
        status: false,
        message: "Could not find the Review",
        data: [],
      });
    }
  
    const where = { eventId };
    if (venue) {
      where.venue = venue;
    }
  
    if (area) {
      where.area = area;
    }
  
    const reviews = await Review.findAll({ where: where });
  
    if (!reviews) {
      return res.status(400).json({
        status: false,
        message: "Could not get any reviews",
        data: [],
      });
    }
      
    return res.status(200).json({
      status: true,
      message: "reviews retrieved successfully",
      data: reviews,
    });
  };

    // get a single review
export const getReview = async (req, res) => {
  const { reviewId } = req.params;
  const review = await Review.findByPk(Number(reviewId));
  if (!review) {
    return res.status(404).json({
      status: false,
      message: "Could not get the review",
      data: [],
    });
  }

  return res.status(200).json({
    status: true,
    message: "review retrieved successfully",
    data: review,
  });
};

// update a review
export const updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const review = await Review.findByPk(Number(reviewId));

  if (!review) {
    return res.status(400).json({
      status: false,
      message: "Could not get the review",
      data: [],
    });
  }

  await review.update(req.body);

  return res.status(200).json({
    status: true,
    message: "review updated successfully",
    data: review,
  });
};

// delete a review
export const deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const review = await Review.findByPk(Number(reviewId));
  await review.destroy();
  return res.status(200).json({
    status: true,
    message: "review deleted successfully",
    data: [],
  });
};

//get average rating for an event
export const getEventAverageRating = async (req, res) => {
  const review = await Review.getAverageRating(req.params.eventId);
  res.status(200).son({
    staatus: true,
    message:" Average rating for event",
    data: [],
  });

};
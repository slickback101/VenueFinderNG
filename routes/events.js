const express = require('express');
const { body, query } = require('express-validator');
const eventController = require('../controllers/eventController');
const { authenticateToken: authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();


// Get all events
router.get('/', eventController.getAllEvents);


// Create new event
router.post('/',
    upload.array('images', 5),
    eventController.createEvent
);


// Get event attendees
router.get('/:id/attendees', eventController.getEventAttendees);

// Get event by ID
router.get('/:id', eventController.getEventById);



// Update event
router.put('/:id',
    upload.array('images', 5),
    eventController.updateEvent
);

// Delete event
router.delete(
    '/:id',
    eventController.deleteEvent
);

module.exports = router;
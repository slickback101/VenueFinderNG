const express = require('express');
const { body, query } = require('express-validator');
const eventController = require('../controllers/eventController');
const { authenticateToken: authenticate } = require('../middleware/auth');
//const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/:id', eventController.getEventById);
router.get('/events', eventController.getAllEvents);


// Protected routes
router.use(authenticate);

router.post(
'/',
//authorize(['organizer', 'admin']),
upload.array('images', 5),
eventController.createEvent

);

router.put(
    '/:id',
    //authorize(['organizer', 'admin']),
    upload.array('images', 5),
    eventController.updateEvent
);

router.delete(
    '/:id',
    //authorize(['organizer', 'admin']),
    eventController.deleteEvent
);

router.get('/:id/attendees', eventController.getEventAttendees);
// For single file upload
router.post('/upload', upload.single('image'), eventController.uploadImage);


module.exports = router;
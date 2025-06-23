const express = require('express');
const router = express.Router();

// Get user's calendar events
router.get('/', async (req, res) => {
    try {
        const userId = req.user?.id || req.query.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        const calendarEvents = [
            {
                id: 1,
                title: 'Lagos Tech Conference',
                description: 'Annual technology conference',
                start: '2025-07-15T09:00:00Z',
                end: '2025-07-15T17:00:00Z',
                location: 'Eko Convention Centre, Lagos',
                type: 'event',
                status: 'confirmed'
            }
        ];

        res.status(200).json({
            success: true,
            data: calendarEvents,
            count: calendarEvents.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching calendar events',
            error: error.message
        });
    }
});

// Get calendar events by date range
router.get('/range', async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        const events = [];

        res.status(200).json({
            success: true,
            data: events,
            count: events.length,
            dateRange: {
                start: startDate,
                end: endDate
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching events by date range',
            error: error.message
        });
    }
});

// Add event to user's calendar
router.post('/add-event', async (req, res) => {
    try {
        const { eventId, userId, reminderTime } = req.body;

        if (!eventId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Event ID and User ID are required'
            });
        }

        const calendarEntry = {
            id: Date.now(),
            userId,
            eventId,
            addedAt: new Date(),
            reminderTime: reminderTime || '30',
            status: 'active'
        };

        res.status(201).json({
            success: true,
            data: calendarEntry,
            message: 'Event added to calendar successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding event to calendar',
            error: error.message
        });
    }
});

// Remove event from user's calendar
router.delete('/remove-event/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Event removed from calendar successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error removing event from calendar',
            error: error.message
        });
    }
});

module.exports = router;
const Event = require('../models/Event');
const Venue = require('../models/Venue');
const { validationResult } = require('express-validator');

class EventController {
async getAllEvents(req, res) {
    try {
    const { category, location, date, venue_id } = req.query;
    let filter = {};

    if (category) filter.category = { $regex: category, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (venue_id) filter.venue_id = venue_id;
    if (date) {
        const startDate = new Date(date);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        filter.date = { $gte: startDate, $lt: endDate };
    }

    const events = await Event.find(filter)
        .populate('venue_id', 'name address capacity')
        .sort({ date: 1 });

    res.json({
        success: true,
        count: events.length,
        data: events
    });
    } catch (error) {
    res.status(500).json({
        success: false,
        message: 'Error fetching events',
        error: error.message
    });
    }
    }

  // Get single event by ID
    async getEventById(req, res) {
    try {
    const event = await Event.findById(req.params.id)
        .populate('venue_id', 'name address capacity amenities contact');

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching event',
        error: error.message
      });
    }
  }

  // Create new event
  async createEvent(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const {
        title,
        description,
        date,
        time,
        duration,
        category,
        venue_id,
        capacity,
        price,
        organizer,
        contact_email,
        contact_phone,
        requirements,
        tags
      } = req.body;

      // Verify venue exists and has sufficient capacity
      const venue = await Venue.findById(venue_id);
      if (!venue) {
        return res.status(404).json({
          success: false,
          message: 'Venue not found'
        });
      }

      if (capacity > venue.capacity) {
        return res.status(400).json({
          success: false,
          message: 'Event capacity exceeds venue capacity'
        });
      }

      // Check for venue availability (basic check)
      const existingEvent = await Event.findOne({
        venue_id,
        date: new Date(date),
        $or: [
          { time: { $lte: time }, end_time: { $gte: time } },
          { time: { $lte: time + duration }, end_time: { $gte: time + duration } }
        ]
      });

      if (existingEvent) {
        return res.status(409).json({
          success: false,
          message: 'Venue is not available at the specified time'
        });
      }

      const event = new Event({
        title,
        description,
        date: new Date(date),
        time,
        duration,
        end_time: time + duration,
        category,
        venue_id,
        capacity,
        available_spots: capacity,
        price: price || 0,
        organizer,
        contact_email,
        contact_phone,
        requirements: requirements || [],
        tags: tags || [],
        status: 'active',
        created_at: new Date()
      });

      await event.save();

      const populatedEvent = await Event.findById(event._id)
        .populate('venue_id', 'name address');

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: populatedEvent
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating event',
        error: error.message
      });
    }
  }

  // Update event
  async updateEvent(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      // Check if event has already started
      const eventDateTime = new Date(event.date.toDateString() + ' ' + event.time);
      if (eventDateTime <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot update event that has already started'
        });
      }

      const updates = req.body;
      
      // If venue is being changed, verify new venue
      if (updates.venue_id && updates.venue_id !== event.venue_id.toString()) {
        const venue = await Venue.findById(updates.venue_id);
        if (!venue) {
          return res.status(404).json({
            success: false,
            message: 'New venue not found'
          });
        }
      }

      // If capacity is being reduced, check current registrations
      if (updates.capacity && updates.capacity < event.capacity) {
        const registeredCount = event.capacity - event.available_spots;
        if (updates.capacity < registeredCount) {
          return res.status(400).json({
            success: false,
            message: 'Cannot reduce capacity below current registrations'
          });
        }
        updates.available_spots = updates.capacity - registeredCount;
      }

      updates.updated_at = new Date();

      const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      ).populate('venue_id', 'name address');

      res.json({
        success: true,
        message: 'Event updated successfully',
        data: updatedEvent
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating event',
        error: error.message
      });
    }
  }

  // Delete event
  async deleteEvent(req, res) {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      // Check if event has registrations
      if (event.available_spots < event.capacity) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete event with existing registrations'
        });
      }

      await Event.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting event',
        error: error.message
      });
    }
  }

  // Cancel event
  async cancelEvent(req, res) {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      if (event.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Event is already cancelled'
        });
      }

      const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        { 
          status: 'cancelled',
          updated_at: new Date()
        },
        { new: true }
      ).populate('venue_id', 'name address');

      res.json({
        success: true,
        message: 'Event cancelled successfully',
        data: updatedEvent
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error cancelling event',
        error: error.message
      });
    }
  }

  // Get events by organizer
  async getEventsByOrganizer(req, res) {
    try {
      const { organizer } = req.params;
      const events = await Event.find({ organizer })
        .populate('venue_id', 'name address')
        .sort({ date: 1 });

      res.json({
        success: true,
        count: events.length,
        data: events
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching organizer events',
        error: error.message
      });
    }
  }

  // Get upcoming events
  async getUpcomingEvents(req, res) {
    try {
      const now = new Date();
      const events = await Event.find({
        date: { $gte: now },
        status: 'active'
      })
        .populate('venue_id', 'name address')
        .sort({ date: 1 })
        .limit(10);

      res.json({
        success: true,
        count: events.length,
        data: events
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching upcoming events',
        error: error.message
      });
    }
    }

// Get event attendees
async getEventAttendees(req, res) {
    try {
        // Implementation for getting event attendees
        res.json({
            success: true,
            message: 'Event attendees retrieved',
            data: []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching event attendees',
            error: error.message
        });
    }
}

// Upload image
async uploadImage(req, res) {
    try {
        // Implementation for image upload
        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: { filename: req.file ? req.file.filename : null }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading image',
            error: error.message
        });
    }
}

}

module.exports = new EventController();
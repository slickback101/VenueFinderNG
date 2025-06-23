const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const { validationResult } = require('express-validator');

class RegistrationController {
  // Register for an event
  async registerForEvent(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { event_id, user_id, attendee_info, special_requirements } = req.body;

      // Check if event exists and is active
      const event = await Event.findById(event_id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      if (event.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Event is not available for registration'
        });
      }

      // Check if event is in the future
      const eventDateTime = new Date(event.date.toDateString() + ' ' + event.time);
      if (eventDateTime <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot register for past events'
        });
      }

      // Check if user is already registered
      const existingRegistration = await Registration.findOne({
        event_id,
        user_id,
        status: { $in: ['confirmed', 'pending'] }
      });

      if (existingRegistration) {
        return res.status(409).json({
          success: false,
          message: 'Already registered for this event'
        });
      }

      // Check available spots
      if (event.available_spots <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Event is fully booked'
        });
      }

      // Create registration
      const registration = new Registration({
        event_id,
        user_id,
        attendee_info: attendee_info || {},
        special_requirements: special_requirements || [],
        status: 'confirmed',
        registration_date: new Date(),
        payment_status: event.price > 0 ? 'pending' : 'completed'
      });

      await registration.save();

      // Update event available spots
      await Event.findByIdAndUpdate(event_id, {
        $inc: { available_spots: -1 }
      });

      const populatedRegistration = await Registration.findById(registration._id)
        .populate('event_id', 'title date time venue_id')
        .populate('user_id', 'name email');

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: populatedRegistration
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error processing registration',
        error: error.message
      });
    }
  }

  // Get all registrations for an event
  async getEventRegistrations(req, res) {
    try {
      const { event_id } = req.params;
      const { status } = req.query;

      let filter = { event_id };
      if (status) filter.status = status;

      const registrations = await Registration.find(filter)
        .populate('user_id', 'name email phone')
        .populate('event_id', 'title date time')
        .sort({ registration_date: -1 });

      res.json({
        success: true,
        count: registrations.length,
        data: registrations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching event registrations',
        error: error.message
      });
    }
  }

  // Get user's registrations
  async getUserRegistrations(req, res) {
    try {
      const { user_id } = req.params;
      const { status, upcoming } = req.query;

      let filter = { user_id };
      if (status) filter.status = status;

      const registrations = await Registration.find(filter)
        .populate({
          path: 'event_id',
          select: 'title description date time duration venue_id category price',
          populate: {
            path: 'venue_id',
            select: 'name address'
          }
        })
        .sort({ registration_date: -1 });

      let filteredRegistrations = registrations;
      
      if (upcoming === 'true') {
        const now = new Date();
        filteredRegistrations = registrations.filter(reg => 
          reg.event_id && new Date(reg.event_id.date) >= now
        );
      }

      res.json({
        success: true,
        count: filteredRegistrations.length,
        data: filteredRegistrations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user registrations',
        error: error.message
      });
    }
  }

  // Get single registration
  async getRegistration(req, res) {
    try {
      const registration = await Registration.findById(req.params.id)
        .populate('event_id', 'title description date time venue_id category price')
        .populate('user_id', 'name email phone');

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found'
        });
      }

      res.json({
        success: true,
        data: registration
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching registration',
        error: error.message
      });
    }
  }

  // Update registration
  async updateRegistration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const registration = await Registration.findById(req.params.id);
      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found'
        });
      }

      const updates = req.body;
      updates.updated_at = new Date();

      const updatedRegistration = await Registration.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      )
        .populate('event_id', 'title date time')
        .populate('user_id', 'name email');

      res.json({
        success: true,
        message: 'Registration updated successfully',
        data: updatedRegistration
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating registration',
        error: error.message
      });
    }
  }

  // Cancel registration
  async cancelRegistration(req, res) {
    try {
      const registration = await Registration.findById(req.params.id);
      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found'
        });
      }

      if (registration.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Registration is already cancelled'
        });
      }

      // Check if event is in the future
      const event = await Event.findById(registration.event_id);
      const eventDateTime = new Date(event.date.toDateString() + ' ' + event.time);
      
      if (eventDateTime <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel registration for past events'
        });
      }

      // Update registration status
      const updatedRegistration = await Registration.findByIdAndUpdate(
        req.params.id,
        { 
          status: 'cancelled',
          cancelled_at: new Date(),
          updated_at: new Date()
        },
        { new: true }
      )
        .populate('event_id', 'title date time')
        .populate('user_id', 'name email');

      // Increase event available spots
      await Event.findByIdAndUpdate(registration.event_id, {
        $inc: { available_spots: 1 }
      });

      res.json({
        success: true,
        message: 'Registration cancelled successfully',
        data: updatedRegistration
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error cancelling registration',
        error: error.message
      });
    }
  }

  // Confirm registration (for pending registrations)
  async confirmRegistration(req, res) {
    try {
      const registration = await Registration.findById(req.params.id);
      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found'
        });
      }

      if (registration.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Registration is not pending confirmation'
        });
      }

      const updatedRegistration = await Registration.findByIdAndUpdate(
        req.params.id,
        { 
          status: 'confirmed',
          confirmed_at: new Date(),
          updated_at: new Date()
        },
        { new: true }
      )
        .populate('event_id', 'title date time')
        .populate('user_id', 'name email');

      res.json({
        success: true,
        message: 'Registration confirmed successfully',
        data: updatedRegistration
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error confirming registration',
        error: error.message
      });
    }
  }

  // Get registration statistics
  async getRegistrationStats(req, res) {
    try {
      const { event_id } = req.params;

      const stats = await Registration.aggregate([
        { $match: { event_id: event_id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const event = await Event.findById(event_id, 'capacity available_spots');

      const formattedStats = {
        total_capacity: event.capacity,
        available_spots: event.available_spots,
        registrations: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        total_registered: stats.reduce((acc, stat) => acc + stat.count, 0)
      };

      res.json({
        success: true,
        data: formattedStats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching registration statistics',
        error: error.message
      });
    }
  }

  // Bulk registration operations
  async bulkUpdateRegistrations(req, res) {
    try {
      const { registration_ids, status } = req.body;

      if (!registration_ids || !Array.isArray(registration_ids)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid registration IDs'
        });
      }

      const result = await Registration.updateMany(
        { _id: { $in: registration_ids } },
        { 
          status,
          updated_at: new Date()
        }
      );

      res.json({
        success: true,
        message: `Updated ${result.modifiedCount} registrations`,
        data: {
          matched: result.matchedCount,
          modified: result.modifiedCount
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating registrations',
        error: error.message
      });
    }
  }
}

module.exports = new RegistrationController();
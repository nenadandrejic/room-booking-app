const express = require('express');
const { Op } = require('sequelize');
const { body, validationResult } = require('express-validator');
const { Booking, Space, User, Floor, Building, Location, SpaceType } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get user's bookings
router.get('/my-bookings', authMiddleware, async (req, res, next) => {
  try {
    const { status = 'confirmed', limit = 50, offset = 0 } = req.query;

    const whereClause = {
      userId: req.user.id,
    };

    if (status) {
      whereClause.status = status;
    }

    const bookings = await Booking.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Space,
          as: 'space',
          include: [
            { model: SpaceType, as: 'spaceType' },
            {
              model: Floor,
              as: 'floor',
              include: [
                {
                  model: Building,
                  as: 'building',
                  include: [{ model: Location, as: 'location' }],
                },
              ],
            },
          ],
        },
      ],
      order: [['startTime', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      bookings: bookings.rows,
      total: bookings.count,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    next(error);
  }
});

// Create a new booking
router.post('/', authMiddleware, [
  body('spaceId').isUUID().withMessage('Valid space ID is required'),
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required'),
  body('notes').optional().trim().isLength({ max: 500 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { spaceId, startTime, endTime, notes } = req.body;
    const userId = req.user.id;

    const requestedStart = new Date(startTime);
    const requestedEnd = new Date(endTime);
    const now = new Date();

    // Validate times
    if (requestedStart >= requestedEnd) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    if (requestedStart <= now) {
      return res.status(400).json({ error: 'Cannot book in the past' });
    }

    // Verify space exists and is bookable
    const space = await Space.findByPk(spaceId, {
      include: [
        { model: SpaceType, as: 'spaceType' },
        {
          model: Floor,
          as: 'floor',
          include: [
            {
              model: Building,
              as: 'building',
              include: [{ model: Location, as: 'location' }],
            },
          ],
        },
      ],
    });

    if (!space || !space.isActive || !space.isBookable) {
      return res.status(400).json({ error: 'Space not found or not bookable' });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      where: {
        spaceId,
        status: 'confirmed',
        [Op.and]: [
          {
            startTime: {
              [Op.lt]: requestedEnd,
            },
          },
          {
            endTime: {
              [Op.gt]: requestedStart,
            },
          },
        ],
      },
    });

    if (conflictingBooking) {
      return res.status(409).json({ 
        error: 'Space is not available during the requested time',
        conflictingBooking: {
          startTime: conflictingBooking.startTime,
          endTime: conflictingBooking.endTime,
        },
      });
    }

    // Business rule: Check if user already has a booking at this time
    const userConflict = await Booking.findOne({
      where: {
        userId,
        status: 'confirmed',
        [Op.and]: [
          {
            startTime: {
              [Op.lt]: requestedEnd,
            },
          },
          {
            endTime: {
              [Op.gt]: requestedStart,
            },
          },
        ],
      },
    });

    if (userConflict) {
      return res.status(409).json({ 
        error: 'You already have a booking during this time',
      });
    }

    // Create the booking
    const booking = await Booking.create({
      userId,
      spaceId,
      startTime: requestedStart,
      endTime: requestedEnd,
      notes: notes?.trim(),
    });

    // Fetch the complete booking with relations
    const createdBooking = await Booking.findByPk(booking.id, {
      include: [
        {
          model: Space,
          as: 'space',
          include: [
            { model: SpaceType, as: 'spaceType' },
            {
              model: Floor,
              as: 'floor',
              include: [
                {
                  model: Building,
                  as: 'building',
                  include: [{ model: Location, as: 'location' }],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking: createdBooking,
    });
  } catch (error) {
    next(error);
  }
});

// Cancel a booking
router.delete('/:bookingId', authMiddleware, async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: Space,
          as: 'space',
          include: [{ model: SpaceType, as: 'spaceType' }],
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user owns the booking or is admin
    if (booking.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    // Business rule: Cannot cancel bookings that have already started
    const now = new Date();
    if (booking.startTime <= now) {
      return res.status(400).json({ 
        error: 'Cannot cancel a booking that has already started' 
      });
    }

    // Update booking status
    await booking.update({
      status: 'cancelled',
      cancelledAt: now,
    });

    res.json({
      message: 'Booking cancelled successfully',
      booking: {
        id: booking.id,
        status: booking.status,
        cancelledAt: booking.cancelledAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get booking details
router.get('/:bookingId', authMiddleware, async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: Space,
          as: 'space',
          include: [
            { model: SpaceType, as: 'spaceType' },
            {
              model: Floor,
              as: 'floor',
              include: [
                {
                  model: Building,
                  as: 'building',
                  include: [{ model: Location, as: 'location' }],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user owns the booking or is admin
    if (booking.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to view this booking' });
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
});

// Admin: Get all bookings with filters
router.get('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { 
      status, 
      spaceId, 
      userId, 
      startDate, 
      endDate, 
      limit = 50, 
      offset = 0 
    } = req.query;

    const whereClause = {};

    if (status) whereClause.status = status;
    if (spaceId) whereClause.spaceId = spaceId;
    if (userId) whereClause.userId = userId;

    if (startDate || endDate) {
      whereClause.startTime = {};
      if (startDate) whereClause.startTime[Op.gte] = new Date(startDate);
      if (endDate) whereClause.startTime[Op.lte] = new Date(endDate);
    }

    const bookings = await Booking.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Space,
          as: 'space',
          include: [
            { model: SpaceType, as: 'spaceType' },
            {
              model: Floor,
              as: 'floor',
              include: [
                {
                  model: Building,
                  as: 'building',
                  include: [{ model: Location, as: 'location' }],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'employeeId'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      bookings: bookings.rows,
      total: bookings.count,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

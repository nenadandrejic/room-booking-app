const express = require('express');
const { Op } = require('sequelize');
const { Space, Floor, Building, Location, SpaceType, Booking } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get spaces for a floor with availability
router.get('/floors/:floorId', authMiddleware, async (req, res, next) => {
  try {
    const { floorId } = req.params;
    const { date, startTime, endTime } = req.query;

    // Verify floor exists
    const floor = await Floor.findByPk(floorId, {
      include: [
        {
          model: Building,
          as: 'building',
          include: [{ model: Location, as: 'location' }],
        },
      ],
    });

    if (!floor || !floor.isActive) {
      return res.status(404).json({ error: 'Floor not found' });
    }

    const spaces = await Space.findAll({
      where: {
        floorId,
        isBookable: true,
        isActive: true,
      },
      include: [
        {
          model: SpaceType,
          as: 'spaceType',
        },
      ],
      order: [['name', 'ASC']],
    });

    // If date and time are provided, check availability
    if (date && startTime && endTime) {
      const requestedStart = new Date(`${date}T${startTime}`);
      const requestedEnd = new Date(`${date}T${endTime}`);

      for (const space of spaces) {
        const conflictingBookings = await Booking.count({
          where: {
            spaceId: space.id,
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

        space.dataValues.isAvailable = conflictingBookings === 0;
      }
    }

    res.json({
      floor: {
        id: floor.id,
        name: floor.name,
        floorNumber: floor.floorNumber,
        layoutData: floor.layoutData,
        layoutImageUrl: floor.layoutImageUrl,
        building: floor.building,
      },
      spaces,
    });
  } catch (error) {
    next(error);
  }
});

// Get specific space details
router.get('/:spaceId', authMiddleware, async (req, res, next) => {
  try {
    const { spaceId } = req.params;

    const space = await Space.findByPk(spaceId, {
      include: [
        {
          model: SpaceType,
          as: 'spaceType',
        },
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

    if (!space || !space.isActive) {
      return res.status(404).json({ error: 'Space not found' });
    }

    res.json({ space });
  } catch (error) {
    next(error);
  }
});

// Get availability for a specific space
router.get('/:spaceId/availability', authMiddleware, async (req, res, next) => {
  try {
    const { spaceId } = req.params;
    const { date, duration = 1 } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const space = await Space.findByPk(spaceId);
    if (!space || !space.isActive || !space.isBookable) {
      return res.status(404).json({ error: 'Space not found or not bookable' });
    }

    const requestedDate = new Date(date);
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all bookings for this space on the requested date
    const bookings = await Booking.findAll({
      where: {
        spaceId,
        status: 'confirmed',
        startTime: {
          [Op.gte]: startOfDay,
          [Op.lte]: endOfDay,
        },
      },
      order: [['startTime', 'ASC']],
    });

    // Generate available time slots (business hours: 8 AM to 6 PM)
    const businessStart = 8; // 8 AM
    const businessEnd = 18; // 6 PM
    const slotDuration = parseInt(duration); // hours
    const availableSlots = [];

    for (let hour = businessStart; hour <= businessEnd - slotDuration; hour++) {
      const slotStart = new Date(requestedDate);
      slotStart.setHours(hour, 0, 0, 0);
      
      const slotEnd = new Date(slotStart);
      slotEnd.setHours(hour + slotDuration, 0, 0, 0);

      // Check if this slot conflicts with any booking
      const hasConflict = bookings.some(booking => {
        return (
          (booking.startTime < slotEnd) &&
          (booking.endTime > slotStart)
        );
      });

      if (!hasConflict) {
        availableSlots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
        });
      }
    }

    res.json({
      space: {
        id: space.id,
        name: space.name,
      },
      date,
      duration: slotDuration,
      availableSlots,
      existingBookings: bookings.map(booking => ({
        id: booking.id,
        startTime: booking.startTime,
        endTime: booking.endTime,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Admin: Create new space
router.post('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { floorId, spaceTypeId, name, capacity, coordinates, features } = req.body;

    if (!floorId || !spaceTypeId || !name) {
      return res.status(400).json({ 
        error: 'Floor ID, space type ID, and name are required' 
      });
    }

    // Verify floor exists
    const floor = await Floor.findByPk(floorId);
    if (!floor) {
      return res.status(400).json({ error: 'Invalid floor ID' });
    }

    // Verify space type exists
    const spaceType = await SpaceType.findByPk(spaceTypeId);
    if (!spaceType) {
      return res.status(400).json({ error: 'Invalid space type ID' });
    }

    const space = await Space.create({
      floorId,
      spaceTypeId,
      name: name.trim(),
      capacity: capacity ? parseInt(capacity) : null,
      coordinates,
      features: features || [],
    });

    const createdSpace = await Space.findByPk(space.id, {
      include: [
        { model: SpaceType, as: 'spaceType' },
        { model: Floor, as: 'floor' },
      ],
    });

    res.status(201).json({
      message: 'Space created successfully',
      space: createdSpace,
    });
  } catch (error) {
    next(error);
  }
});

// Admin: Update space
router.put('/:spaceId', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { spaceId } = req.params;
    const { name, capacity, coordinates, features, isBookable, isActive } = req.body;

    const space = await Space.findByPk(spaceId);
    if (!space) {
      return res.status(404).json({ error: 'Space not found' });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (capacity !== undefined) updateData.capacity = capacity ? parseInt(capacity) : null;
    if (coordinates) updateData.coordinates = coordinates;
    if (features) updateData.features = features;
    if (typeof isBookable === 'boolean') updateData.isBookable = isBookable;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    await space.update(updateData);

    const updatedSpace = await Space.findByPk(spaceId, {
      include: [
        { model: SpaceType, as: 'spaceType' },
        { model: Floor, as: 'floor' },
      ],
    });

    res.json({
      message: 'Space updated successfully',
      space: updatedSpace,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const express = require('express');
const { Location, Building, Floor } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all locations
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const locations = await Location.findAll({
      where: { isActive: true },
      include: [
        {
          model: Building,
          as: 'buildings',
          where: { isActive: true },
          required: false,
          include: [
            {
              model: Floor,
              as: 'floors',
              where: { isActive: true },
              required: false,
            },
          ],
        },
      ],
      order: [['name', 'ASC']],
    });

    res.json({ locations });
  } catch (error) {
    next(error);
  }
});

// Get specific location by ID
router.get('/:locationId', authMiddleware, async (req, res, next) => {
  try {
    const { locationId } = req.params;

    const location = await Location.findByPk(locationId, {
      include: [
        {
          model: Building,
          as: 'buildings',
          where: { isActive: true },
          required: false,
          include: [
            {
              model: Floor,
              as: 'floors',
              where: { isActive: true },
              required: false,
            },
          ],
        },
      ],
    });

    if (!location || !location.isActive) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({ location });
  } catch (error) {
    next(error);
  }
});

// Get buildings for a location
router.get('/:locationId/buildings', authMiddleware, async (req, res, next) => {
  try {
    const { locationId } = req.params;

    // Verify location exists
    const location = await Location.findByPk(locationId);
    if (!location || !location.isActive) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const buildings = await Building.findAll({
      where: { 
        locationId,
        isActive: true,
      },
      include: [
        {
          model: Floor,
          as: 'floors',
          where: { isActive: true },
          required: false,
        },
      ],
      order: [['name', 'ASC']],
    });

    res.json({ buildings });
  } catch (error) {
    next(error);
  }
});

// Get floors for a building
router.get('/:locationId/buildings/:buildingId/floors', authMiddleware, async (req, res, next) => {
  try {
    const { locationId, buildingId } = req.params;

    // Verify building exists and belongs to location
    const building = await Building.findOne({
      where: { 
        id: buildingId,
        locationId,
        isActive: true,
      },
    });

    if (!building) {
      return res.status(404).json({ error: 'Building not found' });
    }

    const floors = await Floor.findAll({
      where: { 
        buildingId,
        isActive: true,
      },
      order: [['floorNumber', 'ASC']],
    });

    res.json({ floors });
  } catch (error) {
    next(error);
  }
});

// Admin routes for managing locations
router.post('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { name, address, city } = req.body;

    if (!name || !city) {
      return res.status(400).json({ error: 'Name and city are required' });
    }

    const location = await Location.create({
      name: name.trim(),
      address: address?.trim(),
      city: city.trim(),
    });

    res.status(201).json({
      message: 'Location created successfully',
      location,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:locationId', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { locationId } = req.params;
    const { name, address, city, isActive } = req.body;

    const location = await Location.findByPk(locationId);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (address !== undefined) updateData.address = address?.trim();
    if (city) updateData.city = city.trim();
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    await location.update(updateData);

    res.json({
      message: 'Location updated successfully',
      location,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

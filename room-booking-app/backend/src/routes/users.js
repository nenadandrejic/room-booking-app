const express = require('express');
const { User } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Admin: Get all users
router.get('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { isActive, limit = 50, offset = 0, search } = req.query;

    const whereClause = {};
    if (typeof isActive === 'string') {
      whereClause.isActive = isActive === 'true';
    }

    if (search) {
      const { Op } = require('sequelize');
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { employeeId: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      users: users.rows,
      total: users.count,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    next(error);
  }
});

// Admin: Get specific user
router.get('/:userId', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Admin: Update user
router.put('/:userId', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { name, email, employeeId, isAdmin, isActive, locationId } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (employeeId !== undefined) updateData.employeeId = employeeId?.trim();
    if (typeof isAdmin === 'boolean') updateData.isAdmin = isAdmin;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (locationId !== undefined) updateData.locationId = locationId;

    await user.update(updateData);

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// Admin: Delete user
router.delete('/:userId', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has active bookings
    const { Booking } = require('../models');
    const { Op } = require('sequelize');
    
    const activeBookings = await Booking.count({
      where: {
        userId,
        status: 'confirmed',
        endTime: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (activeBookings > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete user with active bookings. Please cancel bookings first.',
        activeBookings,
      });
    }

    await user.destroy();

    res.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

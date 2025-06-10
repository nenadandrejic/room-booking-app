const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    spaceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'spaces',
        key: 'id',
      },
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('confirmed', 'cancelled'),
      defaultValue: 'confirmed',
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'bookings',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['spaceId', 'startTime', 'endTime'],
      },
      {
        fields: ['startTime', 'endTime'],
      },
      {
        fields: ['status'],
      },
    ],
    validate: {
      endTimeAfterStartTime() {
        if (this.endTime <= this.startTime) {
          throw new Error('End time must be after start time');
        }
      },
    },
  });

  return Booking;
};

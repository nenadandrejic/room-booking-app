const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Space = sequelize.define('Space', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    floorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'floors',
        key: 'id',
      },
    },
    spaceTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'space_types',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isBookable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    coordinates: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    features: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'spaces',
    timestamps: true,
    indexes: [
      {
        fields: ['floorId'],
      },
      {
        fields: ['spaceTypeId'],
      },
      {
        fields: ['isBookable', 'isActive'],
      },
    ],
  });

  return Space;
};

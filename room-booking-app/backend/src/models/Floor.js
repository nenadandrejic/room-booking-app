const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Floor = sequelize.define('Floor', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    buildingId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'buildings',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    floorNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    layoutData: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    layoutImageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'floors',
    timestamps: true,
    indexes: [
      {
        fields: ['buildingId'],
      },
    ],
  });

  return Floor;
};

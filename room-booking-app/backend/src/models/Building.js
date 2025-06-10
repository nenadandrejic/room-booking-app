const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Building = sequelize.define('Building', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    locationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'locations',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'buildings',
    timestamps: true,
    indexes: [
      {
        fields: ['locationId'],
      },
    ],
  });

  return Building;
};

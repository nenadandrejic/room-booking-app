const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SpaceType = sequelize.define('SpaceType', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'space_types',
    timestamps: false,
  });

  return SpaceType;
};

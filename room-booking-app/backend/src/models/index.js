const { Sequelize } = require('sequelize');

// Use SQLite for development, PostgreSQL for production
const sequelize = process.env.NODE_ENV === 'production' 
  ? new Sequelize(
      process.env.DB_NAME || 'room_booking',
      process.env.DB_USER || 'postgres', 
      process.env.DB_PASSWORD || 'password',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      }
    )
  : new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: console.log,
    });

// Import models
const User = require('./User')(sequelize);
const Location = require('./Location')(sequelize);
const Building = require('./Building')(sequelize);
const Floor = require('./Floor')(sequelize);
const SpaceType = require('./SpaceType')(sequelize);
const Space = require('./Space')(sequelize);
const Booking = require('./Booking')(sequelize);

// Define associations
Location.hasMany(Building, { foreignKey: 'locationId', as: 'buildings' });
Building.belongsTo(Location, { foreignKey: 'locationId', as: 'location' });

Building.hasMany(Floor, { foreignKey: 'buildingId', as: 'floors' });
Floor.belongsTo(Building, { foreignKey: 'buildingId', as: 'building' });

Floor.hasMany(Space, { foreignKey: 'floorId', as: 'spaces' });
Space.belongsTo(Floor, { foreignKey: 'floorId', as: 'floor' });

SpaceType.hasMany(Space, { foreignKey: 'spaceTypeId', as: 'spaces' });
Space.belongsTo(SpaceType, { foreignKey: 'spaceTypeId', as: 'spaceType' });

User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Space.hasMany(Booking, { foreignKey: 'spaceId', as: 'bookings' });
Booking.belongsTo(Space, { foreignKey: 'spaceId', as: 'space' });

module.exports = {
  sequelize,
  User,
  Location,
  Building,
  Floor,
  SpaceType,
  Space,
  Booking,
};

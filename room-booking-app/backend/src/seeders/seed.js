require('dotenv').config();
const { sequelize, Location, Building, Floor, SpaceType, Space, User } = require('../models');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    console.log('Synchronizing database...');
    await sequelize.sync({ force: true }); // This will drop and recreate tables
    
    console.log('Seeding data...');

    // Create space types
    const deskType = await SpaceType.create({
      name: 'Desk',
      description: 'Individual workspace desk',
    });

    const roomType = await SpaceType.create({
      name: 'Project Room',
      description: 'Meeting and project room',
    });

    // Create locations
    const dortmund = await Location.create({
      name: 'Dortmund',
      address: 'Dortmunder Straße 123',
      city: 'Dortmund',
    });

    const duesseldorf = await Location.create({
      name: 'Düsseldorf',
      address: 'Düsseldorfer Allee 456',
      city: 'Düsseldorf',
    });

    // Create buildings
    const dortmundBuilding = await Building.create({
      locationId: dortmund.id,
      name: 'Main Building',
    });

    const duesseldorfBuilding = await Building.create({
      locationId: duesseldorf.id,
      name: 'Office Tower',
    });

    // Create floors for Dortmund
    const dortmundFloors = [];
    for (let i = 1; i <= 5; i++) {
      const floor = await Floor.create({
        buildingId: dortmundBuilding.id,
        name: `Floor ${i}`,
        floorNumber: i,
        layoutData: {
          width: 1000,
          height: 600,
          gridSize: 50,
        },
      });
      dortmundFloors.push(floor);
    }

    // Create floors for Düsseldorf
    const duesseldorfFloors = [];
    for (let i = 1; i <= 3; i++) {
      const floor = await Floor.create({
        buildingId: duesseldorfBuilding.id,
        name: `Floor ${i}`,
        floorNumber: i,
        layoutData: {
          width: 800,
          height: 500,
          gridSize: 50,
        },
      });
      duesseldorfFloors.push(floor);
    }

    // Create spaces for Dortmund (660 users, ~50 rooms)
    console.log('Creating spaces for Dortmund...');
    let deskCounter = 1;
    let roomCounter = 1;

    for (const floor of dortmundFloors) {
      // Create desks (about 130 per floor)
      for (let i = 1; i <= 130; i++) {
        await Space.create({
          floorId: floor.id,
          spaceTypeId: deskType.id,
          name: `D-${floor.floorNumber}-${String(i).padStart(3, '0')}`,
          coordinates: {
            x: 50 + (i % 20) * 45,
            y: 50 + Math.floor(i / 20) * 80,
            width: 40,
            height: 40,
          },
          features: ['monitor', 'power_outlet', 'network_cable'],
        });
        deskCounter++;
      }

      // Create project rooms (about 10 per floor)
      for (let i = 1; i <= 10; i++) {
        await Space.create({
          floorId: floor.id,
          spaceTypeId: roomType.id,
          name: `Room D${floor.floorNumber}.${String(i).padStart(2, '0')}`,
          capacity: Math.floor(Math.random() * 8) + 4, // 4-12 people
          coordinates: {
            x: 50 + (i % 5) * 180,
            y: 450 + Math.floor(i / 5) * 120,
            width: 160,
            height: 100,
          },
          features: ['projector', 'whiteboard', 'video_conference', 'power_outlets'],
        });
        roomCounter++;
      }
    }

    // Create spaces for Düsseldorf (60 users, ~5 rooms)
    console.log('Creating spaces for Düsseldorf...');
    for (const floor of duesseldorfFloors) {
      // Create desks (about 20 per floor)
      for (let i = 1; i <= 20; i++) {
        await Space.create({
          floorId: floor.id,
          spaceTypeId: deskType.id,
          name: `DD-${floor.floorNumber}-${String(i).padStart(3, '0')}`,
          coordinates: {
            x: 50 + (i % 10) * 45,
            y: 50 + Math.floor(i / 10) * 80,
            width: 40,
            height: 40,
          },
          features: ['monitor', 'power_outlet', 'network_cable'],
        });
      }

      // Create project rooms (about 2 per floor)
      for (let i = 1; i <= 2; i++) {
        await Space.create({
          floorId: floor.id,
          spaceTypeId: roomType.id,
          name: `Room DD${floor.floorNumber}.${String(i).padStart(2, '0')}`,
          capacity: Math.floor(Math.random() * 6) + 4, // 4-10 people
          coordinates: {
            x: 50 + (i - 1) * 200,
            y: 350,
            width: 180,
            height: 120,
          },
          features: ['projector', 'whiteboard', 'video_conference'],
        });
      }
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({
      email: 'admin@big-direkt.de',
      name: 'System Administrator',
      password: hashedPassword,
      employeeId: 'ADMIN001',
      isAdmin: true,
      locationId: dortmund.id,
    });

    // Create test users
    const testUsers = [
      {
        email: 'frank.mueller@big-direkt.de',
        name: 'Frank Müller',
        employeeId: 'EMP001',
        locationId: dortmund.id,
      },
      {
        email: 'anna.schmidt@big-direkt.de',
        name: 'Anna Schmidt',
        employeeId: 'EMP002',
        locationId: dortmund.id,
      },
      {
        email: 'thomas.weber@big-direkt.de',
        name: 'Thomas Weber',
        employeeId: 'EMP003',
        locationId: duesseldorf.id,
      },
    ];

    for (const userData of testUsers) {
      const userPassword = await bcrypt.hash('password123', 12);
      await User.create({
        ...userData,
        password: userPassword,
      });
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Locations: 2 (Dortmund, Düsseldorf)`);
    console.log(`- Buildings: 2`);
    console.log(`- Floors: ${dortmundFloors.length + duesseldorfFloors.length}`);
    console.log(`- Total Desks: ${deskCounter - 1}`);
    console.log(`- Total Rooms: ${roomCounter - 1}`);
    console.log(`- Users: ${testUsers.length + 1} (including admin)`);
    console.log('\n🔑 Admin Credentials:');
    console.log('Email: admin@big-direkt.de');
    console.log('Password: admin123');
    console.log('\n🔑 Test User Credentials:');
    console.log('Email: frank.mueller@big-direkt.de');
    console.log('Password: password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
};

seedData();

# BIG direkt gesund Room & Desk Booking App

A comprehensive room and desk booking application built for BIG direkt gesund, supporting Activity-Based Working (ABW) environments across Dortmund and Düsseldorf locations.

## 🏗️ Architecture

- **Backend**: Node.js + Express + PostgreSQL + Sequelize ORM
- **Frontend**: React + TypeScript + Material-UI + TanStack Query
- **Authentication**: JWT-based authentication
- **Database**: PostgreSQL with proper indexing for performance

## 📋 Features

### Core Features
- ✅ **Visual Floor Map**: Interactive map showing desk and room availability
- ✅ **Real-time Booking**: Book desks and rooms with availability checking
- ✅ **User Management**: Role-based access (User/Admin)
- ✅ **Multi-location Support**: Dortmund and Düsseldorf locations
- ✅ **Booking Management**: View, cancel, and manage bookings
- ✅ **Admin Dashboard**: User and booking management

### Technical Features
- ✅ **RESTful API**: Clean API design following REST principles
- ✅ **Data Validation**: Comprehensive input validation and error handling
- ✅ **Security**: Helmet, rate limiting, CORS protection
- ✅ **Performance**: Database indexing and query optimization
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup PostgreSQL database**
   ```bash
   # Create database
   createdb room_booking
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE room_booking;
   ```

4. **Configure environment**
   ```bash
   # Copy and edit environment file
   cp .env.example .env
   
   # Edit .env file with your database credentials
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the backend server**
   ```bash
   npm run dev
   ```

   The backend will be running at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the frontend development server**
   ```bash
   npm start
   ```

   The frontend will be running at `http://localhost:3000`

## 🔑 Demo Credentials

After seeding the database, you can use these credentials:

**Admin User:**
- Email: `admin@big-direkt.de`
- Password: `admin123`

**Regular User:**
- Email: `frank.mueller@big-direkt.de`
- Password: `password123`

## 📊 Database Schema

### Core Tables
- **users**: User accounts and authentication
- **locations**: Office locations (Dortmund, Düsseldorf)
- **buildings**: Buildings within locations
- **floors**: Floors within buildings
- **space_types**: Types of spaces (Desk, Project Room)
- **spaces**: Individual bookable spaces
- **bookings**: Booking records with time slots

### Sample Data
- **2 Locations**: Dortmund (~660 users, ~50 rooms) and Düsseldorf (~60 users, ~5 rooms)
- **~720 Desks**: Distributed across multiple floors
- **~55 Project Rooms**: Various capacities with different features
- **Test Users**: Ready-to-use demo accounts

## 🗂️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `GET /api/auth/me` - Get current user

### Locations & Spaces
- `GET /api/locations` - Get all locations
- `GET /api/locations/:id/buildings/:buildingId/floors` - Get floors
- `GET /api/spaces/floors/:floorId` - Get spaces for floor with availability

### Bookings
- `GET /api/bookings/my-bookings` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `DELETE /api/bookings/:id` - Cancel booking

### Admin
- `GET /api/users` - Get all users (admin only)
- `GET /api/bookings` - Get all bookings (admin only)

## 🎨 UI Components

### Key Pages
1. **Dashboard**: Overview of user's bookings and quick actions
2. **Interactive Map**: Visual floor plan with real-time availability
3. **My Bookings**: Manage personal reservations
4. **Admin Panel**: System administration tools

### Features
- **Responsive Design**: Adapts to different screen sizes
- **Material-UI**: Modern, accessible components
- **Real-time Updates**: Live availability checking
- **Intuitive Navigation**: Easy-to-use interface

## ⚙️ Configuration

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=room_booking
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

**Frontend**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Controlled cross-origin requests
- **Input Validation**: Comprehensive data validation
- **SQL Injection Prevention**: Sequelize ORM protection

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Set production values for all environment variables
2. **Database**: Use managed PostgreSQL service (AWS RDS, etc.)
3. **SSL/TLS**: Enable HTTPS for production
4. **Monitoring**: Add application monitoring and logging
5. **Backup**: Implement database backup strategy

### Docker Support
```dockerfile
# Backend Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📈 Performance Optimizations

- **Database Indexing**: Optimized queries for booking availability
- **Query Optimization**: Efficient joins and filtering
- **Caching**: Frontend query caching with TanStack Query
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Optimized assets for fast loading

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests  
cd frontend
npm test
```

## 📝 Development Workflow

1. **Feature Development**: Create feature branches
2. **Code Review**: Pull request process
3. **Testing**: Automated and manual testing
4. **Deployment**: Staged deployment process

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
- Verify PostgreSQL is running
- Check database credentials in .env
- Ensure database exists

**Frontend API Errors**
- Verify backend is running on port 5000
- Check CORS configuration
- Verify API endpoint URLs

**Authentication Issues**
- Check JWT secret configuration
- Verify token storage in localStorage
- Check token expiration settings

## 📞 Support

For technical support or questions about this implementation:

1. Check the troubleshooting section above
2. Review the API documentation
3. Check console logs for error details
4. Verify environment configuration

## 🔄 Future Enhancements

### Planned Features
- [ ] Calendar integration (Outlook, Google Calendar)
- [ ] Mobile app (React Native)
- [ ] Advanced reporting and analytics
- [ ] Room equipment management
- [ ] Automated cleaning schedules
- [ ] Booking templates and recurring bookings
- [ ] Push notifications
- [ ] Integration with building management systems

### Technical Improvements
- [ ] Microservices architecture
- [ ] GraphQL API
- [ ] Real-time updates with WebSockets
- [ ] Advanced caching strategies
- [ ] Performance monitoring
- [ ] Automated testing suite

## 📄 License

This project is developed for BIG direkt gesund internal use.

---

**Version**: 1.0  
**Last Updated**: June 2025  
**Developed by**: Internal Development Team

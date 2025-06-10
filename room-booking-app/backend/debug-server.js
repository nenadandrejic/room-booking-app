// Step-by-step server debugging
require('dotenv').config();
console.log('1. Environment loaded');

const express = require('express');
console.log('2. Express loaded');

const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
console.log('3. Middleware packages loaded');

const { sequelize } = require('./src/models');
console.log('4. Models loaded');

const errorHandler = require('./src/middleware/errorHandler');
console.log('5. Error handler loaded');

const authRoutes = require('./src/routes/auth');
const locationRoutes = require('./src/routes/locations');
const spaceRoutes = require('./src/routes/spaces');
const bookingRoutes = require('./src/routes/bookings');
const userRoutes = require('./src/routes/users');
console.log('6. All routes loaded');

const app = express();
console.log('7. Express app created');

const PORT = process.env.PORT || 5001;
console.log('8. Port configured:', PORT);

// Apply middleware step by step
app.use(helmet());
console.log('9. Helmet middleware applied');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);
console.log('10. Rate limiting applied');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
console.log('11. CORS applied');

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
console.log('12. Body parsing middleware applied');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}
console.log('13. Logging middleware applied');

app.get('/health', (req, res) => {
  res.json({
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});
console.log('14. Health route added');

app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
console.log('15. API routes mounted');

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});
console.log('16. 404 handler added');

app.use(errorHandler);
console.log('17. Error handler added');

const startServer = async () => {
  try {
    console.log('18. Starting server function...');
    
    await sequelize.authenticate();
    console.log('19. Database connection established');

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('20. Database synchronized');
    }

    app.listen(PORT, () => {
      console.log('21. ✅ Server running on port', PORT);
      console.log('22. 🏥 Health check: http://localhost:' + PORT + '/health');
      console.log('23. 📖 API base URL: http://localhost:' + PORT + '/api');
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

console.log('24. Calling startServer...');
startServer();

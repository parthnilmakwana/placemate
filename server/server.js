const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const helmet = require('helmet');

// Load environment variables
dotenv.config();

// Fail-fast if critical environment variables are missing
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
  process.exit(1);
}

// Connect to database only if not in test mode (tests use in-memory DB)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();
const { globalLimiter } = require('./middleware/rateLimiter');

// Middlewares
app.use(helmet()); // Secure HTTP headers
app.use(globalLimiter); // Apply rate limiter to all API requests
const allowedOrigins = [
  'https://placemate.me',
  'https://www.placemate.me',
  'http://localhost:5173'
];

if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Incoming request Origin:', origin);
    }
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'PlaceMate API server is running smoothly',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mounting authentication router
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const profileRoutes = require('./routes/profileRoutes');
app.use('/api/profile', profileRoutes);

const portfolioRoutes = require('./routes/portfolioRoutes');
app.use('/api/portfolio', portfolioRoutes);

const resumeRoutes = require('./routes/resumeRoutes');
app.use('/api/resume', resumeRoutes);

const jobRoutes = require('./routes/jobRoutes');
app.use('/api/jobs', jobRoutes);

const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);

const feedbackRoutes = require('./routes/feedbackRoutes');
app.use('/api/feedback', feedbackRoutes);

const seoRoutes = require('./routes/seoRoutes');
app.use('/api/seo', seoRoutes);


// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

const path = require('path');
const seoBotMiddleware = require('./middleware/seoBotMiddleware');

// Start Server only if not in test environment
let server;
const PORT = process.env.PORT || 5000;
const { initScheduler } = require('./utils/scheduler');

// Production Front-end serving with Bot Interception
const fs = require('fs');
const clientBuildPath = path.join(__dirname, '../client/dist');

if (process.env.NODE_ENV === 'production' && fs.existsSync(clientBuildPath)) {
  // Use our bot middleware to serve static HTML to crawlers
  app.use(seoBotMiddleware);
  
  // Serve static React build files
  app.use(express.static(clientBuildPath));
  
  // Wildcard handler for SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
}


if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    // Initialize background automated cron scheduler
    initScheduler();
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Export app for testing
module.exports = app;

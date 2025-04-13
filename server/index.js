require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Security middleware
app.use(helmet());
app.use(morgan('combined'));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://url-shortener-xi-sage.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Request ID middleware
app.use((req, res, next) => {
  req.requestId = uuidv4();
  next();
});

// Body parsing middleware
app.use(bodyParser.json({ limit: '10kb' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with improved configuration
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
};

mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Models
const User = require('./models/User');
const ShortUrl = require('./models/ShortUrl');
const Click = require('./models/Click');

// Create/update hardcoded user with improved security
const createHardcodedUser = async () => {
  try {
    const hashedPassword = await bcrypt.hash('Test123', 12);
    await User.findOneAndUpdate(
      { email: 'test@email.com' },
      { 
        email: 'test@email.com',
        password: hashedPassword,
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        upsert: true,
        new: true,
        setDefaultsOnInsert: true 
      }
    );
    console.log('Test user created/updated successfully');
  } catch (err) {
    console.error('Error creating test user:', err);
  }
};

// Initialize after DB connection
mongoose.connection.once('open', () => {
  createHardcodedUser();
});

// Health check endpoint with improved response
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    requestId: req.requestId
  });
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/url', require('./routes/url'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/admin', require('./routes/admin'));

// Enhanced redirect route with click tracking
app.get('/:code', async (req, res) => {
  try {
    const startTime = Date.now();
    const { code } = req.params;

    // 1. Find the URL with caching consideration
    const url = await ShortUrl.findOne({ urlCode: code }).cache(30); // 30 second cache

    if (!url) {
      console.warn(`URL not found for code: ${code}`);
      return res.status(404).json({ 
        error: 'URL not found',
        requestId: req.requestId
      });
    }

    // 2. Check expiration
    if (url.expirationDate && new Date(url.expirationDate) < new Date()) {
      return res.status(410).json({ 
        error: 'Link expired',
        requestId: req.requestId
      });
    }

    // 3. Record the click with error handling
    const clickData = {
      urlId: url._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referer'),
      timestamp: new Date(),
      requestId: req.requestId,
      geoLocation: req.headers['cf-ipcountry'] || null
    };

    try {
      await Click.create(clickData);
      url.clicks++;
      await url.save();
    } catch (err) {
      console.error('Click tracking error:', err);
      // Continue with redirect even if tracking fails
    }

    // 4. Log performance
    console.log(`Redirect processed in ${Date.now() - startTime}ms`);

    // 5. Redirect to original URL
    return res.redirect(301, url.longUrl);

  } catch (err) {
    console.error(`Redirect error [${req.requestId}]:`, err);
    return res.status(500).json({ 
      error: 'Internal server error',
      requestId: req.requestId
    });
  }
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    requestId: req.requestId,
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`Server error [${req.requestId}]:`, err);
  
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;
  
  res.status(statusCode).json({
    error: message,
    requestId: req.requestId,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS configured for: ${corsOptions.origin.join(', ')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;
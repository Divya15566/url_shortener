require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();

app.get('/', (req, res) => {
  res.send('Backend is live 🚀');
});


// Enhanced CORS configuration
app.use(cors({
  origin: 'https://url-shortener-xi-sage.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Models
const User = require('./models/User');
const ShortUrl = require('./models/ShortUrl');
const Click = require('./models/Click');

// Create/update hardcoded user
const createHardcodedUser = async () => {
  try {
    const hashedPassword = await bcrypt.hash('Test123', 10);
    await User.updateOne(
      { email: 'test@email.com' },
      { 
        $set: { 
          email: 'test@email.com',
          password: hashedPassword 
        } 
      },
      { upsert: true }
    );
    console.log('User created/updated successfully');
  } catch (err) {
    console.error('Error creating user:', err);
  }
};

// Initialize after DB connection
mongoose.connection.once('open', () => {
  createHardcodedUser();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/url', require('./routes/url'));
app.use('/api/analytics', require('./routes/analytics'));

// Single, improved redirect route with click tracking
app.get('/:code', async (req, res) => {
  try {
    // 1. Find the URL
    const url = await ShortUrl.findOne({ urlCode: req.params.code });
    
    if (!url) {
      return res.status(404).send('URL not found');
    }

    // 2. Check expiration
    if (url.expirationDate && new Date(url.expirationDate) < new Date()) {
      return res.status(410).send('Link expired');
    }

    // 3. Record the click
    try {
      await Click.create({
        urlId: url._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referer'),
        timestamp: new Date()
      });
      
      // 4. Update click count
      url.clicks++;
      await url.save();
    } catch (err) {
      console.error('Click tracking error:', err);
      // Continue with redirect even if tracking fails
    }

    // 5. Redirect to original URL
    return res.redirect(url.longUrl);
    
  } catch (err) {
    console.error('Redirect error:', err);
    return res.status(500).send('Server error');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS configured for: http://localhost:3000`);
});
const mongoose = require('mongoose');
const { isMobile } = require('../utils/deviceDetector'); // You'll need to create this

const clickSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShortUrl',
    required: true
  },
  ipAddress: String,
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'bot', 'other'],
    default: 'other'
  },
  browser: String,
  os: String,
  country: String,
  city: String,
  referrer: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Add pre-save hook to detect device type
clickSchema.pre('save', function(next) {
  const userAgent = this.userAgent || '';
  this.deviceType = isMobile(userAgent) ? 'mobile' : 'desktop';
  next();
});

module.exports = mongoose.model('Click', clickSchema);
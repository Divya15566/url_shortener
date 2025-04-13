const express = require('express');
const shortid = require('shortid');
const validUrl = require('valid-url');
const auth = require('../middleware/auth');
const ShortUrl = require('../models/ShortUrl');
const router = express.Router();

// Create short URL
router.post('/shorten', auth, async (req, res) => {
  const { longUrl, customAlias, expirationDate } = req.body;
  
  // Validate URL
  if (!validUrl.isUri(longUrl)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  
  try {
    // Check if custom alias exists
    if (customAlias) {
      const existingUrl = await ShortUrl.findOne({ urlCode: customAlias });
      if (existingUrl) {
        return res.status(400).json({ error: 'Custom alias already in use' });
      }
    }
    
    // Create URL code
    const urlCode = customAlias || shortid.generate();
    const baseUrl = process.env.BASE_URL || 'https://url-shortener-dx3x.onrender.com';
    const shortUrl = `${baseUrl}/${urlCode}`;
    
    // Create new short URL
    const newUrl = new ShortUrl({
      longUrl,
      shortUrl,
      urlCode,
      userId: req.user.userId,
      expirationDate: expirationDate || null,
      clicks: 0 // Initialize click count
    });
    
    await newUrl.save();
    res.status(201).json({
      success: true,
      data: newUrl
    });
  } catch (err) {
    console.error('URL shortening error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error during URL creation' 
    });
  }
});

// Get user's URLs
router.get('/myurls', auth, async (req, res) => {
  try {
    const urls = await ShortUrl.find({ userId: req.user.userId })
      .sort({ createdAt: -1 }) // Newest first
      .lean()
      .select('longUrl shortUrl urlCode clicks createdAt expirationDate'); // Only necessary fields
    
    res.status(200).json({
      success: true,
      count: Array.isArray(urls) ? urls : [],
      data: urls
    });
  } catch (err) {
    console.error('Fetch URLs error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve URLs',
      data: [],
      count: 0
    });
  }
});

module.exports = router;
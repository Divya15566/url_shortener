const express = require('express');
const router = express.Router();
const ShortUrl = require('../models/ShortUrl');
const Click = require('../models/Click');
const auth = require('../middleware/auth');

router.get('/:urlCode', auth, async (req, res) => {
  try {
    // 1. Get the URL
    const url = await ShortUrl.findOne({ 
      urlCode: req.params.urlCode,
      userId: req.user.userId
    }).lean();

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // 2. Get all clicks for this URL
    const clicks = await Click.find({ urlId: url._id })
      .sort({ timestamp: -1 })
      .limit(50) // Limit to recent 50 clicks
      .lean();

    // 3. Aggregate data for charts
    const clicksOverTime = await Click.aggregate([
      { $match: { urlId: url._id } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const devices = await Click.aggregate([
      { $match: { urlId: url._id } },
      { $group: {
          _id: "$deviceType",
          count: { $sum: 1 }
        }
      }
    ]);

    const browsers = await Click.aggregate([
      { $match: { urlId: url._id } },
      { $group: {
          _id: "$browser",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      url,
      totalClicks: clicks.length,
      clicks,
      clicksOverTime,
      devices,
      browsers
    });

  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
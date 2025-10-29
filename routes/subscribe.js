const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
// const Subscriber = require('../models/subscriber');
// POST /api/subscribe
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if email already exists
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already subscribed' });
    }

    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

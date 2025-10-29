    const express = require('express');
    const router = express.Router();
    const Contact = require('../models/contact');

    // POST /api/contact
    router.post('/', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !message) {
        return res.status(400).json({ error: 'All required fields must be filled' });
        }

        const newContact = new Contact({ name, email, phone, message });
        await newContact.save();

        res.status(201).json({ message: 'Contact form submitted successfully!' });
    } catch (err) {
        console.error('Error saving contact:', err);
        res.status(500).json({ error: 'Server error' });
    }
    });

    module.exports = router;

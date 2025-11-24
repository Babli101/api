const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// -----------------------------
// Middleware
// -----------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// Static file serving for uploads
// -----------------------------
app.use('/uploads/projects', express.static(path.join(__dirname, 'uploads', 'projects')));
// -----------------------------
// Routes
// -----------------------------
const projectRoutes = require('./routes/projectRoutes');
const subscribeRoute = require('./routes/subscribe');
const contactRoutes = require('./routes/contactRoutes');
const loginRoutes = require('./routes/loginRoutes');

app.use('/api/projects', projectRoutes);
app.use('/api/subscribe', subscribeRoute);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', loginRoutes);

app.get('/', (req, res) => {
  res.send('Explore Realty API is running...');
});

// -----------------------------
// Database
// -----------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

// -----------------------------
// Start Server
// -----------------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// -----------------------
// Middleware
// -----------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------
// Upload Setup
// -----------------------
const uploadsDir = path.join(__dirname, 'uploads', 'projects');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderName = req.body.projectName
      ? req.body.projectName.replace(/\s+/g, '-')
      : 'project-' + Date.now();
    const folderPath = path.join(uploadsDir, folderName);
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${uniqueSuffix}-${safeName}`);
  }
});

const upload = multer({ storage });

// -----------------------
// Static Files
// -----------------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -----------------------
// Default Root Route (FIX)
// -----------------------
app.get('/', (req, res) => {
  res.send('Explore Realty API is running...');
});

// -----------------------
// Routes
// -----------------------
const projectRoutes = require('./routes/projectRoutes');
const subscribeRoute = require('./routes/subscribe');
const contactRoutes = require('./routes/contactRoutes');
const loginRoutes = require('./routes/loginRoutes');

app.use('/api/projects', projectRoutes);
app.use('/api/subscribe', subscribeRoute);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', loginRoutes);

// -----------------------
// MongoDB Connection
// -----------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

// -----------------------
// Error Handler
// -----------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// -----------------------
// Start Server
// -----------------------
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);

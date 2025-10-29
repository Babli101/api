const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads folder for projects
const uploadsDir = path.join(__dirname, 'uploads', 'projects');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer storage for project uploads
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
    cb(null, uniqueSuffix + '-' + safeName);
  }
});

const upload = multer({ storage });

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -----------------------
// Routes
// -----------------------
const projectRoutes = require('./routes/projectRoutes');
app.use('/api/projects', projectRoutes);

const subscribeRoute = require('./routes/subscribe');
app.use('/api/subscribe', subscribeRoute);

const contactRoutes = require('./routes/contactRoutes');
app.use('/api/contact', contactRoutes);

// -----------------------
// MongoDB Connection
// -----------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

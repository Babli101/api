const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// Storage Setup
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'explore-realty',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif', 'pdf', 'docx'],
  },
});

const upload = multer({ storage });

module.exports = { upload, cloudinary };

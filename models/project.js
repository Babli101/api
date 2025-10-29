const mongoose = require('mongoose');

const GalleryItemSchema = new mongoose.Schema({
  url: String,
  filename: String
});

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  developer: String,
  rera: String,
  size: String,
  category: { type: String, enum: ['residential', 'commercial'] },
  status: { type: String, enum: ['trending', 'upcoming', 'newlyLaunched'] },
  // Prices
  price1bhk: String,
  price2bhk: String,
  price3bhk: String,
  price4bhk: String,
  retailPrice: String,
  officePrice: String,
  description: String,
  highlight: String,
  location: {
    main: String,
    location1: String,
    location2: String,
    location3: String,
    location4: String,
    location5: String,
    mapEmbed: String
  },
  gallery: [GalleryItemSchema],
  brochure: {
    url: String,
    filename: String
  },
  possession: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);

const express = require('express');
const router = express.Router();
const multer = require('multer');
const Project = require('../models/project');
const path = require('path');
const fs = require('fs');

// ---------------------------------------------
// Upload folder (root/uploads/projects/...)
// ---------------------------------------------
const uploadsDir = path.join(__dirname, '..', 'uploads', 'projects');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ---------------------------------------------
// Multer Storage
// ---------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const projectFolder = req.body.name
      ? req.body.name.replace(/\s+/g, '-')
      : ('project-' + Date.now());

    const folder = path.join(uploadsDir, projectFolder);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-');
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + safeName);
  }
});

const upload = multer({ storage });

// ---------------------------------------------
// ADD PROJECT
// ---------------------------------------------
router.post(
  '/',
  upload.fields([
    { name: 'gallery', maxCount: 20 },
    { name: 'brochure', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const data = req.body;

      // FIX → Generate correct relative URL
      const gallery = req.files['gallery']
        ? req.files['gallery'].map(f => ({
            url: `/uploads/projects/${path.basename(path.dirname(f.path))}/${path.basename(f.filename)}`,
            filename: f.originalname
          }))
        : [];

      const brochure = req.files['brochure']
        ? {
            url: `/uploads/projects/${path.basename(path.dirname(req.files['brochure'][0].path))}/${req.files['brochure'][0].filename}`,
            filename: req.files['brochure'][0].originalname
          }
        : null;

      const location = {
        main: data.location,
        location1: data.location1,
        location2: data.location2,
        location3: data.location3,
        location4: data.location4,
        location5: data.location5,
        mapEmbed: data.mapEmbed
      };

      const project = new Project({
        name: data.name,
        developer: data.developer,
        rera: data.rera,
        size: data.size,
        category: data.category,
        status: data.status,
        price1bhk: data.price1bhk,
        price2bhk: data.price2bhk,
        price3bhk: data.price3bhk,
        price4bhk: data.price4bhk,
        retailPrice: data.retailPrice,
        officePrice: data.officePrice,
        description: data.description,
        highlight: data.highlight,
        location,
        possession: data.possession,
        gallery,
        brochure
      });

      await project.save();

      res.status(201).json({ success: true, project });

    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// ---------------------------------------------
// GET ALL PROJECTS
// ---------------------------------------------
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------------------------------------
// GET SINGLE PROJECT
// ---------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Not found' });

    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------------------------------------
// DELETE PROJECT
// ---------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Not found' });

    // Delete gallery images
    project.gallery.forEach(img => {
      const filePath = path.join(__dirname, '..', img.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    // Delete brochure
    if (project.brochure) {
      const filePath = path.join(__dirname, '..', project.brochure.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Project.deleteOne({ _id: project._id });
    res.json({ success: true, message: 'Deleted' });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

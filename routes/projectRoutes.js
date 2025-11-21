const express = require('express');
const router = express.Router();
const multer = require('multer');
const Project = require('../models/project');
const path = require('path');
const fs = require('fs');

// ===============================
// 📁 Upload Directory Setup
// ===============================
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ===============================
// 📸 Multer Configuration
// ===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});

const upload = multer({ storage });

// ===============================
// ➕ Add New Project
// ===============================
router.post(
  '/',
  upload.fields([
    { name: 'gallery', maxCount: 15 },
    { name: 'brochure', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const data = req.body;

      const gallery = req.files['gallery']
        ? req.files['gallery'].map(f => ({
          url: `/uploads/${f.filename}`,
          filename: f.originalname
        }))
        : [];

      const brochure = req.files['brochure']
        ? {
          url: `/uploads/${req.files['brochure'][0].filename}`,
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
        gallery,
        brochure,
        possession: data.possession
      });

      await project.save();
      res.status(201).json({ success: true, project });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  }
);

// ===============================
// 📜 Get All Projects
// ===============================
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===============================
// 📋 Get Single Project
// ===============================
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===============================
// ❌ Delete Project by ID
// ===============================
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Delete gallery files
    if (project.gallery && project.gallery.length > 0) {
      project.gallery.forEach(img => {
        if (!img || !img.url) {
          console.warn('⚠️ Skipping image with missing URL:', img);
          return;
        }

        const filePath = path.join(uploadsDir, path.basename(img.url));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }


    // Delete brochure file
    if (project.brochure && project.brochure.url) {
      const filePath = path.join(uploadsDir, path.basename(project.brochure.url));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await project.deleteOne();
    res.json({ message: '🗑️ Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;

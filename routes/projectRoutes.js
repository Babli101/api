const express = require('express');
const router = express.Router();
const Project = require('../models/project');
const { upload } = require('../config/cloudinary'); // Cloudinary Upload
const path = require('path');

// ---------------------------------------------
// ADD PROJECT (Cloudinary Upload)
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

      // Cloudinary gallery
      const gallery = req.files["gallery"]
        ? req.files["gallery"].map(f => ({
            url: f.path,        // Cloudinary URL
            filename: f.filename
          }))
        : [];

      // Cloudinary brochure
      const brochure = req.files["brochure"]
        ? {
            url: req.files["brochure"][0].path,
            filename: req.files["brochure"][0].filename
          }
        : null;

      const location = {
        main: data.location,
        location1: data.location1,
        location2: data.location2,
        location3: data.location3,
        location4: data.location4,
        location5: data.location5,
        mapEmbed: data.mapEmbed,
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
      console.error(error);
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
    if (!project)
      return res.status(404).json({ success: false, message: 'Not found' });

    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------------------------------------
// DELETE PROJECT (Cloudinary)
// ---------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ success: false, message: 'Not found' });

    // Cloudinary files cannot be deleted with file unlink
    // (Needs public_id, optional future feature)

    await Project.deleteOne({ _id: project._id });
    res.json({ success: true });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

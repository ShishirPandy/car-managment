const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const mongoose=require('mongoose');
// Create a car
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Use timestamp to avoid filename conflicts
  }
});

// Initialize multer with file filter and storage configuration
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size (10MB)
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept only image files
    } else {
      cb(new Error('Invalid file type'), false); // Reject non-image files
    }
  }
});

// Use the upload middleware for handling image uploads
router.post('/', authMiddleware, upload.array('images', 5), async (req, res) => {
  const { title, description, tags } = req.body;
  const images = req.files.map(file => file.path); // Store file paths
  try {
    const car = new Car({ title, description, tags, images, user: req.user.id });
    await car.save();
    res.json(car);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
// Get all cars for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cars = await Car.find({ user: req.user.id });
    res.json(cars);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Search cars
router.get('/search', authMiddleware, async (req, res) => {
  const { keyword } = req.query;
  try {
    const cars = await Car.find({
      user: req.user.id,
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { tags: { $regex: keyword, $options: 'i' } },
      ],
    });
    res.json(cars);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Update car
// router.put('/:id', authMiddleware, async (req, res) => {
//   try {
//     const car = await Car.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true });
//     res.json(car);
//   } catch (err) {
//     res.status(500).send('Server error');
//   }
// });
router.put('/:id', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    // Validate car ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send('Invalid car ID');
    }

    // Prepare update data
    const updatedData = { ...req.body };

    // Only update images if new images are provided
    if (req.files && req.files.length > 0) {
      updatedData.images = req.files.map(file => file.path); // Add file paths to images array
    }

    // Validate allowed fields
    const allowedFields = ['title', 'description', 'tags', 'images'];
    const updates = Object.keys(updatedData);
    const isValidUpdate = updates.every(field => allowedFields.includes(field));
    if (!isValidUpdate) {
      return res.status(400).send('Invalid updates');
    }

    // Find and update car document
    const car = await Car.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updatedData,
      { new: true }
    );

    if (!car) {
      return res.status(404).send('Car not found or you are not authorized to update this car');
    }

    res.json(car); // Return the updated car object, which should include images
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete car
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params; // Get car ID from URL
    console.log("Car ID to delete:", id);

    const car = await Car.findById(id);
    console.log("Car found:", car);

    if (!car) {
      console.log("Car not found in the database");
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check if the logged-in user is the owner of the car
    if (car.user.toString() !== req.user.id) {
      console.log("User not authorized to delete this car");
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Proceed with deletion
    await Car.findByIdAndDelete(id); // Delete the car by its ID
    console.log("Car deleted successfully");

    res.status(200).json({ message: 'Car deleted successfully' });
  } catch (err) {
    console.error("Error in DELETE /cars route:", err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;

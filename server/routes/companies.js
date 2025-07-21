import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Company from '../models/Company.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/logos';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload logo (no auth required for testing)
router.post('/upload/logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Return the file URL
    const fileUrl = `/uploads/logos/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Upload logo (with auth)
router.post('/upload/logo-auth', auth, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Return the file URL
    const fileUrl = `/uploads/logos/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Serve uploaded files
router.get('/uploads/logos/:filename', (req, res) => {
  const filePath = path.join(process.cwd(), 'uploads', 'logos', req.params.filename);
  res.sendFile(filePath);
});

// Get all companies
router.get('/', async (req, res) => {
  try {
    const { industry, search } = req.query;
    let query = {};
    
    if (industry && industry !== 'All') {
      query.industry = industry;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const companies = await Company.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get company by ID
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('createdBy', 'name');
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create company
router.post('/', auth, async (req, res) => {
  try {
    const { name, industry, description, logo, website } = req.body;

    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      return res.status(400).json({ message: 'Company already exists' });
    }

    const company = new Company({
      name,
      industry,
      description,
      logo,
      website,
      createdBy: req.user._id
    });

    await company.save();
    await company.populate('createdBy', 'name');

    req.io.emit('company-created', company);
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update company (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, industry, description, logo, website } = req.body;

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { name, industry, description, logo, website },
      { new: true }
    ).populate('createdBy', 'name');

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    req.io.emit('company-updated', company);
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete company (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    req.io.emit('company-deleted', req.params.id);
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
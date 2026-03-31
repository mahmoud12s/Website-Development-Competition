const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const isAuthenticated = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const Category = require('../models/Category');
const Product = require('../models/Product');

// image upload 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed.'));
  }
});

// ============= CATEGORIES =============

// import cat
router.get('/categories', isAuthenticated, async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories.' });
  }
});

// create cat
router.post('/categories', isAuthenticated, requireRole('owner'), async (req, res) => {
  try {
    const { name, description, image } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required.' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await Category.findOne({ slug });
    if (existing) return res.status(400).json({ message: 'Category already exists.' });

    const category = new Category({ name, slug, description, image });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category.' });
  }
});

// edit cat
router.put('/categories/:id', isAuthenticated, requireRole('owner'), async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const update = {};
    if (name) {
      update.name = name;
      update.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) update.description = description;
    if (image !== undefined) update.image = image;

    const category = await Category.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category.' });
  }
});

// remove
router.delete('/categories/:id', isAuthenticated, requireRole('owner'), async (req, res) => {
  try {
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. It has ${productCount} product(s). Remove them first.`
      });
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    res.json({ message: 'Category deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category.' });
  }
});

// ============= PRODUCTS =============

// import products 
router.get('/products', isAuthenticated, async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products.' });
  }
});

// add new product
router.post('/products', isAuthenticated, requireRole('owner'), upload.array('images', 5), async (req, res) => {
  try {
    const { name, price, description, category, stock, featured, imageUrls } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(f => `/uploads/${f.filename}`);
    }
    if (imageUrls) {
      const urls = typeof imageUrls === 'string' ? JSON.parse(imageUrls) : imageUrls;
      images = [...images, ...urls];
    }
    const product = new Product({
      name, slug, price: Number(price), description,
      images, category, stock: Number(stock) || 0,
      featured: featured === 'true' || featured === true
    });
    await product.save();

    const populated = await Product.findById(product._id).populate('category', 'name slug');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Error creating product.' });
  }
});

// edit product 
router.put('/products/:id', isAuthenticated, requireRole('owner'), upload.array('images', 5), async (req, res) => {
  try {
    const { name, price, description, category, stock, featured, soldOut, imageUrls, existingImages } = req.body;
    const update = {};

    if (name) {
      update.name = name;
      update.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    }
    if (price !== undefined) update.price = Number(price);
    if (description !== undefined) update.description = description;
    if (category) update.category = category;
    if (stock !== undefined) update.stock = Number(stock);
    if (featured !== undefined) update.featured = featured === 'true' || featured === true;
    if (soldOut !== undefined) update.soldOut = soldOut === 'true' || soldOut === true;

    let images = [];
    if (existingImages) {
      images = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
    }
    if (req.files && req.files.length > 0) {
      images = [...images, ...req.files.map(f => `/uploads/${f.filename}`)];
    }
    if (imageUrls) {
      const urls = typeof imageUrls === 'string' ? JSON.parse(imageUrls) : imageUrls;
      images = [...images, ...urls];
    }
    if (images.length > 0 || existingImages) update.images = images;

    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('category', 'name slug');
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product.' });
  }
});

// remove product
router.delete('/products/:id', isAuthenticated, requireRole('owner'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product.' });
  }
});

// ============= STOCK =============

// import stock
router.get('/stock', isAuthenticated, requireRole('owner', 'stockmanager'), async (req, res) => {
  try {
    const products = await Product.find()
      .select('name stock soldOut category')
      .populate('category', 'name')
      .sort({ name: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock.' });
  }
});

// update stock 
router.put('/stock/:id', isAuthenticated, requireRole('owner', 'stockmanager'), async (req, res) => {
  try {
    const { stock, soldOut } = req.body;
    const update = {};
    if (stock !== undefined) update.stock = Number(stock);
    if (soldOut !== undefined) update.soldOut = soldOut;

    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true })
      .select('name stock soldOut category')
      .populate('category', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating stock.' });
  }
});

// ============= USERS =============
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// import users 
router.get('/users', isAuthenticated, requireRole('owner'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users.' });
  }
});

// create user 
router.post('/users', isAuthenticated, requireRole('owner'), async (req, res) => {
  try {
    const { username, password, role, displayName } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    const validRoles = ['owner', 'ordermaker', 'stockmanager'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username: username.toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'ordermaker',
      displayName: displayName || username,
    });
    await user.save();

    res.status(201).json({
      _id: user._id,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user.' });
  }
});

// remove user 
router.delete('/users/:id', isAuthenticated, requireRole('owner'), async (req, res) => {
  try {
    if (req.session.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user.' });
  }
});

// ============= CONTACT MESSAGES =============
const ContactMessage = require('../models/ContactMessage');

// get all contact messages
router.get('/messages', isAuthenticated, requireRole('owner'), async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    const unreadCount = await ContactMessage.countDocuments({ read: false });
    res.json({ messages, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages.' });
  }
});

// mark message as read
router.put('/messages/:id/read', isAuthenticated, requireRole('owner'), async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!msg) return res.status(404).json({ message: 'Message not found.' });
    res.json(msg);
  } catch (error) {
    res.status(500).json({ message: 'Error updating message.' });
  }
});

// delete message
router.delete('/messages/:id', isAuthenticated, requireRole('owner'), async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found.' });
    res.json({ message: 'Message deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message.' });
  }
});

module.exports = router;

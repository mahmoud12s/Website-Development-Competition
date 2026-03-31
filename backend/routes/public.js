const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Visit = require('../models/Visit');
const ContactMessage = require('../models/ContactMessage');

// import all cat
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories.' });
  }
});

// import all product
router.get('/products', async (req, res) => {
  try {
    const { q, category, featured, sort = '-createdAt', page = 1, limit = 20 } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) filter.category = cat._id;
    }
    if (featured === 'true') filter.featured = true;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products.' });
  }
});

// import single product using the slug name 
router.get('/products/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', 'name slug');
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product.' });
  }
});

// order post 
router.post('/orders', async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, address, items } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !address || !items || items.length === 0) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // validation
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.product}` });
      }
      if (product.soldOut || product.stock < item.quantity) {
        return res.status(400).json({ message: `${product.name} is out of stock or insufficient quantity.` });
      }

      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price
      });
      total += product.price * item.quantity;

      // stock edit
      product.stock -= item.quantity;
      if (product.stock === 0) product.soldOut = true;
      await product.save();
    }

    const order = new Order({
      customerName,
      customerEmail,
      customerPhone,
      address,
      items: orderItems,
      total
    });
    await order.save();

    res.status(201).json({
      message: 'Order placed successfully!',
      orderId: order._id,
      total: order.total
    });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ message: 'Error placing order.' });
  }
});

// contact form submission
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const contactMessage = new ContactMessage({ name, email, message });
    await contactMessage.save();
    res.status(201).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Error sending message.' });
  }
});

// visit 
router.post('/visit', async (req, res) => {
  try {
    const { page } = req.body;
    if (!page) return res.status(400).json({ message: 'Page is required.' });
    const visit = new Visit({
      page,
      ip: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || '',
      referrer: req.headers.referer || ''
    });
    await visit.save();
    res.json({ success: true });
  } catch (error) {
    // Don't let analytics break the site
    res.json({ success: false });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Visit = require('../models/Visit');

// get order data day week month 
function getDateRanges() {
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return { now, todayStart, weekStart, monthStart };
}

// analyt data 
router.get('/stats', isAuthenticated, requireRole('owner'), async (req, res) => {
  try {
    const { todayStart, weekStart, monthStart } = getDateRanges();
    let visits = { today: 0, week: 0, month: 0, total: 0, byDay: [] };
    try {
      const [visitsToday, visitsWeek, visitsMonth, visitsTotal] = await Promise.all([
        Visit.countDocuments({ createdAt: { $gte: todayStart } }),
        Visit.countDocuments({ createdAt: { $gte: weekStart } }),
        Visit.countDocuments({ createdAt: { $gte: monthStart } }),
        Visit.countDocuments(),
      ]);
      visits = { today: visitsToday, week: visitsWeek, month: visitsMonth, total: visitsTotal, byDay: [] };
      // week 
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date();
        dayStart.setDate(dayStart.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        const count = await Visit.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd } });
        visits.byDay.push({
          date: dayStart.toISOString().slice(0, 10),
          label: dayStart.toLocaleDateString('en', { weekday: 'short' }),
          count
        });
      }
    } catch (e) {
      console.error('Visits stats error:', e.message);
    }

    const allOrders = await Order.find().lean();

    // price from $ to number 
    const parsePrice = (val) => {
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const cleaned = val.replace(/[^0-9.\-]/g, '');
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    };
    let topProducts = [];
    try {
      const productMap = {};
      for (const order of allOrders) {
        if (!order.items) continue;
        for (const item of order.items) {
          const key = item.product ? item.product.toString() : (item.productName || 'unknown');
          if (!productMap[key]) {
            productMap[key] = {
              _id: item.product || null,
              productName: item.productName || '',
              totalSold: 0,
              totalRevenue: 0
            };
          }
          const qty = parseInt(item.quantity) || 0;
          const price = parsePrice(item.price);
          productMap[key].totalSold += qty;
          productMap[key].totalRevenue += price * qty;
        }
      }
      topProducts = Object.values(productMap)
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 10);

      // Fill in product images
      for (const tp of topProducts) {
        if (tp._id) {
          try {
            const prod = await Product.findById(tp._id).select('name images');
            if (prod) {
              if (!tp.productName) tp.productName = prod.name;
              tp.image = prod.images?.[0] || '';
            }
          } catch (e) { }
        }
      }
    } catch (e) {
      console.error('Top products error:', e.message);
    }

    // total orders price
    let sales = {
      today: { total: 0, count: 0 },
      week: { total: 0, count: 0 },
      month: { total: 0, count: 0 },
      allTime: { total: 0, count: 0 },
    };
    try {
      for (const order of allOrders) {
        if (order.status === 'cancelled') continue;
        const orderTotal = parsePrice(order.total);
        const orderDate = new Date(order.createdAt);

        sales.allTime.total += orderTotal;
        sales.allTime.count += 1;

        if (orderDate >= monthStart) {
          sales.month.total += orderTotal;
          sales.month.count += 1;
        }
        if (orderDate >= weekStart) {
          sales.week.total += orderTotal;
          sales.week.count += 1;
        }
        if (orderDate >= todayStart) {
          sales.today.total += orderTotal;
          sales.today.count += 1;
        }
      }
      sales.today.total = Math.round(sales.today.total * 100) / 100;
      sales.week.total = Math.round(sales.week.total * 100) / 100;
      sales.month.total = Math.round(sales.month.total * 100) / 100;
      sales.allTime.total = Math.round(sales.allTime.total * 100) / 100;
    } catch (e) {
      console.error('Sales stats error:', e.message);
    }

    res.json({ visits, topProducts, sales });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Error fetching stats.' });
  }
});

// all orders 
router.get('/', isAuthenticated, requireRole('owner', 'ordermaker'), async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    // search by order info 
    if (search && search.trim()) {
      const searchTerm = search.trim();
      const conditions = [
        { customerName: { $regex: searchTerm, $options: 'i' } },
        { customerEmail: { $regex: searchTerm, $options: 'i' } },
        { customerPhone: { $regex: searchTerm, $options: 'i' } },
      ];
      //search by _id
      if (/^[0-9a-fA-F]{24}$/.test(searchTerm)) {
        const mongoose = require('mongoose');
        conditions.push({ _id: new mongoose.Types.ObjectId(searchTerm) });
      }
      // id match 
      if (/^[0-9a-fA-F]{4,24}$/.test(searchTerm)) {
        // Search orders whose ID ends with this string
        const allOrders = await Order.find(filter).sort({ createdAt: -1 });
        const matchedByPartialId = allOrders.filter(o =>
          o._id.toString().toLowerCase().endsWith(searchTerm.toLowerCase())
        );
        if (matchedByPartialId.length > 0) {
          conditions.push({ _id: { $in: matchedByPartialId.map(o => o._id) } });
        }
      }
      filter.$or = conditions;
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      orders,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ message: 'Error fetching orders.' });
  }
});

// GET single order
router.get('/:id', isAuthenticated, requireRole('owner', 'ordermaker'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order.' });
  }
});

// update order 
router.put('/:id', isAuthenticated, requireRole('owner', 'ordermaker'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const update = {};
    if (status) update.status = status;
    if (notes !== undefined) update.notes = notes;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order.' });
  }
});

module.exports = router;


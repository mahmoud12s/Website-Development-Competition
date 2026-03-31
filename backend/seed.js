require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Category = require('./models/Category');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // make the main admin info to the mongo
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'owner',
        displayName: 'Administrator'
      });
      console.log('Created default admin user (admin / admin123)');
    } else {
      console.log('Admin user already exists, skipping...');
    }
    const roles = [
      { username: 'ordermaker', password: 'order123', role: 'ordermaker', displayName: 'Order Manager' },
      { username: 'stockmanager', password: 'stock123', role: 'stockmanager', displayName: 'Stock Manager' }
    ];

    for (const r of roles) {
      const exists = await User.findOne({ username: r.username });
      if (!exists) {
        const hashed = await bcrypt.hash(r.password, 12);
        await User.create({ username: r.username, password: hashed, role: r.role, displayName: r.displayName });
        console.log(`Created user: ${r.username} (${r.role})`);
      }
    }

    // 3 test cat buildin
    const defaultCategories = [
      { name: 'Mobile', slug: 'mobile', description: 'Smartphones and mobile devices', image: '' },
      { name: 'Laptops', slug: 'laptops', description: 'Laptops and notebooks', image: '' },
      { name: 'Accessories', slug: 'accessories', description: 'Electronics accessories and peripherals', image: '' }
    ];

    for (const cat of defaultCategories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
        console.log(`Created category: ${cat.name}`);
      }
    }


    console.log('  Owner:         admin / admin123');
    console.log('  Order Maker:   ordermaker / order123');
    console.log('  Stock Manager: stockmanager / stock123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();

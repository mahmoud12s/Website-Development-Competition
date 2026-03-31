const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');


router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // --- Validation ---
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const trimmedUsername = String(username).trim().toLowerCase();

    if (trimmedUsername.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters.' });
    }
    if (trimmedUsername.length > 30) {
      return res.status(400).json({ message: 'Username must be 30 characters or less.' });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      return res.status(400).json({ message: 'Username contains invalid characters.' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    if (String(password).length > 100) {
      return res.status(400).json({ message: 'Password is too long.' });
    }

    // --- Authentication ---
    const user = await User.findOne({ username: trimmedUsername });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role,
      displayName: user.displayName || user.username
    };

    res.json({
      message: 'Login successful',
      user: req.session.user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out.' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully.' });
  });
});

router.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ user: req.session.user });
  }
  res.status(401).json({ message: 'Not authenticated.' });
});

module.exports = router;

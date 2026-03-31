require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const connectDB = require('./config/db');
const setupSecurity = require('./middleware/security');

const app = express();
/* ============================================================
 server.js main backend file start
 ============================================================ */

connectDB();

setupSecurity(app);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Trust proxy (nginx) so secure cookies work behind reverse proxy
app.set('trust proxy', 1);

// sesion mongo save 
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60 // 1 day
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files from /dist
app.use(express.static(path.join(__dirname, 'dist')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/orders', require('./routes/orders'));
app.use('/api', require('./routes/public'));

// system check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});



// SPA catch-all: serve index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// error handel 
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  res.status(500).json({ message: 'Internal server error.' });
});

const PORT = process.env.PORT;


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on ${process.env.HOST}:${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
});

/* ============================================================
 server.js main backend file end

 ============================================================ */
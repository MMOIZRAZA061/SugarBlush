const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const MongoStore = require('connect-mongo');
const { connectDB, mongoose } = require('./db/connect');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session with MongoDB store (required for Vercel serverless)
app.use(session({
    secret: process.env.SESSION_SECRET || 'sugar-blush-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions',
        ttl: 24 * 60 * 60 // 24 hours
    }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// Static files (uploads, images, etc.)
app.use('/static', express.static(path.join(__dirname, 'public', 'static')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/custom-orders', require('./routes/customOrders'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/users', require('./routes/users'));
app.use('/api/stock', require('./routes/stock'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/upload', require('./routes/upload'));

// Serve React build (local development only)
const reactBuildPath = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(reactBuildPath)) {
    app.use(express.static(reactBuildPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(reactBuildPath, 'index.html'));
    });
}

// Start server after DB connection
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Sugar Blush Bakery running at http://localhost:${PORT}`);
        console.log(`Admin login: admin@bakery.com / admin123`);
    });
}).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

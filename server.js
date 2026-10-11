const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const { connectDB, mongoose } = require('./db/connect');
const { attachUser } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Lazy DB connection for Vercel serverless
let dbPromise = null;
function ensureDB() {
    if (!dbPromise) {
        dbPromise = connectDB();
    }
    return dbPromise;
}

// Connect to DB first, then attach user middleware
app.use('/api', async (req, res, next) => {
    try {
        await ensureDB();
        // Attach user after DB is connected
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const jwt = require('jsonwebtoken');
                const JWT_SECRET = process.env.JWT_SECRET || 'sugar-blush-jwt-secret-2024';
                const decoded = jwt.verify(token, JWT_SECRET);
                req.user = decoded;
            } catch (e) {
                req.user = null;
            }
        } else {
            req.user = null;
        }
        next();
    } catch (err) {
        console.error('DB connection failed:', err.message);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

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

// Serve React build (local development only - Vercel handles client build)
const reactBuildPath = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(reactBuildPath)) {
    app.use(express.static(reactBuildPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(reactBuildPath, 'index.html'));
    });
}

// Export for Vercel serverless
module.exports = app;

// Start server only in local development (not on Vercel)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Sugar Blush Bakery running at http://localhost:${PORT}`);
            console.log(`Admin login: admin@bakery.com / admin123`);
        });
    }).catch(err => {
        console.error('Failed to start server:', err);
        process.exit(1);
    });
}

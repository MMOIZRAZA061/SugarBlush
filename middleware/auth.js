const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sugar-blush-jwt-secret-2024';

function generateToken(user) {
    return jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (e) {
        return null;
    }
}

// Middleware to attach user to request from JWT token
function attachUser(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        if (decoded) {
            req.user = decoded;
        }
    }
    next();
}

// Middleware to require authentication
function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
}

// Middleware to require admin role
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

module.exports = { generateToken, verifyToken, attachUser, requireAuth, requireAdmin, JWT_SECRET };

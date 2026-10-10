const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../db/models');
const { toPlain } = require('../db/helpers');
const { generateToken } = require('../middleware/auth');
const router = express.Router();

// GET /api/auth/check
router.get('/check', (req, res) => {
    if (req.user) {
        res.json({ authenticated: true, user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role } });
    } else {
        res.json({ authenticated: false });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = generateToken(user);
        res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Login failed' });
    }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }
        const normalizedEmail = email.toLowerCase().trim();
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        const hashed = bcrypt.hashSync(password, 10);
        const maxDoc = await User.findOne().sort({ id: -1 }).select('id').lean();
        const newId = (maxDoc && maxDoc.id ? maxDoc.id : 0) + 1;
        const user = await User.create({
            id: newId,
            name,
            email: normalizedEmail,
            password: hashed,
            phone: phone || '',
            address: address || '',
            role: 'customer'
        });
        const token = generateToken(user);
        res.json({ success: true, token, user: { id: user.id, name, email: normalizedEmail, role: 'customer' } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Signup failed' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.json({ success: true });
});

// GET /api/auth/profile
router.get('/profile', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const user = await User.findOne({ id: req.user.id }).select('-password');
    res.json({ user: toPlain(user) });
});

// PUT /api/auth/profile
router.put('/profile', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const { name, phone, address } = req.body;
    await User.updateOne({ id: req.user.id }, {
        name: name || req.user.name,
        phone: phone || '',
        address: address || ''
    });
    res.json({ success: true });
});

module.exports = router;

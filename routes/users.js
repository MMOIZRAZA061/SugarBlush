const express = require('express');
const { User, Order } = require('../db/models');
const { toPlain, toPlainArray } = require('../db/helpers');
const router = express.Router();

// GET /api/users - List users (admin)
router.get('/', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const { search, role } = req.query;
        const filter = {};
        if (search) {
            const rx = new RegExp(search, 'i');
            filter.$or = [{ name: rx }, { email: rx }];
        }
        if (role) filter.role = role;
        const users = await User.find(filter).select('-password').sort({ created_at: -1 });
        res.json({ users: toPlainArray(users) });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to list users' });
    }
});

// GET /api/users/:id - Get user details (admin)
router.get('/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const user = await User.findOne({ id: parseInt(req.params.id) }).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        const orders = await Order.find({ user_id: user.id });
        const orderCount = orders.length;
        const totalSpent = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
        res.json({ user: toPlain(user), orderCount, totalSpent });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// PUT /api/users/:id - Update user (admin)
router.put('/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const { name, phone, address, role } = req.body;
        await User.updateOne({ id: parseInt(req.params.id) }, {
            name,
            phone: phone || '',
            address: address || '',
            role: role || 'customer'
        });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// DELETE /api/users/:id - Delete user (admin)
router.delete('/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        if (parseInt(req.params.id) === req.session.user.id) {
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }
        await User.deleteOne({ id: parseInt(req.params.id) });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;

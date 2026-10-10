const express = require('express');
const { CustomOrder } = require('../db/models');
const { toPlainArray } = require('../db/helpers');
const router = express.Router();

// GET /api/custom-orders - List custom orders (admin)
router.get('/', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const orders = await CustomOrder.find(filter).sort({ created_at: -1 });
        res.json({ orders: toPlainArray(orders) });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to list custom orders' });
    }
});

// POST /api/custom-orders - Submit custom order
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, description, quantity, preferred_date } = req.body;
        if (!name || !email || !description) {
            return res.status(400).json({ error: 'Name, email, and description are required' });
        }
        const userId = req.session.user ? req.session.user.id : null;
        const maxDoc = await CustomOrder.findOne().sort({ id: -1 }).select('id').lean();
        const newId = (maxDoc && maxDoc.id ? maxDoc.id : 0) + 1;
        const order = await CustomOrder.create({
            id: newId,
            user_id: userId,
            name,
            email,
            phone: phone || '',
            description,
            quantity: quantity || 1,
            preferred_date: preferred_date || null
        });
        res.json({ success: true, id: order.id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create custom order' });
    }
});

// PUT /api/custom-orders/:id/status - Update status (admin)
router.put('/:id/status', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const { status } = req.body;
        await CustomOrder.updateOne({ id: parseInt(req.params.id) }, { status });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// DELETE /api/custom-orders/:id - Delete (admin)
router.delete('/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        await CustomOrder.deleteOne({ id: parseInt(req.params.id) });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to delete custom order' });
    }
});

module.exports = router;

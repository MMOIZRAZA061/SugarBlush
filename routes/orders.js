const express = require('express');
const { Order, OrderItem, Product, User } = require('../db/models');
const { toPlain, toPlainArray } = require('../db/helpers');
const router = express.Router();

// GET /api/orders - List orders (admin)
router.get('/', async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = status ? { status } : {};
        const total = await Order.countDocuments(filter);
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const orders = await Order.find(filter)
            .sort({ created_at: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        const userIds = orders.map(o => o.user_id);
        const users = await User.find({ id: { $in: userIds } }).select('id name email').lean();
        const uMap = Object.fromEntries(users.map(u => [u.id, u]));

        const enriched = toPlainArray(orders).map(o => ({
            ...o,
            customer_name: uMap[o.user_id]?.name || '',
            customer_email: uMap[o.user_id]?.email || ''
        }));
        res.json({ orders: enriched, total, page: pageNum, limit: limitNum });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to list orders' });
    }
});

// GET /api/orders/my - My orders (customer)
router.get('/my', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    try {
        const orders = await Order.find({ user_id: req.user.id }).sort({ created_at: -1 });
        res.json({ orders: toPlainArray(orders) });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to list orders' });
    }
});

// GET /api/orders/:id - Get order details
router.get('/:id', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    try {
        const order = await Order.findOne({ id: parseInt(req.params.id) });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (order.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const user = await User.findOne({ id: order.user_id }).select('name email').lean();
        const items = await OrderItem.find({ order_id: order.id });
        const productIds = items.map(i => i.product_id);
        const products = await Product.find({ id: { $in: productIds } }).select('id name image').lean();
        const pMap = Object.fromEntries(products.map(p => [p.id, p]));
        const enrichedItems = toPlainArray(items).map(i => ({
            ...i,
            name: pMap[i.product_id]?.name || '',
            image: pMap[i.product_id]?.image || ''
        }));
        res.json({
            order: {
                ...toPlain(order),
                customer_name: user?.name || '',
                customer_email: user?.email || ''
            },
            items: enrichedItems
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to get order' });
    }
});

// PUT /api/orders/:id/status - Update order status (admin)
router.put('/:id/status', async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const { status } = req.body;
        await Order.updateOne({ id: parseInt(req.params.id) }, { status });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// DELETE /api/orders/:id - Delete order (admin)
router.delete('/:id', async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const id = parseInt(req.params.id);
        await OrderItem.deleteMany({ order_id: id });
        await Order.deleteOne({ id });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

module.exports = router;

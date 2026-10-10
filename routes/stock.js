const express = require('express');
const { Product, Category, StockLog } = require('../db/models');
const { toPlainArray } = require('../db/helpers');
const router = express.Router();

// GET /api/stock - Get stock levels (admin)
router.get('/', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const products = await Product.find().sort({ stock: 1 });
        const catIds = [...new Set(products.map(p => p.category_id).filter(Boolean))];
        const cats = await Category.find({ id: { $in: catIds } }).select('id name').lean();
        const catMap = Object.fromEntries(cats.map(c => [c.id, c.name]));
        const enriched = toPlainArray(products).map(p => ({
            ...p,
            category_name: p.category_id ? (catMap[p.category_id] || '') : ''
        }));
        res.json({ products: enriched });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to get stock' });
    }
});

// POST /api/stock/update - Update stock (admin)
router.post('/update', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const { product_id, stock, reason } = req.body;
        const product = await Product.findOne({ id: product_id });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        const change = stock - product.stock;
        await Product.updateOne({ id: product_id }, { stock });
        const maxDoc = await StockLog.findOne().sort({ id: -1 }).select('id').lean();
        const newId = (maxDoc && maxDoc.id ? maxDoc.id : 0) + 1;
        await StockLog.create({
            id: newId,
            product_id,
            change_amount: change,
            reason: reason || 'Manual adjustment'
        });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update stock' });
    }
});

// GET /api/stock/logs - Get stock logs (admin)
router.get('/logs', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const { product_id, limit = 50 } = req.query;
        const filter = product_id ? { product_id: parseInt(product_id) } : {};
        const logs = await StockLog.find(filter).sort({ created_at: -1 }).limit(parseInt(limit));
        const productIds = logs.map(l => l.product_id);
        const products = await Product.find({ id: { $in: productIds } }).select('id name').lean();
        const pMap = Object.fromEntries(products.map(p => [p.id, p.name]));
        const enriched = toPlainArray(logs).map(l => ({ ...l, product_name: pMap[l.product_id] || '' }));
        res.json({ logs: enriched });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to get logs' });
    }
});

// GET /api/stock/report - Stock report (admin)
router.get('/report', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const products = await Product.find().sort({ stock: 1 });
        const catIds = [...new Set(products.map(p => p.category_id).filter(Boolean))];
        const cats = await Category.find({ id: { $in: catIds } }).select('id name').lean();
        const catMap = Object.fromEntries(cats.map(c => [c.id, c.name]));
        const report = toPlainArray(products).map(p => ({
            ...p,
            category_name: p.category_id ? (catMap[p.category_id] || '') : ''
        }));
        const lowStock = report.filter(p => p.stock <= 5);
        const outOfStock = report.filter(p => p.stock === 0);
        res.json({ report, lowStock, outOfStock });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to get report' });
    }
});

module.exports = router;

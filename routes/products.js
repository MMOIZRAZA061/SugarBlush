const express = require('express');
const { Product, Category } = require('../db/models');
const { toPlain, toPlainArray } = require('../db/helpers');
const router = express.Router();

// GET /api/products - List products (public)
router.get('/', async (req, res) => {
    try {
        const { category, featured, new_arrivals, search, page = 1, limit = 12 } = req.query;
        const filter = { is_active: true };
        if (featured === '1') filter.is_featured = true;
        if (new_arrivals === '1') filter.is_new = true;
        if (search) {
            const rx = new RegExp(search, 'i');
            filter.$or = [{ name: rx }, { description: rx }];
        }
        if (category) {
            const cat = await Category.findOne({ name: category }).select('id').lean();
            if (!cat) return res.json({ products: [], total: 0, page: parseInt(page), limit: parseInt(limit) });
            filter.category_id = cat.id;
        }

        const total = await Product.countDocuments(filter);
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const docs = await Product.find(filter)
            .sort({ created_at: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        // Attach category_name
        const catIds = [...new Set(docs.map(d => d.category_id).filter(Boolean))];
        const cats = await Category.find({ id: { $in: catIds } }).select('id name').lean();
        const catMap = Object.fromEntries(cats.map(c => [c.id, c.name]));

        const products = toPlainArray(docs).map(p => ({
            ...p,
            category_name: p.category_id ? (catMap[p.category_id] || '') : ''
        }));

        res.json({ products, total, page: pageNum, limit: limitNum });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to list products' });
    }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ id: parseInt(req.params.id) });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        let category_name = '';
        if (product.category_id) {
            const cat = await Category.findOne({ id: product.category_id }).select('name').lean();
            category_name = cat ? cat.name : '';
        }
        res.json({ product: { ...toPlain(product), category_name } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to get product' });
    }
});

// POST /api/products - Create product (admin)
router.post('/', async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const { name, description, price, cost_price, category_id, image, stock, is_active, is_featured, is_new } = req.body;
        const maxDoc = await Product.findOne().sort({ id: -1 }).select('id').lean();
        const newId = (maxDoc && maxDoc.id ? maxDoc.id : 0) + 1;
        const product = await Product.create({
            id: newId,
            name,
            description: description || '',
            price: price || 0,
            cost_price: cost_price || 0,
            category_id: category_id || null,
            image: image || '',
            stock: stock || 0,
            is_active: is_active ? true : false,
            is_featured: is_featured ? true : false,
            is_new: is_new ? true : false
        });
        res.json({ success: true, id: product.id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// PUT /api/products/:id - Update product (admin)
router.put('/:id', async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const { name, description, price, cost_price, category_id, image, stock, is_active, is_featured, is_new } = req.body;
        await Product.updateOne({ id: parseInt(req.params.id) }, {
            name,
            description: description || '',
            price: price || 0,
            cost_price: cost_price || 0,
            category_id: category_id || null,
            image: image || '',
            stock: stock || 0,
            is_active: is_active ? true : false,
            is_featured: is_featured ? true : false,
            is_new: is_new ? true : false
        });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// DELETE /api/products/:id - Delete product (admin)
router.delete('/:id', async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        await Product.deleteOne({ id: parseInt(req.params.id) });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// POST /api/products/:id/toggle - Toggle active status (admin)
router.post('/:id/toggle', async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const product = await Product.findOne({ id: parseInt(req.params.id) });
        if (product) {
            product.is_active = !product.is_active;
            await product.save();
        }
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to toggle product' });
    }
});

module.exports = router;

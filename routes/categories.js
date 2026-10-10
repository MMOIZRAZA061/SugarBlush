const express = require('express');
const { Category, Product } = require('../db/models');
const { toPlainArray } = require('../db/helpers');
const router = express.Router();

// GET /api/categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json({ categories: toPlainArray(categories) });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to list categories' });
    }
});

// POST /api/categories - Create category (admin)
router.post('/', async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const { name, description } = req.body;
        const maxDoc = await Category.findOne().sort({ id: -1 }).select('id').lean();
        const newId = (maxDoc && maxDoc.id ? maxDoc.id : 0) + 1;
        const cat = await Category.create({ id: newId, name, description: description || '' });
        res.json({ success: true, id: cat.id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// PUT /api/categories/:id - Update category (admin)
router.put('/:id', async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const { name, description } = req.body;
        await Category.updateOne({ id: parseInt(req.params.id) }, { name, description: description || '' });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// DELETE /api/categories/:id - Delete category (admin)
router.delete('/:id', async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const id = parseInt(req.params.id);
        await Product.updateMany({ category_id: id }, { category_id: null });
        await Category.deleteOne({ id });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

module.exports = router;

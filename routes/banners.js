const express = require('express');
const { Banner } = require('../db/models');
const { toPlainArray } = require('../db/helpers');
const router = express.Router();

// GET /api/banners - List active banners
router.get('/', async (req, res) => {
    try {
        const banners = await Banner.find({ is_active: true }).sort({ sort_order: 1 });
        res.json({ banners: toPlainArray(banners) });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to list banners' });
    }
});

// POST /api/banners - Create banner (admin)
router.post('/', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const { title, subtitle, image, link, sort_order } = req.body;
        const maxDoc = await Banner.findOne().sort({ id: -1 }).select('id').lean();
        const newId = (maxDoc && maxDoc.id ? maxDoc.id : 0) + 1;
        const banner = await Banner.create({
            id: newId,
            title,
            subtitle: subtitle || '',
            image: image || '',
            link: link || '',
            sort_order: sort_order || 0
        });
        res.json({ success: true, id: banner.id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create banner' });
    }
});

// PUT /api/banners/:id - Update banner (admin)
router.put('/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const { title, subtitle, image, link, is_active, sort_order } = req.body;
        await Banner.updateOne({ id: parseInt(req.params.id) }, {
            title,
            subtitle: subtitle || '',
            image: image || '',
            link: link || '',
            is_active: is_active ? true : false,
            sort_order: sort_order || 0
        });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update banner' });
    }
});

// DELETE /api/banners/:id - Delete banner (admin)
router.delete('/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        await Banner.deleteOne({ id: parseInt(req.params.id) });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to delete banner' });
    }
});

module.exports = router;

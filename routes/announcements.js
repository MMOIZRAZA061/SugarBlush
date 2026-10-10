const express = require('express');
const { Announcement } = require('../db/models');
const { toPlainArray } = require('../db/helpers');
const router = express.Router();

// GET /api/announcements - List active announcements
router.get('/', async (req, res) => {
    try {
        const announcements = await Announcement.find({ is_active: true }).sort({ created_at: -1 });
        res.json({ announcements: toPlainArray(announcements) });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to list announcements' });
    }
});

// POST /api/announcements - Create announcement (admin)
router.post('/', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const { title, message } = req.body;
        const maxDoc = await Announcement.findOne().sort({ id: -1 }).select('id').lean();
        const newId = (maxDoc && maxDoc.id ? maxDoc.id : 0) + 1;
        const a = await Announcement.create({ id: newId, title, message: message || '' });
        res.json({ success: true, id: a.id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create announcement' });
    }
});

// PUT /api/announcements/:id - Update announcement (admin)
router.put('/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const { title, message, is_active } = req.body;
        await Announcement.updateOne({ id: parseInt(req.params.id) }, {
            title,
            message: message || '',
            is_active: is_active ? true : false
        });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update announcement' });
    }
});

// DELETE /api/announcements/:id - Delete announcement (admin)
router.delete('/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        await Announcement.deleteOne({ id: parseInt(req.params.id) });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to delete announcement' });
    }
});

module.exports = router;

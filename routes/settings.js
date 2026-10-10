const express = require('express');
const { SiteSetting } = require('../db/models');
const router = express.Router();

// GET /api/settings - Get all settings
router.get('/', async (req, res) => {
    try {
        const rows = await SiteSetting.find();
        const settings = {};
        rows.forEach(r => { settings[r.key] = r.value; });
        res.json({ settings });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to get settings' });
    }
});

// PUT /api/settings - Update settings (admin)
router.put('/', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const settings = req.body || {};
        await Promise.all(Object.entries(settings).map(([key, value]) =>
            SiteSetting.updateOne({ key }, { value: String(value) }, { upsert: true })
        ));
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

module.exports = router;

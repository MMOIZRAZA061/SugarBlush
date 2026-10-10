const express = require('express');
const { ContactMessage } = require('../db/models');
const { toPlainArray } = require('../db/helpers');
const router = express.Router();

// GET /api/contact - List messages (admin)
router.get('/', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const { unread } = req.query;
        const filter = unread === '1' ? { is_read: false } : {};
        const messages = await ContactMessage.find(filter).sort({ created_at: -1 });
        res.json({ messages: toPlainArray(messages) });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to list messages' });
    }
});

// POST /api/contact - Submit contact message
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required' });
        }
        const maxDoc = await ContactMessage.findOne().sort({ id: -1 }).select('id').lean();
        const newId = (maxDoc && maxDoc.id ? maxDoc.id : 0) + 1;
        const m = await ContactMessage.create({
            id: newId,
            name,
            email,
            phone: phone || '',
            subject: subject || '',
            message
        });
        res.json({ success: true, id: m.id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to submit message' });
    }
});

// PUT /api/contact/:id/read - Mark as read (admin)
router.put('/:id/read', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        await ContactMessage.updateOne({ id: parseInt(req.params.id) }, { is_read: true });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});

// DELETE /api/contact/:id - Delete message (admin)
router.delete('/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        await ContactMessage.deleteOne({ id: parseInt(req.params.id) });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

module.exports = router;

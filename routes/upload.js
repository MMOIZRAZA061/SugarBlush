const express = require('express');
const multer = require('multer');
const { uploadImage } = require('../lib/cloudinary');
const router = express.Router();

// Multer memory storage (files go to Cloudinary, not disk)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed'));
    }
});

// POST /api/upload - Upload image to Cloudinary
router.post('/', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    upload.single('image')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        try {
            const folder = req.body.folder || 'sugar-blush';
            const url = await uploadImage(req.file.buffer, folder);
            res.json({ success: true, url, public_id: req.file.originalname });
        } catch (e) {
            console.error('Cloudinary upload failed:', e);
            res.status(500).json({ error: 'Failed to upload image' });
        }
    });
});

module.exports = router;

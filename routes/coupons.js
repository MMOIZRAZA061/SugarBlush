const express = require('express');
const { Coupon, CouponAssignment, User } = require('../db/models');
const { toPlainArray } = require('../db/helpers');
const router = express.Router();

function requireAdmin(req, res) {
    if (!req.session.user || req.session.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return false;
    }
    return true;
}

function generateCode(length = 8) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

async function uniqueCode() {
    let code;
    do {
        code = generateCode();
    } while (await Coupon.findOne({ code }));
    return code;
}

// GET /api/coupons - List coupons (admin)
router.get('/', async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
        const coupons = await Coupon.find().sort({ created_at: -1 });
        // Get assignment counts for each coupon
        const assignmentCounts = await CouponAssignment.aggregate([
            { $group: { _id: '$coupon_id', assigned: { $sum: 1 }, claimed: { $sum: { $cond: [{ $in: ['$status', ['claimed', 'used']] }, 1, 0] } }, used: { $sum: { $cond: [{ $eq: ['$status', 'used'] }, 1, 0] } } } }
        ]);
        const countMap = Object.fromEntries(assignmentCounts.map(a => [a._id, a]));
        const enriched = toPlainArray(coupons).map(c => ({
            ...c,
            assigned_count: countMap[c.id]?.assigned || 0,
            claimed_count: countMap[c.id]?.claimed || 0,
            used_assignments: countMap[c.id]?.used || 0
        }));
        res.json({ coupons: enriched });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to list coupons' });
    }
});

// POST /api/coupons - Create coupon (admin)
router.post('/', async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
        const { discount_percent, min_order_amount = 0, max_uses = 0, expires_at = null, is_active = 1, code } = req.body;
        const pct = parseFloat(discount_percent);
        if (!pct || pct <= 0 || pct > 100) {
            return res.status(400).json({ error: 'Discount percent must be between 1 and 100' });
        }
        const finalCode = (code && String(code).trim()) ? String(code).trim().toUpperCase() : await uniqueCode();
        const existing = await Coupon.findOne({ code: finalCode });
        if (existing) return res.status(400).json({ error: 'Coupon code already exists' });
        const maxDoc = await Coupon.findOne().sort({ id: -1 }).select('id').lean();
        const newId = (maxDoc && maxDoc.id ? maxDoc.id : 0) + 1;
        const coupon = await Coupon.create({
            id: newId,
            code: finalCode,
            discount_percent: pct,
            min_order_amount: parseFloat(min_order_amount) || 0,
            max_uses: parseInt(max_uses) || 0,
            expires_at: expires_at || null,
            is_active: is_active ? true : false
        });
        res.json({ success: true, id: coupon.id, code: coupon.code });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create coupon' });
    }
});

// POST /api/coupons/generate - Generate N random codes (admin)
router.post('/generate', async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
        const { discount_percent, min_order_amount = 0, max_uses = 0, expires_at = null, is_active = 1, count = 1 } = req.body;
        const pct = parseFloat(discount_percent);
        if (!pct || pct <= 0 || pct > 100) {
            return res.status(400).json({ error: 'Discount percent must be between 1 and 100' });
        }
        const n = Math.max(1, Math.min(100, parseInt(count) || 1));
        const maxDoc = await Coupon.findOne().sort({ id: -1 }).select('id').lean();
        let nextId = (maxDoc && maxDoc.id ? maxDoc.id : 0);
        const created = [];
        for (let i = 0; i < n; i++) {
            const code = await uniqueCode();
            nextId += 1;
            const c = await Coupon.create({
                id: nextId,
                code,
                discount_percent: pct,
                min_order_amount: parseFloat(min_order_amount) || 0,
                max_uses: parseInt(max_uses) || 0,
                expires_at: expires_at || null,
                is_active: is_active ? true : false
            });
            created.push({ id: c.id, code: c.code });
        }
        res.json({ success: true, coupons: created });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to generate coupons' });
    }
});

// PUT /api/coupons/:id - Update coupon (admin)
router.put('/:id', async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
        const { code, discount_percent, min_order_amount, max_uses, expires_at, is_active } = req.body;
        const existing = await Coupon.findOne({ id: parseInt(req.params.id) });
        if (!existing) return res.status(404).json({ error: 'Coupon not found' });
        const pct = discount_percent !== undefined ? parseFloat(discount_percent) : existing.discount_percent;
        if (!pct || pct <= 0 || pct > 100) {
            return res.status(400).json({ error: 'Discount percent must be between 1 and 100' });
        }
        const finalCode = code !== undefined ? String(code).trim().toUpperCase() : existing.code;
        const dup = await Coupon.findOne({ code: finalCode, id: { $ne: existing.id } });
        if (dup) return res.status(400).json({ error: 'Coupon code already exists' });
        await Coupon.updateOne({ id: existing.id }, {
            code: finalCode,
            discount_percent: pct,
            min_order_amount: min_order_amount !== undefined ? (parseFloat(min_order_amount) || 0) : existing.min_order_amount,
            max_uses: max_uses !== undefined ? (parseInt(max_uses) || 0) : existing.max_uses,
            expires_at: expires_at !== undefined ? (expires_at || null) : existing.expires_at,
            is_active: is_active !== undefined ? (is_active ? true : false) : existing.is_active
        });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update coupon' });
    }
});

// DELETE /api/coupons/:id - Delete coupon (admin)
router.delete('/:id', async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
        await Coupon.deleteOne({ id: parseInt(req.params.id) });
        await CouponAssignment.deleteMany({ coupon_id: parseInt(req.params.id) });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to delete coupon' });
    }
});

// POST /api/coupons/assign - Assign coupons to random users (admin)
router.post('/assign', async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
        const { coupon_id, total_assignments } = req.body;
        const coupon = await Coupon.findOne({ id: parseInt(coupon_id) });
        if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
        if (!coupon.is_active) return res.status(400).json({ error: 'Coupon is inactive' });

        const numToAssign = Math.max(1, Math.min(500, parseInt(total_assignments) || 1));

        // Get all customer users (not admin)
        const customers = await User.find({ role: 'customer' });
        if (customers.length === 0) return res.status(400).json({ error: 'No customer users found' });

        // Shuffle and pick random users
        const shuffled = customers.sort(() => Math.random() - 0.5);
        const selectedUsers = shuffled.slice(0, Math.min(numToAssign, shuffled.length));

        const maxAssign = await CouponAssignment.findOne().sort({ id: -1 }).select('id').lean();
        let nextId = (maxAssign && maxAssign.id ? maxAssign.id : 0);

        const assignments = [];
        for (const user of selectedUsers) {
            // Check if user already has this coupon assigned
            const existing = await CouponAssignment.findOne({ coupon_id: coupon.id, user_id: user.id });
            if (existing) continue;
            nextId += 1;
            const a = await CouponAssignment.create({
                id: nextId,
                coupon_id: coupon.id,
                user_id: user.id,
                status: 'assigned'
            });
            assignments.push({ id: a.id, user_id: user.id, user_name: user.name });
        }

        res.json({ success: true, assigned: assignments.length, total_requested: numToAssign, assignments });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to assign coupons' });
    }
});

// GET /api/coupons/my - Get my assigned coupons (customer)
router.get('/my', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
    try {
        const assignments = await CouponAssignment.find({ user_id: req.session.user.id }).sort({ assigned_at: -1 });
        const couponIds = assignments.map(a => a.coupon_id);
        const coupons = await Coupon.find({ id: { $in: couponIds } });
        const cMap = Object.fromEntries(coupons.map(c => [c.id, c]));

        const enriched = assignments.map(a => {
            const c = cMap[a.coupon_id];
            return {
                assignment_id: a.id,
                status: a.status,
                assigned_at: a.assigned_at,
                claimed_at: a.claimed_at,
                used_at: a.used_at,
                coupon: c ? {
                    id: c.id,
                    code: c.code,
                    discount_percent: c.discount_percent,
                    min_order_amount: c.min_order_amount,
                    max_uses: c.max_uses,
                    used_count: c.used_count,
                    expires_at: c.expires_at,
                    is_active: c.is_active
                } : null
            };
        }).filter(a => a.coupon);

        res.json({ coupons: enriched });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to get my coupons' });
    }
});

// POST /api/coupons/claim/:assignment_id - Claim a coupon (customer)
router.post('/claim/:assignment_id', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
    try {
        const assignment = await CouponAssignment.findOne({ id: parseInt(req.params.assignment_id), user_id: req.session.user.id });
        if (!assignment) return res.status(404).json({ error: 'Coupon assignment not found' });
        if (assignment.status !== 'assigned') return res.status(400).json({ error: 'Coupon already claimed or used' });

        const coupon = await Coupon.findOne({ id: assignment.coupon_id });
        if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
        if (!coupon.is_active) return res.status(400).json({ error: 'Coupon is inactive' });
        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            return res.status(400).json({ error: 'Coupon has expired' });
        }

        await CouponAssignment.updateOne({ id: assignment.id }, {
            status: 'claimed',
            claimed_at: new Date()
        });

        res.json({ success: true, message: `Coupon ${coupon.code} claimed!` });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to claim coupon' });
    }
});

// POST /api/coupons/validate - Validate a coupon code (customer)
router.post('/validate', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
    try {
        const { code, cart_total } = req.body;
        if (!code) return res.status(400).json({ error: 'Coupon code required' });

        const coupon = await Coupon.findOne({ code: String(code).trim().toUpperCase() });
        if (!coupon) return res.status(400).json({ error: 'Invalid coupon code' });
        if (!coupon.is_active) return res.status(400).json({ error: 'Coupon is inactive' });
        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            return res.status(400).json({ error: 'Coupon has expired' });
        }
        if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) {
            return res.status(400).json({ error: 'Coupon usage limit reached' });
        }

        // Check if user has this coupon assigned and claimed
        const assignment = await CouponAssignment.findOne({ coupon_id: coupon.id, user_id: req.session.user.id, status: { $in: ['claimed', 'used'] } });
        if (!assignment) {
            return res.status(400).json({ error: 'This coupon is not assigned to you. Check your Coupons page.' });
        }

        const total = parseFloat(cart_total) || 0;
        if (total < (coupon.min_order_amount || 0)) {
            return res.status(400).json({ error: `Minimum order amount is Rs. ${coupon.min_order_amount}` });
        }
        const discount = Math.round(total * (coupon.discount_percent / 100) * 100) / 100;
        res.json({
            valid: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                discount_percent: coupon.discount_percent,
                discount_amount: discount,
                final_total: Math.max(0, total - discount)
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to validate coupon' });
    }
});

module.exports = router;

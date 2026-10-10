const express = require('express');
const { CartItem, Product, Order, OrderItem, StockLog, SiteSetting, Coupon, CouponAssignment } = require('../db/models');
const { toPlainArray } = require('../db/helpers');
const router = express.Router();

// GET /api/cart - Get cart items
router.get('/', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
    try {
        const items = await CartItem.find({ user_id: req.session.user.id });
        const productIds = items.map(i => i.product_id);
        const products = await Product.find({ id: { $in: productIds } });
        const pMap = Object.fromEntries(products.map(p => [p.id, p]));
        const enriched = items.map(i => {
            const p = pMap[i.product_id];
            return {
                id: i.id,
                user_id: i.user_id,
                product_id: i.product_id,
                quantity: i.quantity,
                created_at: i.created_at,
                name: p ? p.name : '',
                price: p ? p.price : 0,
                image: p ? p.image : '',
                stock: p ? p.stock : 0
            };
        });
        const total = enriched.reduce((sum, i) => sum + i.price * i.quantity, 0);
        res.json({ items: enriched, total });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to get cart' });
    }
});

// POST /api/cart/add - Add item to cart
router.post('/add', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
    try {
        const { product_id, quantity = 1 } = req.body;
        const product = await Product.findOne({ id: product_id, is_active: true });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        if (product.stock < quantity) return res.status(400).json({ error: 'Insufficient stock' });

        const existing = await CartItem.findOne({ user_id: req.session.user.id, product_id });
        if (existing) {
            existing.quantity += quantity;
            await existing.save();
        } else {
            const maxDoc = await CartItem.findOne().sort({ id: -1 }).select('id').lean();
            const newId = (maxDoc && maxDoc.id ? maxDoc.id : 0) + 1;
            await CartItem.create({ id: newId, user_id: req.session.user.id, product_id, quantity });
        }
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});

// PUT /api/cart/update/:id - Update cart item quantity
router.put('/update/:id', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
    try {
        const { quantity } = req.body;
        await CartItem.updateOne({ id: parseInt(req.params.id), user_id: req.session.user.id }, { quantity });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

// DELETE /api/cart/remove/:id - Remove item from cart
router.delete('/remove/:id', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
    try {
        await CartItem.deleteOne({ id: parseInt(req.params.id), user_id: req.session.user.id });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to remove from cart' });
    }
});

// POST /api/cart/checkout - Checkout and create order
router.post('/checkout', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
    try {
        const { delivery_address, phone, payment_method, notes, coupon_code } = req.body;
        const items = await CartItem.find({ user_id: req.session.user.id });
        if (items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

        const productIds = items.map(i => i.product_id);
        const products = await Product.find({ id: { $in: productIds } });
        const pMap = Object.fromEntries(products.map(p => [p.id, p]));

        const subtotal = items.reduce((sum, i) => sum + (pMap[i.product_id]?.price || 0) * i.quantity, 0);
        const deliveryFee = parseFloat((await SiteSetting.findOne({ key: 'delivery_fee' }))?.value || 0);
        const freeMin = parseFloat((await SiteSetting.findOne({ key: 'free_delivery_min' }))?.value || 0);

        // Validate coupon if provided
        let discountAmount = 0;
        let usedCode = '';
        let couponId = null;
        if (coupon_code) {
            const coupon = await Coupon.findOne({ code: String(coupon_code).trim().toUpperCase() });
            if (!coupon) return res.status(400).json({ error: 'Invalid coupon code' });
            if (!coupon.is_active) return res.status(400).json({ error: 'Coupon is inactive' });
            if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
                return res.status(400).json({ error: 'Coupon has expired' });
            }
            if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) {
                return res.status(400).json({ error: 'Coupon usage limit reached' });
            }
            if (subtotal < (coupon.min_order_amount || 0)) {
                return res.status(400).json({ error: `Minimum order amount is Rs. ${coupon.min_order_amount}` });
            }
            // Check if user has this coupon assigned and claimed
            const assignment = await CouponAssignment.findOne({ coupon_id: coupon.id, user_id: req.session.user.id, status: { $in: ['claimed', 'used'] } });
            if (!assignment) {
                return res.status(400).json({ error: 'This coupon is not assigned to you. Check your Coupons page.' });
            }
            discountAmount = Math.round(subtotal * (coupon.discount_percent / 100) * 100) / 100;
            usedCode = coupon.code;
            couponId = coupon.id;
        }

        const discountedSubtotal = Math.max(0, subtotal - discountAmount);
        const finalTotal = discountedSubtotal + (subtotal >= freeMin ? 0 : deliveryFee);

        const maxOrder = await Order.findOne().sort({ id: -1 }).select('id').lean();
        const newOrderId = (maxOrder && maxOrder.id ? maxOrder.id : 0) + 1;
        const order = await Order.create({
            id: newOrderId,
            user_id: req.session.user.id,
            total_amount: finalTotal,
            discount_amount: discountAmount,
            coupon_code: usedCode,
            status: 'pending',
            payment_method: payment_method || 'cash',
            delivery_address: delivery_address || '',
            phone: phone || '',
            notes: notes || ''
        });

        let oiMax = await OrderItem.findOne().sort({ id: -1 }).select('id').lean();
        let slMax = await StockLog.findOne().sort({ id: -1 }).select('id').lean();
        let oiId = (oiMax && oiMax.id ? oiMax.id : 0);
        let slId = (slMax && slMax.id ? slMax.id : 0);

        for (const item of items) {
            oiId += 1;
            slId += 1;
            await OrderItem.create({
                id: oiId,
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: pMap[item.product_id]?.price || 0
            });
            await Product.updateOne({ id: item.product_id }, { $inc: { stock: -item.quantity } });
            await StockLog.create({
                id: slId,
                product_id: item.product_id,
                change_amount: -item.quantity,
                reason: `Order #${order.id}`
            });
        }

        if (couponId) {
            await Coupon.updateOne({ id: couponId }, { $inc: { used_count: 1 } });
            await CouponAssignment.updateOne({ coupon_id: couponId, user_id: req.session.user.id, status: 'claimed' }, {
                status: 'used',
                used_at: new Date()
            });
        }

        await CartItem.deleteMany({ user_id: req.session.user.id });
        res.json({ success: true, order_id: order.id, total: finalTotal, discount: discountAmount });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Checkout failed' });
    }
});

module.exports = router;

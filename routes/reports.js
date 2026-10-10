const express = require('express');
const { Order, OrderItem, Product, User, Category, CustomOrder, ContactMessage } = require('../db/models');
const { toPlainArray } = require('../db/helpers');
const router = express.Router();

// GET /api/reports/dashboard - Dashboard stats (admin)
router.get('/dashboard', async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const [orders, products, users, categories, customOrders, messages, orderItems] = await Promise.all([
            Order.find(),
            Product.find(),
            User.find(),
            Category.find(),
            CustomOrder.find(),
            ContactMessage.find(),
            OrderItem.find()
        ]);

        const totalSales = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const totalProducts = products.length;
        const totalUsers = users.length;
        const totalCategories = categories.length;
        const totalCustomOrders = customOrders.length;
        const totalMessages = messages.length;
        const unreadMessages = messages.filter(m => !m.is_read).length;
        const lowStockProducts = products.filter(p => p.stock <= 5).length;
        const outOfStockProducts = products.filter(p => p.stock === 0).length;

        const pMap = Object.fromEntries(products.map(p => [p.id, p]));
        const totalProfit = orderItems.reduce((s, oi) => {
            const p = pMap[oi.product_id];
            return s + ((oi.price - (p?.cost_price || 0)) * oi.quantity);
        }, 0);
        const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        // Top selling products
        const soldMap = {};
        orderItems.forEach(oi => {
            if (!soldMap[oi.product_id]) soldMap[oi.product_id] = { product_id: oi.product_id, total_sold: 0, total_revenue: 0 };
            soldMap[oi.product_id].total_sold += oi.quantity;
            soldMap[oi.product_id].total_revenue += oi.price * oi.quantity;
        });
        const topProducts = Object.values(soldMap)
            .map(s => ({ name: pMap[s.product_id]?.name || '', total_sold: s.total_sold, total_revenue: s.total_revenue }))
            .sort((a, b) => b.total_sold - a.total_sold)
            .slice(0, 5);

        // Recent orders
        const uMap = Object.fromEntries(users.map(u => [u.id, u.name]));
        const recentOrders = orders
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5)
            .map(o => ({ ...o.toObject(), customer_name: uMap[o.user_id] || '' }));

        res.json({
            totalSales, totalOrders, pendingOrders, totalProducts, totalUsers,
            totalCategories, totalCustomOrders, totalMessages, unreadMessages,
            lowStockProducts, outOfStockProducts, totalProfit, avgOrderValue,
            topProducts, recentOrders
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to get dashboard' });
    }
});

// GET /api/reports/analytics - Analytics data (admin)
router.get('/analytics', async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    try {
        const [orders, orderItems, products, categories] = await Promise.all([
            Order.find(),
            OrderItem.find(),
            Product.find(),
            Category.find()
        ]);
        const pMap = Object.fromEntries(products.map(p => [p.id, p]));
        const cMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

        // Sales by category
        const catSales = {};
        orderItems.forEach(oi => {
            const p = pMap[oi.product_id];
            const catId = p?.category_id;
            if (!catId) return;
            if (!catSales[catId]) catSales[catId] = { name: cMap[catId] || 'Uncategorized', total_sales: 0, total_items: 0 };
            catSales[catId].total_sales += oi.price * oi.quantity;
            catSales[catId].total_items += oi.quantity;
        });
        const salesByCategory = Object.values(catSales).sort((a, b) => b.total_sales - a.total_sales);

        // Orders by status
        const statusMap = {};
        orders.forEach(o => { statusMap[o.status] = (statusMap[o.status] || 0) + 1; });
        const ordersByStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

        // Monthly sales (last 6 months)
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        const monthly = {};
        orders.forEach(o => {
            const d = new Date(o.created_at);
            if (d < sixMonthsAgo) return;
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!monthly[key]) monthly[key] = { month: key, total: 0, orders: 0 };
            monthly[key].total += o.total_amount;
            monthly[key].orders += 1;
        });
        const monthlySales = Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));

        res.json({ salesByCategory, ordersByStatus, monthlySales });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});

// GET /api/reports/top-search - Top search terms (admin)
router.get('/top-search', (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    const topSearches = [
        { term: 'cake', count: 45 },
        { term: 'cupcake', count: 32 },
        { term: 'bread', count: 28 },
        { term: 'cookies', count: 22 },
        { term: 'chocolate', count: 18 }
    ];
    res.json({ topSearches });
});

module.exports = router;

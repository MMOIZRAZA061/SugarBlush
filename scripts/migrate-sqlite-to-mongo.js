// One-time migration script: copies all data from SQLite (db/bakery.db) into MongoDB.
// Usage: node scripts/migrate-sqlite-to-mongo.js
// Safe to re-run: it clears each collection first, then re-inserts.

const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const { connectDB, mongoose } = require('../db/connect');
const models = require('../db/models');

const dbPath = path.join(__dirname, '..', 'db', 'bakery.db');
const sqlite = new DatabaseSync(dbPath);

function parseDate(s) {
    if (!s) return null;
    // SQLite stores as "YYYY-MM-DD HH:MM:SS" or ISO
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
}

function bool(v) {
    if (v === 1 || v === true || v === '1' || v === 'true') return true;
    if (v === 0 || v === false || v === '0' || v === 'false') return false;
    return !!v;
}

async function migrateCollection(name, table, mapper) {
    const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
    console.log(`Migrating ${table}: ${rows.length} rows`);
    await models[name].deleteMany({});
    if (rows.length === 0) return;
    const docs = rows.map(mapper).filter(Boolean);
    await models[name].insertMany(docs, { ordered: false });
    console.log(`  -> inserted ${docs.length}`);
}

async function main() {
    await connectDB();

    try {
        await migrateCollection('User', 'users', r => ({
            id: r.id,
            name: r.name,
            email: r.email,
            password: r.password,
            phone: r.phone || '',
            address: r.address || '',
            role: r.role || 'customer',
            created_at: parseDate(r.created_at)
        }));

        await migrateCollection('Category', 'categories', r => ({
            id: r.id,
            name: r.name,
            description: r.description || '',
            created_at: parseDate(r.created_at)
        }));

        await migrateCollection('Product', 'products', r => ({
            id: r.id,
            name: r.name,
            description: r.description || '',
            price: r.price,
            cost_price: r.cost_price || 0,
            category_id: r.category_id || null,
            image: r.image || '',
            stock: r.stock || 0,
            is_active: bool(r.is_active),
            is_featured: bool(r.is_featured),
            is_new: bool(r.is_new),
            created_at: parseDate(r.created_at)
        }));

        await migrateCollection('CartItem', 'cart_items', r => ({
            id: r.id,
            user_id: r.user_id,
            product_id: r.product_id,
            quantity: r.quantity || 1,
            created_at: parseDate(r.created_at)
        }));

        await migrateCollection('Order', 'orders', r => ({
            id: r.id,
            user_id: r.user_id,
            total_amount: r.total_amount,
            discount_amount: r.discount_amount || 0,
            coupon_code: r.coupon_code || '',
            status: r.status || 'pending',
            payment_method: r.payment_method || 'cash',
            delivery_address: r.delivery_address || '',
            phone: r.phone || '',
            notes: r.notes || '',
            created_at: parseDate(r.created_at)
        }));

        await migrateCollection('OrderItem', 'order_items', r => ({
            id: r.id,
            order_id: r.order_id,
            product_id: r.product_id,
            quantity: r.quantity,
            price: r.price
        }));

        await migrateCollection('Banner', 'banners', r => ({
            id: r.id,
            title: r.title,
            subtitle: r.subtitle || '',
            image: r.image || '',
            link: r.link || '',
            is_active: bool(r.is_active),
            sort_order: r.sort_order || 0,
            created_at: parseDate(r.created_at)
        }));

        await migrateCollection('Announcement', 'announcements', r => ({
            id: r.id,
            title: r.title,
            message: r.message || '',
            is_active: bool(r.is_active),
            created_at: parseDate(r.created_at)
        }));

        await migrateCollection('CustomOrder', 'custom_orders', r => ({
            id: r.id,
            user_id: r.user_id || null,
            name: r.name,
            email: r.email,
            phone: r.phone || '',
            description: r.description || '',
            quantity: r.quantity || 1,
            preferred_date: r.preferred_date || null,
            status: r.status || 'pending',
            created_at: parseDate(r.created_at)
        }));

        await migrateCollection('ContactMessage', 'contact_messages', r => ({
            id: r.id,
            name: r.name,
            email: r.email,
            phone: r.phone || '',
            subject: r.subject || '',
            message: r.message,
            is_read: bool(r.is_read),
            created_at: parseDate(r.created_at)
        }));

        await migrateCollection('SiteSetting', 'site_settings', r => ({
            key: r.key,
            value: r.value || ''
        }));

        await migrateCollection('StockLog', 'stock_logs', r => ({
            id: r.id,
            product_id: r.product_id,
            change_amount: r.change_amount,
            reason: r.reason || '',
            created_at: parseDate(r.created_at)
        }));

        // coupons table may not exist in older DBs
        try {
            await migrateCollection('Coupon', 'coupons', r => ({
                id: r.id,
                code: r.code,
                discount_percent: r.discount_percent,
                min_order_amount: r.min_order_amount || 0,
                max_uses: r.max_uses || 0,
                used_count: r.used_count || 0,
                expires_at: parseDate(r.expires_at),
                is_active: bool(r.is_active),
                created_at: parseDate(r.created_at)
            }));
        } catch (e) {
            console.log('  (skipping coupons - table not found)');
        }

        console.log('\nMigration complete!');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exitCode = 1;
    } finally {
        sqlite.close();
        await mongoose.disconnect();
    }
}

main();

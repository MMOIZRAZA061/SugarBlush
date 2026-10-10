const mongoose = require('mongoose');

const { Schema } = mongoose;

// All models use a numeric `id` field (unique) to preserve client-side compatibility.
// MongoDB's `_id` (ObjectId) is auto-generated but not exposed to the client.

const UserSchema = new Schema({
    id: { type: Number, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    role: { type: String, default: 'customer' },
    created_at: { type: Date, default: Date.now }
});

const CategorySchema = new Schema({
    id: { type: Number, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    created_at: { type: Date, default: Date.now }
});

const ProductSchema = new Schema({
    id: { type: Number, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, default: 0 },
    cost_price: { type: Number, default: 0 },
    category_id: { type: Number, default: null },
    image: { type: String, default: '' },
    stock: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
    is_featured: { type: Boolean, default: false },
    is_new: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

const CartItemSchema = new Schema({
    id: { type: Number, unique: true, index: true },
    user_id: { type: Number, required: true },
    product_id: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    created_at: { type: Date, default: Date.now }
});

const OrderSchema = new Schema({
    id: { type: Number, unique: true, index: true },
    user_id: { type: Number, required: true },
    total_amount: { type: Number, required: true },
    discount_amount: { type: Number, default: 0 },
    coupon_code: { type: String, default: '' },
    status: { type: String, default: 'pending' },
    payment_method: { type: String, default: 'cash' },
    delivery_address: { type: String, default: '' },
    phone: { type: String, default: '' },
    notes: { type: String, default: '' },
    created_at: { type: Date, default: Date.now }
});

const OrderItemSchema = new Schema({
    id: { type: Number, unique: true, index: true },
    order_id: { type: Number, required: true },
    product_id: { type: Number, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
});

const BannerSchema = new Schema({
    id: { type: Number, unique: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    image: { type: String, default: '' },
    link: { type: String, default: '' },
    is_active: { type: Boolean, default: true },
    sort_order: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
});

const AnnouncementSchema = new Schema({
    id: { type: Number, unique: true, index: true },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

const CustomOrderSchema = new Schema({
    id: { type: Number, unique: true, index: true },
    user_id: { type: Number, default: null },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    description: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    preferred_date: { type: String, default: null },
    status: { type: String, default: 'pending' },
    created_at: { type: Date, default: Date.now }
});

const ContactMessageSchema = new Schema({
    id: { type: Number, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    subject: { type: String, default: '' },
    message: { type: String, required: true },
    is_read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

const SiteSettingSchema = new Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String, default: '' }
});

const StockLogSchema = new Schema({
    id: { type: Number, unique: true, index: true },
    product_id: { type: Number, required: true },
    change_amount: { type: Number, required: true },
    reason: { type: String, default: '' },
    created_at: { type: Date, default: Date.now }
});

const CouponSchema = new Schema({
    id: { type: Number, unique: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discount_percent: { type: Number, required: true },
    min_order_amount: { type: Number, default: 0 },
    max_uses: { type: Number, default: 0 },
    used_count: { type: Number, default: 0 },
    expires_at: { type: Date, default: null },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

const CouponAssignmentSchema = new Schema({
    id: { type: Number, unique: true, index: true },
    coupon_id: { type: Number, required: true },
    user_id: { type: Number, required: true },
    status: { type: String, default: 'assigned' }, // assigned, claimed, used
    assigned_at: { type: Date, default: Date.now },
    claimed_at: { type: Date, default: null },
    used_at: { type: Date, default: null }
});

module.exports = {
    User: mongoose.model('User', UserSchema),
    Category: mongoose.model('Category', CategorySchema),
    Product: mongoose.model('Product', ProductSchema),
    CartItem: mongoose.model('CartItem', CartItemSchema),
    Order: mongoose.model('Order', OrderSchema),
    OrderItem: mongoose.model('OrderItem', OrderItemSchema),
    Banner: mongoose.model('Banner', BannerSchema),
    Announcement: mongoose.model('Announcement', AnnouncementSchema),
    CustomOrder: mongoose.model('CustomOrder', CustomOrderSchema),
    ContactMessage: mongoose.model('ContactMessage', ContactMessageSchema),
    SiteSetting: mongoose.model('SiteSetting', SiteSettingSchema),
    StockLog: mongoose.model('StockLog', StockLogSchema),
    Coupon: mongoose.model('Coupon', CouponSchema),
    CouponAssignment: mongoose.model('CouponAssignment', CouponAssignmentSchema)
};

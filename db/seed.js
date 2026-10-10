const db = require('./schema');
const bcrypt = require('bcryptjs');

// Clear existing data
db.exec('DELETE FROM users');
db.exec('DELETE FROM categories');
db.exec('DELETE FROM products');
db.exec('DELETE FROM banners');
db.exec('DELETE FROM announcements');
db.exec('DELETE FROM site_settings');

// Insert admin user
const adminPass = bcrypt.hashSync('admin123', 10);
db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    'Admin', 'admin@bakery.com', adminPass, 'admin'
);

// Insert sample customer
const custPass = bcrypt.hashSync('customer123', 10);
db.prepare('INSERT INTO users (name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)').run(
    'John Doe', 'john@example.com', custPass, '0300-1234567', '123 Main St, Karachi', 'customer'
);

// Insert categories
const categories = [
    ['Cakes', 'Delicious cakes for every occasion'],
    ['Cupcakes', 'Miniature cakes with endless flavors'],
    ['Breads', 'Freshly baked breads'],
    ['Pastries', 'Flaky and buttery pastries'],
    ['Cookies', 'Crunchy and chewy cookies'],
    ['Drinks', 'Refreshing beverages'],
    ['Specialty', 'Unique and special items']
];
const catStmt = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
categories.forEach(c => catStmt.run(c[0], c[1]));

// Insert products
const products = [
    ['Chocolate Truffle Cake', 'Rich chocolate cake with truffle filling', 1500, 800, 1, 'download.jpeg', 25, 1, 1, 0],
    ['Red Velvet Cupcake', 'Classic red velvet with cream cheese frosting', 250, 120, 2, 'download_4.jpeg', 50, 1, 1, 0],
    ['Fresh Bread Loaf', 'Soft and fluffy white bread', 300, 150, 3, 'download_5.jpeg', 30, 1, 1, 0],
    ['Butter Croissant', 'Flaky French-style croissant', 200, 100, 4, 'download_7.jpeg', 40, 1, 1, 0],
    ['Chocolate Chip Cookies', 'Oven-baked with premium chocolate chips', 150, 75, 5, 'download_8.jpeg', 60, 1, 1, 0],
    ['Fresh Orange Juice', 'Freshly squeezed orange juice', 350, 180, 6, 'download_9.jpeg', 20, 1, 1, 0],
    ['Strawberry Shortcake', 'Layers of sponge with fresh strawberries', 1200, 600, 1, 'download_10.jpeg', 15, 1, 1, 0],
    ['Vanilla Cupcake', 'Classic vanilla with buttercream frosting', 200, 100, 2, 'download_12.jpeg', 45, 1, 1, 0],
    ['Whole Wheat Bread', 'Healthy whole wheat bread', 350, 175, 3, 'images_3.jpeg', 25, 1, 1, 0],
    ['Puff Pastry', 'Light and crispy puff pastry', 250, 125, 4, 'images_4.jpeg', 35, 1, 1, 0],
    ['Oatmeal Cookies', 'Healthy oatmeal with raisins', 180, 90, 5, 'images_5.jpeg', 55, 1, 1, 0],
    ['Mango Lassi', 'Creamy mango yogurt drink', 400, 200, 6, 'Chicken-bread-1.jpg', 18, 1, 1, 0],
    ['Custom Birthday Cake', 'Personalized birthday cake', 2500, 1200, 1, 'WhatsApp_Image_2026-03-14_at_10.33.52_AM.jpeg', 10, 1, 0, 1],
    ['Wedding Cake', 'Elegant multi-tier wedding cake', 8000, 4000, 1, 'WhatsApp_Image_2026-03-20_at_2.54.36_PM.jpeg', 5, 1, 0, 1],
    ['Sugar Slush', 'Refreshing sugar slush drink', 500, 250, 6, 'SUGAR%20SLUSH%20(1).png', 22, 1, 0, 1],
    ['Eggless Cake', 'Delicious eggless chocolate cake', 1800, 900, 1, 'download.jpeg', 12, 1, 0, 1],
    ['Assorted Cupcake Box', 'Box of 6 assorted cupcakes', 1200, 600, 2, 'download_4.jpeg', 20, 1, 0, 1],
    ['Specialty Bread', 'Artisan specialty bread', 450, 225, 3, 'download_5.jpeg', 15, 1, 0, 1]
];
const prodStmt = db.prepare(`INSERT INTO products (name, description, price, cost_price, category_id, image, stock, is_active, is_featured, is_new) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
products.forEach(p => prodStmt.run(...p));

// Insert banners
const banners = [
    ['Fresh Baked Daily', 'Quality ingredients, made with love', 'download.jpeg', '/shop', 1, 1],
    ['Custom Cakes', 'Order your dream cake today', 'download_10.jpeg', '/custom-orders', 1, 2],
    ['New Arrivals', 'Check out our latest creations', 'images_5.jpeg', '/shop', 1, 3],
    ['Special Offers', 'Get 20% off on your first order', 'download_4.jpeg', '/shop', 1, 4],
    ['Fresh Drinks', 'Refreshing beverages for every mood', 'Chicken-bread-1.jpg', '/shop', 1, 5]
];
const bannerStmt = db.prepare('INSERT INTO banners (title, subtitle, image, link, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
banners.forEach(b => bannerStmt.run(...b));

// Insert announcements
const announcements = [
    ['Welcome to Sugar Blush!', 'We are excited to serve you with the freshest baked goods.', 1],
    ['Holiday Special', 'Get 15% off on all cakes during the holiday season.', 1]
];
const annStmt = db.prepare('INSERT INTO announcements (title, message, is_active) VALUES (?, ?, ?)');
announcements.forEach(a => annStmt.run(...a));

// Insert site settings
const settings = [
    ['site_name', 'Sugar Blush Bakery'],
    ['site_description', 'Fresh baked goods made with love'],
    ['contact_email', 'info@sugarblush.com'],
    ['contact_phone', '+92 300 1234567'],
    ['contact_address', '123 Bakery Street, Karachi, Pakistan'],
    ['facebook_url', 'https://facebook.com/sugarblush'],
    ['instagram_url', 'https://instagram.com/sugarblush'],
    ['whatsapp_url', 'https://wa.me/923001234567'],
    ['delivery_fee', '50'],
    ['free_delivery_min', '1000']
];
const setStmt = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)');
settings.forEach(s => setStmt.run(...s));

console.log('Database seeded successfully!');
console.log(`- ${db.prepare('SELECT COUNT(*) as count FROM users').get().count} users`);
console.log(`- ${db.prepare('SELECT COUNT(*) as count FROM categories').get().count} categories`);
console.log(`- ${db.prepare('SELECT COUNT(*) as count FROM products').get().count} products`);
console.log(`- ${db.prepare('SELECT COUNT(*) as count FROM banners').get().count} banners`);
console.log(`- ${db.prepare('SELECT COUNT(*) as count FROM announcements').get().count} announcements`);

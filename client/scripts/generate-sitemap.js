// client/scripts/generate-sitemap.js
import fs from 'fs';
import path from 'path';

// Base URL of the website (change this to your actual domain)
const BASE_URL = 'https://sugarblush-s2ky.vercel.app';

// Routes array from client/src/routes.js
const routes = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/about', priority: '0.8', changefreq: 'monthly' },
    { path: '/shop', priority: '0.9', changefreq: 'weekly' },
    { path: '/product/:id', priority: '0.7', changefreq: 'weekly' }, // Note: dynamic route
    { path: '/contact', priority: '0.8', changefreq: 'monthly' },
    { path: '/custom-orders', priority: '0.8', changefreq: 'monthly' },
    { path: '/login', priority: '0.6', changefreq: 'monthly' },
    { path: '/signup', priority: '0.6', changefreq: 'monthly' },
    { path: '/profile', priority: '0.6', changefreq: 'monthly' },
    { path: '/order-history', priority: '0.6', changefreq: 'monthly' },
    { path: '/coupons', priority: '0.6', changefreq: 'monthly' },
    { path: '/admin', priority: '0.5', changefreq: 'monthly' }, // Admin routes
    { path: '/admin/dashboard', priority: '0.5', changefreq: 'monthly' },
    { path: '/admin/products', priority: '0.5', changefreq: 'monthly' },
    { path: '/admin/orders', priority: '0.5', changefreq: 'monthly' },
    { path: '/admin/categories', priority: '0.5', changefreq: 'monthly' },
    { path: '/admin/banners', priority: '0.5', changefreq: 'monthly' },
    { path: '/admin/announcements', priority: '0.5', changefreq: 'monthly' },
    { path: '/admin/custom-orders', priority: '0.5', changefreq: 'monthly' },
    { path: '/admin/contact-messages', priority: '0.5', changefreq: 'monthly' },
    { path: '/admin/stock', priority: '0.5', changefreq: 'monthly' },
    { path: '/admin/stock-report', priority: '0.5', changefreq: 'monthly' },
    { path: '/admin/settings', priority: '0.5', changefreq: 'monthly' },
    { path: '/admin/reports', priority: '0.5', changefreq: 'monthly' },
    { path: '/admin/analytics', priority: '0.5', changefreq: 'monthly' },
    { path: '/admin/top-search', priority: '0.5', changefreq: 'monthly' },
    { path: '/admin/coupons', priority: '0.5', changefreq: 'monthly' }
];

// Generate sitemap XML
const generateSitemap = () => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    routes.forEach(route => {
        // Skip dynamic routes for now (we'll handle them separately if needed)
        if (route.path.includes(':')) {
            // For dynamic routes like /product/:id, we cannot generate specific URLs without data
            // In a real app, you would fetch from CMS/database and generate URLs for each product
            // For now, we'll skip or you can implement a separate script to fetch products
            return;
        }

        const url = `${BASE_URL}${route.path}`;
        xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    // Ensure public directory exists
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    // Write sitemap.xml
    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, xml);
    console.log(`Sitemap generated at ${sitemapPath}`);
};

generateSitemap();
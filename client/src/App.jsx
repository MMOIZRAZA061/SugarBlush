import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './components/Toast.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import MobileActionBar from './components/MobileActionBar.jsx'
import AdminLayout from './components/AdminLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { Helmet } from 'react-helmet'
import { routes } from './routes'

// Public pages
import Home from './pages/public/Home.jsx'
import Shop from './pages/public/Shop.jsx'
import Cart from './pages/public/Cart.jsx'
import Contact from './pages/public/Contact.jsx'
import CustomOrders from './pages/public/CustomOrders.jsx'
import Login from './pages/public/Login.jsx'
import Signup from './pages/public/Signup.jsx'
import Profile from './pages/public/Profile.jsx'
import OrderHistory from './pages/public/OrderHistory.jsx'
import About from './pages/public/About.jsx'
import Coupons from './pages/public/Coupons.jsx'
import ProductDetail from './pages/public/ProductDetail.jsx'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminProducts from './pages/admin/Products.jsx'
import AdminOrders from './pages/admin/Orders.jsx'
import AdminCategories from './pages/admin/Categories.jsx'
import AdminUsers from './pages/admin/Users.jsx'
import AdminBanners from './pages/admin/Banners.jsx'
import AdminAnnouncements from './pages/admin/Announcements.jsx'
import AdminCustomOrders from './pages/admin/CustomOrders.jsx'
import AdminContactMessages from './pages/admin/ContactMessages.jsx'
import AdminStock from './pages/admin/Stock.jsx'
import AdminSettings from './pages/admin/Settings.jsx'
import AdminReports from './pages/admin/Reports.jsx'
import AdminAnalytics from './pages/admin/Analytics.jsx'
import AdminStockReport from './pages/admin/StockReport.jsx'
import AdminTopSearch from './pages/admin/TopSearch.jsx'
import AdminCoupons from './pages/admin/Coupons.jsx'

// Function to get route metadata
const getRouteMetadata = (pathname) => {
    // Find matching route
    const route = routes.find(r =>
        r.path === pathname ||
        (r.path.includes(':') && pathname.startsWith(r.path.split(':')[0]))
    ) || { title: 'Sugar Blush Bakery', description: 'Freshly baked goods and custom cakes' };

    return {
        title: `${route.title} | Sugar Blush Bakery`,
        description: route.description || 'Freshly baked goods, custom cakes, and delicious treats made with love.'
    };
};

export default function App() {
    const location = useLocation();
    const { title, description } = getRouteMetadata(location.pathname);

    return (
        <ToastProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Helmet>
                        <title>{title}</title>
                        <meta name="description" content={description} />
                        <meta name="keywords" content="bakery, cakes, breads, pastries, custom cakes, desserts, Sugar Blush Bakery, online bakery, fresh baked goods" />
                        <meta property="og:title" content={title} />
                        <meta property="og:description" content={description} />
                        <meta property="og:image" content="https://sugarblushbakery.vercel.app/logo.png" />
                        <meta property="og:url" content={`https://sugarblushbakery.vercel.app${location.pathname}`} />
                        <meta property="og:type" content="website" />
                        <meta name="twitter:card" content="summary_large_image" />
                        <meta name="twitter:title" content={title} />
                        <meta name="twitter:description" content={description} />
                        <meta name="twitter:image" content="https://sugarblushbakery.vercel.app/logo.png" />
                    </Helmet>
                    <Navbar />
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/custom-orders" element={<CustomOrders />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />

                        {/* Protected public routes */}
                        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/order-history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
                        <Route path="/coupons" element={<ProtectedRoute><Coupons /></ProtectedRoute>} />

                        {/* Admin routes */}
                        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="products" element={<AdminProducts />} />
                            <Route path="orders" element={<AdminOrders />} />
                            <Route path="categories" element={<AdminCategories />} />
                            <Route path="users" element={<AdminUsers />} />
                            <Route path="banners" element={<AdminBanners />} />
                            <Route path="announcements" element={<AdminAnnouncements />} />
                            <Route path="custom-orders" element={<AdminCustomOrders />} />
                            <Route path="contact-messages" element={<AdminContactMessages />} />
                            <Route path="stock" element={<AdminStock />} />
                            <Route path="stock-report" element={<AdminStockReport />} />
                            <Route path="settings" element={<AdminSettings />} />
                            <Route path="reports" element={<AdminReports />} />
                            <Route path="analytics" element={<AdminAnalytics />} />
                            <Route path="top-search" element={<AdminTopSearch />} />
                            <Route path="coupons" element={<AdminCoupons />} />
                        </Route>

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    <Footer />
                    <MobileActionBar />
                </BrowserRouter>
            </AuthProvider>
        </ToastProvider>
    )
}

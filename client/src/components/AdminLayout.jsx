import React, { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'

const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
    { to: '/admin/reports', label: 'Reports & Analytics', icon: 'bi-bar-chart' },
    { to: '/admin/analytics', label: 'Analytics', icon: 'bi-graph-up' },
    { to: '/admin/orders', label: 'Orders', icon: 'bi-basket3' },
    { to: '/admin/products', label: 'Products', icon: 'bi-box-seam' },
    { to: '/admin/categories', label: 'Categories', icon: 'bi-tags' },
    { to: '/admin/users', label: 'Users', icon: 'bi-people' },
    { to: '/admin/banners', label: 'Banners', icon: 'bi-image' },
    { to: '/admin/announcements', label: 'Announcements', icon: 'bi-megaphone' },
    { to: '/admin/custom-orders', label: 'Custom Orders', icon: 'bi-pencil-square' },
    { to: '/admin/settings', label: 'Site Settings', icon: 'bi-gear' },
    { to: '/admin/contact-messages', label: 'Contact Messages', icon: 'bi-envelope' },
    { to: '/admin/stock', label: 'Stock', icon: 'bi-box' },
    { to: '/admin/stock-report', label: 'Stock Report', icon: 'bi-file-earmark-bar-graph' },
    { to: '/admin/top-search', label: 'Top Search', icon: 'bi-search' },
    { to: '/admin/coupons', label: 'Coupons', icon: 'bi-ticket-perforated' },
]

export default function AdminLayout() {
    const [showSidebar, setShowSidebar] = useState(false)

    return (
        <>
            <button
                className="btn btn-primary admin-menu-btn"
                type="button"
                onClick={() => setShowSidebar(true)}
                style={{ position: 'fixed', top: '70px', right: '20px', zIndex: 1055, width: '46px', height: '46px', borderRadius: '50%' }}
            >
                <i className="bi bi-list" style={{ fontSize: '1.25rem' }}></i>
            </button>

            <div className={`offcanvas offcanvas-end ${showSidebar ? 'show' : ''}`} tabIndex="-1" id="adminSidebar" aria-labelledby="adminSidebarLabel">
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="adminSidebarLabel">Admin Menu</h5>
                    <button type="button" className="btn-close" onClick={() => setShowSidebar(false)} aria-label="Close"></button>
                </div>
                <div className="offcanvas-body">
                    <div className="list-group list-group-flush">
                        {adminLinks.map(link => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) => `list-group-item list-group-item-action ${isActive ? 'active' : ''}`}
                                onClick={() => setShowSidebar(false)}
                            >
                                <i className={`bi ${link.icon} me-2`}></i>{link.label}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>
            {showSidebar && <div className="offcanvas-backdrop fade show" onClick={() => setShowSidebar(false)}></div>}

            <section className="container mt-4">
                <Outlet />
            </section>
        </>
    )
}

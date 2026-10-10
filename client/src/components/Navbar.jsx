import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { imageUrl } from '../api/index.js'
import { useToast } from './Toast.jsx'

export default function Navbar() {
    const { user, cartCount, logout } = useAuth()
    const { showToast } = useToast()
    const navigate = useNavigate()
    const [showMobile, setShowMobile] = useState(false)

    async function handleLogout(e) {
        e.preventDefault()
        try {
            await logout()
            showToast('Logged out successfully', 'success')
            navigate('/')
        } catch (err) {
            showToast(err.message, 'danger')
        }
    }

    return (
        <nav className="navbar navbar-expand-lg sticky-top">
            <div className="container">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <div className="d-flex align-items-center">
                        <div className="logo-circle">
                            <img src={imageUrl('WhatsApp_Image_2026-03-14_at_10.33.52_AM.jpeg')} alt="Sugar Blush Logo" />
                        </div>
                        <div className="brand-text-wrapper ms-2">
                            <span className="brand-title">SUGAR BLUSH</span>
                            <div className="brand-details text-muted">
                                <small>Freshly baked today</small>
                                <small>Custom cakes & treats</small>
                                <small>Quick delivery across city</small>
                            </div>
                        </div>
                    </div>
                </Link>
                <button className="navbar-toggler" type="button" onClick={() => setShowMobile(!showMobile)} aria-expanded={showMobile}>
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={`collapse navbar-collapse ${showMobile ? 'show' : ''}`}>
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/about">About</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/shop">Shop</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/contact">Contact</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/custom-orders">Custom Orders</Link></li>

                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <li className="nav-item"><Link className="nav-link" to="/admin">Admin</Link></li>
                                )}
                                <li className="nav-item"><Link className="nav-link" to="/profile">Profile</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/order-history">Order History</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/coupons">Coupons</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/cart">Cart ({cartCount})</Link></li>
                                <li className="nav-item"><a className="nav-link" href="#" onClick={handleLogout}>Logout</a></li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item"><Link className="nav-link disabled" to="#" title="Please login to access cart">Cart (0)</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/signup">Signup</Link></li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    )
}

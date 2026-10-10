import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function MobileActionBar() {
    const { user, cartCount } = useAuth()

    return (
        <div className="mobile-action-bar d-lg-none d-flex gap-2 justify-content-center">
            <Link to="/shop" className="btn btn-success">Shop</Link>
            <Link to="/custom-orders" className="btn btn-info text-white">Custom Order</Link>
            {user ? (
                <Link to="/cart" className="btn btn-warning text-dark">Cart ({cartCount})</Link>
            ) : (
                <Link to="/login" className="btn btn-warning text-dark disabled" title="Please login to access cart">Cart (0)</Link>
            )}
        </div>
    )
}

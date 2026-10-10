import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API, formatCurrency, imageUrl } from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from './Toast.jsx'

export default function ProductCard({ product, showStock = false, showCustomRequest = false }) {
    const { user } = useAuth()
    const { showToast } = useToast()
    const navigate = useNavigate()

    async function handleAddToCart(e) {
        e.stopPropagation()
        try {
            await API.cart.add(product.id)
            showToast('Added to cart!', 'success')
        } catch (err) {
            if (err.message.includes('Not authenticated') || err.message.includes('login')) {
                navigate('/login?next=/')
            } else {
                showToast(err.message, 'danger')
            }
        }
    }

    async function handleBuyNow(e) {
        e.stopPropagation()
        try {
            await API.cart.add(product.id)
            navigate('/cart')
        } catch (err) {
            if (err.message.includes('Not authenticated') || err.message.includes('login')) {
                navigate('/login?next=/cart')
            } else {
                showToast(err.message, 'danger')
            }
        }
    }

    return (
        <div className="card product-card mb-4" style={{ cursor: 'pointer' }} onClick={() => navigate(`/product/${product.id}`)}>
            <img src={imageUrl(product.image)} className="card-img-top" alt={product.name} style={{ height: '200px', objectFit: 'cover' }} />
            <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                {product.description && <p className="card-text text-muted">{product.description.substring(0, 60)}...</p>}
                <p className="card-text"><strong>{formatCurrency(product.price)}</strong></p>
                {showStock && <p className="card-text"><strong>Stock:</strong> {product.stock}</p>}
                <div className="d-flex gap-2 mt-auto">
                    {showCustomRequest && (
                        <Link to="/custom-orders" className="btn btn-sm btn-outline-warning" onClick={(e) => e.stopPropagation()}>Custom Request</Link>
                    )}
                    <button className="btn btn-sm btn-primary flex-fill" onClick={handleAddToCart}>Add to Cart</button>
                    <button className="btn btn-sm btn-success flex-fill" onClick={handleBuyNow}>Buy Now</button>
                </div>
            </div>
        </div>
    )
}

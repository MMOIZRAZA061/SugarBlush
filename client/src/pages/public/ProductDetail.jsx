import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { API, formatCurrency } from '../../api/index.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../components/Toast.jsx'

export default function ProductDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, refreshCartCount } = useAuth()
    const { showToast } = useToast()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const [adding, setAdding] = useState(false)
    const [showCouponPopup, setShowCouponPopup] = useState(false)
    const [myCoupons, setMyCoupons] = useState([])
    const [claimingId, setClaimingId] = useState(null)

    useEffect(() => {
        loadProduct()
        if (user) loadMyCoupons()
    }, [id, user])

    async function loadProduct() {
        setLoading(true)
        try {
            const res = await API.products.get(id)
            setProduct(res.product)
        } catch (e) {
            showToast(e.message, 'danger')
        }
        setLoading(false)
    }

    async function loadMyCoupons() {
        try {
            const res = await API.coupons.my()
            const available = (res.coupons || []).filter(c => c.status === 'assigned' && c.coupon.is_active && (!c.coupon.expires_at || new Date(c.coupon.expires_at) > new Date()))
            setMyCoupons(available)
            if (available.length > 0) {
                setShowCouponPopup(true)
            }
        } catch (e) { console.error(e) }
    }

    async function handleAddToCart() {
        setAdding(true)
        try {
            await API.cart.add(product.id, quantity)
            await refreshCartCount()
            showToast('Added to cart!', 'success')
        } catch (err) {
            if (err.message.includes('Not authenticated') || err.message.includes('login')) {
                navigate('/login?next=/product/' + id)
            } else {
                showToast(err.message, 'danger')
            }
        }
        setAdding(false)
    }

    async function handleBuyNow() {
        setAdding(true)
        try {
            await API.cart.add(product.id, quantity)
            await refreshCartCount()
            navigate('/cart')
        } catch (err) {
            if (err.message.includes('Not authenticated') || err.message.includes('login')) {
                navigate('/login?next=/cart')
            } else {
                showToast(err.message, 'danger')
            }
        }
        setAdding(false)
    }

    async function handleClaim(assignmentId) {
        setClaimingId(assignmentId)
        try {
            const res = await API.coupons.claim(assignmentId)
            showToast(res.message || 'Coupon claimed!', 'success')
            await loadMyCoupons()
        } catch (err) {
            showToast(err.message, 'danger')
        }
        setClaimingId(null)
    }

    if (loading) {
        return <div className="container mt-4"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>
    }

    if (!product) {
        return <div className="container mt-4"><div className="alert alert-danger">Product not found.</div><Link to="/shop" className="btn btn-primary">Back to Shop</Link></div>
    }

    return (
        <section className="container mt-4">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                    <li className="breadcrumb-item"><Link to="/shop">Shop</Link></li>
                    <li className="breadcrumb-item active">{product.name}</li>
                </ol>
            </nav>

            <div className="row">
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <img src={`/static/uploads/${product.image}`} className="card-img-top" alt={product.name} style={{ height: '400px', objectFit: 'cover' }} />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card p-4">
                        {product.category_name && (
                            <span className="badge bg-secondary mb-2">{product.category_name}</span>
                        )}
                        <h2>{product.name}</h2>
                        <p className="text-muted">{product.description}</p>

                        <div className="mb-3">
                            <span className="display-6 fw-bold text-primary">{formatCurrency(product.price)}</span>
                        </div>

                        <div className="mb-3">
                            <strong>Stock:</strong> {product.stock > 0 ? <span className="text-success">{product.stock} available</span> : <span className="text-danger">Out of stock</span>}
                        </div>

                        {product.is_featured && <span className="badge bg-warning text-dark me-1">Featured</span>}
                        {product.is_new && <span className="badge bg-info">New</span>}

                        <div className="mt-4">
                            <label className="form-label">Quantity</label>
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <button className="btn btn-outline-secondary" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                <span className="fs-5">{quantity}</span>
                                <button className="btn btn-outline-secondary" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
                            </div>

                            <div className="d-flex gap-2">
                                <button className="btn btn-primary flex-fill" onClick={handleAddToCart} disabled={adding || product.stock <= 0}>
                                    {adding ? 'Adding...' : <><i className="bi bi-cart-plus me-1"></i>Add to Cart</>}
                                </button>
                                <button className="btn btn-success flex-fill" onClick={handleBuyNow} disabled={adding || product.stock <= 0}>
                                    <i className="bi bi-lightning me-1"></i>Buy Now
                                </button>
                            </div>
                        </div>

                        {user && myCoupons.length > 0 && (
                            <div className="mt-3">
                                <button className="btn btn-outline-warning w-100" onClick={() => setShowCouponPopup(true)}>
                                    <i className="bi bi-ticket-perforated me-1"></i>You have {myCoupons.length} coupon(s) to claim!
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Coupon Popup */}
            {showCouponPopup && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-warning text-dark">
                                <h5><i className="bi bi-gift me-2"></i>Coupons Available for You!</h5>
                                <button className="btn-close" onClick={() => setShowCouponPopup(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p className="text-muted mb-3">You have {myCoupons.length} coupon(s) waiting to be claimed. Claim them now!</p>
                                <div className="d-flex flex-column gap-2">
                                    {myCoupons.map(item => {
                                        const c = item.coupon
                                        return (
                                            <div key={item.assignment_id} className="card border-warning">
                                                <div className="card-body d-flex justify-content-between align-items-center py-2">
                                                    <div>
                                                        <code className="fs-6">{c.code}</code>
                                                        <div className="small text-muted">
                                                            {c.discount_percent}% off
                                                            {c.min_order_amount > 0 && ` · Min ${formatCurrency(c.min_order_amount)}`}
                                                            {c.expires_at && ` · Expires ${new Date(c.expires_at).toLocaleDateString()}`}
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => handleClaim(item.assignment_id)}
                                                        disabled={claimingId === item.assignment_id}
                                                    >
                                                        {claimingId === item.assignment_id ? 'Claiming...' : 'Claim'}
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowCouponPopup(false)}>Close</button>
                                <Link to="/coupons" className="btn btn-outline-primary" onClick={() => setShowCouponPopup(false)}>
                                    View All Coupons
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API, formatCurrency } from '../../api/index.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../components/Toast.jsx'

export default function Cart() {
    const { refreshCartCount } = useAuth()
    const { showToast } = useToast()
    const navigate = useNavigate()
    const [cart, setCart] = useState(null)
    const [checkoutData, setCheckoutData] = useState({ name: '', phone: '', address: '', notes: '' })
    const [showCheckout, setShowCheckout] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [couponInput, setCouponInput] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState(null)
    const [applyingCoupon, setApplyingCoupon] = useState(false)

    useEffect(() => { loadCart() }, [])

    async function loadCart() {
        try {
            const res = await API.cart.get()
            setCart(res)
        } catch (e) { console.error(e) }
    }

    async function handleUpdateQty(id, qty) {
        try {
            await API.cart.update(id, qty)
            await loadCart()
            await refreshCartCount()
        } catch (e) { showToast(e.message, 'danger') }
    }

    async function handleRemove(id) {
        try {
            await API.cart.remove(id)
            await loadCart()
            await refreshCartCount()
            showToast('Item removed', 'success')
        } catch (e) { showToast(e.message, 'danger') }
    }

    async function handleApplyCoupon(e) {
        e.preventDefault()
        if (!couponInput.trim()) return
        setApplyingCoupon(true)
        try {
            const subtotal = (cart?.items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0)
            const res = await API.coupons.validate(couponInput.trim(), subtotal)
            setAppliedCoupon(res.coupon)
            showToast(`Coupon applied! ${res.coupon.discount_percent}% off`, 'success')
        } catch (err) {
            showToast(err.message, 'danger')
            setAppliedCoupon(null)
        }
        setApplyingCoupon(false)
    }

    function handleRemoveCoupon() {
        setAppliedCoupon(null)
        setCouponInput('')
    }

    async function handleCheckout(e) {
        e.preventDefault()
        setProcessing(true)
        try {
            const payload = { ...checkoutData }
            if (appliedCoupon) payload.coupon_code = appliedCoupon.code
            await API.cart.checkout(payload)
            showToast('Order placed successfully!', 'success')
            await refreshCartCount()
            navigate('/order-history')
        } catch (e) {
            showToast(e.message, 'danger')
        }
        setProcessing(false)
    }

    if (!cart) {
        return <div className="container mt-4"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>
    }

    const items = cart.items || []
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const discount = appliedCoupon ? appliedCoupon.discount_amount : 0
    const totalAfterDiscount = Math.max(0, subtotal - discount)

    return (
        <section className="container mt-4">
            <h2>Your Cart</h2>
            {items.length === 0 ? (
                <>
                    <div className="alert alert-info">Your cart is empty. Start shopping to add items!</div>
                    <Link to="/shop" className="btn btn-success">Go to Shop</Link>
                </>
            ) : (
                <>
                    <div className="row">
                        {items.map(item => (
                            <div key={item.id} className="col-md-6 col-lg-4 mb-3">
                                <div className="card cart-item-card p-3">
                                    <div className="d-flex gap-3">
                                        <img src={`/static/uploads/${item.image}`} className="cart-item-img rounded" alt={item.name} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                        <div className="flex-fill">
                                            <h6>{item.name}</h6>
                                            <p className="mb-1">{formatCurrency(item.price)}</p>
                                            <div className="d-flex align-items-center gap-2">
                                                <button className="btn btn-sm btn-outline-secondary" onClick={() => handleUpdateQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                                                <span>{item.quantity}</span>
                                                <button className="btn btn-sm btn-outline-secondary" onClick={() => handleUpdateQty(item.id, item.quantity + 1)}>+</button>
                                            </div>
                                            <button className="btn btn-sm btn-danger mt-2" onClick={() => handleRemove(item.id)}>Remove</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="card p-4 mt-3">
                        <h5>Order Summary</h5>

                        {!appliedCoupon ? (
                            <form onSubmit={handleApplyCoupon} className="row g-2 mb-3">
                                <div className="col-md-8">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter coupon code"
                                        value={couponInput}
                                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <button type="submit" className="btn btn-outline-primary w-100" disabled={applyingCoupon || !couponInput.trim()}>
                                        {applyingCoupon ? 'Applying...' : 'Apply Coupon'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="alert alert-success d-flex justify-content-between align-items-center py-2 mb-3">
                                <span><i className="bi bi-check-circle me-1"></i>
                                    <strong>{appliedCoupon.code}</strong> — {appliedCoupon.discount_percent}% off ({formatCurrency(appliedCoupon.discount_amount)})
                                </span>
                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleRemoveCoupon}>Remove</button>
                            </div>
                        )}

                        <div className="mb-1">
                            <span>Subtotal:</span> <strong>{formatCurrency(subtotal)}</strong>
                        </div>
                        {discount > 0 && (
                            <div className="mb-1 text-success">
                                <span>Discount:</span> <strong>-{formatCurrency(discount)}</strong>
                            </div>
                        )}
                        <p className="mb-3">Total: <strong>{formatCurrency(totalAfterDiscount)}</strong></p>

                        {!showCheckout ? (
                            <button className="btn btn-primary" onClick={() => setShowCheckout(true)}>Proceed to Checkout</button>
                        ) : (
                            <form onSubmit={handleCheckout} className="row g-3 mt-3">
                                <div className="col-md-6">
                                    <label className="form-label">Full Name</label>
                                    <input className="form-control" value={checkoutData.name} onChange={e => setCheckoutData({ ...checkoutData, name: e.target.value })} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Phone</label>
                                    <input className="form-control" value={checkoutData.phone} onChange={e => setCheckoutData({ ...checkoutData, phone: e.target.value })} required />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Delivery Address</label>
                                    <textarea className="form-control" value={checkoutData.address} onChange={e => setCheckoutData({ ...checkoutData, address: e.target.value })} required></textarea>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Notes (optional)</label>
                                    <textarea className="form-control" value={checkoutData.notes} onChange={e => setCheckoutData({ ...checkoutData, notes: e.target.value })}></textarea>
                                </div>
                                <div className="col-12">
                                    <button type="submit" className="btn btn-success" disabled={processing}>
                                        {processing ? 'Processing...' : 'Place Order'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </>
            )}
        </section>
    )
}

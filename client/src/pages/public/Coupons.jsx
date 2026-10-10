import React, { useState, useEffect } from 'react'
import { API, formatCurrency } from '../../api/index.js'
import { useToast } from '../../components/Toast.jsx'

export default function Coupons() {
    const { showToast } = useToast()
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)
    const [claimingId, setClaimingId] = useState(null)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const res = await API.coupons.my()
            setCoupons(res.coupons || [])
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    async function handleClaim(assignmentId) {
        setClaimingId(assignmentId)
        try {
            const res = await API.coupons.claim(assignmentId)
            showToast(res.message || 'Coupon claimed!', 'success')
            await loadData()
        } catch (err) {
            showToast(err.message, 'danger')
        }
        setClaimingId(null)
    }

    function copyCode(code) {
        navigator.clipboard.writeText(code)
        showToast('Code copied!', 'success')
    }

    if (loading) {
        return <div className="container mt-4"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>
    }

    return (
        <section className="container mt-4">
            <h2><i className="bi bi-ticket-perforated me-2"></i>My Coupons</h2>
            <p className="text-muted">Claim your assigned coupons and use them at checkout.</p>

            {coupons.length === 0 ? (
                <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    No coupons assigned to you yet. Check back later!
                </div>
            ) : (
                <div className="row g-3">
                    {coupons.map(item => {
                        const c = item.coupon
                        const isExpired = c.expires_at && new Date(c.expires_at) < new Date()
                        const isInactive = !c.is_active
                        const isUsed = item.status === 'used'
                        const isClaimed = item.status === 'claimed'
                        const isAssigned = item.status === 'assigned'

                        return (
                            <div key={item.assignment_id} className="col-md-6 col-lg-4">
                                <div className={`card h-100 coupon-card ${isUsed ? 'border-success' : isClaimed ? 'border-primary' : 'border-warning'}`}>
                                    <div className="card-body d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <h5 className="mb-0">
                                                    <code className="fs-5">{c.code}</code>
                                                </h5>
                                                <small className="text-muted">
                                                    Assigned: {new Date(item.assigned_at).toLocaleDateString()}
                                                </small>
                                            </div>
                                            <span className={`badge ${isUsed ? 'bg-success' : isClaimed ? 'bg-primary' : 'bg-warning text-dark'}`}>
                                                {isUsed ? 'Used' : isClaimed ? 'Claimed' : 'Available'}
                                            </span>
                                        </div>

                                        <div className="text-center my-3">
                                            <div className="display-6 fw-bold text-primary">{c.discount_percent}%</div>
                                            <div className="text-muted">OFF</div>
                                        </div>

                                        <div className="mb-2">
                                            {c.min_order_amount > 0 && (
                                                <div className="small text-muted">
                                                    <i className="bi bi-cart3 me-1"></i>Min order: {formatCurrency(c.min_order_amount)}
                                                </div>
                                            )}
                                            {c.expires_at && (
                                                <div className="small text-muted">
                                                    <i className="bi bi-calendar me-1"></i>Expires: {new Date(c.expires_at).toLocaleDateString()}
                                                </div>
                                            )}
                                            {c.max_uses > 0 && (
                                                <div className="small text-muted">
                                                    <i className="bi bi-repeat me-1"></i>Uses: {c.used_count}/{c.max_uses}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-auto">
                                            {isAssigned && !isExpired && !isInactive && (
                                                <button
                                                    className="btn btn-primary w-100"
                                                    onClick={() => handleClaim(item.assignment_id)}
                                                    disabled={claimingId === item.assignment_id}
                                                >
                                                    {claimingId === item.assignment_id ? 'Claiming...' : 'Claim Coupon'}
                                                </button>
                                            )}
                                            {isClaimed && !isExpired && !isInactive && (
                                                <button
                                                    className="btn btn-outline-primary w-100"
                                                    onClick={() => copyCode(c.code)}
                                                >
                                                    <i className="bi bi-clipboard me-1"></i>Copy Code
                                                </button>
                                            )}
                                            {isUsed && (
                                                <div className="text-center text-success small">
                                                    <i className="bi bi-check-circle me-1"></i>Used on {item.used_at ? new Date(item.used_at).toLocaleDateString() : 'an order'}
                                                </div>
                                            )}
                                            {isExpired && (
                                                <div className="text-center text-danger small">
                                                    <i className="bi bi-x-circle me-1"></i>Expired
                                                </div>
                                            )}
                                            {isInactive && !isExpired && (
                                                <div className="text-center text-muted small">
                                                    <i className="bi bi-slash-circle me-1"></i>Inactive
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </section>
    )
}

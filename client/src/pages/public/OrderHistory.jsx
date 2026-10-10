import React, { useState, useEffect } from 'react'
import { API, formatCurrency, formatDate } from '../../api/index.js'

export default function OrderHistory() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { loadOrders() }, [])

    async function loadOrders() {
        try {
            const res = await API.orders.myOrders()
            setOrders(res.orders || [])
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    const statusColors = {
        pending: 'warning',
        confirmed: 'info',
        processing: 'primary',
        shipped: 'secondary',
        delivered: 'success',
        cancelled: 'danger'
    }

    if (loading) {
        return <div className="container mt-4"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>
    }

    return (
        <section className="container mt-4">
            <h2>Order History</h2>
            {orders.length === 0 ? (
                <div className="alert alert-info">No orders yet.</div>
            ) : (
                orders.map(order => (
                    <div key={order.id} className="card order-card p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <h5>Order #{order.id}</h5>
                                <p>{formatDate(order.created_at)}</p>
                            </div>
                            <span className={`badge bg-${statusColors[order.status] || 'secondary'}`}>{order.status}</span>
                        </div>
                        <hr />
                        {order.items && order.items.map(item => (
                            <div key={item.id} className="d-flex justify-content-between mb-1">
                                <span>{item.name} x{item.quantity}</span>
                                <span>{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                        ))}
                        <hr />
                        <div className="d-flex justify-content-between">
                            <strong>Total: {formatCurrency(order.total)}</strong>
                            {order.address && <span className="text-muted">{order.address}</span>}
                        </div>
                    </div>
                ))
            )}
        </section>
    )
}

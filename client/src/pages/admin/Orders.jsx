import React, { useState, useEffect } from 'react'
import { API, formatCurrency, formatDate } from '../../api/index.js'
import { useToast } from '../../components/Toast.jsx'

const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
const statusColors = { pending: 'warning', confirmed: 'info', processing: 'primary', shipped: 'secondary', delivered: 'success', cancelled: 'danger' }

export default function Orders() {
    const { showToast } = useToast()
    const [orders, setOrders] = useState([])
    const [filter, setFilter] = useState('')

    useEffect(() => { loadOrders() }, [filter])

    async function loadOrders() {
        try {
            const params = filter ? { status: filter } : {}
            const res = await API.orders.list(params)
            setOrders(res.orders || [])
        } catch (e) { console.error(e) }
    }

    async function handleStatusChange(id, status) {
        try {
            await API.orders.updateStatus(id, status)
            showToast('Status updated!', 'success')
            await loadOrders()
        } catch (err) { showToast(err.message, 'danger') }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this order?')) return
        try {
            await API.orders.delete(id)
            showToast('Order deleted!', 'success')
            await loadOrders()
        } catch (err) { showToast(err.message, 'danger') }
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Orders</h2>
                <select className="form-select w-auto" value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="table-responsive">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o.id}>
                                <td>{o.id}</td>
                                <td>{o.name || o.customer_name || '-'}</td>
                                <td>{formatCurrency(o.total)}</td>
                                <td>
                                    <select className={`form-select form-select-sm bg-${statusColors[o.status] || 'secondary'}`} value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)}>
                                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </td>
                                <td>{formatDate(o.created_at)}</td>
                                <td>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(o.id)}><i className="bi bi-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

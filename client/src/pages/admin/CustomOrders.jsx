import React, { useState, useEffect } from 'react'
import { API, formatCurrency, formatDate } from '../../api/index.js'
import { useToast } from '../../components/Toast.jsx'

const statuses = ['pending', 'in_progress', 'completed', 'cancelled']
const statusColors = { pending: 'warning', in_progress: 'info', completed: 'success', cancelled: 'danger' }

export default function CustomOrders() {
    const { showToast } = useToast()
    const [orders, setOrders] = useState([])

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const res = await API.customOrders.list()
            setOrders(res.orders || [])
        } catch (e) { console.error(e) }
    }

    async function handleStatusChange(id, status) {
        try {
            await API.customOrders.updateStatus(id, status)
            showToast('Status updated!', 'success')
            await loadData()
        } catch (err) { showToast(err.message, 'danger') }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this custom order?')) return
        try {
            await API.customOrders.delete(id)
            showToast('Custom order deleted!', 'success')
            await loadData()
        } catch (err) { showToast(err.message, 'danger') }
    }

    return (
        <div>
            <h2>Custom Orders</h2>
            <div className="table-responsive">
                <table className="table table-hover">
                    <thead><tr><th>ID</th><th>Customer</th><th>Description</th><th>Budget</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o.id}>
                                <td>{o.id}</td>
                                <td>{o.name}<br /><small>{o.phone}</small></td>
                                <td>{o.description?.substring(0, 60)}{o.description?.length > 60 ? '...' : ''}</td>
                                <td>{o.budget ? formatCurrency(o.budget) : '-'}</td>
                                <td>{o.preferred_date || '-'}</td>
                                <td>
                                    <select className={`form-select form-select-sm bg-${statusColors[o.status] || 'secondary'}`} value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)}>
                                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </td>
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

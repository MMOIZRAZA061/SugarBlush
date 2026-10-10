import React, { useState, useEffect } from 'react'
import { API, formatCurrency } from '../../api/index.js'
import { useToast } from '../../components/Toast.jsx'

export default function CustomOrders() {
    const { showToast } = useToast()
    const [orders, setOrders] = useState([])
    const [form, setForm] = useState({ name: '', phone: '', description: '', preferred_date: '', budget: '' })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => { loadOrders() }, [])

    async function loadOrders() {
        try {
            const res = await API.customOrders.list()
            setOrders(res.orders || [])
        } catch (e) { console.error(e) }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        try {
            await API.customOrders.create(form)
            showToast('Custom order request submitted!', 'success')
            setForm({ name: '', phone: '', description: '', preferred_date: '', budget: '' })
            await loadOrders()
        } catch (err) {
            showToast(err.message, 'danger')
        }
        setSubmitting(false)
    }

    return (
        <section className="container mt-4">
            <h2>Custom Orders</h2>
            <p className="text-muted">Have a special request? Tell us about your dream cake or treat!</p>

            <div className="row">
                <div className="col-md-6">
                    <form onSubmit={handleSubmit} className="card p-4">
                        <h5>Submit a Custom Request</h5>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Your Name</label>
                                <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Phone</label>
                                <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                            </div>
                            <div className="col-12">
                                <label className="form-label">Description</label>
                                <textarea className="form-control" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required placeholder="Describe your custom order..."></textarea>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Preferred Date</label>
                                <input type="date" className="form-control" value={form.preferred_date} onChange={e => setForm({ ...form, preferred_date: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Budget (PKR)</label>
                                <input type="number" className="form-control" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
                            </div>
                            <div className="col-12">
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="col-md-6">
                    <h5>Your Recent Requests</h5>
                    {orders.length === 0 ? (
                        <div className="alert alert-info">No custom order requests yet.</div>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} className="card custom-request-card p-3 mb-3">
                                <h6>{order.description.substring(0, 80)}{order.description.length > 80 ? '...' : ''}</h6>
                                <p><strong>Date:</strong> {order.preferred_date || 'Not specified'}</p>
                                <p><strong>Budget:</strong> {order.budget ? formatCurrency(order.budget) : 'Not specified'}</p>
                                <p><strong>Status:</strong> <span className={`badge bg-${order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : 'info'}`}>{order.status}</span></p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    )
}

import React, { useState, useEffect } from 'react'
import { API, formatCurrency } from '../../api/index.js'
import { useToast } from '../../components/Toast.jsx'

export default function Stock() {
    const { showToast } = useToast()
    const [products, setProducts] = useState([])
    const [logs, setLogs] = useState([])
    const [showLogs, setShowLogs] = useState(false)
    const [updateForm, setUpdateForm] = useState({ productId: '', stock: '', reason: '' })

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const res = await API.stock.list()
            setProducts(res.products || [])
        } catch (e) { console.error(e) }
    }

    async function loadLogs() {
        try {
            const res = await API.stock.logs()
            setLogs(res.logs || [])
        } catch (e) { console.error(e) }
    }

    async function handleUpdate(e) {
        e.preventDefault()
        try {
            await API.stock.update(updateForm.productId, updateForm.stock, updateForm.reason)
            showToast('Stock updated!', 'success')
            setUpdateForm({ productId: '', stock: '', reason: '' })
            await loadData()
        } catch (err) { showToast(err.message, 'danger') }
    }

    return (
        <div>
            <h2>Stock Management</h2>

            <div className="card p-3 mb-3">
                <h5>Update Stock</h5>
                <form onSubmit={handleUpdate} className="row g-3">
                    <div className="col-md-4">
                        <label className="form-label">Product</label>
                        <select className="form-control" value={updateForm.productId} onChange={e => setUpdateForm({ ...updateForm, productId: e.target.value })} required>
                            <option value="">Select product</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} (Current: {p.stock})</option>)}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">New Stock</label>
                        <input type="number" className="form-control" value={updateForm.stock} onChange={e => setUpdateForm({ ...updateForm, stock: e.target.value })} required />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Reason</label>
                        <input className="form-control" value={updateForm.reason} onChange={e => setUpdateForm({ ...updateForm, reason: e.target.value })} />
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                        <button type="submit" className="btn btn-primary w-100">Update</button>
                    </div>
                </form>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Current Stock</h5>
                <button className="btn btn-outline-secondary" onClick={() => { setShowLogs(!showLogs); if (!showLogs) loadLogs() }}>
                    <i className="bi bi-clock-history me-1"></i>Stock Logs
                </button>
            </div>

            <div className="table-responsive">
                <table className="table table-hover">
                    <thead><tr><th>ID</th><th>Product</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id}>
                                <td>{p.id}</td>
                                <td>{p.name}</td>
                                <td>{formatCurrency(p.price)}</td>
                                <td>{p.stock}</td>
                                <td>
                                    {p.stock === 0 ? <span className="badge bg-danger">Out of Stock</span> :
                                        p.stock < 10 ? <span className="badge bg-warning">Low Stock</span> :
                                            <span className="badge bg-success">In Stock</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showLogs && (
                <div className="mt-3">
                    <h5>Stock Change Logs</h5>
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead><tr><th>Product</th><th>Old Stock</th><th>New Stock</th><th>Reason</th><th>Date</th></tr></thead>
                            <tbody>
                                {logs.map(l => (
                                    <tr key={l.id}>
                                        <td>{l.product_name || l.product_id}</td>
                                        <td>{l.old_stock}</td>
                                        <td>{l.new_stock}</td>
                                        <td>{l.reason || '-'}</td>
                                        <td>{l.created_at}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

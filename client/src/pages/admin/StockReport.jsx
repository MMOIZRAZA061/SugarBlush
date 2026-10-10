import React, { useState, useEffect } from 'react'
import { API, formatCurrency } from '../../api/index.js'

export default function StockReport() {
    const [data, setData] = useState(null)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const res = await API.stock.report()
            setData(res)
        } catch (e) { console.error(e) }
    }

    if (!data) {
        return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    }

    const totalStock = data.total_stock || 0
    const lowStock = data.low_stock || 0
    const categoryBreakdown = data.category_breakdown || []
    const products = data.products || []

    function stockLevelColor(stock) {
        if (stock === 0) return 'danger'
        if (stock <= 5) return 'warning'
        return 'success'
    }

    function stockLevelWidth(stock) {
        return Math.min(stock, 100)
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-0">Stock Analytics Report</h2>
                    <small className="text-muted">Inventory summary and category breakdown</small>
                </div>
                <div>
                    <a className="btn btn-outline-primary me-2" href="/admin/stock-report/pdf">Download PDF</a>
                    <a className="btn btn-outline-secondary" href="/admin/stock">Manage Stock</a>
                </div>
            </div>

            <div className="row mb-3">
                <div className="col-md-2">
                    <div className="card p-3 border-primary">
                        <h6>Total Stock</h6>
                        <strong>{totalStock}</strong>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card p-3 border-warning">
                        <h6>Low Stock (&le; 5)</h6>
                        <strong>{lowStock}</strong>
                    </div>
                </div>
            </div>

            <div className="card mb-4 p-3">
                <h5>Category Stock Breakdown</h5>
                <table className="table table-sm">
                    <thead><tr><th>Category</th><th>Total Stock</th></tr></thead>
                    <tbody>
                        {categoryBreakdown.map((c, i) => (
                            <tr key={i}><td>{c.category}</td><td>{c.total_stock}</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card p-3">
                <h5>All Products Stock</h5>
                <div className="table-responsive">
                    <table className="table table-striped table-hover align-middle">
                        <thead><tr><th>#</th><th>Product</th><th>Category</th><th>Stock</th><th>Status</th><th>Stock Level</th></tr></thead>
                        <tbody>
                            {products.map((p, i) => (
                                <tr key={p.id} className={p.stock === 0 ? 'table-danger' : p.stock <= 5 ? 'table-warning' : ''}>
                                    <td>{i + 1}</td>
                                    <td>{p.name}</td>
                                    <td>{p.category_name || '-'}</td>
                                    <td>{p.stock}</td>
                                    <td>
                                        {p.stock === 0 ? <span className="badge bg-danger">Out of Stock</span> :
                                            p.stock <= 5 ? <span className="badge bg-warning">Low Stock</span> :
                                                <span className="badge bg-success">Normal</span>}
                                    </td>
                                    <td>
                                        <div className="progress" style={{ height: '1rem' }}>
                                            <div className={`progress-bar bg-${stockLevelColor(p.stock)}`} role="progressbar"
                                                style={{ width: `${stockLevelWidth(p.stock)}%` }}
                                                aria-valuenow={p.stock} aria-valuemin="0" aria-valuemax="100">
                                                {p.stock}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

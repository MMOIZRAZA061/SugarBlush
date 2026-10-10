import React, { useState, useEffect } from 'react'
import { API, formatCurrency } from '../../api/index.js'

export default function Analytics() {
    const [data, setData] = useState(null)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const res = await API.reports.analytics()
            setData(res)
        } catch (e) { console.error(e) }
    }

    if (!data) {
        return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    }

    return (
        <div>
            <h2>Analytics</h2>
            <div className="row">
                <div className="col-md-6">
                    <div className="card p-3">
                        <h5>Sales Overview</h5>
                        <p><strong>Total Sales:</strong> {formatCurrency(data.total_sales || 0)}</p>
                        <p><strong>Total Profit:</strong> {formatCurrency(data.total_profit || 0)}</p>
                        <p><strong>Average Order Value:</strong> {formatCurrency(data.avg_order_value || 0)}</p>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card p-3">
                        <h5>Order Statistics</h5>
                        <p><strong>Total Orders:</strong> {data.total_orders || 0}</p>
                        <p><strong>Pending:</strong> {data.pending_orders || 0}</p>
                        <p><strong>Completed:</strong> {data.completed_orders || 0}</p>
                        <p><strong>Cancelled:</strong> {data.cancelled_orders || 0}</p>
                    </div>
                </div>
            </div>

            {data.top_products && data.top_products.length > 0 && (
                <div className="card p-3 mt-3">
                    <h5>Top Selling Products</h5>
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead><tr><th>Product</th><th>Quantity Sold</th><th>Revenue</th></tr></thead>
                            <tbody>
                                {data.top_products.map((p, i) => (
                                    <tr key={i}>
                                        <td>{p.name}</td>
                                        <td>{p.quantity_sold}</td>
                                        <td>{formatCurrency(p.revenue)}</td>
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

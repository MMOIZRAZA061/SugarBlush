import React, { useState, useEffect } from 'react'
import { API, formatCurrency } from '../../api/index.js'

export default function Reports() {
    const [data, setData] = useState(null)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const res = await API.reports.dashboard()
            setData(res)
        } catch (e) { console.error(e) }
    }

    if (!data) {
        return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    }

    return (
        <div>
            <h2>Reports & Analytics</h2>
            <div className="row mb-3">
                <div className="col-md-3">
                    <div className="card text-white bg-primary p-3">
                        <h6>Total Sales</h6>
                        <h3>{formatCurrency(data.total_sales || 0)}</h3>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-success p-3">
                        <h6>Total Profit</h6>
                        <h3>{formatCurrency(data.total_profit || 0)}</h3>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-warning p-3">
                        <h6>Total Orders</h6>
                        <h3>{data.total_orders || 0}</h3>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-info p-3">
                        <h6>Total Customers</h6>
                        <h3>{data.total_customers || 0}</h3>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="card p-3">
                        <h5>Today's Summary</h5>
                        <p><strong>Sales:</strong> {formatCurrency(data.today_sales || 0)}</p>
                        <p><strong>Profit:</strong> {formatCurrency(data.today_profit || 0)}</p>
                        <p><strong>Pending Orders:</strong> {data.pending_orders || 0}</p>
                        <p><strong>Completed Orders:</strong> {data.completed_orders || 0}</p>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card p-3">
                        <h5>Inventory Summary</h5>
                        <p><strong>Total Products:</strong> {data.total_products || 0}</p>
                        <p><strong>Pending Custom Orders:</strong> {data.pending_custom_orders || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

import React, { useState, useEffect } from 'react'
import { API, formatCurrency } from '../../api/index.js'

export default function Dashboard() {
    const [stats, setStats] = useState(null)

    useEffect(() => { loadStats() }, [])

    async function loadStats() {
        try {
            const res = await API.reports.dashboard()
            setStats(res)
        } catch (e) { console.error(e) }
    }

    if (!stats) {
        return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    }

    const statCards = [
        { label: 'Total Sales', value: formatCurrency(stats.total_sales || 0), icon: 'bi-currency-dollar', color: 'primary' },
        { label: 'Total Profit', value: formatCurrency(stats.total_profit || 0), icon: 'bi-graph-up', color: 'success' },
        { label: 'Total Orders', value: stats.total_orders || 0, icon: 'bi-basket3', color: 'warning' },
        { label: 'Total Customers', value: stats.total_customers || 0, icon: 'bi-people', color: 'info' },
        { label: 'Total Products', value: stats.total_products || 0, icon: 'bi-box-seam', color: 'secondary' },
        { label: 'Today Sales', value: formatCurrency(stats.today_sales || 0), icon: 'bi-calendar-day', color: 'primary' },
        { label: 'Today Profit', value: formatCurrency(stats.today_profit || 0), icon: 'bi-currency-dollar', color: 'success' },
        { label: 'Pending Orders', value: stats.pending_orders || 0, icon: 'bi-hourglass-split', color: 'warning' },
        { label: 'Pending Custom Orders', value: stats.pending_custom_orders || 0, icon: 'bi-hand-index', color: 'info' },
        { label: 'Completed Orders', value: stats.completed_orders || 0, icon: 'bi-check2-circle', color: 'success' },
    ]

    return (
        <div>
            <h2>Admin Dashboard</h2>
            <div className="row mb-3">
                {statCards.map((card, i) => (
                    <div key={i} className="col-sm-6 col-md-2 mb-2">
                        <div className={`card text-white bg-${card.color} h-100 p-3`}>
                            <div className="d-flex align-items-center justify-content-between">
                                <div><i className={`bi ${card.icon} fs-2`}></i></div>
                                <div className="text-end">
                                    <h6 className="mb-0">{card.label}</h6>
                                    <strong>{card.value}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

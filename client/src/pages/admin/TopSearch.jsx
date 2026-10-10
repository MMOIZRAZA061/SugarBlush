import React, { useState, useEffect } from 'react'
import { API } from '../../api/index.js'

export default function TopSearch() {
    const [data, setData] = useState(null)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const res = await API.reports.topSearch()
            setData(res)
        } catch (e) { console.error(e) }
    }

    if (!data) {
        return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    }

    const searches = data.topSearches || []
    const uniqueTerms = searches.length
    const totalVolume = searches.reduce((sum, s) => sum + (s.count || 0), 0)
    const avgPerTerm = uniqueTerms > 0 ? (totalVolume / uniqueTerms).toFixed(2) : '0.00'
    const topTerm = searches.length > 0 ? searches[0] : null

    return (
        <div>
            <h2>Top Search Term Analytics</h2>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <p className="mb-0 text-muted">Data includes all tracked user search terms and frequency.</p>
                    <small className="text-muted">Most recent searches first.</small>
                </div>
                <div>
                    <a className="btn btn-success me-2" href="/admin/top-search/pdf">Download PDF Report</a>
                    <a className="btn btn-outline-secondary" href="/admin/dashboard">Back to Dashboard</a>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card shadow-sm p-3 border-left-primary">
                        <div className="text-muted">Unique Search Terms</div>
                        <div className="h3 mb-0">{uniqueTerms}</div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card shadow-sm p-3 border-left-info">
                        <div className="text-muted">Total Search Volume</div>
                        <div className="h3 mb-0">{totalVolume}</div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card shadow-sm p-3 border-left-warning">
                        <div className="text-muted">Avg Searches/Term</div>
                        <div className="h3 mb-0">{avgPerTerm}</div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card shadow-sm p-3 border-left-success">
                        <div className="text-muted">Top Search Term</div>
                        <div className="h3 mb-0">{topTerm ? topTerm.term : 'N/A'}</div>
                        <small className="text-muted">({topTerm ? topTerm.count : '-'} searches)</small>
                    </div>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-striped table-hover align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th scope="col">Rank</th>
                            <th scope="col">Search Term</th>
                            <th scope="col">Count</th>
                            <th scope="col">Last Searched</th>
                            <th scope="col">Trend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {searches.length === 0 ? (
                            <tr><td colspan="5" className="text-center">No searches yet.</td></tr>
                        ) : (
                            searches.map((s, i) => (
                                <tr key={i}>
                                    <td>{i + 1}</td>
                                    <td><strong>{s.term}</strong></td>
                                    <td>{s.count}</td>
                                    <td>{s.last_searched || '-'}</td>
                                    <td>
                                        <span className="badge bg-success">
                                            <i className="bi bi-arrow-up"></i> Trending
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

import React, { useState, useEffect } from 'react'
import { API, formatCurrency } from '../../api/index.js'
import { useToast } from '../../components/Toast.jsx'

const emptyForm = {
    code: '',
    discount_percent: '',
    min_order_amount: 0,
    max_uses: 0,
    expires_at: '',
    is_active: 1
}

export default function Coupons() {
    const { showToast } = useToast()
    const [coupons, setCoupons] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [showGenModal, setShowGenModal] = useState(false)
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(emptyForm)
    const [genForm, setGenForm] = useState({ discount_percent: 10, min_order_amount: 0, max_uses: 0, expires_at: '', is_active: 1, count: 5 })
    const [generated, setGenerated] = useState([])
    const [assignForm, setAssignForm] = useState({ coupon_id: '', total_assignments: 10 })
    const [assignResult, setAssignResult] = useState(null)
    const [assigning, setAssigning] = useState(false)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const res = await API.coupons.list()
            setCoupons(res.coupons || [])
        } catch (e) { console.error(e) }
    }

    function openCreate() {
        setEditing(null)
        setForm(emptyForm)
        setShowModal(true)
    }

    function openEdit(c) {
        setEditing(c)
        setForm({
            code: c.code,
            discount_percent: c.discount_percent,
            min_order_amount: c.min_order_amount || 0,
            max_uses: c.max_uses || 0,
            expires_at: c.expires_at ? c.expires_at.replace(' ', 'T').slice(0, 16) : '',
            is_active: c.is_active
        })
        setShowModal(true)
    }

    function openAssign(c) {
        setAssignForm({ coupon_id: c.id, total_assignments: 10 })
        setAssignResult(null)
        setShowAssignModal(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            const payload = {
                ...form,
                expires_at: form.expires_at ? form.expires_at.replace('T', ' ') : null
            }
            if (editing) {
                await API.coupons.update(editing.id, payload)
                showToast('Coupon updated!', 'success')
            } else {
                await API.coupons.create(payload)
                showToast('Coupon created!', 'success')
            }
            setShowModal(false)
            await loadData()
        } catch (err) { showToast(err.message, 'danger') }
    }

    async function handleGenerate(e) {
        e.preventDefault()
        try {
            const payload = {
                ...genForm,
                expires_at: genForm.expires_at ? genForm.expires_at.replace('T', ' ') : null
            }
            const res = await API.coupons.generate(payload)
            setGenerated(res.coupons || [])
            showToast(`Generated ${res.coupons.length} coupons!`, 'success')
            await loadData()
        } catch (err) { showToast(err.message, 'danger') }
    }

    async function handleAssign(e) {
        e.preventDefault()
        setAssigning(true)
        try {
            const res = await API.coupons.assign(assignForm.coupon_id, assignForm.total_assignments)
            setAssignResult(res)
            showToast(`Assigned ${res.assigned} coupons to random users!`, 'success')
            await loadData()
        } catch (err) { showToast(err.message, 'danger') }
        setAssigning(false)
    }

    async function handleDelete(id) {
        if (!confirm('Delete this coupon?')) return
        try {
            await API.coupons.delete(id)
            showToast('Coupon deleted!', 'success')
            await loadData()
        } catch (err) { showToast(err.message, 'danger') }
    }

    function copyCode(code) {
        navigator.clipboard.writeText(code)
        showToast('Code copied!', 'success')
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Coupons</h2>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary" onClick={() => { setGenForm({ ...genForm, count: 5 }); setGenerated([]); setShowGenModal(true) }}>
                        <i className="bi bi-magic me-1"></i>Generate Random
                    </button>
                    <button className="btn btn-primary" onClick={openCreate}>
                        <i className="bi bi-plus-lg me-1"></i>Add Coupon
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Code</th>
                                <th>Discount</th>
                                <th>Min Order</th>
                                <th>Uses</th>
                                <th>Assigned</th>
                                <th>Expires</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.length === 0 && (
                                <tr><td colSpan="8" className="text-center text-muted py-4">No coupons yet. Create or generate one!</td></tr>
                            )}
                            {coupons.map(c => (
                                <tr key={c.id}>
                                    <td>
                                        <code className="me-2">{c.code}</code>
                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => copyCode(c.code)} title="Copy">
                                            <i className="bi bi-clipboard"></i>
                                        </button>
                                    </td>
                                    <td><strong>{c.discount_percent}%</strong></td>
                                    <td>{c.min_order_amount > 0 ? formatCurrency(c.min_order_amount) : '—'}</td>
                                    <td>{c.used_count} / {c.max_uses > 0 ? c.max_uses : '∞'}</td>
                                    <td>
                                        <span className="badge bg-info">{c.assigned_count || 0}</span>
                                        {c.claimed_count > 0 && <span className="badge bg-primary ms-1">{c.claimed_count} claimed</span>}
                                    </td>
                                    <td>{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}</td>
                                    <td>
                                        <span className={`badge ${c.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                            {c.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            <button className="btn btn-sm btn-outline-success" onClick={() => openAssign(c)} title="Assign to Users">
                                                <i className="bi bi-person-plus"></i>
                                            </button>
                                            <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(c)}><i className="bi bi-pencil"></i></button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id)}><i className="bi bi-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5>{editing ? 'Edit Coupon' : 'Add Coupon'}</h5>
                                <button className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Coupon Code</label>
                                        <input className="form-control" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="Leave blank to auto-generate" />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Discount Percent (%)</label>
                                        <input type="number" min="1" max="100" step="0.01" className="form-control" value={form.discount_percent} onChange={e => setForm({ ...form, discount_percent: e.target.value })} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Minimum Order Amount (Rs.)</label>
                                        <input type="number" min="0" step="0.01" className="form-control" value={form.min_order_amount} onChange={e => setForm({ ...form, min_order_amount: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Max Uses (0 = unlimited)</label>
                                        <input type="number" min="0" className="form-control" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Expires At (optional)</label>
                                        <input type="datetime-local" className="form-control" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} />
                                    </div>
                                    <div className="form-check">
                                        <input type="checkbox" className="form-check-input" id="isActive" checked={!!form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })} />
                                        <label className="form-check-label" for="isActive">Active</label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showGenModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5>Generate Random Coupons</h5>
                                <button className="btn-close" onClick={() => setShowGenModal(false)}></button>
                            </div>
                            <form onSubmit={handleGenerate}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Discount Percent (%)</label>
                                        <input type="number" min="1" max="100" step="0.01" className="form-control" value={genForm.discount_percent} onChange={e => setGenForm({ ...genForm, discount_percent: e.target.value })} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Minimum Order Amount (Rs.)</label>
                                        <input type="number" min="0" step="0.01" className="form-control" value={genForm.min_order_amount} onChange={e => setGenForm({ ...genForm, min_order_amount: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Max Uses per Coupon (0 = unlimited)</label>
                                        <input type="number" min="0" className="form-control" value={genForm.max_uses} onChange={e => setGenForm({ ...genForm, max_uses: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Expires At (optional)</label>
                                        <input type="datetime-local" className="form-control" value={genForm.expires_at} onChange={e => setGenForm({ ...genForm, expires_at: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">How many codes to generate?</label>
                                        <input type="number" min="1" max="100" className="form-control" value={genForm.count} onChange={e => setGenForm({ ...genForm, count: e.target.value })} required />
                                    </div>
                                    <div className="form-check">
                                        <input type="checkbox" className="form-check-input" id="genActive" checked={!!genForm.is_active} onChange={e => setGenForm({ ...genForm, is_active: e.target.checked ? 1 : 0 })} />
                                        <label className="form-check-label" for="genActive">Active</label>
                                    </div>

                                    {generated.length > 0 && (
                                        <div className="mt-3 p-3 bg-light rounded">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <strong>Generated Codes:</strong>
                                                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => navigator.clipboard.writeText(generated.map(g => g.code).join('\n'))}>
                                                    <i className="bi bi-clipboard me-1"></i>Copy All
                                                </button>
                                            </div>
                                            <div className="d-flex flex-wrap gap-2">
                                                {generated.map(g => (
                                                    <code key={g.id} className="badge bg-dark">{g.code}</code>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowGenModal(false)}>Close</button>
                                    <button type="submit" className="btn btn-primary"><i className="bi bi-magic me-1"></i>Generate</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showAssignModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5><i className="bi bi-person-plus me-1"></i>Assign to Random Users</h5>
                                <button className="btn-close" onClick={() => setShowAssignModal(false)}></button>
                            </div>
                            <form onSubmit={handleAssign}>
                                <div className="modal-body">
                                    <div className="alert alert-info py-2">
                                        <i className="bi bi-info-circle me-1"></i>
                                        This will assign the coupon to random customer users. They will see it on their <strong>Coupons</strong> page and can claim it.
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Total Users to Assign</label>
                                        <input type="number" min="1" max="500" className="form-control" value={assignForm.total_assignments} onChange={e => setAssignForm({ ...assignForm, total_assignments: e.target.value })} required />
                                        <div className="form-text">Coupon will be assigned to this many random users (max 500)</div>
                                    </div>

                                    {assignResult && (
                                        <div className="mt-3 p-3 bg-light rounded">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <strong>Assignment Result:</strong>
                                                <span className="badge bg-success">{assignResult.assigned} assigned</span>
                                            </div>
                                            {assignResult.assigned < assignResult.total_requested && (
                                                <div className="alert alert-warning py-1 small mb-2">
                                                    Only {assignResult.assigned} users available (requested {assignResult.total_requested})
                                                </div>
                                            )}
                                            <div className="d-flex flex-wrap gap-1">
                                                {assignResult.assignments?.map(a => (
                                                    <span key={a.id} className="badge bg-secondary">{a.user_name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Close</button>
                                    <button type="submit" className="btn btn-success" disabled={assigning}>
                                        {assigning ? 'Assigning...' : <><i className="bi bi-person-plus me-1"></i>Assign Now</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

import React, { useState, useEffect } from 'react'
import { API, formatDate } from '../../api/index.js'
import { useToast } from '../../components/Toast.jsx'

export default function Users() {
    const { showToast } = useToast()
    const [users, setUsers] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'customer' })

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const res = await API.users.list()
            setUsers(res.users || [])
        } catch (e) { console.error(e) }
    }

    function openEdit(u) {
        setEditing(u)
        setForm({ name: u.name || '', email: u.email || '', phone: u.phone || '', role: u.role || 'customer' })
        setShowModal(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            await API.users.update(editing.id, form)
            showToast('User updated!', 'success')
            setShowModal(false)
            await loadData()
        } catch (err) { showToast(err.message, 'danger') }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this user?')) return
        try {
            await API.users.delete(id)
            showToast('User deleted!', 'success')
            await loadData()
        } catch (err) { showToast(err.message, 'danger') }
    }

    return (
        <div>
            <h2>Users</h2>
            <div className="table-responsive">
                <table className="table table-hover">
                    <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td>{u.phone || '-'}</td>
                                <td><span className={`badge bg-${u.role === 'admin' ? 'danger' : 'secondary'}`}>{u.role}</span></td>
                                <td>{formatDate(u.created_at)}</td>
                                <td>
                                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(u)}><i className="bi bi-pencil"></i></button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u.id)}><i className="bi bi-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5>Edit User</h5>
                                <button className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Name</label>
                                        <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Phone</label>
                                        <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Role</label>
                                        <select className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                            <option value="customer">Customer</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Update</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

import React, { useState, useEffect } from 'react'
import { API, formatDate } from '../../api/index.js'
import { useToast } from '../../components/Toast.jsx'

export default function Announcements() {
    const { showToast } = useToast()
    const [announcements, setAnnouncements] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({ title: '', content: '' })

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const res = await API.announcements.list()
            setAnnouncements(res.announcements || [])
        } catch (e) { console.error(e) }
    }

    function openCreate() {
        setEditing(null)
        setForm({ title: '', content: '' })
        setShowModal(true)
    }

    function openEdit(a) {
        setEditing(a)
        setForm({ title: a.title, content: a.content || '' })
        setShowModal(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            if (editing) {
                await API.announcements.update(editing.id, form)
                showToast('Announcement updated!', 'success')
            } else {
                await API.announcements.create(form)
                showToast('Announcement created!', 'success')
            }
            setShowModal(false)
            await loadData()
        } catch (err) { showToast(err.message, 'danger') }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this announcement?')) return
        try {
            await API.announcements.delete(id)
            showToast('Announcement deleted!', 'success')
            await loadData()
        } catch (err) { showToast(err.message, 'danger') }
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Announcements</h2>
                <button className="btn btn-primary" onClick={openCreate}><i className="bi bi-plus-lg me-1"></i>Add Announcement</button>
            </div>

            <div className="table-responsive">
                <table className="table table-hover">
                    <thead><tr><th>ID</th><th>Title</th><th>Content</th><th>Date</th><th>Actions</th></tr></thead>
                    <tbody>
                        {announcements.map(a => (
                            <tr key={a.id}>
                                <td>{a.id}</td>
                                <td>{a.title}</td>
                                <td>{a.content?.substring(0, 60)}{a.content?.length > 60 ? '...' : ''}</td>
                                <td>{formatDate(a.created_at)}</td>
                                <td>
                                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(a)}><i className="bi bi-pencil"></i></button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(a.id)}><i className="bi bi-trash"></i></button>
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
                                <h5>{editing ? 'Edit Announcement' : 'Add Announcement'}</h5>
                                <button className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Title</label>
                                        <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Content</label>
                                        <textarea className="form-control" rows={4} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required></textarea>
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
        </div>
    )
}

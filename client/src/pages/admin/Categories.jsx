import React, { useState, useEffect } from 'react'
import { API } from '../../api/index.js'
import { useToast } from '../../components/Toast.jsx'

export default function Categories() {
    const { showToast } = useToast()
    const [categories, setCategories] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({ name: '', description: '' })

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const res = await API.categories.list()
            setCategories(res.categories || [])
        } catch (e) { console.error(e) }
    }

    function openCreate() {
        setEditing(null)
        setForm({ name: '', description: '' })
        setShowModal(true)
    }

    function openEdit(c) {
        setEditing(c)
        setForm({ name: c.name, description: c.description || '' })
        setShowModal(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            if (editing) {
                await API.categories.update(editing.id, form)
                showToast('Category updated!', 'success')
            } else {
                await API.categories.create(form)
                showToast('Category created!', 'success')
            }
            setShowModal(false)
            await loadData()
        } catch (err) { showToast(err.message, 'danger') }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this category?')) return
        try {
            await API.categories.delete(id)
            showToast('Category deleted!', 'success')
            await loadData()
        } catch (err) { showToast(err.message, 'danger') }
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Categories</h2>
                <button className="btn btn-primary" onClick={openCreate}><i className="bi bi-plus-lg me-1"></i>Add Category</button>
            </div>

            <div className="table-responsive">
                <table className="table table-hover">
                    <thead><tr><th>ID</th><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
                    <tbody>
                        {categories.map(c => (
                            <tr key={c.id}>
                                <td>{c.id}</td>
                                <td>{c.name}</td>
                                <td>{c.description || '-'}</td>
                                <td>
                                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(c)}><i className="bi bi-pencil"></i></button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id)}><i className="bi bi-trash"></i></button>
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
                                <h5>{editing ? 'Edit Category' : 'Add Category'}</h5>
                                <button className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Name</label>
                                        <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
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

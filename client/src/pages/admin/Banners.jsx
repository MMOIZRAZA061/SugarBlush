import React, { useState, useEffect } from 'react'
import { API } from '../../api/index.js'
import { useToast } from '../../components/Toast.jsx'

export default function Banners() {
    const { showToast } = useToast()
    const [banners, setBanners] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({ title: '', subtitle: '', image: '', link: '' })

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const res = await API.banners.list()
            setBanners(res.banners || [])
        } catch (e) { console.error(e) }
    }

    function openCreate() {
        setEditing(null)
        setForm({ title: '', subtitle: '', image: '', link: '' })
        setShowModal(true)
    }

    function openEdit(b) {
        setEditing(b)
        setForm({ title: b.title, subtitle: b.subtitle || '', image: b.image || '', link: b.link || '' })
        setShowModal(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            if (editing) {
                await API.banners.update(editing.id, form)
                showToast('Banner updated!', 'success')
            } else {
                await API.banners.create(form)
                showToast('Banner created!', 'success')
            }
            setShowModal(false)
            await loadData()
        } catch (err) { showToast(err.message, 'danger') }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this banner?')) return
        try {
            await API.banners.delete(id)
            showToast('Banner deleted!', 'success')
            await loadData()
        } catch (err) { showToast(err.message, 'danger') }
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Banners</h2>
                <button className="btn btn-primary" onClick={openCreate}><i className="bi bi-plus-lg me-1"></i>Add Banner</button>
            </div>

            <div className="row">
                {banners.map(b => (
                    <div key={b.id} className="col-md-6 col-lg-4 mb-3">
                        <div className="card">
                            <img src={`/static/uploads/${b.image}`} className="card-img-top" alt={b.title} style={{ height: '150px', objectFit: 'cover' }} />
                            <div className="card-body">
                                <h6>{b.title}</h6>
                                <p className="text-muted small">{b.subtitle}</p>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(b)}><i className="bi bi-pencil"></i></button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(b.id)}><i className="bi bi-trash"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5>{editing ? 'Edit Banner' : 'Add Banner'}</h5>
                                <button className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Title</label>
                                        <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Subtitle</label>
                                        <input className="form-control" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Image (filename in /static/uploads/)</label>
                                        <input className="form-control" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Link</label>
                                        <input className="form-control" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} />
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

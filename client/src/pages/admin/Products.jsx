import React, { useState, useEffect } from 'react'
import { API, formatCurrency, imageUrl } from '../../api/index.js'
import { useToast } from '../../components/Toast.jsx'

export default function Products() {
    const { showToast } = useToast()
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({ name: '', description: '', price: '', cost_price: '', stock: '', image: '', category_id: '', featured: 0, new_arrival: 0, active: 1 })

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const [pRes, cRes] = await Promise.all([API.products.list(), API.categories.list()])
            setProducts(pRes.products || [])
            setCategories(cRes.categories || [])
        } catch (e) { console.error(e) }
    }

    function openCreate() {
        setEditing(null)
        setForm({ name: '', description: '', price: '', cost_price: '', stock: '', image: '', category_id: '', featured: 0, new_arrival: 0, active: 1 })
        setShowModal(true)
    }

    function openEdit(p) {
        setEditing(p)
        setForm({ name: p.name, description: p.description || '', price: p.price, cost_price: p.cost_price || '', stock: p.stock, image: p.image || '', category_id: p.category_id || '', featured: p.featured || 0, new_arrival: p.new_arrival || 0, active: p.active || 1 })
        setShowModal(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            if (editing) {
                await API.products.update(editing.id, form)
                showToast('Product updated!', 'success')
            } else {
                await API.products.create(form)
                showToast('Product created!', 'success')
            }
            setShowModal(false)
            await loadData()
        } catch (err) { showToast(err.message, 'danger') }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this product?')) return
        try {
            await API.products.delete(id)
            showToast('Product deleted!', 'success')
            await loadData()
        } catch (err) { showToast(err.message, 'danger') }
    }

    async function handleToggle(id) {
        try {
            await API.products.toggle(id)
            await loadData()
        } catch (err) { showToast(err.message, 'danger') }
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Products</h2>
                <button className="btn btn-primary" onClick={openCreate}><i className="bi bi-plus-lg me-1"></i>Add Product</button>
            </div>

            <div className="table-responsive">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th><th>Name</th><th>Price</th><th>Stock</th><th>Category</th><th>Active</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id}>
                                <td>{p.id}</td>
                                <td>{p.name}</td>
                                <td>{formatCurrency(p.price)}</td>
                                <td>{p.stock}</td>
                                <td>{categories.find(c => c.id == p.category_id)?.name || '-'}</td>
                                <td>
                                    <button className={`btn btn-sm ${p.active ? 'btn-success' : 'btn-secondary'}`} onClick={() => handleToggle(p.id)}>
                                        {p.active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td>
                                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(p)}><i className="bi bi-pencil"></i></button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}><i className="bi bi-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5>{editing ? 'Edit Product' : 'Add Product'}</h5>
                                <button className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Name</label>
                                        <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Category</label>
                                        <select className="form-control" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                                            <option value="">Select category</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Price (PKR)</label>
                                        <input type="number" step="0.01" className="form-control" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Cost Price</label>
                                        <input type="number" step="0.01" className="form-control" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: e.target.value })} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Stock</label>
                                        <input type="number" className="form-control" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Description</label>
                                        <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Image</label>
                                        <input type="file" accept="image/*" className="form-control" onChange={async (e) => {
                                            const file = e.target.files[0]
                                            if (!file) return
                                            try {
                                                const res = await API.upload.image(file, 'sugar-blush/products')
                                                setForm({ ...form, image: res.url })
                                                showToast('Image uploaded!', 'success')
                                            } catch (err) { showToast(err.message, 'danger') }
                                        }} />
                                        {form.image && <img src={imageUrl(form.image)} className="img-thumbnail mt-2" style={{ maxHeight: '100px' }} alt="Preview" />}
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-check mt-4">
                                            <input type="checkbox" className="form-check-input" checked={!!form.featured} onChange={e => setForm({ ...form, featured: e.target.checked ? 1 : 0 })} id="featured" />
                                            <label className="form-check-label" for="featured">Featured</label>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-check mt-4">
                                            <input type="checkbox" className="form-check-input" checked={!!form.new_arrival} onChange={e => setForm({ ...form, new_arrival: e.target.checked ? 1 : 0 })} id="newArrival" />
                                            <label className="form-check-label" for="newArrival">New Arrival</label>
                                        </div>
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

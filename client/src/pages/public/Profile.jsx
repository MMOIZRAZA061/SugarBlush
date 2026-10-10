import React, { useState, useEffect } from 'react'
import { API } from '../../api/index.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../components/Toast.jsx'

export default function Profile() {
    const { user, setUser } = useAuth()
    const { showToast } = useToast()
    const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user) {
            setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', address: user.address || '' })
        }
    }, [user])

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await API.auth.updateProfile(form)
            setUser(res.user)
            showToast('Profile updated!', 'success')
        } catch (err) {
            showToast(err.message, 'danger')
        }
        setLoading(false)
    }

    return (
        <section className="container mt-4">
            <h2>My Profile</h2>
            <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">Full Name</label>
                    <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Address</label>
                    <input className="form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="col-12">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Update Profile'}
                    </button>
                </div>
            </form>
        </section>
    )
}

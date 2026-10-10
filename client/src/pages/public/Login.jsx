import React, { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../components/Toast.jsx'

export default function Login() {
    const { login } = useAuth()
    const { showToast } = useToast()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await login(form.email, form.password)
            showToast('Login successful!', 'success')
            const next = searchParams.get('next')
            navigate(next || '/admin')
        } catch (err) {
            setError(err.message)
        }
        setLoading(false)
    }

    return (
        <section className="container mt-4">
            <h2>Login</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                </div>
                <div className="col-12">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </div>
                <div className="col-12 mt-2">
                    Don't have an account? <Link to="/signup">Sign up here</Link>.
                </div>
            </form>
        </section>
    )
}

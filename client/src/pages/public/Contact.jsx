import React, { useState } from 'react'
import { API } from '../../api/index.js'
import { useToast } from '../../components/Toast.jsx'

export default function Contact() {
    const { showToast } = useToast()
    const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
    const [sending, setSending] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setSending(true)
        try {
            await API.contact.create(form)
            showToast('Message sent successfully!', 'success')
            setForm({ name: '', email: '', phone: '', subject: '', message: '' })
        } catch (err) {
            showToast(err.message, 'danger')
        }
        setSending(false)
    }

    return (
        <section className="container mt-4">
            <h2>Contact Us</h2>
            <div className="row">
                <div className="col-md-6">
                    <form onSubmit={handleSubmit} className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Name</label>
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
                            <label className="form-label">Subject</label>
                            <input className="form-control" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
                        </div>
                        <div className="col-12">
                            <label className="form-label">Message</label>
                            <textarea className="form-control" rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required></textarea>
                        </div>
                        <div className="col-12">
                            <button type="submit" className="btn btn-primary" disabled={sending}>
                                {sending ? 'Sending...' : 'Send Message'}
                            </button>
                        </div>
                    </form>
                </div>
                <div className="col-md-6">
                    <div className="card p-4">
                        <h5>Contact Information</h5>
                        <p><i className="bi bi-envelope me-2"></i>986sugarblush@gmail.com</p>
                        <p><i className="bi bi-telephone me-2"></i>+92 315 4331348</p>
                        <p><i className="bi bi-clock me-2"></i>Open Daily: 9:00 AM - 10:00 PM</p>
                        <div className="mt-3">
                            <h6>Follow Us</h6>
                            <div className="social-icons">
                                <a href="https://www.facebook.com/share/1CNgGnYDxp/" target="_blank" rel="noreferrer"><i className="bi bi-facebook"></i></a>
                                <a href="https://www.instagram.com/sugarblush_bakers" target="_blank" rel="noreferrer"><i className="bi bi-instagram"></i></a>
                                <a href="https://youtube.com/@sugarblush_bakers" target="_blank" rel="noreferrer"><i className="bi bi-youtube"></i></a>
                                <a href="https://www.tiktok.com/@sugarblush_vibes" target="_blank" rel="noreferrer"><i className="bi bi-tiktok"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

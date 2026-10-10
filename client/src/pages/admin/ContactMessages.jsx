import React, { useState, useEffect } from 'react'
import { API, formatDate } from '../../api/index.js'
import { useToast } from '../../components/Toast.jsx'

export default function ContactMessages() {
    const { showToast } = useToast()
    const [messages, setMessages] = useState([])

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const res = await API.contact.list()
            setMessages(res.messages || [])
        } catch (e) { console.error(e) }
    }

    async function handleMarkRead(id) {
        try {
            await API.contact.markRead(id)
            await loadData()
        } catch (err) { showToast(err.message, 'danger') }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this message?')) return
        try {
            await API.contact.delete(id)
            showToast('Message deleted!', 'success')
            await loadData()
        } catch (err) { showToast(err.message, 'danger') }
    }

    return (
        <div>
            <h2>Contact Messages</h2>
            <div className="table-responsive">
                <table className="table table-hover">
                    <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Subject</th><th>Message</th><th>Date</th><th>Read</th><th>Actions</th></tr></thead>
                    <tbody>
                        {messages.map(m => (
                            <tr key={m.id} className={m.is_read ? '' : 'table-primary'}>
                                <td>{m.id}</td>
                                <td>{m.name}</td>
                                <td>{m.email}</td>
                                <td>{m.subject}</td>
                                <td>{m.message?.substring(0, 50)}{m.message?.length > 50 ? '...' : ''}</td>
                                <td>{formatDate(m.created_at)}</td>
                                <td>{m.is_read ? <span className="badge bg-success">Yes</span> : <span className="badge bg-warning">No</span>}</td>
                                <td>
                                    {!m.is_read && <button className="btn btn-sm btn-outline-info me-1" onClick={() => handleMarkRead(m.id)}><i className="bi bi-check"></i></button>}
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(m.id)}><i className="bi bi-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

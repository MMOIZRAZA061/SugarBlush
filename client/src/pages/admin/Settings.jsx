import React, { useState, useEffect } from 'react'
import { API } from '../../api/index.js'
import { useToast } from '../../components/Toast.jsx'

export default function Settings() {
    const { showToast } = useToast()
    const [settings, setSettings] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => { loadSettings() }, [])

    async function loadSettings() {
        try {
            const res = await API.settings.get()
            setSettings(res.settings || {})
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    async function handleSave(e) {
        e.preventDefault()
        try {
            await API.settings.update(settings)
            showToast('Settings saved!', 'success')
        } catch (err) { showToast(err.message, 'danger') }
    }

    if (loading) {
        return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    }

    return (
        <div>
            <h2>Site Settings</h2>
            <form onSubmit={handleSave} className="row g-3">
                {Object.entries(settings).map(([key, value]) => (
                    <div key={key} className="col-md-6">
                        <label className="form-label">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</label>
                        <input className="form-control" value={value} onChange={e => setSettings({ ...settings, [key]: e.target.value })} />
                    </div>
                ))}
                <div className="col-12">
                    <button type="submit" className="btn btn-primary">Save Settings</button>
                </div>
            </form>
        </div>
    )
}

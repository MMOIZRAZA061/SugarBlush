import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now() + Math.random()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 3000)
    }, [])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 9999, padding: '1rem' }}>
                {toasts.map(toast => (
                    <div key={toast.id} className={`alert alert-${toast.type} alert-dismissible fade show`} role="alert">
                        {toast.message}
                        <button type="button" className="btn-close" onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}></button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    return useContext(ToastContext)
}

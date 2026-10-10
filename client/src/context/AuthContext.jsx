import { createContext, useContext, useState, useEffect } from 'react'
import { API } from '../api/index.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [cartCount, setCartCount] = useState(0)

    useEffect(() => {
        checkAuth()
    }, [])

    async function checkAuth() {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                setLoading(false)
                return
            }
            const result = await API.auth.check()
            if (result.authenticated) {
                setUser(result.user)
                if (result.cartCount !== undefined) setCartCount(result.cartCount)
            } else {
                localStorage.removeItem('token')
            }
        } catch (e) {
            localStorage.removeItem('token')
        } finally {
            setLoading(false)
        }
    }

    async function login(email, password) {
        const result = await API.auth.login(email, password)
        if (result.token) {
            localStorage.setItem('token', result.token)
        }
        setUser(result.user)
        return result
    }

    async function signup(data) {
        const result = await API.auth.signup(data)
        if (result.token) {
            localStorage.setItem('token', result.token)
        }
        setUser(result.user)
        return result
    }

    async function logout() {
        await API.auth.logout()
        localStorage.removeItem('token')
        setUser(null)
        setCartCount(0)
    }

    async function refreshCartCount() {
        try {
            const cart = await API.cart.get()
            setCartCount(cart.items?.length || 0)
        } catch (e) {
            setCartCount(0)
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, cartCount, login, signup, logout, checkAuth, refreshCartCount, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}

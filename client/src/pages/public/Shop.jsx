import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { API } from '../../api/index.js'
import ProductCard from '../../components/ProductCard.jsx'

export default function Shop() {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [searchParams, setSearchParams] = useSearchParams()
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
    const [loading, setLoading] = useState(true)

    const categoryId = searchParams.get('category_id')

    useEffect(() => {
        loadCategories()
        loadProducts()
    }, [categoryId])

    async function loadCategories() {
        try {
            const res = await API.categories.list()
            setCategories(res.categories || [])
        } catch (e) { console.error(e) }
    }

    async function loadProducts() {
        setLoading(true)
        try {
            const params = {}
            if (categoryId) params.category_id = categoryId
            if (searchQuery) params.q = searchQuery
            const res = await API.products.list(params)
            setProducts(res.products || [])
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    function handleSearch(e) {
        e.preventDefault()
        const params = {}
        if (categoryId) params.category_id = categoryId
        if (searchQuery) params.q = searchQuery
        setSearchParams(params)
        loadProducts()
    }

    function handleCategoryClick(catId) {
        const params = {}
        if (catId) params.category_id = catId
        if (searchQuery) params.q = searchQuery
        setSearchParams(params)
    }

    return (
        <section className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Shop Products</h2>
                <form className="d-flex" onSubmit={handleSearch}>
                    <input className="form-control me-2" type="search" placeholder="Search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    <button className="btn btn-outline-success" type="submit">Search</button>
                </form>
            </div>

            <div className="row mb-3">
                <div className="col-12 d-flex flex-wrap align-items-center gap-2">
                    <div className="btn-group" role="group">
                        <button className={`btn ${!categoryId ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={() => handleCategoryClick(null)}>All</button>
                        {categories.map(cat => (
                            <button key={cat.id} className={`btn ${categoryId === String(cat.id) ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={() => handleCategoryClick(cat.id)}>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                </div>
            ) : products.length === 0 ? (
                <div className="alert alert-info">No products found.</div>
            ) : (
                <div className="row">
                    {products.map(p => (
                        <div key={p.id} className="col-sm-6 col-lg-4 mb-4">
                            <ProductCard product={p} showStock showCustomRequest />
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

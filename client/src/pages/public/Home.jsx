import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API } from '../../api/index.js'
import ProductCard from '../../components/ProductCard.jsx'

export default function Home() {
    const [banners, setBanners] = useState([])
    const [featured, setFeatured] = useState([])
    const [newArrivals, setNewArrivals] = useState([])
    const [announcements, setAnnouncements] = useState([])
    const [activeSlide, setActiveSlide] = useState(0)

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        if (banners.length > 1) {
            const interval = setInterval(() => {
                setActiveSlide(prev => (prev + 1) % banners.length)
            }, 5000)
            return () => clearInterval(interval)
        }
    }, [banners.length])

    async function loadData() {
        try {
            const [bannersRes, featuredRes, newArrivalsRes, announcementsRes] = await Promise.all([
                API.banners.list(),
                API.products.list({ featured: 1, limit: 4 }),
                API.products.list({ new_arrivals: 1, limit: 4 }),
                API.announcements.list()
            ])
            setBanners(bannersRes.banners || [])
            setFeatured(featuredRes.products || [])
            setNewArrivals(newArrivalsRes.products || [])
            setAnnouncements(announcementsRes.announcements || [])
        } catch (e) {
            console.error('Failed to load home data:', e)
        }
    }

    return (
        <section className="container mt-4">
            {/* Carousel */}
            {banners.length > 0 && (
                <div id="promoCarousel" className="carousel slide" data-bs-ride="carousel">
                    <div className="carousel-inner">
                        {banners.map((b, i) => (
                            <div key={b.id} className={`carousel-item ${i === activeSlide ? 'active' : ''}`}>
                                <Link to="/shop" className="d-block">
                                    <img src={`/static/uploads/${b.image}`} className="d-block w-100 hero-banner" alt={b.title} />
                                </Link>
                                <div className="carousel-caption d-none d-md-block text-start">
                                    <h1 className="display-4" style={{ color: '#fff', textShadow: '2px 2px 20px rgba(0,0,0,.45)' }}>{b.title}</h1>
                                    <p className="lead" style={{ color: '#fff' }}>{b.subtitle}</p>
                                    <div className="d-flex gap-2">
                                        <Link to="/shop" className="btn btn-gradient">Shop Now</Link>
                                        <Link to="/custom-orders" className="btn btn-outline-warning text-dark">Custom Order</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target="#promoCarousel" data-bs-slide="prev" onClick={() => setActiveSlide(prev => (prev - 1 + banners.length) % banners.length)}>
                        <span className="carousel-control-prev-icon"></span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#promoCarousel" data-bs-slide="next" onClick={() => setActiveSlide(prev => (prev + 1) % banners.length)}>
                        <span className="carousel-control-next-icon"></span>
                    </button>
                </div>
            )}

            {/* Announcements */}
            {announcements.length > 0 && (
                <div className="mt-4 fade-on-scroll">
                    <h2>Announcements</h2>
                    <div className="row">
                        {announcements.map(a => (
                            <div key={a.id} className="col-md-6 mb-3">
                                <div className="card announcement-card p-3">
                                    <h5>{a.title}</h5>
                                    <p>{a.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Featured Products */}
            {featured.length > 0 && (
                <div className="mt-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                        <h2 className="mb-0">Featured Products</h2>
                        <Link to="/shop" className="btn btn-outline-primary btn-sm">More</Link>
                    </div>
                    <div className="row">
                        {featured.map(p => (
                            <div key={p.id} className="col-6 col-sm-4 col-lg-3">
                                <ProductCard product={p} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* New Arrivals */}
            {newArrivals.length > 0 && (
                <div className="mt-4 new-arrivals-section p-3 rounded-3" style={{ background: 'linear-gradient(160deg, #FFF4E6 0%, #FFE7CA 100%)', border: '2px solid #FFB97A' }}>
                    <h2 className="new-arrivals-title" style={{ color: '#ba4d4d', fontWeight: 800 }}>New Arrivals (Just Landed!)</h2>
                    <div className="row">
                        {newArrivals.map(p => (
                            <div key={p.id} className="col-6 col-sm-4 col-lg-3">
                                <ProductCard product={p} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    )
}

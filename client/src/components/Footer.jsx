import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="footer mt-4 p-5">
            <div className="container text-white">
                <div className="row">
                    <div className="col-md-4 mb-3">
                        <h5 className="text-white">Sugar Blush Bakery</h5>
                        <p>Warm, fresh & handcrafted daily pastries delivered with love.</p>
                    </div>
                    <div className="col-md-4 mb-3">
                        <h6>Quick Links</h6>
                        <ul className="list-unstyled">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/shop">Shop</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>
                    <div className="col-md-4 mb-3">
                        <h6>Contact</h6>
                        <p>Email: 986sugarblush@gmail.com</p>
                        <p>Phone: +92 315 4331348</p>
                        <div className="social-icons mt-2">
                            <a href="https://www.facebook.com/share/1CNgGnYDxp/" target="_blank" rel="noreferrer"><i className="bi bi-facebook"></i></a>
                            <a href="https://www.instagram.com/sugarblush_bakers?igsh=MWp0Ymk4eWx1NGV1eg==" target="_blank" rel="noreferrer"><i className="bi bi-instagram"></i></a>
                            <a href="https://youtube.com/@sugarblush_bakers?si=tzmkz5mJLPuXHEif" target="_blank" rel="noreferrer"><i className="bi bi-youtube"></i></a>
                            <a href="https://www.tiktok.com/@sugarblush_vibes?_r=1&_t=ZN-94gFTOBCsPW" target="_blank" rel="noreferrer"><i className="bi bi-tiktok"></i></a>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-3">&copy; 2026 Sugar Blush Bakery - All rights reserved.</div>
            </div>
        </footer>
    )
}

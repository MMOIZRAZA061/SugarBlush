import React from 'react'
import { Link } from 'react-router-dom'

export default function About() {
    return (
        <section className="container mt-4">
            <h2>About Sugar Blush Bakery</h2>
            <div className="row">
                <div className="col-md-8">
                    <p className="lead">At Sugar Blush Bakery, we believe that every bite should be a celebration. Founded with a passion for fresh, handcrafted baked goods, we bring warmth and sweetness to your doorstep.</p>
                    <p>Our bakery specializes in custom cakes, fresh breads, pastries, and treats made daily with the finest ingredients. Whether it's a birthday celebration, a corporate event, or just a craving for something sweet, we've got you covered.</p>
                    <h5>What Makes Us Special</h5>
                    <ul>
                        <li><strong>Fresh Daily:</strong> Everything is baked fresh every morning</li>
                        <li><strong>Custom Orders:</strong> Personalized cakes and treats for any occasion</li>
                        <li><strong>Quality Ingredients:</strong> We use only the best ingredients</li>
                        <li><strong>Quick Delivery:</strong> Fast delivery across the city</li>
                    </ul>
                    <h5>Our Story</h5>
                    <p>Sugar Blush Bakery started as a small home bakery with a big dream. Today, we serve hundreds of happy customers every week, and we're just getting started. Our mission is simple: to make every moment sweeter with our handcrafted treats.</p>
                </div>
                <div className="col-md-4">
                    <div className="card p-4">
                        <h5>Get in Touch</h5>
                        <p><i className="bi bi-envelope me-2"></i>986sugarblush@gmail.com</p>
                        <p><i className="bi bi-telephone me-2"></i>+92 315 4331348</p>
                        <p><i className="bi bi-clock me-2"></i>Open Daily: 9:00 AM - 10:00 PM</p>
                        <hr />
                        <Link to="/shop" className="btn btn-gradient w-100">Shop Now</Link>
                        <Link to="/custom-orders" className="btn btn-outline-warning w-100 mt-2">Custom Order</Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

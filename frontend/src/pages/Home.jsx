import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?featured=true&limit=100')
      .then(r => r.json())
      .then(data => setFeatured(data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page"><div className="loading"><div className="spinner" /></div></div>;
  }

  return (
    <div className="page">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Discover the Future of Electronics</h1>
            <p>
              Shop the latest smartphones, laptops, and accessories at unbeatable prices.
              Premium quality meets exceptional service.
            </p>
            <div className="hero-actions">
              <a href="#products" className="btn btn-primary btn-lg">
                <i className="fas fa-shopping-bag"></i> Shop Now
              </a>
              <Link to="/categories" className="btn btn-outline btn-lg">
                <i className="fas fa-th-large"></i> Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="section" id="products" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <p>{featured.length} hand-picked product{featured.length !== 1 ? 's' : ''} just for you</p>
          </div>

          {featured.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-star icon"></i>
              <h3>No featured products yet</h3>
              <p>Check back soon, or browse our full catalog.</p>
              <Link to="/categories" className="btn btn-primary" style={{ marginTop: 16 }}>
                Browse Categories
              </Link>
            </div>
          ) : (
            <div className="grid grid-4">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Why */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Us?</h2>
            <p>We go above and beyond to deliver the best experience</p>
          </div>
          <div className="grid grid-3">
            {[
              { icon: 'fa-truck-fast', title: 'Fast Delivery', desc: 'Swift shipping on all orders. Your tech, delivered to your door.' },
              { icon: 'fa-shield-halved', title: 'Warranty Included', desc: 'Every product comes with a manufacturer warranty for peace of mind.' },
              { icon: 'fa-headset', title: '24/7 Support', desc: 'Our team is here around the clock to answer your questions.' },
            ].map((item, i) => (
              <div key={i} className="category-card" style={{ cursor: 'default' }}>
                <i className={`fas ${item.icon}`} style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: 12 }}></i>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

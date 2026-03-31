import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/products?limit=200').then(r => r.json()),
    ]).then(([cats, prodData]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      setAllProducts(prodData.products || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'all'
    ? allProducts
    : allProducts.filter(p => {
      const cat = p.category;
      if (!cat) return false;
      return (cat._id === activeCategory || cat.slug === activeCategory);
    });

  const getCount = (catId, catSlug) =>
    allProducts.filter(p => p.category?._id === catId || p.category?.slug === catSlug).length;

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
              <Link to="/about" className="btn btn-outline btn-lg">
                <i className="fas fa-info-circle"></i> Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/*  cat grid sec */}
      {categories.length > 0 && (
        <section className="section" id="categories">
          <div className="container">
            <div className="section-header">
              <h2>Shop by Category</h2>
              <p>Find exactly what you're looking for</p>
            </div>

            <div className="category-grid-layout">
              {/* "All" card */}
              <div
                className={`category-grid-card ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => { setActiveCategory('all'); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                <div className="category-grid-icon">
                  <i className="fas fa-th-large" />
                </div>
                <div className="category-grid-info">
                  <h3>All Products</h3>
                  <span className="category-grid-count">{allProducts.length} items</span>
                </div>
                <i className="fas fa-chevron-right category-grid-arrow" />
              </div>

              {categories.map(cat => {
                const count = getCount(cat._id, cat.slug);
                return (
                  <div
                    key={cat._id}
                    className={`category-grid-card ${activeCategory === cat._id ? 'active' : ''}`}
                    onClick={() => { setActiveCategory(cat._id); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}
                  >
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="category-grid-img"
                        onError={e => { e.target.style.display = 'none'; e.target.nextElementSibling && (e.target.nextElementSibling.style.display = 'flex'); }}
                      />
                    ) : null}
                    <div className="category-grid-icon" style={cat.image ? { display: 'none' } : {}}>
                      <i className={`fas ${getCategoryIcon(cat.slug)}`} />
                    </div>
                    <div className="category-grid-info">
                      <h3>{cat.name}</h3>
                      <span className="category-grid-count">{count} item{count !== 1 ? 's' : ''}</span>
                    </div>
                    <i className="fas fa-chevron-right category-grid-arrow" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* prod */}
      <section className="section" id="products" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <h2>
              {activeCategory === 'all' ? 'All Products' : categories.find(c => c._id === activeCategory)?.name || 'Products'}
            </h2>
            <p>{filtered.length} product{filtered.length !== 1 ? 's' : ''} available</p>
          </div>

          {/* quick filter bar */}
          {categories.length > 0 && (
            <div className="category-quick-bar">
              <button
                className={`category-quick-btn ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id}
                  className={`category-quick-btn ${activeCategory === cat._id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat._id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-box-open icon"></i>
              <h3>No products in this category yet</h3>
            </div>
          ) : (
            <div className="grid grid-4">
              {filtered.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* */}
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
// font-awesom icons quick add
function getCategoryIcon(slug) {
  const icons = {
    mobile: 'fa-mobile-screen',
    'mobile-phones': 'fa-mobile-screen',
    phones: 'fa-mobile-screen',
    laptops: 'fa-laptop',
    accessories: 'fa-headphones',
    tablets: 'fa-tablet-screen-button',
    cameras: 'fa-camera',
    gaming: 'fa-gamepad',
    audio: 'fa-volume-high',
    wearables: 'fa-clock',
    notebooks: 'fa-laptop-code',
    chargers: 'fa-plug',
    cables: 'fa-plug',
    cases: 'fa-shield',
    headphones: 'fa-headphones',
    speakers: 'fa-volume-high',
    watches: 'fa-clock',
  };
  return icons[slug] || 'fa-tag';
}

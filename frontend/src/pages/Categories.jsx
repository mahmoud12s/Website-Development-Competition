import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/products?limit=500').then(r => r.json()),
    ]).then(([cats, prodData]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      const map = {};
      (prodData.products || []).forEach(p => {
        const id = p.category?._id;
        if (id) map[id] = (map[id] || 0) + 1;
      });
      setCounts(map);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page"><div className="loading"><div className="spinner" /></div></div>;
  }

  return (
    <div className="page" style={{ paddingTop: 100 }}>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <p>Find exactly what you're looking for</p>
          </div>

          {categories.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-folder-open icon"></i>
              <h3>No categories yet</h3>
            </div>
          ) : (
            <div className="category-grid-layout">
              {categories.map(cat => {
                const count = counts[cat._id] || 0;
                return (
                  <div
                    key={cat._id}
                    className="category-grid-card"
                    onClick={() => navigate(`/category/${cat.slug}`)}
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
          )}
        </div>
      </section>
    </div>
  );
}

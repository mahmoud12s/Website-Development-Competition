import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

export default function Category() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ category: slug, sort, limit: '50' });
    if (search) params.set('q', search);

    Promise.all([
      fetch(`/api/products?${params}`).then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([data, cats]) => {
      setProducts(data.products || []);
      const allCats = Array.isArray(cats) ? cats : [];
      setCategory(allCats.find(c => c.slug === slug) || { name: slug });
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, sort, search]);

  return (
    <div className="page">
      <section className="section">
        <div className="container">
          <div className="admin-header" style={{ marginBottom: 32 }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{category?.name || 'Products'}</h1>
              {category?.description && (
                <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>{category.description}</p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
            <div className="search-container" style={{ maxWidth: 400 }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search in this category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="select"
              style={{ width: 'auto', maxWidth: 200 }}
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📦</div>
              <h3>No products found</h3>
              <p>Try a different search or browse other categories.</p>
            </div>
          ) : (
            <div className="grid grid-4">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

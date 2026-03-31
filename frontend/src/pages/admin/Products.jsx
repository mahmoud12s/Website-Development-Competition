import { useState, useEffect } from 'react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', price: '', description: '', category: '', stock: '', featured: false, imageUrls: '',
  });
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/admin/products', { credentials: 'include' }),
        fetch('/api/admin/categories', { credentials: 'include' }),
      ]);
      const prods = await prodRes.json();
      const cats = await catRes.json();
      setProducts(Array.isArray(prods) ? prods : []);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', price: '', description: '', category: categories[0]?._id || '', stock: '0', featured: false, imageUrls: '' });
    setFiles([]);
    setExistingImages([]);
    setError('');
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      price: String(product.price),
      description: product.description || '',
      category: product.category?._id || '',
      stock: String(product.stock),
      featured: product.featured || false,
      imageUrls: '',
    });
    setFiles([]);
    setExistingImages(product.images || []);
    setError('');
    setShowModal(true);
  };

  const handleSave = async e => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('price', form.price);
      fd.append('description', form.description);
      fd.append('category', form.category);
      fd.append('stock', form.stock);
      fd.append('featured', form.featured);

      if (editing) {
        fd.append('existingImages', JSON.stringify(existingImages));
      }

      // URL-based images
      if (form.imageUrls.trim()) {
        const urls = form.imageUrls.split('\n').map(u => u.trim()).filter(Boolean);
        fd.append('imageUrls', JSON.stringify(urls));
      }

      // File uploads
      for (const file of files) {
        fd.append('images', file);
      }

      const url = editing ? `/api/admin/products/${editing._id}` : '/api/admin/products';
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        credentials: 'include',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const removeExistingImage = (idx) => {
    setExistingImages(prev => prev.filter((_, i) => i !== idx));
  };

  // Filter products
  let filtered = products;
  if (filterCategory) filtered = filtered.filter(p => p.category?._id === filterCategory);
  if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <>
      <div className="admin-header">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          className="input"
          style={{ maxWidth: 250, minWidth: 0, flex: '1 1 180px' }}
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="select" style={{ width: 'auto', maxWidth: 200, minWidth: 0 }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <span style={{ color: 'var(--text-secondary)', alignSelf: 'center', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
          {filtered.length} product{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📦</div>
          <h3>No products found</h3>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Featured</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p._id}>
                <td data-label="Image">
                  <img
                    src={p.images?.[0] || 'https://via.placeholder.com/48'}
                    alt={p.name}
                    style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}
                    onError={e => { e.target.src = 'https://via.placeholder.com/48'; }}
                  />
                </td>
                <td data-label="Name" style={{ fontWeight: 600 }}>{p.name}</td>
                <td data-label="Category"><span className="badge badge-primary">{p.category?.name || '—'}</span></td>
                <td data-label="Price" style={{ color: 'var(--accent)', fontWeight: 600 }}>${p.price?.toFixed(2)}</td>
                <td data-label="Stock">
                  <span className={`badge badge-${p.stock > 5 ? 'success' : p.stock > 0 ? 'warning' : 'danger'}`}>
                    {p.soldOut ? 'Sold Out' : p.stock}
                  </span>
                </td>
                <td data-label="Featured">{p.featured ? '⭐' : '—'}</td>
                <td data-label="">
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="modal-form-grid">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Price *</label>
                  <input className="input" type="number" step="0.01" min="0" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select className="select" required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select...</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input className="input" type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
                  Featured Product
                </label>
              </div>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="form-group">
                  <label>Current Images</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {existingImages.map((img, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={img} alt="" style={{ width: 72, height: 72, borderRadius: 8, objectFit: 'cover' }} onError={e => { e.target.src = 'https://via.placeholder.com/72'; }} />
                        <button type="button" className="remove-btn" style={{ position: 'absolute', top: -8, right: -8, background: 'var(--bg-card)', borderRadius: '50%', width: 24, height: 24, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => removeExistingImage(i)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Upload Images</label>
                <input type="file" accept="image/*" multiple onChange={e => setFiles(Array.from(e.target.files))} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <div className="form-group">
                <label>Image URLs (one per line)</label>
                <textarea className="textarea" value={form.imageUrls} onChange={e => setForm({ ...form, imageUrls: e.target.value })} placeholder="https://example.com/image.jpg" style={{ minHeight: 60 }} />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : (editing ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

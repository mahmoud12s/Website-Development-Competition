import { useState, useEffect } from 'react';

export default function AdminStock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState('');

  const fetchStock = async () => {
    try {
      const res = await fetch('/api/admin/stock', { credentials: 'include' });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStock(); }, []);

  const startEdit = (product) => {
    setEditingId(product._id);
    setEditStock(String(product.stock));
  };

  const saveStock = async (id) => {
    try {
      const res = await fetch(`/api/admin/stock/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ stock: Number(editStock), soldOut: Number(editStock) === 0 }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      setEditingId(null);
      fetchStock();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleSoldOut = async (product) => {
    try {
      const res = await fetch(`/api/admin/stock/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ soldOut: !product.soldOut }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      fetchStock();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <>
      <div className="admin-header">
        <h1>Stock Management</h1>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <h3>No products to manage</h3>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Status</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}>
                <td data-label="Product" style={{ fontWeight: 600 }}>{p.name}</td>
                <td data-label="Category"><span className="badge badge-primary">{p.category?.name || '—'}</span></td>
                <td data-label="Stock">
                  {editingId === p._id ? (
                    <input
                      className="input"
                      type="number"
                      min="0"
                      style={{ width: 80, padding: '6px 10px' }}
                      value={editStock}
                      onChange={e => setEditStock(e.target.value)}
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && saveStock(p._id)}
                    />
                  ) : (
                    <span className={`badge badge-${p.stock > 5 ? 'success' : p.stock > 0 ? 'warning' : 'danger'}`}>
                      {p.stock}
                    </span>
                  )}
                </td>
                <td data-label="Status">
                  <button
                    className={`btn btn-sm ${p.soldOut ? 'btn-danger' : 'btn-outline'}`}
                    onClick={() => toggleSoldOut(p)}
                    style={{ fontSize: '0.8rem' }}
                  >
                    {p.soldOut ? 'Sold Out' : 'In Stock'}
                  </button>
                </td>
                <td data-label="">
                  {editingId === p._id ? (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="btn btn-sm btn-primary" onClick={() => saveStock(p._id)}>Save</button>
                      <button className="btn btn-sm btn-outline" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button className="btn btn-sm btn-outline" onClick={() => startEdit(p)}>Edit Stock</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

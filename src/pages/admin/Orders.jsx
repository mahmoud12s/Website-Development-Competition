import { useState, useEffect, useCallback } from 'react';

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

// Helper to format total — handles both number and string totals
const fmtTotal = (total) => {
  if (total == null) return '$0.00';
  const num = typeof total === 'number' ? total : parseFloat(total);
  return isNaN(num) ? `$${total}` : `$${num.toFixed(2)}`;
};

// Helper to get customer name from either schema
const getCustomerName = (order) => order.customerName || order.name || '—';
const getCustomerContact = (order) => order.customerEmail || order.phone || '';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searching, setSearching] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setSearching(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);
      params.set('limit', '100');
      
      const res = await fetch(`/api/admin/orders?${params}`, { credentials: 'include' });
      const data = await res.json();
      setOrders(data.orders || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      fetchOrders();
      if (selectedOrder?._id === id) {
        setSelectedOrder(prev => ({ ...prev, status }));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <>
      <div className="admin-header">
        <h1>Orders</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {orders.length} order{orders.length !== 1 ? 's' : ''}
            {searchQuery && <span style={{ color: 'var(--primary)' }}> matching "{searchQuery}"</span>}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="orders-search-bar">
        <div className="orders-search-input-wrap">
          <i className="fas fa-search orders-search-icon" />
          <input
            type="text"
            className="orders-search-input"
            placeholder="Search by name, email, phone, or ID..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button className="orders-search-clear" onClick={clearSearch} title="Clear search">
              <i className="fas fa-times" />
            </button>
          )}
          {searching && <div className="orders-search-spinner" />}
        </div>
        <select className="select orders-status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🛒</div>
          <h3>{searchQuery ? 'No orders match your search' : 'No orders found'}</h3>
          {searchQuery && (
            <button className="btn btn-outline btn-sm" style={{ marginTop: 12 }} onClick={clearSearch}>
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td data-label="Order ID" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{order._id?.slice(-8)}</td>
                <td data-label="Customer">
                  <div style={{ fontWeight: 600 }}>{getCustomerName(order)}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{getCustomerContact(order)}</div>
                </td>
                <td data-label="Items">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</td>
                <td data-label="Total" style={{ fontWeight: 600, color: 'var(--primary)' }}>{fmtTotal(order.total)}</td>
                <td data-label="Status">
                  <select
                    className="select"
                    style={{ width: 'auto', padding: '6px 10px', fontSize: '0.85rem', minWidth: 120 }}
                    value={order.status}
                    onChange={e => updateStatus(order._id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </td>
                <td data-label="Date" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td data-label="">
                  <button className="btn btn-sm btn-outline" onClick={() => setSelectedOrder(order)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <h2>Order Details</h2>
            <div style={{ marginBottom: 20 }}>
              <div className="cart-summary-row">
                <span style={{ color: 'var(--text-secondary)' }}>Order ID</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>{selectedOrder._id}</span>
              </div>
              <div className="cart-summary-row">
                <span style={{ color: 'var(--text-secondary)' }}>Customer</span>
                <span>{getCustomerName(selectedOrder)}</span>
              </div>
              {(selectedOrder.customerEmail || selectedOrder.phone) && (
                <div className="cart-summary-row">
                  <span style={{ color: 'var(--text-secondary)' }}>{selectedOrder.customerEmail ? 'Email' : 'Phone'}</span>
                  <span style={{ wordBreak: 'break-all' }}>{selectedOrder.customerEmail || selectedOrder.phone}</span>
                </div>
              )}
              {selectedOrder.customerPhone && (
                <div className="cart-summary-row">
                  <span style={{ color: 'var(--text-secondary)' }}>Phone</span>
                  <span>{selectedOrder.customerPhone}</span>
                </div>
              )}
              <div className="cart-summary-row">
                <span style={{ color: 'var(--text-secondary)' }}>Address</span>
                <span>{selectedOrder.address || '—'}</span>
              </div>
              {selectedOrder.deliveryArea && (
                <div className="cart-summary-row">
                  <span style={{ color: 'var(--text-secondary)' }}>Delivery Area</span>
                  <span>{selectedOrder.deliveryArea}</span>
                </div>
              )}
              <div className="cart-summary-row">
                <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                <span className={`badge badge-${selectedOrder.status === 'delivered' ? 'success' : selectedOrder.status === 'cancelled' ? 'danger' : 'warning'}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="cart-summary-row">
                <span style={{ color: 'var(--text-secondary)' }}>Date</span>
                <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
              </div>
              {selectedOrder.notes && (
                <div className="cart-summary-row">
                  <span style={{ color: 'var(--text-secondary)' }}>Notes</span>
                  <span>{selectedOrder.notes}</span>
                </div>
              )}
            </div>

            <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Items</h3>
            {selectedOrder.items?.map((item, i) => {
              const itemName = item.productName || item.name || 'Product';
              const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
              return (
                <div key={i} className="cart-summary-row">
                  <span>
                    {itemName} × {item.quantity}
                    {item.selectedShade && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> — {item.selectedShade}</span>}
                    {item.selectedSize && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> — {item.selectedSize}</span>}
                  </span>
                  <span>{fmtTotal(itemPrice * item.quantity)}</span>
                </div>
              );
            })}
            {selectedOrder.deliveryFee && (
              <div className="cart-summary-row">
                <span>Delivery Fee</span>
                <span>{fmtTotal(selectedOrder.deliveryFee)}</span>
              </div>
            )}
            <div className="cart-summary-row total">
              <span>Total</span>
              <span>{fmtTotal(selectedOrder.total)}</span>
            </div>

            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

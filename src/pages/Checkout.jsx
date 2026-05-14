import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ customerName: '', customerEmail: '', customerPhone: '', address: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  if (items.length === 0 && !success) {
    return (
      <div className="page">
        <div className="empty-state" style={{ paddingTop: 120 }}>
          <div className="icon">🛒</div>
          <h3>Your Cart is Empty</h3>
          <p>Add some products before checking out.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Products</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="page">
        <div className="success-page">
          <div>
            <div className="icon">🎉</div>
            <h1>Order Placed Successfully!</h1>
            <p>Thank you for your order! Your order ID is <strong>{success.orderId}</strong></p>
            <p>Total: <strong>${success.total?.toFixed(2)}</strong></p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map(i => ({ product: i._id, quantity: i.quantity }))
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      clearCart();
      setSuccess(data);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page" style={{ paddingTop: 100 }}>
      <div className="container">
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 32 }}>Checkout</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="checkout-grid">
          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 32 }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: 24, fontWeight: 700 }}>Shipping Information</h2>

              <div className="form-group">
                <label htmlFor="customerName">Full Name *</label>
                <input id="customerName" name="customerName" className="input" required value={form.customerName} onChange={handleChange} placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label htmlFor="customerEmail">Email Address *</label>
                <input id="customerEmail" name="customerEmail" type="email" className="input" required value={form.customerEmail} onChange={handleChange} placeholder="john@example.com" />
              </div>
              <div className="form-group">
                <label htmlFor="customerPhone">Phone Number *</label>
                <input id="customerPhone" name="customerPhone" className="input" required value={form.customerPhone} onChange={handleChange} placeholder="+1 555 123 4567" />
              </div>
              <div className="form-group">
                <label htmlFor="address">Shipping Address *</label>
                <textarea id="address" name="address" className="textarea" required value={form.address} onChange={handleChange} placeholder="123 Main Street, City, Country" />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Placing Order...' : '🎉 Place Order'}
              </button>
            </div>
          </form>

          {/* order resum */}
          <div className="cart-summary">
            <h3>Order Summary</h3>
            {items.map(item => (
              <div key={item._id} className="cart-summary-row" style={{ gap: 12 }}>
                <span style={{ flex: 1 }}>{item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="cart-summary-row total">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

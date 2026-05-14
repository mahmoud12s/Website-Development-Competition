import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="empty-state" style={{ paddingTop: 120 }}>
          <div className="icon">🛒</div>
          <h3>Your Cart is Empty</h3>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page cart-page">
      <div className="container">
        <h1 className="cart-title">
          Shopping Cart ({cartCount} item{cartCount !== 1 ? 's' : ''})
        </h1>

        <div className="cart-layout">
          {/* Cart Items */}
          <div>
            {items.map(item => (
              <div key={item._id} className="cart-item">
                <img
                  src={item.image || 'https://via.placeholder.com/100'}
                  alt={item.name}
                  onError={e => { e.target.src = 'https://via.placeholder.com/100'; }}
                />
                <div className="cart-item-info">
                  <Link to={`/product/${item.slug}`}>
                    <h3>{item.name}</h3>
                  </Link>
                  <p className="price">${item.price?.toFixed(2)}</p>
                </div>
                <div className="cart-item-actions">
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                    <span style={{ fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                  </div>
                  <div className="cart-item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item._id)} title="Remove">✕</button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="cart-summary-row">
              <span>Subtotal ({cartCount} items)</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              <span style={{ color: 'var(--success)' }}>Free</span>
            </div>
            <div className="cart-summary-row total">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 20 }}>
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

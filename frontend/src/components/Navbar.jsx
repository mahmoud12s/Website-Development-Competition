import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import SearchBar from './SearchBar';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">mahmoud cell</Link>

        {/* Cart icon — always visible on mobile (top-right) */}
        <div className="navbar-actions">
          <div className="navbar-search-desktop">
            <SearchBar />
          </div>
          <button className="cart-icon" onClick={() => navigate('/cart')} aria-label="Cart">
            <i className="fas fa-shopping-cart"></i>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span className={menuOpen ? 'open' : ''}></span>
          <span className={menuOpen ? 'open' : ''}></span>
          <span className={menuOpen ? 'open' : ''}></span>
        </button>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {/* Search bar inside mobile menu */}
          <li className="navbar-search-mobile">
            <SearchBar />
          </li>
          <li><NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink></li>
          <li><NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink></li>
          <li><NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</NavLink></li>
        </ul>
      </div>
    </nav>
  );
}

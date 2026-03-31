import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-section">
          <div className="footer-brand">mahmoud cell</div>
          <p>Your destination for premium electronics. We offer the latest smartphones, laptops, and accessories at competitive prices with exceptional customer service.</p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/cart">My Cart</Link>
        </div>
        <div className="footer-section">
          <h3>Categories</h3>
          <Link to="/category/mobile">Mobile Phones</Link>
          <Link to="/category/laptops">Laptops</Link>
          <Link to="/category/accessories">Accessories</Link>
        </div>
        <div className="footer-section">
          <h3>Contact Info</h3>
          <p>mahmoud@gmail.com</p>
          <p>76946420</p>
          <p>aramoun</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} mahmoud cell. All rights reserved.</p>
      </div>
    </footer>
  );
}

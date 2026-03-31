import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Category from './pages/Category';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminCategories from './pages/admin/Categories';
import AdminProducts from './pages/admin/Products';
import AdminStock from './pages/admin/Stock';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminMessages from './pages/admin/Messages';

// Track a page visit
function trackVisit(page) {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/visit', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ page }));
  } catch (e) {
    // silently fail — analytics should never break the site
  }
}

export default function App() {
  const location = useLocation();

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Track every page visit (public pages only)
  useEffect(() => {
    if (!location.pathname.startsWith('/admin')) {
      trackVisit(location.pathname);
    }
  }, [location.pathname]);

  return (
    <>
      <Routes>
        {/* Public pages with Navbar + Footer */}
        <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
        <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
        <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />
        <Route path="/category/:slug" element={<><Navbar /><Category /><Footer /></>} />
        <Route path="/product/:slug" element={<><Navbar /><ProductDetail /><Footer /></>} />
        <Route path="/cart" element={<><Navbar /><Cart /><Footer /></>} />
        <Route path="/checkout" element={<><Navbar /><Checkout /><Footer /></>} />

        {/* Admin pages */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/categories" element={<AdminDashboard><AdminCategories /></AdminDashboard>} />
        <Route path="/admin/products" element={<AdminDashboard><AdminProducts /></AdminDashboard>} />
        <Route path="/admin/stock" element={<AdminDashboard><AdminStock /></AdminDashboard>} />
        <Route path="/admin/orders" element={<AdminDashboard><AdminOrders /></AdminDashboard>} />
        <Route path="/admin/users" element={<AdminDashboard><AdminUsers /></AdminDashboard>} />
        <Route path="/admin/messages" element={<AdminDashboard><AdminMessages /></AdminDashboard>} />
      </Routes>
    </>
  );
}

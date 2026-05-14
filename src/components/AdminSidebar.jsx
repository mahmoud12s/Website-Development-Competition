import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminSidebar({ isOpen, onClose }) {
  const { user, logout, hasRole } = useAuth();

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div style={{ padding: '0 24px 20px', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
          {user?.displayName || user?.username}
        </div>
        <span className="badge badge-primary" style={{ marginTop: 4 }}>{user?.role}</span>
      </div>

      {hasRole('owner') && (
        <>
          <NavLink to="/admin" end className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <i className="fas fa-chart-pie"></i> Dashboard
          </NavLink>
          <NavLink to="/admin/categories" className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <i className="fas fa-folder"></i> Categories
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <i className="fas fa-box"></i> Products
          </NavLink>
        </>
      )}

      {hasRole('owner', 'stockmanager') && (
        <NavLink to="/admin/stock" className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <i className="fas fa-warehouse"></i> Stock Management
        </NavLink>
      )}

      {hasRole('owner', 'ordermaker') && (
        <NavLink to="/admin/orders" className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <i className="fas fa-receipt"></i> Orders
        </NavLink>
      )}

      {hasRole('owner') && (
        <>
          <NavLink to="/admin/users" className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <i className="fas fa-users-gear"></i> Users
          </NavLink>
          <NavLink to="/admin/messages" className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <i className="fas fa-envelope"></i> Messages
          </NavLink>
        </>
      )}

      <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', marginTop: 24 }}>
        <button className="btn btn-outline" style={{ width: '100%' }} onClick={logout}>
          <i className="fas fa-right-from-bracket"></i> Logout
        </button>
      </div>
    </aside>
  );
}

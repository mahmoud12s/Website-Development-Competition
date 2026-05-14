import { useState, useEffect, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/AdminSidebar';
import Navbar from '../../components/Navbar';

// ─── Mini bar chart component ───
function MiniBarChart({ data, height = 120 }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="mini-bar-chart" style={{ height, display: 'flex', alignItems: 'flex-end', gap: 6, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{d.count}</span>
          <div
            style={{
              width: '100%',
              maxWidth: 40,
              height: `${Math.max((d.count / max) * (height - 36), 4)}px`,
              background: `linear-gradient(180deg, var(--primary), var(--accent))`,
              borderRadius: '6px 6px 4px 4px',
              transition: 'height 0.6s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Dashboard stats component ───
function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [basicStats, setBasicStats] = useState({ products: 0, categories: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('week');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAll = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const [productsRes, categoriesRes, ordersRes, statsRes] = await Promise.all([
        fetch('/api/admin/products', { credentials: 'include' }).then(r => r.ok ? r.json() : {}),
        fetch('/api/admin/categories', { credentials: 'include' }).then(r => r.ok ? r.json() : []),
        fetch('/api/admin/orders', { credentials: 'include' }).then(r => r.ok ? r.json() : {}),
        fetch('/api/admin/orders/stats', { credentials: 'include' }).then(r => r.ok ? r.json() : null),
      ]);

      const prodList = productsRes.products || (Array.isArray(productsRes) ? productsRes : []);
      const catList = Array.isArray(categoriesRes) ? categoriesRes : [];
      const orderList = ordersRes.orders || (Array.isArray(ordersRes) ? ordersRes : []);

      setBasicStats({
        products: prodList.length,
        categories: catList.length,
        orders: ordersRes.total || orderList.length,
      });

      if (statsRes) setStats(statsRes);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAll(true);
  }, [fetchAll]);

  // AJAX auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAll(false); // refresh without loading spinner
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  if (loading) {
    return <div className="loading"><div className="spinner" /></div>;
  }

  const salesData = stats?.sales || { today: { total: 0 }, week: { total: 0 }, month: { total: 0 }, allTime: { total: 0 } };
  const visits = stats?.visits || { today: 0, week: 0, month: 0, total: 0, byDay: [] };
  const topProducts = stats?.topProducts || [];

  return (
    <>
      <div className="admin-header">
        <h1>Dashboard</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {lastUpdated && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            className="btn btn-sm btn-outline"
            onClick={() => fetchAll(false)}
            title="Refresh now"
            style={{ padding: '6px 14px' }}
          >
            <i className="fas fa-sync-alt" /> Refresh
          </button>
        </div>
      </div>

      {/* ── Overview Stats ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(37,99,235,0.1)' }}>
            <i className="fas fa-box" style={{ color: '#2563eb', fontSize: '1.4rem' }} />
          </div>
          <div>
            <div className="stat-value">{basicStats.products}</div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <i className="fas fa-folder" style={{ color: '#10b981', fontSize: '1.4rem' }} />
          </div>
          <div>
            <div className="stat-value">{basicStats.categories}</div>
            <div className="stat-label">Categories</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
            <i className="fas fa-receipt" style={{ color: '#f59e0b', fontSize: '1.4rem' }} />
          </div>
          <div>
            <div className="stat-value">{basicStats.orders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.1)' }}>
            <i className="fas fa-eye" style={{ color: '#8b5cf6', fontSize: '1.4rem' }} />
          </div>
          <div>
            <div className="stat-value">{visits.total}</div>
            <div className="stat-label">Total Visits</div>
          </div>
        </div>
      </div>

      {/* ── Sales & Visits Row ── */}
      <div className="analytics-row">
        {/* Sales Card */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h3><i className="fas fa-dollar-sign" style={{ color: 'var(--success)', marginRight: 8 }} />Sales Overview</h3>
            <div className="tab-pills">
              {['today', 'week', 'month', 'allTime'].map(tab => (
                <button
                  key={tab}
                  className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'allTime' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="sales-highlight">
            <div className="sales-amount">${salesData[activeTab]?.total?.toFixed(2) || '0.00'}</div>
            <div className="sales-count">{salesData[activeTab]?.count || 0} orders</div>
          </div>
          <div className="sales-breakdown">
            <div className="sales-breakdown-item">
              <span className="breakdown-label">Today</span>
              <span className="breakdown-value">${salesData.today?.total?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="sales-breakdown-item">
              <span className="breakdown-label">This Week</span>
              <span className="breakdown-value">${salesData.week?.total?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="sales-breakdown-item">
              <span className="breakdown-label">This Month</span>
              <span className="breakdown-value">${salesData.month?.total?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="sales-breakdown-item">
              <span className="breakdown-label">All Time</span>
              <span className="breakdown-value" style={{ color: 'var(--primary)', fontWeight: 700 }}>${salesData.allTime?.total?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Visits Card */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h3><i className="fas fa-chart-bar" style={{ color: 'var(--accent)', marginRight: 8 }} />Website Visits</h3>
          </div>
          <div className="visits-stats-row">
            <div className="visit-stat">
              <div className="visit-stat-value">{visits.today}</div>
              <div className="visit-stat-label">Today</div>
            </div>
            <div className="visit-stat">
              <div className="visit-stat-value">{visits.week}</div>
              <div className="visit-stat-label">This Week</div>
            </div>
            <div className="visit-stat">
              <div className="visit-stat-value">{visits.month}</div>
              <div className="visit-stat-label">This Month</div>
            </div>
          </div>
          {visits.byDay && visits.byDay.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12, fontWeight: 500 }}>Last 7 Days</div>
              <MiniBarChart data={visits.byDay} height={110} />
            </div>
          )}
        </div>
      </div>

      {/* ── Top Products ── */}
      {topProducts.length > 0 && (
        <div className="analytics-card" style={{ marginTop: 24 }}>
          <div className="analytics-card-header">
            <h3><i className="fas fa-trophy" style={{ color: '#f59e0b', marginRight: 8 }} />Top Products</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>By units sold</span>
          </div>
          <div className="top-products-list">
            {topProducts.map((product, idx) => (
              <div key={product._id || idx} className="top-product-item">
                <div className="top-product-rank">#{idx + 1}</div>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.productName}
                    className="top-product-img"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="top-product-img-placeholder">
                    <i className="fas fa-box" />
                  </div>
                )}
                <div className="top-product-info">
                  <div className="top-product-name">{product.productName || 'Unknown Product'}</div>
                  <div className="top-product-meta">
                    <span>{product.totalSold} sold</span>
                    <span>•</span>
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>${product.totalRevenue?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
                <div className="top-product-bar-wrap">
                  <div
                    className="top-product-bar"
                    style={{
                      width: `${Math.max((product.totalSold / (topProducts[0]?.totalSold || 1)) * 100, 8)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function Dashboard({ children }) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return <div className="page"><div className="loading"><div className="spinner" /></div></div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  const isDashboardRoot = location.pathname === '/admin';

  return (
    <>
      <Navbar />
      <div className="admin-layout">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="admin-content">
          <button className="toggle-sidebar-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          {isDashboardRoot && !children ? <DashboardHome /> : children}
        </main>
      </div>
    </>
  );
}

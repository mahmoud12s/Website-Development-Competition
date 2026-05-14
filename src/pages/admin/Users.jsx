import { useState, useEffect } from 'react';

const ROLES = [
  { value: 'owner', label: 'Owner', desc: 'Full access to all features' },
  { value: 'ordermaker', label: 'Order Maker', desc: 'Can view and manage orders' },
  { value: 'stockmanager', label: 'Stock Manager', desc: 'Can manage product stock levels' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', password: '', role: 'ordermaker', displayName: '' });

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create user');
      setShowModal(false);
      setForm({ username: '', password: '', role: 'ordermaker', displayName: '' });
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id, username) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete');
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'owner': return 'badge-primary';
      case 'ordermaker': return 'badge-warning';
      case 'stockmanager': return 'badge-success';
      default: return 'badge-primary';
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <>
      <div className="admin-header">
        <h1>User Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create User</button>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <div className="icon">👥</div>
          <h3>No users found</h3>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Display Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Created</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td data-label="Name" style={{ fontWeight: 600 }}>{user.displayName || user.username}</td>
                <td data-label="Username" style={{ color: 'var(--text-secondary)' }}>{user.username}</td>
                <td data-label="Role">
                  <span className={`badge ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td data-label="Created" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td data-label="">
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(user._id, user.username)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setError(''); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Create New User</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Display Name</label>
                <input
                  className="input"
                  placeholder="e.g. John Doe"
                  value={form.displayName}
                  onChange={e => setForm({ ...form, displayName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Username *</label>
                <input
                  className="input"
                  placeholder="Login username"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ROLES.map(r => (
                    <label
                      key={r.value}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: '14px 16px',
                        border: `1.5px solid ${form.role === r.value ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        background: form.role === r.value ? 'var(--primary-50)' : 'transparent',
                        transition: 'all 0.2s',
                      }}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        checked={form.role === r.value}
                        onChange={e => setForm({ ...form, role: e.target.value })}
                        style={{ marginTop: 2 }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{r.label}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>{r.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => { setShowModal(false); setError(''); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

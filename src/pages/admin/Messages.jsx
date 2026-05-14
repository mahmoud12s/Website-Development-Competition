import { useState, useEffect } from 'react';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [expandedId, setExpandedId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setMessages(data.messages || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/admin/messages/${id}/read`, {
        method: 'PUT',
        credentials: 'include',
      });
      setMessages(prev => prev.map(m => m._id === id ? { ...m, read: true } : m));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const deleteMessage = async (id) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete');
      setMessages(prev => prev.filter(m => m._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      const msg = messages.find(m => m._id === id);
      if (msg && !msg.read) {
        markAsRead(id);
      }
    }
  };

  const filtered = messages.filter(m => {
    if (filter === 'unread') return !m.read;
    if (filter === 'read') return m.read;
    return true;
  });

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return <div className="loading"><div className="spinner" /></div>;
  }

  return (
    <>
      <div className="admin-header">
        <h1>
          <i className="fas fa-envelope" style={{ marginRight: 10, color: 'var(--primary)' }} />
          Messages
          {unreadCount > 0 && (
            <span style={{
              background: 'var(--danger, #ef4444)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 20,
              marginLeft: 10,
              verticalAlign: 'middle',
            }}>
              {unreadCount} new
            </span>
          )}
        </h1>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { key: 'all', label: `All (${messages.length})` },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'read', label: `Read (${messages.length - unreadCount})` },
        ].map(tab => (
          <button
            key={tab.key}
            className={`tab-pill ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: filter === tab.key ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: filter === tab.key ? 'rgba(37,99,235,0.1)' : 'var(--bg-card)',
              color: filter === tab.key ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Messages list */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--text-muted)',
        }}>
          <i className="fas fa-inbox" style={{ fontSize: '3rem', marginBottom: 16, display: 'block', opacity: 0.4 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>
            {filter === 'unread' ? 'No unread messages' : filter === 'read' ? 'No read messages' : 'No messages yet'}
          </p>
          <p style={{ fontSize: '0.85rem', marginTop: 4 }}>
            Messages from the contact form will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(msg => (
            <div
              key={msg._id}
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${msg.read ? 'var(--border)' : 'var(--primary)'}`,
                borderRadius: 12,
                overflow: 'hidden',
                transition: 'all 0.25s ease',
                boxShadow: !msg.read ? '0 0 0 1px rgba(37,99,235,0.15), 0 2px 8px rgba(37,99,235,0.08)' : 'none',
              }}
            >
              {/* Message header - clickable */}
              <div
                onClick={() => toggleExpand(msg._id)}
                style={{
                  padding: '16px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Unread indicator */}
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: msg.read ? 'transparent' : 'var(--primary)',
                  border: msg.read ? '2px solid var(--border)' : 'none',
                  flexShrink: 0,
                }} />

                {/* Avatar */}
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${msg.read ? '#94a3b8' : 'var(--primary)'}, ${msg.read ? '#64748b' : 'var(--accent, #7c3aed)'})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  flexShrink: 0,
                }}>
                  {msg.name?.charAt(0).toUpperCase() || '?'}
                </div>

                {/* Name + preview */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 2,
                  }}>
                    <span style={{
                      fontWeight: msg.read ? 500 : 700,
                      fontSize: '0.95rem',
                      color: 'var(--text-primary)',
                    }}>
                      {msg.name}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      flexShrink: 0,
                      marginLeft: 12,
                    }}>
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    marginBottom: 2,
                  }}>
                    {msg.email}
                  </div>
                  {expandedId !== msg._id && (
                    <div style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontWeight: msg.read ? 400 : 500,
                    }}>
                      {msg.message}
                    </div>
                  )}
                </div>

                {/* Expand arrow */}
                <i className={`fas fa-chevron-${expandedId === msg._id ? 'up' : 'down'}`}
                  style={{ color: 'var(--text-muted)', fontSize: '0.8rem', flexShrink: 0 }}
                />
              </div>

              {/* Expanded message body */}
              {expandedId === msg._id && (
                <div style={{
                  padding: '0 20px 20px 86px',
                  animation: 'fadeIn 0.25s ease',
                }}>
                  <div style={{
                    background: 'var(--bg-elevated, rgba(0,0,0,0.02))',
                    padding: '16px 20px',
                    borderRadius: 10,
                    fontSize: '0.92rem',
                    lineHeight: 1.7,
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap',
                    marginBottom: 16,
                  }}>
                    {msg.message}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <a
                      href={`mailto:${msg.email}`}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.8rem', padding: '6px 16px', textDecoration: 'none' }}
                    >
                      <i className="fas fa-reply" style={{ marginRight: 6 }} /> Reply via Email
                    </a>

                    {deleteConfirm === msg._id ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--danger, #ef4444)' }}>Delete?</span>
                        <button
                          className="btn btn-sm"
                          style={{ fontSize: '0.75rem', padding: '4px 12px', background: 'var(--danger, #ef4444)', color: '#fff', border: 'none', borderRadius: 6 }}
                          onClick={() => deleteMessage(msg._id)}
                        >
                          Yes
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          style={{ fontSize: '0.75rem', padding: '4px 12px' }}
                          onClick={() => setDeleteConfirm(null)}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline"
                        style={{ fontSize: '0.8rem', padding: '6px 16px', color: 'var(--danger, #ef4444)', borderColor: 'var(--danger, #ef4444)' }}
                        onClick={() => setDeleteConfirm(msg._id)}
                      >
                        <i className="fas fa-trash" style={{ marginRight: 6 }} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

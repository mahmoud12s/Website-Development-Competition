import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send message.');
      setSent(true);
      setTimeout(() => setSent(false), 4000);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page">
      <section className="section" style={{ paddingTop: 100 }}>
        <div className="container">
          <div className="section-header">
            <h2>Get in Touch</h2>
            <p>We'd love to hear from you. Send us a message or reach out via our contact info.</p>
          </div>

          <div className="contact-grid">
            {/* Contact Form */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 32,
            }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 24 }}>Send a Message</h3>
              {sent && <div className="alert alert-success">Message sent successfully! We'll get back to you soon.</div>}
              {error && <div className="alert alert-error" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="contact-name">Your Name *</label>
                  <input
                    id="contact-name"
                    className="input"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="mahmoud"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-email">Email Address *</label>
                  <input
                    id="contact-email"
                    type="email"
                    className="input"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="mahmoud@gmail.com"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-message">Message *</label>
                  <textarea
                    id="contact-message"
                    className="textarea"
                    required
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="How can we help?"
                    style={{ minHeight: 150 }}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={sending}>
                  {sending ? '⏳ Sending...' : '✉️ Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <div className="contact-info-card">
                <div className="icon">📧</div>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: 4 }}>Email</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>support@mahmoud cell.com</p>
                </div>
              </div>
              <div className="contact-info-card">
                <div className="icon">📞</div>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: 4 }}>Phone</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>+961 76946420</p>
                </div>
              </div>
              <div className="contact-info-card">
                <div className="icon">📍</div>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: 4 }}>Address</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>aramoun</p>
                </div>
              </div>
              <div className="contact-info-card">
                <div className="icon">🕐</div>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: 4 }}>Business Hours</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>Mon — Fri: 9:00 AM — 6:00 PM</p>
                  <p style={{ color: 'var(--text-secondary)' }}>Sat — Sun: 10:00 AM — 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

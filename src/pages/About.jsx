export default function About() {
  return (
    <div className="page">
      <section className="section" style={{ paddingTop: 100 }}>
        <div className="container">
          <div className="section-header">
            <h2>About mahmoud cell</h2>
            <p>Your trusted partner in premium electronics since 2020</p>
          </div>

          <div className="about-grid" style={{ marginBottom: 60 }}>
            <div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Our Mission</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                At mahmoud cell, we believe everyone deserves access to the latest and greatest technology.
                Our mission is to make premium electronics accessible and affordable while providing
                an exceptional shopping experience.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                We carefully curate our product selection to ensure every item meets our high standards
                for quality, performance, and value. From smartphones to laptops to accessories,
                we've got you covered.
              </p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary-50), var(--primary-100))',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 48,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>⚡</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: 8, color: 'var(--text-primary)' }}>mahmoud cell</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Premium Electronics. Unbeatable Value.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-4" style={{ marginBottom: 60 }}>
            {[
              { value: '10K+', label: 'Happy Customers' },
              { value: '500+', label: 'Products Available' },
              { value: '99%', label: 'Satisfaction Rate' },
              { value: '24/7', label: 'Customer Support' },
            ].map((stat, i) => (
              <div key={i} className="category-card" style={{ cursor: 'default' }}>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)' }}>
                  {stat.value}
                </h3>
                <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Values */}
          <div className="section-header">
            <h2>Our Values</h2>
          </div>
          <div className="grid grid-3">
            {[
              { icon: '🎯', title: 'Quality First', desc: 'We only stock products that pass our rigorous quality checks.' },
              { icon: '🤝', title: 'Customer Trust', desc: 'Transparent pricing with no hidden fees. What you see is what you pay.' },
              { icon: '🌍', title: 'Global Reach', desc: 'We ship worldwide with reliable partners to ensure safe delivery.' },
            ].map((v, i) => (
              <div key={i} className="category-card" style={{ cursor: 'default' }}>
                <span className="icon">{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

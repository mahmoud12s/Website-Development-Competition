import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Validation 
const validators = {
  username: (val) => {
    if (!val.trim()) return 'Username is required.';
    if (val.trim().length < 3) return 'Username must be at least 3 characters.';
    if (val.trim().length > 30) return 'Username must be 30 characters or less.';
    if (!/^[a-zA-Z0-9_]+$/.test(val.trim())) return 'Username can only contain letters, numbers, and underscores.';
    return '';
  },
  password: (val) => {
    if (!val) return 'Password is required.';
    if (val.length < 6) return 'Password must be at least 6 characters.';
    if (val.length > 100) return 'Password is too long.';
    return '';
  },
};

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect
  if (user) {
    navigate('/admin', { replace: true });
    return null;
  }

  const validateField = (name, value) => {
    const err = validators[name]?.(value) || '';
    setFieldErrors(prev => ({ ...prev, [name]: err }));
    return err;
  };

  const handleBlur = (name, value) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const usernameErr = validators.username(username);
    const passwordErr = validators.password(password);
    setFieldErrors({ username: usernameErr, password: passwordErr });
    setTouched({ username: true, password: true });

    if (usernameErr || passwordErr) return;

    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name) => ({
    borderColor: touched[name] && fieldErrors[name] ? 'var(--danger, #ef4444)' : undefined,
  });

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '2.5rem' }}>🔐</span>
        </div>
        <h1>Admin Panel</h1>
        <p>Sign in to manage your store</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              className="input"
              value={username}
              onChange={e => { setUsername(e.target.value); if (touched.username) validateField('username', e.target.value); }}
              onBlur={() => handleBlur('username', username)}
              placeholder="admin"
              autoFocus
              autoComplete="username"
              style={inputStyle('username')}
            />
            {touched.username && fieldErrors.username && (
              <span className="field-error" style={{ color: 'var(--danger, #ef4444)', fontSize: '0.82rem', marginTop: 4, display: 'block' }}>
                {fieldErrors.username}
              </span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              className="input"
              value={password}
              onChange={e => { setPassword(e.target.value); if (touched.password) validateField('password', e.target.value); }}
              onBlur={() => handleBlur('password', password)}
              placeholder="••••••••"
              autoComplete="current-password"
              style={inputStyle('password')}
            />
            {touched.password && fieldErrors.password && (
              <span className="field-error" style={{ color: 'var(--danger, #ef4444)', fontSize: '0.82rem', marginTop: 4, display: 'block' }}>
                {fieldErrors.password}
              </span>
            )}
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

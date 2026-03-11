import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEMO_ACCOUNTS } from '../data';
import './Login.css';

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    // Attempt login
    const result = await login(email, password);
    
    if (result.success) {
      // Redirect based on role
      if (result.user.role === 'donor') {
        navigate('/donor-dashboard');
      } else if (result.user.role === 'staff') {
        navigate('/staff-dashboard');
      } else if (result.user.role === 'admin') {
        navigate('/admin-dashboard');
      }
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    const account = DEMO_ACCOUNTS[role];
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
    }
  };

  return (
    <div className="login-container">
      <div className="login-hero">
        <div className="hero-content">
          <div className="hero-logo">
            <span className="logo-icon">+</span>
            <span className="logo-text">BDMS</span>
          </div>
          <h1>Blood Donation Management System</h1>
          <p className="hero-tagline">Every drop counts. Save lives through the power of giving.</p>
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="pw-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPassword(p => !p)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-divider">
            <span>Quick Demo Access</span>
          </div>

          <div className="demo-buttons">
            <button
              onClick={() => handleDemoLogin('donor')}
              className="btn-demo"
            >
              <span className="demo-role">Donor</span>
              <span className="demo-desc">View donor experience</span>
            </button>
            <button
              onClick={() => handleDemoLogin('staff')}
              className="btn-demo"
            >
              <span className="demo-role">Staff</span>
              <span className="demo-desc">View staff experience</span>
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              className="btn-demo"
            >
              <span className="demo-role">Admin</span>
              <span className="demo-desc">View admin experience</span>
            </button>
          </div>

          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <a href="/register" onClick={(e) => {
                e.preventDefault();
                navigate('/register');
              }}>
                Create one now
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

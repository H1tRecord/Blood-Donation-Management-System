import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEMO_ACCOUNTS } from '../data';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">500+</span>
              <span className="stat-text">Donors Registered</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">1,200+</span>
              <span className="stat-text">Lives Saved</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">8</span>
              <span className="stat-text">Blood Types</span>
            </div>
          </div>
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
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
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

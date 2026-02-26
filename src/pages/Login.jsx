import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
    const result = login(email, password);
    
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
    if (role === 'donor') {
      setEmail('john.smith@email.com');
      setPassword('donor123');
    } else if (role === 'staff') {
      setEmail('nurse.smith@bdms.org');
      setPassword('staff123');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Blood Donation Management System</h1>
          <h2>Sign In</h2>
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
              placeholder="Enter your email"
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
          <span>Demo Accounts</span>
        </div>

        <div className="demo-buttons">
          <button
            onClick={() => handleDemoLogin('donor')}
            className="btn-demo"
          >
            Demo Donor Login
          </button>
          <button
            onClick={() => handleDemoLogin('staff')}
            className="btn-demo"
          >
            Demo Staff Login
          </button>
        </div>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <a href="/register" onClick={(e) => {
              e.preventDefault();
              navigate('/register');
            }}>
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

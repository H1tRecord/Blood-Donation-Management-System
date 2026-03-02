import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'donor'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validate inputs
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Attempt registration
    const result = await register(formData, formData.role === 'donor'); // Auto-login donors
    
    if (result.success) {
      if (formData.role === 'donor') {
        setSuccess('Registration successful! Please book your first appointment to complete registration.');
        setTimeout(() => {
          // Navigate to appointment booking for first-time donors
          navigate('/book-appointment', { state: { isFirstTime: true } });
        }, 2000);
      } else {
        // Staff members just login normally
        setSuccess(result.message);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-hero">
        <div className="hero-content">
          <div className="hero-logo">
            <span className="logo-icon">+</span>
            <span className="logo-text">BDMS</span>
          </div>
          <h1>Join the lifesaving community</h1>
          <p className="hero-tagline">Register as a donor and make a difference. Your first donation could save up to three lives.</p>
          <ul className="hero-benefits">
            <li>Quick and easy registration</li>
            <li>Book appointments at your convenience</li>
            <li>Track your donation history</li>
            <li>Get notified when your blood type is needed</li>
          </ul>
        </div>
      </div>

      <div className="register-form-side">
        <div className="register-card">
          <div className="register-header">
            <h2>Create your account</h2>
            <p>Fill in your details to get started</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Smith"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  minLength="6"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="register-footer">
            <p>
              Already have an account?{' '}
              <a href="/login" onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}>
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

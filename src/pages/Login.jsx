import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'donor',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Simple validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (isRegister && (!formData.name || !formData.phone)) {
      setError('Please fill in all required fields');
      return;
    }

    // Mock authentication - in real app this would call an API
    const user = {
      id: isRegister ? `D${Date.now()}` : 'D001',
      name: isRegister ? formData.name : (formData.role === 'donor' ? 'John Smith' : 'Admin User'),
      email: formData.email,
      phone: isRegister ? formData.phone : '555-123-4567',
      bloodType: null, // Blood type set by staff during appointment
      role: formData.role,
    };

    onLogin(user);
    
    // Navigate based on role
    if (formData.role === 'donor') {
      navigate('/donor/dashboard');
    } else {
      navigate('/staff/dashboard');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <span className="blood-icon-large">🩸</span>
          <h1>Blood Donation Management System</h1>
          <p>{isRegister ? 'Create your donor account' : 'Sign in to your account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          {isRegister && (
            <>
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="info-note">
                <span className="info-icon">ℹ️</span>
                <small>Your blood type will be determined by our staff during your first donation appointment.</small>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </div>

          {!isRegister && (
            <div className="form-group">
              <label htmlFor="role">Login As</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="donor">Donor</option>
                <option value="staff">Staff/Admin</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn-primary btn-block">
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button onClick={() => setIsRegister(false)} className="link-button">
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button onClick={() => setIsRegister(true)} className="link-button">
                Register as Donor
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;

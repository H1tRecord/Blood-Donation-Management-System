import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">🩸</span>
            <span className="brand-text">BDMS</span>
          </Link>
        </div>

        <div className="navbar-menu">
          {currentUser?.role === 'donor' && (
            <>
              <Link
                to="/donor-dashboard"
                className={`nav-link ${isActive('/donor-dashboard')}`}
              >
                Dashboard
              </Link>
              <Link
                to="/appointment-booking"
                className={`nav-link ${isActive('/appointment-booking')}`}
              >
                Book Appointment
              </Link>
            </>
          )}

          {(currentUser?.role === 'staff' || currentUser?.role === 'admin') && (
            <>
              <Link
                to="/staff-dashboard"
                className={`nav-link ${isActive('/staff-dashboard')}`}
              >
                Dashboard
              </Link>
              <Link
                to="/staff-appointments"
                className={`nav-link ${isActive('/staff-appointments')}`}
              >
                Appointments
              </Link>
              <Link
                to="/inventory-management"
                className={`nav-link ${isActive('/inventory-management')}`}
              >
                Inventory
              </Link>
              <Link
                to="/donor-search"
                className={`nav-link ${isActive('/donor-search')}`}
              >
                Search Donors
              </Link>
            </>
          )}
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <span className="user-role">
              {currentUser?.role === 'donor' ? '👤' : '👔'}
            </span>
            <span className="user-name">{currentUser?.name}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

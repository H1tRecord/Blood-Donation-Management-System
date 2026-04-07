import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">+</span>
            <span className="brand-text">BDMS</span>
          </Link>
        </div>

        <button
          className="hamburger-btn"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="navbar-collapse"
        >
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`} />
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`} />
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`} />
        </button>

        <div className="navbar-menu-desktop">
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
              <Link
                to="/donor-faq"
                className={`nav-link ${isActive('/donor-faq')}`}
              >
                FAQ
              </Link>
            </>
          )}

          {currentUser?.role === 'staff' && (
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

          {currentUser?.role === 'admin' && (
            <>
              <Link
                to="/admin-dashboard"
                className={`nav-link ${isActive('/admin-dashboard')}`}
              >
                Manage Accounts
              </Link>
            </>
          )}
        </div>

        <div className="navbar-user-desktop">
          <div className="user-info">
            <span className="user-role-tag">
              {currentUser?.role === 'donor' ? 'Donor' : currentUser?.role === 'admin' ? 'Admin' : 'Staff'}
            </span>
            <span className="user-name">{currentUser?.name}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>

        {isMenuOpen && (
          <div
            className="sidebar-backdrop"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}

        <div
          id="sidebar-menu"
          className={`sidebar-menu ${isMenuOpen ? 'open' : ''}`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="sidebar-header">
            <span className="sidebar-title">Menu</span>
            <button
              className="sidebar-close"
              onClick={closeMobileMenu}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <div className="sidebar-menu-items">
            {currentUser?.role === 'donor' && (
              <>
                <Link
                  to="/donor-dashboard"
                  className={`sidebar-link ${isActive('/donor-dashboard')}`}
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/appointment-booking"
                  className={`sidebar-link ${isActive('/appointment-booking')}`}
                  onClick={closeMobileMenu}
                >
                  Book Appointment
                </Link>
                <Link
                  to="/donor-faq"
                  className={`sidebar-link ${isActive('/donor-faq')}`}
                  onClick={closeMobileMenu}
                >
                  FAQ
                </Link>
              </>
            )}

            {currentUser?.role === 'staff' && (
              <>
                <Link
                  to="/staff-dashboard"
                  className={`sidebar-link ${isActive('/staff-dashboard')}`}
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/staff-appointments"
                  className={`sidebar-link ${isActive('/staff-appointments')}`}
                  onClick={closeMobileMenu}
                >
                  Appointments
                </Link>
                <Link
                  to="/inventory-management"
                  className={`sidebar-link ${isActive('/inventory-management')}`}
                  onClick={closeMobileMenu}
                >
                  Inventory
                </Link>
                <Link
                  to="/donor-search"
                  className={`sidebar-link ${isActive('/donor-search')}`}
                  onClick={closeMobileMenu}
                >
                  Search Donors
                </Link>
              </>
            )}

            {currentUser?.role === 'admin' && (
              <>
                <Link
                  to="/admin-dashboard"
                  className={`sidebar-link ${isActive('/admin-dashboard')}`}
                  onClick={closeMobileMenu}
                >
                  Manage Accounts
                </Link>
              </>
            )}
          </div>

          <div className="sidebar-footer">
            <div className="user-info">
              <span className="user-role-tag">
                {currentUser?.role === 'donor' ? 'Donor' : currentUser?.role === 'admin' ? 'Admin' : 'Staff'}
              </span>
              <span className="user-name">{currentUser?.name}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn logout-btn-mobile">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <span className="blood-icon">🩸</span>
          <span className="brand-text">Blood Donation Management System</span>
        </Link>
      </div>

      <div className="navbar-menu">
        {user ? (
          <>
            {user.role === 'donor' && (
              <>
                <Link 
                  to="/donor/dashboard" 
                  className={location.pathname === '/donor/dashboard' ? 'active' : ''}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/donor/appointments" 
                  className={location.pathname === '/donor/appointments' ? 'active' : ''}
                >
                  Book Appointment
                </Link>
              </>
            )}
            {user.role === 'staff' && (
              <>
                <Link 
                  to="/staff/dashboard" 
                  className={location.pathname === '/staff/dashboard' ? 'active' : ''}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/staff/appointments" 
                  className={location.pathname === '/staff/appointments' ? 'active' : ''}
                >
                  Appointments
                </Link>
                <Link 
                  to="/staff/inventory" 
                  className={location.pathname === '/staff/inventory' ? 'active' : ''}
                >
                  Inventory
                </Link>
                <Link 
                  to="/staff/donors" 
                  className={location.pathname === '/staff/donors' ? 'active' : ''}
                >
                  Donors
                </Link>
              </>
            )}
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">({user.role})</span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          </>
        ) : (
          <Link to="/login" className="btn-login">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AppointmentBooking from './pages/AppointmentBooking';
import StaffAppointments from './pages/StaffAppointments';
import InventoryManagement from './pages/InventoryManagement';
import DonorSearch from './pages/DonorSearch';
import './App.css';

// Protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

// Public route wrapper (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, currentUser } = useAuth();

  if (isAuthenticated) {
    if (currentUser?.role === 'donor') {
      return <Navigate to="/donor-dashboard" />;
    } else if (currentUser?.role === 'staff') {
      return <Navigate to="/staff-dashboard" />;
    }
  }

  return children;
};

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app">
      {isAuthenticated && <Navbar />}
      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Donor routes */}
          <Route
            path="/donor-dashboard"
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointment-booking"
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <AppointmentBooking />
              </ProtectedRoute>
            }
          />

          {/* Staff routes */}
          <Route
            path="/staff-dashboard"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff-appointments"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <StaffAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory-management"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <InventoryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor-search"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <DonorSearch />
              </ProtectedRoute>
            }
          />

          {/* Default route */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* 404 route */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

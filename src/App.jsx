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
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

// Protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, currentUser, loading } = useAuth();

  if (loading) return null; // wait for Firebase Auth to resolve

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    // Redirect to the user's own home page instead of a generic fallback
    if (currentUser?.role === 'donor') return <Navigate to="/donor-dashboard" />;
    if (currentUser?.role === 'staff') return <Navigate to="/staff-dashboard" />;
    if (currentUser?.role === 'admin') return <Navigate to="/admin-dashboard" />;
    return <Navigate to="/login" />;
  }

  return children;
};

// Public route wrapper (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, currentUser, loading } = useAuth();

  if (loading) return null; // wait for Firebase Auth to resolve

  if (isAuthenticated) {
    if (currentUser?.role === 'donor') {
      return <Navigate to="/donor-dashboard" />;
    } else if (currentUser?.role === 'staff') {
      return <Navigate to="/staff-dashboard" />;
    } else if (currentUser?.role === 'admin') {
      return <Navigate to="/admin-dashboard" />;
    }
  }

  return children;
};

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app">
      {isAuthenticated && <Navbar />}
      <main className={isAuthenticated ? 'main-content' : 'main-content-auth'}>
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
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff-appointments"
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory-management"
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <InventoryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor-search"
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <DonorSearch />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
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

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import DonorDashboard from './pages/DonorDashboard';
import AppointmentBooking from './pages/AppointmentBooking';
import StaffDashboard from './pages/StaffDashboard';
import StaffAppointments from './pages/StaffAppointments';
import InventoryManagement from './pages/InventoryManagement';
import DonorSearch from './pages/DonorSearch';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  // Check for saved user session
  useEffect(() => {
    const savedUser = localStorage.getItem('bdms_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('bdms_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bdms_user');
  };

  // Protected Route component
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to={user.role === 'donor' ? '/donor/dashboard' : '/staff/dashboard'} replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="app">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={
                user ? (
                  <Navigate to={user.role === 'donor' ? '/donor/dashboard' : '/staff/dashboard'} replace />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              } 
            />

            {/* Donor routes */}
            <Route 
              path="/donor/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <DonorDashboard user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/donor/appointments" 
              element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <AppointmentBooking user={user} />
                </ProtectedRoute>
              } 
            />

            {/* Staff routes */}
            <Route 
              path="/staff/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffDashboard user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/staff/appointments" 
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffAppointments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/staff/inventory" 
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <InventoryManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/staff/donors" 
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <DonorSearch />
                </ProtectedRoute>
              } 
            />

            {/* Default redirect */}
            <Route 
              path="/" 
              element={
                user ? (
                  <Navigate to={user.role === 'donor' ? '/donor/dashboard' : '/staff/dashboard'} replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

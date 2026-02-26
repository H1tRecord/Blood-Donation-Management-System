import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  appointments,
  bloodInventory,
  getInventoryStatus,
  getInventoryColor
} from '../data/mockData';
import './StaffDashboard.css';

const StaffDashboard = () => {
  const { currentUser, resetSessionTimeout } = useAuth();
  const navigate = useNavigate();
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    resetSessionTimeout();
    loadStaffData();
  }, []);

  const loadStaffData = () => {
    // Get today's appointments
    const today = new Date('2026-02-26').toISOString().split('T')[0];
    const todayAppts = appointments.filter(
      (apt) => apt.date === '2026-02-27' && apt.status !== 'cancelled'
    ).sort((a, b) => a.time.localeCompare(b.time));
    setTodayAppointments(todayAppts);

    // Load inventory
    setInventory(bloodInventory);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'adequate': return 'status-adequate';
      case 'low': return 'status-low';
      case 'critical': return 'status-critical';
      default: return '';
    }
  };

  const getCriticalBloodTypes = () => {
    return bloodInventory.filter(inv => inv.units < 10);
  };

  const getLowBloodTypes = () => {
    return bloodInventory.filter(inv => inv.units >= 10 && inv.units < 20);
  };

  return (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {currentUser?.name}!</h1>
        <p className="subtitle">Staff Dashboard</p>
      </div>

      <div className="dashboard-grid">
        {/* Blood Inventory Overview Card */}
        <div className="card inventory-overview-card">
          <h2>Blood Inventory Overview</h2>
          <div className="inventory-grid">
            {inventory.map((item) => {
              const status = getInventoryStatus(item.units);
              const color = getInventoryColor(item.units);
              return (
                <div key={item.type} className={`inventory-item ${color}`}>
                  <div className="blood-type-label">{item.type}</div>
                  <div className="units-count">{item.units}</div>
                  <div className="units-label">units</div>
                  <div className={`status-indicator ${status}`}>
                    {status.toUpperCase()}
                  </div>
                </div>
              );
            })}
          </div>
          <button
            className="btn-primary"
            onClick={() => navigate('/inventory-management')}
          >
            Manage Inventory
          </button>
        </div>

        {/* Today's Appointments Card */}
        <div className="card appointments-card">
          <div className="card-header">
            <h2>Today's Appointments</h2>
            <span className="appointment-count">{todayAppointments.length} scheduled</span>
          </div>
          <div className="appointments-list">
            {todayAppointments.length > 0 ? (
              todayAppointments.map((apt) => (
                <div key={apt.id} className="appointment-item">
                  <div className="appointment-time-badge">{apt.time}</div>
                  <div className="appointment-info">
                    <p className="donor-name">{apt.donorName}</p>
                    <div className="appointment-meta">
                      {apt.bloodType && (
                        <span className="blood-type-small">{apt.bloodType}</span>
                      )}
                      <span className={`status-badge ${apt.status}`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-appointments">No appointments scheduled for today</p>
            )}
          </div>
          <button
            className="btn-secondary"
            onClick={() => navigate('/staff-appointments')}
          >
            View All Appointments
          </button>
        </div>

        {/* Critical Blood Types Card */}
        {getCriticalBloodTypes().length > 0 && (
          <div className="card critical-card">
            <h2>🚨 Critical Blood Types</h2>
            <p className="critical-info">Immediate action required</p>
            <div className="critical-list">
              {getCriticalBloodTypes().map((inv) => (
                <div key={inv.type} className="critical-item">
                  <span className="blood-type-badge critical">{inv.type}</span>
                  <div className="critical-details">
                    <span className="units-remaining">
                      Only {inv.units} units remaining
                    </span>
                    <button
                      className="btn-request"
                      onClick={() => navigate('/donor-search', { state: { bloodType: inv.type } })}
                    >
                      Request Donors
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Low Blood Types Card */}
        {getLowBloodTypes().length > 0 && (
          <div className="card low-card">
            <h2>⚠️ Low Blood Types</h2>
            <p className="low-info">Consider requesting donations</p>
            <div className="low-list">
              {getLowBloodTypes().map((inv) => (
                <div key={inv.type} className="low-item">
                  <span className="blood-type-badge low">{inv.type}</span>
                  <div className="low-details">
                    <span className="units-remaining">{inv.units} units available</span>
                    <button
                      className="btn-request-secondary"
                      onClick={() => navigate('/donor-search', { state: { bloodType: inv.type } })}
                    >
                      Request Donors
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions Card */}
        <div className="card quick-actions-card">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            <button
              className="quick-action-btn"
              onClick={() => navigate('/staff-appointments')}
            >
              <span className="action-icon">📅</span>
              <span className="action-label">Manage Appointments</span>
            </button>
            <button
              className="quick-action-btn"
              onClick={() => navigate('/inventory-management')}
            >
              <span className="action-icon">📦</span>
              <span className="action-label">Update Inventory</span>
            </button>
            <button
              className="quick-action-btn"
              onClick={() => navigate('/donor-search')}
            >
              <span className="action-icon">🔍</span>
              <span className="action-label">Search Donors</span>
            </button>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="card statistics-card">
          <h2>Today's Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{todayAppointments.length}</div>
              <div className="stat-label">Total Appointments</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {todayAppointments.filter(a => a.status === 'confirmed').length}
              </div>
              <div className="stat-label">Confirmed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {todayAppointments.filter(a => a.status === 'pending').length}
              </div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {getCriticalBloodTypes().length + getLowBloodTypes().length}
              </div>
              <div className="stat-label">Types Needed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;

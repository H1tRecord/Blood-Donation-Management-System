import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockBloodInventory, mockUpcomingAppointments, mockDonorDatabase } from '../data/mockData';

function StaffDashboard({ user }) {
  const [inventory] = useState(mockBloodInventory);
  const [appointments] = useState(mockUpcomingAppointments);
  const [recentDonors] = useState(mockDonorDatabase.slice(0, 4));

  const getTotalUnits = () => inventory.reduce((sum, item) => sum + item.units, 0);
  const getCriticalCount = () => inventory.filter(item => item.status === 'critical').length;
  const getLowCount = () => inventory.filter(item => item.status === 'low').length;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <h1>Staff Dashboard</h1>
        <p className="subtitle">Welcome back, {user?.name || 'Admin'}</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🩸</div>
          <div className="stat-content">
            <span className="stat-value">{getTotalUnits()}</span>
            <span className="stat-label">Total Blood Units</span>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <span className="stat-value">{getCriticalCount() + getLowCount()}</span>
            <span className="stat-label">Low/Critical Types</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <span className="stat-value">{appointments.length}</span>
            <span className="stat-label">Upcoming Appointments</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <span className="stat-value">{mockDonorDatabase.length}</span>
            <span className="stat-label">Registered Donors</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Inventory Overview */}
        <div className="card inventory-overview">
          <div className="card-header">
            <h2>Blood Inventory Status</h2>
            <Link to="/staff/inventory" className="view-all">View All →</Link>
          </div>
          <div className="card-body">
            <div className="inventory-grid">
              {inventory.map((item) => (
                <div key={item.bloodType} className={`inventory-item ${item.status}`}>
                  <span className="blood-type">{item.bloodType}</span>
                  <span className="units">{item.units} units</span>
                  <span className={`status-indicator ${item.status}`}>
                    {item.status === 'critical' && '🔴'}
                    {item.status === 'low' && '🟡'}
                    {item.status === 'adequate' && '🟢'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="card appointments-card">
          <div className="card-header">
            <h2>Upcoming Appointments</h2>
            <Link to="/staff/appointments" className="view-all">Manage All →</Link>
          </div>
          <div className="card-body">
            <div className="appointments-list">
              {appointments.map((apt) => (
                <div key={apt.id} className="appointment-item">
                  <div className="apt-time">
                    <span className="date">{formatDate(apt.date)}</span>
                    <span className="time">{apt.time}</span>
                  </div>
                  <div className="apt-details">
                    <span className="donor-name">{apt.donorName}</span>
                    <span className="blood-type-small">{apt.bloodType}</span>
                  </div>
                  <span className={`apt-status ${apt.status.toLowerCase()}`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Donors */}
        <div className="card donors-card">
          <div className="card-header">
            <h2>Recent Donors</h2>
            <Link to="/staff/donors" className="view-all">View All →</Link>
          </div>
          <div className="card-body">
            <div className="donors-list">
              {recentDonors.map((donor) => (
                <div key={donor.id} className="donor-item">
                  <div className="donor-avatar">
                    {donor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="donor-info">
                    <span className="donor-name">{donor.name}</span>
                    <span className="donor-email">{donor.email}</span>
                  </div>
                  <span className="donor-blood-type">{donor.bloodType}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card actions-card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="card-body">
            <div className="quick-actions">
              <Link to="/staff/donors" className="action-btn">
                <span className="action-icon">🔍</span>
                <span>Search Donors</span>
              </Link>
              <Link to="/staff/appointments" className="action-btn">
                <span className="action-icon">📅</span>
                <span>Manage Appointments</span>
              </Link>
              <Link to="/staff/inventory" className="action-btn">
                <span className="action-icon">📦</span>
                <span>Manage Inventory</span>
              </Link>
              <button className="action-btn">
                <span className="action-icon">📊</span>
                <span>Generate Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;

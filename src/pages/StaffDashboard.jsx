import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getInventoryStatus,
  getInventoryColor,
  APP_CONFIG,
} from '../data';
import { getAppointments, getBloodInventory } from '../data/db';
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

  const loadStaffData = async () => {
    const [allAppts, allInv] = await Promise.all([
      getAppointments(),
      getBloodInventory(),
    ]);
    const todayAppts = allAppts
      .filter((apt) => apt.date === APP_CONFIG.TODAY && apt.status !== 'cancelled')
      .sort((a, b) => a.time.localeCompare(b.time));
    setTodayAppointments(todayAppts);
    setInventory(allInv);
  };

  const criticalTypes = inventory.filter((inv) => inv.units < 10);
  const lowTypes      = inventory.filter((inv) => inv.units >= 10 && inv.units < 20);

  const stats = [
    { value: todayAppointments.length,                                       label: 'Appointments',  accent: 'blue'   },
    { value: todayAppointments.filter((a) => a.status === 'confirmed').length, label: 'Confirmed',    accent: 'green'  },
    { value: todayAppointments.filter((a) => a.status === 'pending').length,   label: 'Pending',      accent: 'yellow' },
    { value: criticalTypes.length + lowTypes.length,                           label: 'Types Needed', accent: 'red'    },
  ];

  return (
    <div className="staff-dashboard">

      {/* ── Header ── */}
      <div className="sd-header">
        <div>
          <h1>Good morning, {currentUser?.name?.split(' ')[0]}!</h1>
          <p className="sd-subtitle">Here's what needs your attention today</p>
        </div>
        <span className="sd-role-badge">Staff</span>
      </div>

      {/* ── Stat Bar ── */}
      <div className="sd-stat-bar">
        {stats.map((s) => (
          <div key={s.label} className={`sd-stat accent-${s.accent}`}>
            <span className="sd-stat-value">{s.value}</span>
            <span className="sd-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="sd-main-grid">

        {/* Left: Blood Inventory */}
        <div className="card sd-inventory-card">
          <div className="sd-card-head">
            <h2>Blood Inventory</h2>
            <button className="sd-link-btn" onClick={() => navigate('/inventory-management')}>
              Manage →
            </button>
          </div>

          <div className="sd-inventory-list">
            {inventory.map((item) => {
              const pct    = Math.min((item.units / 40) * 100, 100);
              const color  = getInventoryColor(item.units);
              const status = getInventoryStatus(item.units);
              return (
                <div key={item.type} className="sd-inv-row">
                  <span className="sd-inv-type">{item.type}</span>
                  <div className="sd-inv-bar-wrap">
                    <div className={`sd-inv-bar ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="sd-inv-units">{item.units} <em>units</em></span>
                  <span className={`sd-inv-status ${color}`}>{status}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Today's Appointments */}
        <div className="card sd-appts-card">
          <div className="sd-card-head">
            <h2>Today's Appointments</h2>
            <span className="sd-count-pill">{todayAppointments.length}</span>
          </div>

          <div className="sd-appts-list">
            {todayAppointments.length > 0 ? (
              todayAppointments.map((apt) => (
                <div key={apt.id} className={`sd-appt-item status-${apt.status}`}>
                  <div className="sd-appt-time">{apt.time}</div>
                  <div className="sd-appt-body">
                    <p className="sd-appt-name">{apt.donorName}</p>
                    <div className="sd-appt-tags">
                      {apt.bloodType && (
                        <span className="sd-tag blood">{apt.bloodType}</span>
                      )}
                      <span className={`sd-tag ${apt.status}`}>{apt.status}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="sd-empty">No appointments scheduled for today</div>
            )}
          </div>

          <button className="sd-ghost-btn" onClick={() => navigate('/staff-appointments')}>
            View all appointments
          </button>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="sd-bottom-row">

        {/* Alerts */}
        {(criticalTypes.length > 0 || lowTypes.length > 0) && (
          <div className="card sd-alerts-card">
            <h2>Stock Alerts</h2>

            {criticalTypes.length > 0 && (
              <div className="sd-alert-group">
                <p className="sd-alert-heading critical">Critical — immediate action needed</p>
                {criticalTypes.map((inv) => (
                  <div key={inv.type} className="sd-alert-row">
                    <span className="sd-alert-dot critical" />
                    <span className="sd-alert-type">{inv.type}</span>
                    <span className="sd-alert-units">only {inv.units} units</span>
                    <button
                      className="sd-alert-btn critical"
                      onClick={() => navigate('/donor-search', { state: { bloodType: inv.type } })}
                    >
                      Request Donors
                    </button>
                  </div>
                ))}
              </div>
            )}

            {lowTypes.length > 0 && (
              <div className="sd-alert-group">
                <p className="sd-alert-heading low">Low — consider requesting donations</p>
                {lowTypes.map((inv) => (
                  <div key={inv.type} className="sd-alert-row">
                    <span className="sd-alert-dot low" />
                    <span className="sd-alert-type">{inv.type}</span>
                    <span className="sd-alert-units">{inv.units} units</span>
                    <button
                      className="sd-alert-btn low"
                      onClick={() => navigate('/donor-search', { state: { bloodType: inv.type } })}
                    >
                      Request Donors
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="card sd-actions-card">
          <h2>Quick Actions</h2>
          <div className="sd-actions-grid">
            <button className="sd-action" onClick={() => navigate('/staff-appointments')}>
              <span className="sd-action-icon">📅</span>
              <span>Manage Appointments</span>
            </button>
            <button className="sd-action" onClick={() => navigate('/inventory-management')}>
              <span className="sd-action-icon">📦</span>
              <span>Update Inventory</span>
            </button>
            <button className="sd-action" onClick={() => navigate('/donor-search')}>
              <span className="sd-action-icon">🔍</span>
              <span>Search Donors</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointments, bloodInventory } from '../data/mockData';
import './StaffAppointments.css';

const StaffAppointments = () => {
  const { currentUser, resetSessionTimeout } = useAuth();
  const [allAppointments, setAllAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [dateAppointments, setDateAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    resetSessionTimeout();
    loadAppointments();
    generateAvailableDates();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      filterAppointmentsByDate(selectedDate);
    }
  }, [selectedDate, allAppointments]);

  const loadAppointments = () => {
    // Load all appointments (exclude cancelled for default view)
    const appts = [...appointments].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
    setAllAppointments(appts);
  };

  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date('2026-02-26');
    
    // Generate next 7 days
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        })
      });
    }
    
    setAvailableDates(dates);
    setSelectedDate(dates[0].value); // Default to tomorrow
  };

  const filterAppointmentsByDate = (date) => {
    const filtered = allAppointments.filter(apt => apt.date === date);
    setDateAppointments(filtered);
  };

  const handleStatusChange = (appointmentId, newStatus) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      appointment.status = newStatus;
      
      // If completed, could add to donation history here
      if (newStatus === 'completed') {
        console.log('Appointment completed - would record donation');
        // In real app, would prompt for donation details (hemoglobin, etc.)
      }
      
      loadAppointments();
    }
  };

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      handleStatusChange(appointmentId, 'cancelled');
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'checked-in': return 'status-checked-in';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const getAppointmentStats = () => {
    return {
      total: dateAppointments.length,
      pending: dateAppointments.filter(a => a.status === 'pending').length,
      confirmed: dateAppointments.filter(a => a.status === 'confirmed').length,
      checkedIn: dateAppointments.filter(a => a.status === 'checked-in').length,
      completed: dateAppointments.filter(a => a.status === 'completed').length,
      cancelled: dateAppointments.filter(a => a.status === 'cancelled').length
    };
  };

  const stats = getAppointmentStats();

  return (
    <div className="staff-appointments">
      <div className="page-header">
        <h1>Appointment Management</h1>
        <p className="subtitle">View and manage donor appointments</p>
      </div>

      <div className="appointments-content">
        {/* Date Selector */}
        <div className="card date-selector-card">
          <h2>Select Date</h2>
          <div className="date-buttons">
            {availableDates.map((date) => (
              <button
                key={date.value}
                className={`date-btn ${selectedDate === date.value ? 'selected' : ''}`}
                onClick={() => setSelectedDate(date.value)}
              >
                {date.label}
              </button>
            ))}
          </div>
        </div>

        {/* Appointment Stats */}
        {selectedDate && (
          <div className="card stats-card">
            <h2>
              Appointments for{' '}
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </h2>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total</div>
              </div>
              <div className="stat-box pending">
                <div className="stat-value">{stats.pending}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-box confirmed">
                <div className="stat-value">{stats.confirmed}</div>
                <div className="stat-label">Confirmed</div>
              </div>
              <div className="stat-box checked-in">
                <div className="stat-value">{stats.checkedIn}</div>
                <div className="stat-label">Checked In</div>
              </div>
              <div className="stat-box completed">
                <div className="stat-value">{stats.completed}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
          </div>
        )}

        {/* Appointments List */}
        <div className="card appointments-list-card">
          <h2>Appointments</h2>
          {dateAppointments.length > 0 ? (
            <div className="appointments-table">
              <div className="table-header">
                <div className="col-time">Time</div>
                <div className="col-donor">Donor</div>
                <div className="col-blood">Blood Type</div>
                <div className="col-status">Status</div>
                <div className="col-confirmation">Confirmation</div>
                <div className="col-actions">Actions</div>
              </div>
              {dateAppointments.map((apt) => (
                <div key={apt.id} className="table-row">
                  <div className="col-time">
                    <span className="time-badge">{apt.time}</span>
                  </div>
                  <div className="col-donor">
                    <span className="donor-name">{apt.donorName}</span>
                  </div>
                  <div className="col-blood">
                    {apt.bloodType ? (
                      <span className="blood-type-badge">{apt.bloodType}</span>
                    ) : (
                      <span className="unknown-type">TBD</span>
                    )}
                  </div>
                  <div className="col-status">
                    <span className={`status-badge ${getStatusBadgeClass(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>
                  <div className="col-confirmation">
                    <span className="confirmation-code">{apt.confirmationNumber}</span>
                  </div>
                  <div className="col-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleViewDetails(apt)}
                      title="View Details"
                    >
                      👁️
                    </button>
                    {apt.status === 'pending' && (
                      <button
                        className="btn-icon confirm"
                        onClick={() => handleStatusChange(apt.id, 'confirmed')}
                        title="Confirm"
                      >
                        ✓
                      </button>
                    )}
                    {apt.status === 'confirmed' && (
                      <button
                        className="btn-icon checkin"
                        onClick={() => handleStatusChange(apt.id, 'checked-in')}
                        title="Check In"
                      >
                        📝
                      </button>
                    )}
                    {apt.status === 'checked-in' && (
                      <button
                        className="btn-icon complete"
                        onClick={() => handleStatusChange(apt.id, 'completed')}
                        title="Complete"
                      >
                        ✅
                      </button>
                    )}
                    {(apt.status === 'pending' || apt.status === 'confirmed') && (
                      <button
                        className="btn-icon cancel"
                        onClick={() => handleCancelAppointment(apt.id)}
                        title="Cancel"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-appointments">
              <p>No appointments scheduled for this date</p>
            </div>
          )}
        </div>

        {/* Appointment Status Flow Info */}
        <div className="card info-card">
          <h3>Appointment Status Flow</h3>
          <div className="status-flow">
            <div className="flow-step">
              <span className="flow-badge pending">Pending</span>
              <span className="flow-arrow">→</span>
            </div>
            <div className="flow-step">
              <span className="flow-badge confirmed">Confirmed</span>
              <span className="flow-arrow">→</span>
            </div>
            <div className="flow-step">
              <span className="flow-badge checked-in">Checked In</span>
              <span className="flow-arrow">→</span>
            </div>
            <div className="flow-step">
              <span className="flow-badge completed">Completed</span>
            </div>
          </div>
          <ul className="status-descriptions">
            <li><strong>Pending:</strong> Appointment booked, awaiting confirmation</li>
            <li><strong>Confirmed:</strong> Appointment confirmed by staff</li>
            <li><strong>Checked In:</strong> Donor has arrived and checked in</li>
            <li><strong>Completed:</strong> Donation completed successfully</li>
            <li><strong>Cancelled:</strong> Appointment cancelled (by donor or staff)</li>
          </ul>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Appointment Details</h2>
              <button
                className="close-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="details-grid">
                <div className="detail-row">
                  <span className="detail-label">Confirmation Number:</span>
                  <span className="detail-value">{selectedAppointment.confirmationNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Donor Name:</span>
                  <span className="detail-value">{selectedAppointment.donorName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Donor ID:</span>
                  <span className="detail-value">{selectedAppointment.donorId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {new Date(selectedAppointment.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Time:</span>
                  <span className="detail-value">{selectedAppointment.time}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Blood Type:</span>
                  <span className="detail-value">
                    {selectedAppointment.bloodType || 'To be determined'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`detail-value status-badge ${getStatusBadgeClass(selectedAppointment.status)}`}>
                    {selectedAppointment.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Booked On:</span>
                  <span className="detail-value">
                    {new Date(selectedAppointment.createdDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAppointments;

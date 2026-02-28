import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointments, bloodInventory } from '../data/mockData';
import './StaffAppointments.css';

const StaffAppointments = () => {
  const { currentUser, resetSessionTimeout, updateUserBloodType } = useAuth();
  const [allAppointments, setAllAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(new Date('2026-02-26'));
  const [dateAppointments, setDateAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBloodTypeModal, setShowBloodTypeModal] = useState(false);
  const [selectedBloodType, setSelectedBloodType] = useState('');

  useEffect(() => {
    resetSessionTimeout();
    loadAppointments();
    // Default to today
    setSelectedDate('2026-02-28');
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

  const generateAvailableDates = () => {};

  // Calendar helpers
  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay(); // 0=Sun
    const days = [];

    // Padding for days before the 1st
    for (let i = 0; i < startPad; i++) {
      days.push(null);
    }

    // Actual days of month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const apptCount = allAppointments.filter(a => a.date === dateStr).length;
      days.push({ day: d, dateStr, apptCount });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const calendarMonthLabel = calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const calendarDays = getCalendarDays();

  const filterAppointmentsByDate = (date) => {
    const filtered = allAppointments.filter(apt => apt.date === date);
    setDateAppointments(filtered);
  };

  const handleStatusChange = (appointmentId, newStatus) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      // If completing a first-time donor appointment, prompt for blood type
      if (newStatus === 'completed' && !appointment.bloodType) {
        setSelectedAppointment(appointment);
        setShowBloodTypeModal(true);
        return;
      }
      
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

  const handleAssignBloodType = () => {
    if (!selectedBloodType) {
      alert('Please select a blood type');
      return;
    }
    
    if (!selectedAppointment) return;
    
    // Update the donor's blood type
    updateUserBloodType(selectedAppointment.donorId, selectedBloodType);
    
    // Update the appointment
    selectedAppointment.bloodType = selectedBloodType;
    selectedAppointment.status = 'completed';
    
    // Close modal and refresh
    setShowBloodTypeModal(false);
    setSelectedBloodType('');
    setSelectedAppointment(null);
    loadAppointments();
    
    alert(`Blood type ${selectedBloodType} assigned successfully!`);
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
        {/* Calendar */}
        <div className="card calendar-card">
          <div className="calendar-header">
            <button className="cal-nav-btn" onClick={handlePrevMonth}>&lt;</button>
            <h2 className="cal-month-label">{calendarMonthLabel}</h2>
            <button className="cal-nav-btn" onClick={handleNextMonth}>&gt;</button>
          </div>
          <div className="calendar-grid">
            <div className="cal-weekday">Sun</div>
            <div className="cal-weekday">Mon</div>
            <div className="cal-weekday">Tue</div>
            <div className="cal-weekday">Wed</div>
            <div className="cal-weekday">Thu</div>
            <div className="cal-weekday">Fri</div>
            <div className="cal-weekday">Sat</div>
            {calendarDays.map((cell, idx) => (
              cell ? (
                <button
                  key={cell.dateStr}
                  className={`cal-day ${selectedDate === cell.dateStr ? 'selected' : ''} ${cell.apptCount > 0 ? 'has-appts' : ''}`}
                  onClick={() => setSelectedDate(cell.dateStr)}
                >
                  <span className="cal-day-num">{cell.day}</span>
                  {cell.apptCount > 0 && (
                    <span className="cal-dot">{cell.apptCount}</span>
                  )}
                </button>
              ) : (
                <div key={`pad-${idx}`} className="cal-day empty" />
              )
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
                      <span className="unknown-type" title="First-time donor">TBD</span>
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
                      className="btn-action view"
                      onClick={() => handleViewDetails(apt)}
                    >
                      View
                    </button>
                    {apt.status === 'pending' && (
                      <button
                        className="btn-action confirm"
                        onClick={() => handleStatusChange(apt.id, 'confirmed')}
                      >
                        Confirm
                      </button>
                    )}
                    {apt.status === 'confirmed' && (
                      <button
                        className="btn-action checkin"
                        onClick={() => handleStatusChange(apt.id, 'checked-in')}
                      >
                        Check In
                      </button>
                    )}
                    {apt.status === 'checked-in' && (
                      <button
                        className="btn-action complete"
                        onClick={() => handleStatusChange(apt.id, 'completed')}
                      >
                        Complete
                      </button>
                    )}
                    {(apt.status === 'pending' || apt.status === 'confirmed') && (
                      <button
                        className="btn-action cancel"
                        onClick={() => handleCancelAppointment(apt.id)}
                      >
                        Cancel
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

      {/* Blood Type Assignment Modal */}
      {showBloodTypeModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Assign Blood Type</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowBloodTypeModal(false);
                  setSelectedBloodType('');
                  setSelectedAppointment(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="blood-type-assignment">
                <p className="assignment-info">
                  <strong>Donor:</strong> {selectedAppointment.donorName}
                </p>
                <p className="assignment-notice">
                  This is a first-time donor. Please assign their blood type after testing.
                </p>
                
                <div className="blood-type-selector">
                  <label>Select Blood Type:</label>
                  <div className="blood-type-options">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`blood-type-btn ${selectedBloodType === type ? 'selected' : ''}`}
                        onClick={() => setSelectedBloodType(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setShowBloodTypeModal(false);
                      setSelectedBloodType('');
                      setSelectedAppointment(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleAssignBloodType}
                    disabled={!selectedBloodType}
                  >
                    Assign & Complete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAppointments;

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BLOOD_TYPES } from '../data';
import { getAppointments, updateAppointment } from '../data/db';
import './StaffAppointments.css';

const StaffAppointments = () => {
  const { currentUser, resetSessionTimeout, updateUserBloodType } = useAuth();
  const [allAppointments, setAllAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState('2026-02-28');
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 1, 1));
  const [dateAppointments, setDateAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBloodTypeModal, setShowBloodTypeModal] = useState(false);
  const [selectedBloodType, setSelectedBloodType] = useState('');

  useEffect(() => {
    resetSessionTimeout();
    loadAppointments();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      filterAppointmentsByDate(selectedDate);
    }
  }, [selectedDate, allAppointments]);

  const loadAppointments = async () => {
    const appts = (await getAppointments()).sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
    setAllAppointments(appts);
  };

  // ── Calendar helpers ──────────────────────────

  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const days = [];

    const prevMonthLast = new Date(year, month, 0);
    for (let i = startPad - 1; i >= 0; i--) {
      days.push({ day: prevMonthLast.getDate() - i, dateStr: null, isOtherMonth: true });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayAppts = allAppointments.filter(a => a.date === dateStr);
      const isToday = dateStr === '2026-02-28';
      days.push({
        day: d,
        dateStr,
        isOtherMonth: false,
        isToday,
        total: dayAppts.length,
        pending: dayAppts.filter(a => a.status === 'pending').length,
        confirmed: dayAppts.filter(a => a.status === 'confirmed').length,
        completed: dayAppts.filter(a => a.status === 'completed').length,
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, dateStr: null, isOtherMonth: true });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCalendarMonth(new Date(2026, 1, 1));
    setSelectedDate('2026-02-28');
  };

  const calendarMonthLabel = calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const calendarDays = getCalendarDays();

  const handleDayClick = (cell) => {
    if (cell.isOtherMonth || !cell.dateStr) return;
    setSelectedDate(cell.dateStr);
  };

  const selectedDateLabel = selectedDate
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  // ── Filtering & status ────────────────────────

  const filterAppointmentsByDate = (date) => {
    const filtered = allAppointments.filter(apt => apt.date === date);
    setDateAppointments(filtered);
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    const appointment = allAppointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      if (newStatus === 'completed' && !appointment.bloodType) {
        setSelectedAppointment(appointment);
        setShowBloodTypeModal(true);
        return;
      }
      await updateAppointment(appointmentId, { status: newStatus });
      loadAppointments();
    }
  };

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      handleStatusChange(appointmentId, 'cancelled');
    }
  };

  const handleAssignBloodType = async () => {
    if (!selectedBloodType) {
      alert('Please select a blood type');
      return;
    }
    if (!selectedAppointment) return;

    await Promise.all([
      updateUserBloodType(selectedAppointment.donorId, selectedBloodType),
      updateAppointment(selectedAppointment.id, {
        bloodType: selectedBloodType,
        status: 'completed',
      }),
    ]);

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
      case 'pending': return 'sa-status-pending';
      case 'confirmed': return 'sa-status-confirmed';
      case 'checked-in': return 'sa-status-checkedin';
      case 'completed': return 'sa-status-completed';
      case 'cancelled': return 'sa-status-cancelled';
      default: return '';
    }
  };

  const stats = {
    total: dateAppointments.length,
    pending: dateAppointments.filter(a => a.status === 'pending').length,
    confirmed: dateAppointments.filter(a => a.status === 'confirmed').length,
    checkedIn: dateAppointments.filter(a => a.status === 'checked-in').length,
    completed: dateAppointments.filter(a => a.status === 'completed').length,
    cancelled: dateAppointments.filter(a => a.status === 'cancelled').length,
  };

  return (
    <div className="staff-appointments">
      {/* Header */}
      <div className="sa-header">
        <div>
          <h1>Appointment Management</h1>
          <p className="sa-subtitle">View and manage donor appointments</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="sa-stats-row">
        <div className="sa-stat">
          <span className="sa-stat-num">{stats.total}</span>
          <span className="sa-stat-lbl">Total</span>
        </div>
        <div className="sa-stat pending">
          <span className="sa-stat-num">{stats.pending}</span>
          <span className="sa-stat-lbl">Pending</span>
        </div>
        <div className="sa-stat confirmed">
          <span className="sa-stat-num">{stats.confirmed}</span>
          <span className="sa-stat-lbl">Confirmed</span>
        </div>
        <div className="sa-stat checkedin">
          <span className="sa-stat-num">{stats.checkedIn}</span>
          <span className="sa-stat-lbl">Checked In</span>
        </div>
        <div className="sa-stat completed">
          <span className="sa-stat-num">{stats.completed}</span>
          <span className="sa-stat-lbl">Completed</span>
        </div>
      </div>

      <div className="sa-layout">
        {/* Left: Calendar */}
        <div className="sa-calendar-panel">
          <div className="sa-cal-card">
            <div className="sa-cal-controls">
              <div className="sa-cal-nav">
                <button className="sa-nav-btn" onClick={handlePrevMonth}>&lt;</button>
                <h2 className="sa-month-label">{calendarMonthLabel}</h2>
                <button className="sa-nav-btn" onClick={handleNextMonth}>&gt;</button>
              </div>
              <button className="sa-btn sa-btn-ghost" onClick={handleToday}>Today</button>
            </div>

            <div className="sa-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="sa-weekday">{d}</div>
              ))}
              {calendarDays.map((cell, idx) => (
                <button
                  key={idx}
                  className={`sa-cell ${cell.isOtherMonth ? 'other' : ''} ${cell.dateStr === selectedDate ? 'selected' : ''} ${cell.isToday ? 'today' : ''}`}
                  onClick={() => handleDayClick(cell)}
                  disabled={cell.isOtherMonth}
                >
                  <span className="sa-cell-day">{cell.day}</span>
                  {!cell.isOtherMonth && cell.total > 0 && (
                    <div className="sa-cell-indicators">
                      {cell.pending > 0 && <span className="sa-dot pending" />}
                      {cell.confirmed > 0 && <span className="sa-dot confirmed" />}
                      {cell.completed > 0 && <span className="sa-dot completed" />}
                    </div>
                  )}
                  {!cell.isOtherMonth && cell.total > 0 && (
                    <span className="sa-cell-count">{cell.total}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="sa-legend">
              <span className="sa-legend-item"><span className="sa-dot pending" /> Pending</span>
              <span className="sa-legend-item"><span className="sa-dot confirmed" /> Confirmed</span>
              <span className="sa-legend-item"><span className="sa-dot completed" /> Completed</span>
            </div>
          </div>
        </div>

        {/* Right: Day detail */}
        <div className="sa-detail-panel">
          <div className="sa-detail-card">
            <div className="sa-detail-header">
              <h2 className="sa-detail-date">{selectedDateLabel}</h2>
              <p className="sa-detail-count">
                {dateAppointments.length} appointment{dateAppointments.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Appointments list */}
            <div className="sa-appt-list">
              {dateAppointments.length > 0 ? (
                dateAppointments.map(apt => (
                  <div key={apt.id} className={`sa-appt-item ${apt.status === 'cancelled' ? 'cancelled' : ''}`}>
                    <div className="sa-appt-time-col">
                      <span className="sa-appt-time">{apt.time}</span>
                      <span className={`sa-appt-status ${getStatusBadgeClass(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                    <div className="sa-appt-info">
                      <span className="sa-appt-name">{apt.donorName}</span>
                      <span className="sa-appt-meta">
                        {apt.bloodType ? (
                          <span className="sa-bt-badge">{apt.bloodType}</span>
                        ) : (
                          <span className="sa-tbd">TBD</span>
                        )}
                        <span className="sa-appt-conf">{apt.confirmationNumber}</span>
                      </span>
                    </div>
                    <div className="sa-appt-actions">
                      <button className="sa-action view" onClick={() => handleViewDetails(apt)}>View</button>
                      {apt.status === 'pending' && (
                        <button className="sa-action confirm" onClick={() => handleStatusChange(apt.id, 'confirmed')}>Confirm</button>
                      )}
                      {apt.status === 'confirmed' && (
                        <button className="sa-action checkin" onClick={() => handleStatusChange(apt.id, 'checked-in')}>Check In</button>
                      )}
                      {apt.status === 'checked-in' && (
                        <button className="sa-action complete" onClick={() => handleStatusChange(apt.id, 'completed')}>Complete</button>
                      )}
                      {(apt.status === 'pending' || apt.status === 'confirmed') && (
                        <button className="sa-action cancel" onClick={() => handleCancelAppointment(apt.id)}>Cancel</button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="sa-no-appts">
                  <p>No appointments for this date</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Flow Info */}
          <div className="sa-flow-card">
            <h3>Status Flow</h3>
            <div className="sa-flow">
              <span className="sa-flow-badge pending">Pending</span>
              <span className="sa-flow-arrow">&rarr;</span>
              <span className="sa-flow-badge confirmed">Confirmed</span>
              <span className="sa-flow-arrow">&rarr;</span>
              <span className="sa-flow-badge checkedin">Checked In</span>
              <span className="sa-flow-arrow">&rarr;</span>
              <span className="sa-flow-badge completed">Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Appointment Details</h2>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="sa-details-grid">
                <div className="sa-detail-row"><span className="sa-dlabel">Confirmation:</span><span className="sa-dvalue">{selectedAppointment.confirmationNumber}</span></div>
                <div className="sa-detail-row"><span className="sa-dlabel">Donor:</span><span className="sa-dvalue">{selectedAppointment.donorName}</span></div>
                <div className="sa-detail-row"><span className="sa-dlabel">Donor ID:</span><span className="sa-dvalue">{selectedAppointment.donorId}</span></div>
                <div className="sa-detail-row">
                  <span className="sa-dlabel">Date:</span>
                  <span className="sa-dvalue">
                    {new Date(selectedAppointment.date + 'T12:00:00').toLocaleDateString('en-US', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="sa-detail-row"><span className="sa-dlabel">Time:</span><span className="sa-dvalue">{selectedAppointment.time}</span></div>
                <div className="sa-detail-row"><span className="sa-dlabel">Blood Type:</span><span className="sa-dvalue">{selectedAppointment.bloodType || 'To be determined'}</span></div>
                <div className="sa-detail-row">
                  <span className="sa-dlabel">Status:</span>
                  <span className={`sa-dvalue sa-appt-status ${getStatusBadgeClass(selectedAppointment.status)}`}>{selectedAppointment.status}</span>
                </div>
                <div className="sa-detail-row"><span className="sa-dlabel">Booked On:</span><span className="sa-dvalue">{new Date(selectedAppointment.createdDate).toLocaleDateString()}</span></div>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
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
              <button className="close-btn" onClick={() => { setShowBloodTypeModal(false); setSelectedBloodType(''); setSelectedAppointment(null); }}>×</button>
            </div>
            <div className="modal-content">
              <div className="sa-bt-assignment">
                <p className="sa-bt-info"><strong>Donor:</strong> {selectedAppointment.donorName}</p>
                <p className="sa-bt-notice">This is a first-time donor. Please assign their blood type after testing.</p>
                <div className="sa-bt-selector">
                  <label>Select Blood Type:</label>
                  <div className="sa-bt-options">
                    {BLOOD_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`sa-bt-btn ${selectedBloodType === type ? 'selected' : ''}`}
                        onClick={() => setSelectedBloodType(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="btn-secondary" onClick={() => { setShowBloodTypeModal(false); setSelectedBloodType(''); setSelectedAppointment(null); }}>Cancel</button>
                  <button className="btn-primary" onClick={handleAssignBloodType} disabled={!selectedBloodType}>Assign & Complete</button>
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

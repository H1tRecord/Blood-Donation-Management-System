import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BLOOD_TYPES, APP_CONFIG } from '../data';
import {
  getAppointments,
  updateAppointment,
  createDonationRecord,
  addInventoryBatch,
  getUserById,
  updateUserInDB,
} from '../data/db';
import './StaffAppointments.css';

const StaffAppointments = () => {
  const { currentUser, resetSessionTimeout, updateUserBloodType } = useAuth();
  const todayStr = APP_CONFIG.TODAY;
  const todayDate = new Date(todayStr + 'T12:00:00');
  const [allAppointments, setAllAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [calendarMonth, setCalendarMonth] = useState(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
  const [dateAppointments, setDateAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  // Completion modal
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionBloodType, setCompletionBloodType] = useState('');
  const [completionUnits, setCompletionUnits] = useState(1);
  const [completionDate, setCompletionDate] = useState('');
  const [completionLoading, setCompletionLoading] = useState(false);
  const [completionError, setCompletionError] = useState('');

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
    const appts = (await getAppointments()).sort((a, b) => a.date.localeCompare(b.date));
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
      const isToday = dateStr === todayStr;
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
    setCalendarMonth(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
    setSelectedDate(todayStr);
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

  const openCompleteModal = (appointment) => {
    setSelectedAppointment(appointment);
    setCompletionBloodType(appointment.bloodType || '');
    setCompletionUnits(1);
    // Default collection date to the appointment date
    setCompletionDate(appointment.date);
    setCompletionError('');
    setShowCompleteModal(true);
  };

  const closeCompleteModal = () => {
    setShowCompleteModal(false);
    setSelectedAppointment(null);
    setCompletionBloodType('');
    setCompletionUnits(1);
    setCompletionDate('');
    setCompletionError('');
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    const appointment = allAppointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
    if (newStatus === 'completed') {
      openCompleteModal(appointment);
      return;
    }
    await updateAppointment(appointmentId, { status: newStatus });
    loadAppointments();
  };

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      handleStatusChange(appointmentId, 'cancelled');
    }
  };

  const handleCompleteAppointment = async () => {
    setCompletionError('');
    if (!completionBloodType) {
      setCompletionError('Please select a blood type.');
      return;
    }
    const units = parseInt(completionUnits, 10);
    if (!units || units < 1) {
      setCompletionError('Units collected must be at least 1.');
      return;
    }
    if (!completionDate) {
      setCompletionError('Please enter a collection date.');
      return;
    }

    setCompletionLoading(true);
    const apt = selectedAppointment;

    // Blood expires 42 days after collection
    const collDate = new Date(completionDate + 'T12:00:00');
    const expDate = new Date(collDate);
    expDate.setDate(expDate.getDate() + 42);
    const expirationDate = expDate.toISOString().split('T')[0];

    try {
      // 1. If first-time donor, update blood type on user profile
      if (!apt.bloodType) {
        await updateUserBloodType(apt.donorId, completionBloodType);
      }

      // 2. Increment donor's lastDonationDate and donationCount
      const donor = await getUserById(apt.donorId);
      await updateUserInDB(apt.donorId, {
        lastDonationDate: completionDate,
        donationCount: ((donor?.donationCount) || 0) + 1,
      });

      // 3. Create Donation History record
      const donationId = await createDonationRecord({
        donorId: apt.donorId,
        donorName: apt.donorName,
        bloodType: completionBloodType,
        appointmentId: apt.id,
        date: completionDate,
        units,
        staffId: currentUser.uid,
        staffName: currentUser.name,
        status: 'completed',
      });

      // 4. Add batch to Blood Inventory
      await addInventoryBatch(completionBloodType, units, expirationDate, donationId);

      // 5. Mark appointment completed, store linked donationHistoryId
      await updateAppointment(apt.id, {
        status: 'completed',
        bloodType: completionBloodType,
        donationHistoryId: donationId,
      });

      closeCompleteModal();
      loadAppointments();
    } catch (err) {
      setCompletionError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setCompletionLoading(false);
    }
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
                        <button className="sa-action complete" onClick={() => openCompleteModal(apt)}>Complete</button>
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

      {/* Complete Appointment Modal */}
      {showCompleteModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-card sa-complete-modal">
            <div className="modal-header">
              <h2>Complete Appointment</h2>
              <button className="close-btn" onClick={closeCompleteModal} disabled={completionLoading}>×</button>
            </div>
            <div className="modal-content">
              <div className="sa-complete-meta">
                <p><strong>Donor:</strong> {selectedAppointment.donorName}</p>
                <p><strong>Appointment:</strong> {new Date(selectedAppointment.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>

              {completionError && (
                <div className="sa-complete-error">{completionError}</div>
              )}

              {/* Blood Type */}
              <div className="form-group">
                {selectedAppointment.bloodType ? (
                  // Known blood type — display read-only, no selection needed
                  <>
                    <label>Blood Type</label>
                    <div className="sa-bt-readonly">
                      <span className="sa-bt-badge sa-bt-known">{selectedAppointment.bloodType}</span>
                      <span className="sa-bt-readonly-note">Registered blood type — no action needed</span>
                    </div>
                  </>
                ) : (
                  // First-time donor — staff must select blood type
                  <>
                    <label>Blood Type <span className="sa-first-time-tag">First-time donor</span></label>
                    <div className="sa-bt-options">
                      {BLOOD_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`sa-bt-btn ${completionBloodType === type ? 'selected' : ''}`}
                          onClick={() => setCompletionBloodType(type)}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Units Collected */}
              <div className="form-group">
                <label>Units Collected</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={completionUnits}
                  onChange={(e) => setCompletionUnits(e.target.value)}
                  className="sa-units-input"
                />
              </div>

              {/* Collection Date */}
              <div className="form-group">
                <label>Collection Date</label>
                <input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  max={APP_CONFIG.TODAY}
                />
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={closeCompleteModal} disabled={completionLoading}>Cancel</button>
                <button
                  className="btn-primary"
                  onClick={handleCompleteAppointment}
                  disabled={completionLoading || !completionBloodType || !completionDate}
                >
                  {completionLoading ? 'Saving…' : 'Record Donation & Complete'}
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

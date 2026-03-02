import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { timeSlots, APP_CONFIG } from '../data';
import { getAppointments, updateAppointment, deleteAppointment } from '../data/db';
import './AdminCalendar.css';

const DEFAULT_SLOT_CAP = APP_CONFIG.DEFAULT_SLOT_CAPACITY;

const AdminCalendar = () => {
  const { resetSessionTimeout } = useAuth();

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 1, 1)); // Feb 2026
  const [selectedDate, setSelectedDate] = useState('2026-02-28');
  const [viewMode, setViewMode] = useState('month'); // month | week

  // Appointments state
  const [allAppointments, setAllAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  // Edit form
  const [editForm, setEditForm] = useState({
    date: '',
    time: '',
    status: '',
  });

  // Blocked dates & slots
  // blockedDates: array of date strings (whole day blocked)
  const [blockedDates, setBlockedDates] = useState([]);
  // blockedSlots: { 'YYYY-MM-DD|HH:MM AM': true } — individual slot blocks
  const [blockedSlots, setBlockedSlots] = useState({});
  // slotCaps: { 'YYYY-MM-DD|HH:MM AM': number } — per-date-slot capacity overrides
  const [slotCaps, setSlotCaps] = useState({});

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    resetSessionTimeout();
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    const appts = await getAppointments();
    setAllAppointments(appts);
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // ── Calendar helpers ──────────────────────────

  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const days = [];

    // Previous month padding
    const prevMonthLast = new Date(year, month, 0);
    for (let i = startPad - 1; i >= 0; i--) {
      days.push({ day: prevMonthLast.getDate() - i, dateStr: null, isOtherMonth: true });
    }

    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayAppts = allAppointments.filter(a => a.date === dateStr);
      const isBlocked = blockedDates.includes(dateStr);
      const isToday = dateStr === '2026-02-28';
      days.push({
        day: d,
        dateStr,
        isOtherMonth: false,
        isBlocked,
        isToday,
        appointments: dayAppts,
        total: dayAppts.length,
        pending: dayAppts.filter(a => a.status === 'pending').length,
        confirmed: dayAppts.filter(a => a.status === 'confirmed').length,
        completed: dayAppts.filter(a => a.status === 'completed').length,
        cancelled: dayAppts.filter(a => a.status === 'cancelled').length,
      });
    }

    // Next month padding (fill to 42 cells = 6 rows)
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

  // ── Selected date info ────────────────────────

  const selectedDateAppts = useMemo(() => {
    let appts = allAppointments.filter(a => a.date === selectedDate);
    if (filterStatus !== 'all') {
      appts = appts.filter(a => a.status === filterStatus);
    }
    return appts.sort((a, b) => a.time.localeCompare(b.time));
  }, [allAppointments, selectedDate, filterStatus]);

  const selectedDateLabel = selectedDate
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const isSelectedDateBlocked = blockedDates.includes(selectedDate);

  // Time slot occupancy for selected date
  const slotOccupancy = useMemo(() => {
    return timeSlots.map(slot => {
      const key = `${selectedDate}|${slot}`;
      const cap = slotCaps[key] ?? DEFAULT_SLOT_CAP;
      const isBlocked = !!blockedSlots[key];
      const count = allAppointments.filter(
        a => a.date === selectedDate && a.time === slot && a.status !== 'cancelled'
      ).length;
      return { slot, count, cap, available: !isBlocked && count < cap, isBlocked };
    });
  }, [allAppointments, selectedDate, slotCaps, blockedSlots]);

  // ── Stats ─────────────────────────────────────

  const monthAppts = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    return allAppointments.filter(a => {
      const d = new Date(a.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [allAppointments, calendarMonth]);

  const stats = {
    total: monthAppts.length,
    pending: monthAppts.filter(a => a.status === 'pending').length,
    confirmed: monthAppts.filter(a => a.status === 'confirmed').length,
    completed: monthAppts.filter(a => a.status === 'completed').length,
    cancelled: monthAppts.filter(a => a.status === 'cancelled').length,
  };

  // ── Actions ───────────────────────────────────

  const handleDayClick = (cell) => {
    if (cell.isOtherMonth || !cell.dateStr) return;
    setSelectedDate(cell.dateStr);
  };

  const handleToggleBlock = async () => {
    if (isSelectedDateBlocked) {
      setBlockedDates(prev => prev.filter(d => d !== selectedDate));
      showToast(`${selectedDateLabel} unblocked`);
    } else {
      const toCancel = allAppointments.filter(
        a => a.date === selectedDate && (a.status === 'pending' || a.status === 'confirmed')
      );
      if (toCancel.length > 0) {
        if (!window.confirm(`Blocking this date will cancel ${toCancel.length} active appointment(s). Continue?`)) {
          return;
        }
        await Promise.all(toCancel.map(a => updateAppointment(a.id, { status: 'cancelled' })));
        loadAppointments();
      }
      setBlockedDates(prev => [...prev, selectedDate]);
      showToast(`${selectedDateLabel} blocked — no new appointments allowed`);
    }
  };

  // ── Slot management ──────────────────────────

  const getSlotKey = (date, slot) => `${date}|${slot}`;

  const handleToggleSlotBlock = (slot) => {
    const key = getSlotKey(selectedDate, slot);
    setBlockedSlots(prev => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
        showToast(`${slot} unblocked`);
      } else {
        next[key] = true;
        showToast(`${slot} blocked on ${selectedDateLabel}`);
      }
      return next;
    });
  };

  const handleChangeSlotCap = (slot, delta) => {
    const key = getSlotKey(selectedDate, slot);
    setSlotCaps(prev => {
      const current = prev[key] ?? DEFAULT_SLOT_CAP;
      const newCap = Math.max(0, current + delta);
      return { ...prev, [key]: newCap };
    });
  };

  // ── Edit appointment ──────────────────────────

  const handleOpenEdit = (appt) => {
    setEditingAppointment(appt);
    setEditForm({ date: appt.date, time: appt.time, status: appt.status });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.date || !editForm.time || !editForm.status) {
      showToast('All fields are required', 'error');
      return;
    }
    await updateAppointment(editingAppointment.id, {
      date: editForm.date,
      time: editForm.time,
      status: editForm.status,
    });
    await loadAppointments();
    setShowEditModal(false);
    showToast('Appointment updated');
  };

  // ── Delete appointment ────────────────────────

  const handleDeleteAppointment = async (apptId) => {
    if (!window.confirm('Permanently delete this appointment?')) return;
    await deleteAppointment(apptId);
    await loadAppointments();
    showToast('Appointment deleted');
  };

  // ── Cancel appointment ────────────────────────

  const handleCancelAppointment = async (apptId) => {
    await updateAppointment(apptId, { status: 'cancelled' });
    await loadAppointments();
    showToast('Appointment cancelled');
  };

  // ── Week view helpers ─────────────────────────

  const getWeekDays = () => {
    const sel = new Date(selectedDate + 'T12:00:00');
    const dayOfWeek = sel.getDay();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sel);
      d.setDate(d.getDate() - dayOfWeek + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayAppts = allAppointments.filter(a => a.date === dateStr);
      days.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        dateStr,
        isToday: dateStr === '2026-02-28',
        isSelected: dateStr === selectedDate,
        total: dayAppts.length,
      });
    }
    return days;
  };

  const weekDays = viewMode === 'week' ? getWeekDays() : [];

  // status helper
  const statusClass = (status) => {
    switch (status) {
      case 'pending': return 'mc-status-pending';
      case 'confirmed': return 'mc-status-confirmed';
      case 'checked-in': return 'mc-status-checkedin';
      case 'completed': return 'mc-status-completed';
      case 'cancelled': return 'mc-status-cancelled';
      default: return '';
    }
  };

  return (
    <div className="admin-calendar">
      {/* Header */}
      <div className="mc-header">
        <div>
          <h1>Master Calendar</h1>
          <p className="mc-subtitle">Appointment management, slot blocking, and capacity control</p>
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div className={`mc-toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Month Stats */}
      <div className="mc-stats-row">
        <div className="mc-stat">
          <span className="mc-stat-num">{stats.total}</span>
          <span className="mc-stat-lbl">Total</span>
        </div>
        <div className="mc-stat pending">
          <span className="mc-stat-num">{stats.pending}</span>
          <span className="mc-stat-lbl">Pending</span>
        </div>
        <div className="mc-stat confirmed">
          <span className="mc-stat-num">{stats.confirmed}</span>
          <span className="mc-stat-lbl">Confirmed</span>
        </div>
        <div className="mc-stat completed">
          <span className="mc-stat-num">{stats.completed}</span>
          <span className="mc-stat-lbl">Completed</span>
        </div>
        <div className="mc-stat cancelled">
          <span className="mc-stat-num">{stats.cancelled}</span>
          <span className="mc-stat-lbl">Cancelled</span>
        </div>
      </div>

      <div className="mc-layout">
        {/* Left: Calendar */}
        <div className="mc-calendar-panel">
          {/* Calendar controls */}
          <div className="card mc-cal-card">
            <div className="mc-cal-controls">
              <div className="mc-cal-nav">
                <button className="mc-nav-btn" onClick={handlePrevMonth}>&lt;</button>
                <h2 className="mc-month-label">{calendarMonthLabel}</h2>
                <button className="mc-nav-btn" onClick={handleNextMonth}>&gt;</button>
              </div>
              <div className="mc-cal-actions">
                <button className="mc-btn mc-btn-ghost" onClick={handleToday}>Today</button>
                <div className="mc-view-toggle">
                  <button
                    className={`mc-view-btn ${viewMode === 'month' ? 'active' : ''}`}
                    onClick={() => setViewMode('month')}
                  >
                    Month
                  </button>
                  <button
                    className={`mc-view-btn ${viewMode === 'week' ? 'active' : ''}`}
                    onClick={() => setViewMode('week')}
                  >
                    Week
                  </button>
                </div>
              </div>
            </div>

            {/* Month grid */}
            {viewMode === 'month' && (
              <div className="mc-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="mc-weekday">{d}</div>
                ))}
                {calendarDays.map((cell, idx) => (
                  <button
                    key={idx}
                    className={`mc-cell ${cell.isOtherMonth ? 'other' : ''} ${cell.dateStr === selectedDate ? 'selected' : ''} ${cell.isToday ? 'today' : ''} ${cell.isBlocked ? 'blocked' : ''}`}
                    onClick={() => handleDayClick(cell)}
                    disabled={cell.isOtherMonth}
                  >
                    <span className="mc-cell-day">{cell.day}</span>
                    {!cell.isOtherMonth && cell.total > 0 && (
                      <div className="mc-cell-indicators">
                        {cell.pending > 0 && <span className="mc-dot pending" title={`${cell.pending} pending`} />}
                        {cell.confirmed > 0 && <span className="mc-dot confirmed" title={`${cell.confirmed} confirmed`} />}
                        {cell.completed > 0 && <span className="mc-dot completed" title={`${cell.completed} completed`} />}
                      </div>
                    )}
                    {!cell.isOtherMonth && cell.total > 0 && (
                      <span className="mc-cell-count">{cell.total}</span>
                    )}
                    {cell.isBlocked && <span className="mc-blocked-mark">Blocked</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Week view */}
            {viewMode === 'week' && (
              <div className="mc-week-strip">
                {weekDays.map(wd => (
                  <button
                    key={wd.dateStr}
                    className={`mc-week-day ${wd.isSelected ? 'selected' : ''} ${wd.isToday ? 'today' : ''}`}
                    onClick={() => setSelectedDate(wd.dateStr)}
                  >
                    <span className="mc-wd-label">{wd.label}</span>
                    {wd.total > 0 && <span className="mc-wd-count">{wd.total} appt{wd.total !== 1 ? 's' : ''}</span>}
                  </button>
                ))}
              </div>
            )}

          {/* Legend */}
          <div className="mc-legend">
            <span className="mc-legend-item"><span className="mc-dot pending" /> Pending</span>
            <span className="mc-legend-item"><span className="mc-dot confirmed" /> Confirmed</span>
            <span className="mc-legend-item"><span className="mc-dot completed" /> Completed</span>
            <span className="mc-legend-item"><span className="mc-blocked-indicator" /> Blocked</span>
          </div>
          </div>
        </div>

        {/* Right: Day detail */}
        <div className="mc-detail-panel">
          <div className="card mc-detail-card">
            {/* Day header */}
            <div className="mc-detail-header">
              <div>
                <h2 className="mc-detail-date">{selectedDateLabel}</h2>
                <p className="mc-detail-count">
                  {selectedDateAppts.length} appointment{selectedDateAppts.length !== 1 ? 's' : ''}
                  {isSelectedDateBlocked && <span className="mc-blocked-badge">Blocked</span>}
                </p>
              </div>
              <div className="mc-detail-actions">
                <button
                  className={`mc-btn ${isSelectedDateBlocked ? 'mc-btn-success' : 'mc-btn-danger'}`}
                  onClick={handleToggleBlock}
                >
                  {isSelectedDateBlocked ? 'Unblock Date' : 'Block Date'}
                </button>
              </div>
            </div>

            {/* Filter */}
            <div className="mc-detail-filter">
              <label>Filter:</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked-in">Checked In</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Time slots capacity */}
            <div className="mc-slots">
              <h3>Time Slot Management</h3>
              <div className="mc-slots-list">
                {slotOccupancy.map(s => (
                  <div key={s.slot} className={`mc-slot-row ${s.isBlocked ? 'blocked' : ''} ${!s.available && !s.isBlocked ? 'full' : ''}`}>
                    <span className="mc-slot-time">{s.slot}</span>
                    {s.isBlocked ? (
                      <span className="mc-slot-blocked-label">Blocked</span>
                    ) : (
                      <>
                        <span className="mc-slot-fill">
                          <span className="mc-slot-bar" style={{ width: `${s.cap > 0 ? Math.min((s.count / s.cap) * 100, 100) : 100}%` }} />
                        </span>
                        <span className="mc-slot-count">{s.count}/{s.cap}</span>
                        <div className="mc-cap-controls">
                          <button className="mc-cap-btn" onClick={() => handleChangeSlotCap(s.slot, -1)} title="Decrease cap">-</button>
                          <button className="mc-cap-btn" onClick={() => handleChangeSlotCap(s.slot, 1)} title="Increase cap">+</button>
                        </div>
                      </>
                    )}
                    <button
                      className={`mc-slot-block-btn ${s.isBlocked ? 'unblock' : 'block'}`}
                      onClick={() => handleToggleSlotBlock(s.slot)}
                    >
                      {s.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Appointments list */}
            <div className="mc-appt-list">
              <h3>Appointments</h3>
              {selectedDateAppts.length > 0 ? (
                selectedDateAppts.map(appt => (
                  <div key={appt.id} className={`mc-appt-item ${appt.status === 'cancelled' ? 'cancelled' : ''}`}>
                    <div className="mc-appt-time-col">
                      <span className="mc-appt-time">{appt.time}</span>
                      <span className={`mc-appt-status ${statusClass(appt.status)}`}>
                        {appt.status}
                      </span>
                    </div>
                    <div className="mc-appt-info">
                      <span className="mc-appt-name">{appt.donorName}</span>
                      <span className="mc-appt-meta">
                        {appt.bloodType ? <span className="blood-type-badge mc-bt">{appt.bloodType}</span> : 'TBD'}
                        <span className="mc-appt-conf">{appt.confirmationNumber}</span>
                      </span>
                    </div>
                    <div className="mc-appt-actions">
                      <button className="mc-action edit" onClick={() => handleOpenEdit(appt)}>Edit</button>
                      {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                        <button className="mc-action cancel" onClick={() => handleCancelAppointment(appt.id)}>Cancel</button>
                      )}
                      <button className="mc-action delete" onClick={() => handleDeleteAppointment(appt.id)}>Delete</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="mc-no-appts">
                  <p>No appointments for this date</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ───────────────────────── */}
      {showEditModal && editingAppointment && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Edit Appointment</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="mc-edit-info">
                <span className="mc-edit-label">Donor:</span>
                <span className="mc-edit-value">{editingAppointment.donorName}</span>
              </div>
              <div className="mc-edit-info">
                <span className="mc-edit-label">Confirmation:</span>
                <span className="mc-edit-value">{editingAppointment.confirmationNumber}</span>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Time Slot</label>
                <select
                  value={editForm.time}
                  onChange={e => setEditForm({ ...editForm, time: e.target.value })}
                >
                  {timeSlots.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="checked-in">Checked In</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSaveEdit}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCalendar;

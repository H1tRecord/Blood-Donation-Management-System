import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  timeSlots,
  APP_CONFIG,
  isEligibleToDonate,
  getDaysUntilEligible
} from '../data';
import { getAppointments, createAppointment, updateDonationRequest } from '../data/db';
import './AppointmentBooking.css';

const AppointmentBooking = () => {
  const { currentUser, resetSessionTimeout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isEligible, setIsEligible] = useState(false);
  const [daysUntilEligible, setDaysUntilEligible] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [allAppointments, setAllAppointments] = useState([]);

  // Calendar state — initialised to today
  const todayStr = APP_CONFIG.TODAY;
  const todayDate = new Date(todayStr + 'T12:00:00');
  const [calendarMonth, setCalendarMonth] = useState(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));

  useEffect(() => {
    resetSessionTimeout();
    if (location.state?.isFirstTime) {
      setIsFirstTime(true);
    }
    checkEligibility();
    getAppointments().then(setAllAppointments);
  }, [currentUser]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const checkEligibility = () => {
    if (!currentUser) return;
    
    if (currentUser.bloodType === null || currentUser.bloodType === undefined) {
      setIsEligible(true);
      setIsFirstTime(true);
      return;
    }
    
    const eligible = isEligibleToDonate(currentUser.lastDonationDate);
    setIsEligible(eligible);
    
    if (!eligible) {
      const days = getDaysUntilEligible(currentUser.lastDonationDate);
      setDaysUntilEligible(days);
    }
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

    const today = new Date(todayStr + 'T12:00:00');
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const cellDate = new Date(dateStr + 'T12:00:00');
      const isPast = cellDate <= today;
      const isToday = dateStr === todayStr;
      const dayAppts = allAppointments.filter(a => a.date === dateStr && a.status !== 'cancelled');
      const totalCapacity = timeSlots.length * APP_CONFIG.DEFAULT_SLOT_CAPACITY;
      const hasAvailability = dayAppts.length < totalCapacity;

      const availableCount = totalCapacity - dayAppts.length;
      days.push({
        day: d,
        dateStr,
        isOtherMonth: false,
        isPast,
        isToday,
        isDisabled: isPast,
        hasAvailability,
        availableCount,
        apptCount: dayAppts.length,
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
    setSelectedTime('');
  };

  const calendarMonthLabel = calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const calendarDays = getCalendarDays();

  const handleDayClick = (cell) => {
    if (cell.isOtherMonth || cell.isDisabled) return;
    setSelectedDate(cell.dateStr);
    setSelectedTime('');
  };

  const selectedDateLabel = selectedDate
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  // ── Slot & booking logic ──────────────────────

  const loadAvailableSlots = (date) => {
    const dateAppointments = allAppointments.filter(apt => apt.date === date && apt.status !== 'cancelled');
    const cap = APP_CONFIG.DEFAULT_SLOT_CAPACITY;
    const available = timeSlots
      .map(slot => {
        const booked = dateAppointments.filter(apt => apt.time === slot).length;
        return { time: slot, booked, available: cap - booked };
      })
      .filter(s => s.available > 0);
    setAvailableSlots(available);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }

    const cap = APP_CONFIG.DEFAULT_SLOT_CAPACITY;
    const bookedCount = allAppointments.filter(
      apt => apt.date === selectedDate && apt.time === selectedTime && apt.status !== 'cancelled'
    ).length;

    if (bookedCount >= cap) {
      alert('This slot has just been filled. Please select another time.');
      const freshAppts = await getAppointments();
      setAllAppointments(freshAppts);
      loadAvailableSlots(selectedDate);
      return;
    }

    const confNum = `CONF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const newAppointment = {
      donorId: currentUser.uid,
      donorName: currentUser.name,
      bloodType: currentUser.bloodType || null,
      date: selectedDate,
      time: selectedTime,
      status: 'pending',
      confirmationNumber: confNum,
      createdDate: new Date().toISOString().split('T')[0],
    };

    await createAppointment(newAppointment);

    // If donor came here via a donation request, mark it accepted now
    const pendingRequestId = location.state?.requestId;
    if (pendingRequestId) {
      await updateDonationRequest(pendingRequestId, {
        status: 'accepted',
        responseDate: new Date().toISOString().split('T')[0],
      });
    }

    setConfirmationNumber(confNum);
    setShowConfirmation(true);
  };

  const handleBackToDashboard = () => {
    if (isFirstTime) {
      navigate('/login');
    } else {
      navigate('/donor-dashboard');
    }
  };

  // ── Ineligible view ───────────────────────────

  if (!isEligible) {
    return (
      <div className="appointment-booking">
        <div className="ineligible-notice">
          <div className="notice-icon">Ineligible</div>
          <h2>Unable to Book Appointment</h2>
          <p>
            You are currently ineligible to donate blood. You must wait 56 days between donations.
          </p>
          <p className="days-remaining">
            You can donate again in <strong>{daysUntilEligible} days</strong>
          </p>
          {currentUser?.lastDonationDate && (
            <p className="last-donation">
              Last donation: {new Date(currentUser.lastDonationDate).toLocaleDateString()}
            </p>
          )}
          <button className="ab-btn ab-btn-primary" onClick={handleBackToDashboard}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Confirmation view ─────────────────────────

  if (showConfirmation) {
    return (
      <div className="appointment-booking">
        <div className="confirmation-card">
          <div className="confirmation-icon">Done</div>
          <h2>Appointment Confirmed!</h2>
          {isFirstTime && (
            <div className="first-time-notice">
              <p className="notice-text">
                <strong>Welcome!</strong> Your blood type will be determined during your first visit.
              </p>
            </div>
          )}
          <div className="confirmation-details">
            <p className="confirmation-number">
              Confirmation Number: <strong>{confirmationNumber}</strong>
            </p>
            <div className="appointment-summary">
              <p className="summary-item">
                <span className="summary-label">Date:</span>
                <span className="summary-value">{selectedDateLabel}</span>
              </p>
              <p className="summary-item">
                <span className="summary-label">Time:</span>
                <span className="summary-value">{selectedTime}</span>
              </p>
              <p className="summary-item">
                <span className="summary-label">Donor:</span>
                <span className="summary-value">{currentUser.name}</span>
              </p>
              {currentUser.bloodType && (
                <p className="summary-item">
                  <span className="summary-label">Blood Type:</span>
                  <span className="summary-value blood-type">{currentUser.bloodType}</span>
                </p>
              )}
            </div>
          </div>
          <div className="confirmation-info">
            <h3>What to expect:</h3>
            <ul>
              <li>Please arrive 10 minutes early</li>
              <li>Bring a valid photo ID</li>
              <li>Eat a healthy meal before donating</li>
              <li>Stay hydrated - drink plenty of water</li>
              <li>The donation process takes about 45-60 minutes</li>
            </ul>
          </div>
          <div className="confirmation-actions">
            <button className="ab-btn ab-btn-primary" onClick={handleBackToDashboard}>
              {isFirstTime ? 'Continue to Login' : 'Back to Dashboard'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main booking view ─────────────────────────

  return (
    <div className="appointment-booking">
      {/* Header */}
      <div className="ab-header">
        <div>
          <h1>Book Donation Appointment</h1>
          {isFirstTime ? (
            <p className="ab-subtitle">Welcome! Book your first appointment. Staff will determine your blood type during your visit.</p>
          ) : (
            <p className="ab-subtitle">Select a date and time for your blood donation</p>
          )}
        </div>
      </div>

      <div className="ab-layout">
        {/* Left: Calendar */}
        <div className="ab-calendar-panel">
          <div className="ab-cal-card">
            <div className="ab-cal-controls">
              <div className="ab-cal-nav">
                <button className="ab-nav-btn" onClick={handlePrevMonth}>&lt;</button>
                <h2 className="ab-month-label">{calendarMonthLabel}</h2>
                <button className="ab-nav-btn" onClick={handleNextMonth}>&gt;</button>
              </div>
              <div className="ab-cal-actions">
                <button className="ab-btn ab-btn-ghost" onClick={handleToday}>Today</button>
              </div>
            </div>

            <div className="ab-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="ab-weekday">{d}</div>
              ))}
              {calendarDays.map((cell, idx) => (
                <button
                  key={idx}
                  className={`ab-cell ${cell.isOtherMonth ? 'other' : ''} ${cell.dateStr === selectedDate ? 'selected' : ''} ${cell.isToday ? 'today' : ''} ${cell.isDisabled ? 'disabled' : ''}`}
                  onClick={() => handleDayClick(cell)}
                  disabled={cell.isOtherMonth || cell.isDisabled}
                >
                  <span className="ab-cell-day">{cell.day}</span>
                  {!cell.isOtherMonth && !cell.isDisabled && cell.hasAvailability && (
                    <span className="ab-avail-dot" title={`${cell.availableCount} slots open`} />
                  )}
                  {!cell.isOtherMonth && !cell.isDisabled && !cell.hasAvailability && (
                    <span className="ab-full-dot" title="Full" />
                  )}
                </button>
              ))}
            </div>

            <div className="ab-legend">
              <span className="ab-legend-item"><span className="ab-avail-dot legend" /> Slots open</span>
              <span className="ab-legend-item"><span className="ab-full-dot legend" /> Full</span>
            </div>
          </div>
        </div>

        {/* Right: Time selection + summary */}
        <div className="ab-detail-panel">
          <div className="ab-detail-card">
            {selectedDate ? (
              <form onSubmit={handleBookAppointment}>
                <div className="ab-detail-header">
                  <div>
                    <h2 className="ab-detail-date">{selectedDateLabel}</h2>
                    <p className="ab-detail-count">
                      {availableSlots.length} slot{availableSlots.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>

                {availableSlots.length > 0 ? (
                  <div className="ab-slots">
                    <h3>Select Time</h3>
                    <div className="ab-slots-list">
                      {timeSlots.map((slot) => {
                        const s = availableSlots.find(a => a.time === slot);
                        const isUnavailable = !s;
                        const count = s ? s.booked : APP_CONFIG.DEFAULT_SLOT_CAPACITY;
                        const cap = APP_CONFIG.DEFAULT_SLOT_CAPACITY;
                        return (
                          <button
                            key={slot}
                            type="button"
                            className={`ab-slot-row ${isUnavailable ? 'full' : ''} ${selectedTime === slot ? 'selected' : ''}`}
                            onClick={() => !isUnavailable && setSelectedTime(slot)}
                            disabled={isUnavailable}
                          >
                            <span className="ab-slot-time">{slot}</span>
                            <span className="ab-slot-fill">
                              <span className="ab-slot-bar" style={{ width: `${Math.min((count / cap) * 100, 100)}%` }} />
                            </span>
                            <span className="ab-slot-count">{cap - count}/{cap}</span>
                            <span className="ab-slot-label">{isUnavailable ? 'Full' : 'open'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="ab-no-slots">
                    <p>No slots available for this date</p>
                    <p className="ab-no-slots-hint">Select another date on the calendar</p>
                  </div>
                )}

                {selectedTime && (
                  <div className="ab-booking-summary">
                    <h3>Appointment Summary</h3>
                    <div className="ab-summary-row">
                      <span>Date</span>
                      <strong>{selectedDateLabel}</strong>
                    </div>
                    <div className="ab-summary-row">
                      <span>Time</span>
                      <strong>{selectedTime}</strong>
                    </div>
                    <div className="ab-summary-row">
                      <span>Donor</span>
                      <strong>{currentUser.name}</strong>
                    </div>
                  </div>
                )}

                <div className="ab-form-actions">
                  <button type="button" className="ab-btn ab-btn-ghost" onClick={handleBackToDashboard}>
                    Cancel
                  </button>
                  <button type="submit" className="ab-btn ab-btn-primary" disabled={!selectedTime}>
                    Confirm Appointment
                  </button>
                </div>
              </form>
            ) : (
              <div className="ab-empty-state">
                <h2>Select a Date</h2>
                <p>Choose a date from the calendar to see available time slots</p>
              </div>
            )}
          </div>

          {/* Info card */}
          <div className="ab-info-card">
            <h3>Before You Donate</h3>
            <div className="ab-info-list">
              <div className="ab-info-item"><span className="ab-check">✓</span><p>Be at least 18 years old and weigh at least 110 lbs</p></div>
              <div className="ab-info-item"><span className="ab-check">✓</span><p>Be in good general health</p></div>
              <div className="ab-info-item"><span className="ab-check">✓</span><p>Bring a valid photo ID</p></div>
              <div className="ab-info-item"><span className="ab-check">✓</span><p>Eat a healthy meal and drink plenty of water beforehand</p></div>
              <div className="ab-info-item"><span className="ab-check">✓</span><p>Arrive 10 minutes early — process takes ~45–60 minutes</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;

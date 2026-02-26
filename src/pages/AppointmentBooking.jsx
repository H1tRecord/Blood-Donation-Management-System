import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  appointments,
  timeSlots,
  isEligibleToDonate,
  getDaysUntilEligible
} from '../data/mockData';
import './AppointmentBooking.css';

const AppointmentBooking = () => {
  const { currentUser, resetSessionTimeout } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isEligible, setIsEligible] = useState(false);
  const [daysUntilEligible, setDaysUntilEligible] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');

  useEffect(() => {
    resetSessionTimeout();
    checkEligibility();
    generateAvailableDates();
  }, [currentUser]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const checkEligibility = () => {
    if (!currentUser) return;
    
    const eligible = isEligibleToDonate(currentUser.lastDonationDate);
    setIsEligible(eligible);
    
    if (!eligible) {
      const days = getDaysUntilEligible(currentUser.lastDonationDate);
      setDaysUntilEligible(days);
    }
  };

  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date('2026-02-26');
    
    // Generate next 7 days
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // Skip Sundays
      if (date.getDay() !== 0) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })
        });
      }
    }
    
    setAvailableDates(dates);
  };

  const loadAvailableSlots = (date) => {
    // Get appointments for selected date
    const dateAppointments = appointments.filter(apt => apt.date === date);
    
    // Find available time slots (not booked)
    const available = timeSlots.filter(slot => {
      return !dateAppointments.some(apt => apt.time === slot);
    });
    
    setAvailableSlots(available);
  };

  const handleBookAppointment = (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }

    // Check if slot is still available
    const isSlotTaken = appointments.some(
      apt => apt.date === selectedDate && apt.time === selectedTime
    );
    
    if (isSlotTaken) {
      alert('This slot has just been booked. Please select another time.');
      loadAvailableSlots(selectedDate);
      return;
    }

    // Generate confirmation number
    const confNum = `CONF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Create new appointment
    const newAppointment = {
      id: `APT${(appointments.length + 1).toString().padStart(3, '0')}`,
      donorId: currentUser.id,
      donorName: currentUser.name,
      bloodType: currentUser.bloodType,
      date: selectedDate,
      time: selectedTime,
      status: 'pending',
      confirmationNumber: confNum,
      createdDate: new Date().toISOString().split('T')[0]
    };
    
    // Add to appointments array
    appointments.push(newAppointment);
    
    setConfirmationNumber(confNum);
    setShowConfirmation(true);
  };

  const handleBackToDashboard = () => {
    navigate('/donor-dashboard');
  };

  if (!isEligible) {
    return (
      <div className="appointment-booking">
        <div className="ineligible-notice">
          <div className="notice-icon">⏳</div>
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
          <button
            className="btn-primary"
            onClick={handleBackToDashboard}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="appointment-booking">
        <div className="confirmation-card">
          <div className="confirmation-icon">✓</div>
          <h2>Appointment Confirmed!</h2>
          <div className="confirmation-details">
            <p className="confirmation-number">
              Confirmation Number: <strong>{confirmationNumber}</strong>
            </p>
            <div className="appointment-summary">
              <p className="summary-item">
                <span className="summary-label">Date:</span>
                <span className="summary-value">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
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
            <button
              className="btn-primary"
              onClick={handleBackToDashboard}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-booking">
      <div className="booking-header">
        <h1>Book Donation Appointment</h1>
        <p className="subtitle">Select a date and time for your blood donation</p>
      </div>

      <div className="booking-container">
        <div className="booking-form-card">
          <form onSubmit={handleBookAppointment}>
            <div className="form-section">
              <h3>Select Date</h3>
              <div className="date-selector">
                {availableDates.map((date) => (
                  <button
                    key={date.value}
                    type="button"
                    className={`date-option ${selectedDate === date.value ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedDate(date.value);
                      setSelectedTime(''); // Reset time when date changes
                    }}
                  >
                    {date.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div className="form-section">
                <h3>Select Time</h3>
                {availableSlots.length > 0 ? (
                  <div className="time-selector">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`time-option ${selectedTime === slot ? 'selected' : ''}`}
                        onClick={() => setSelectedTime(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="no-slots">No time slots available for this date. Please select another date.</p>
                )}
              </div>
            )}

            {selectedDate && selectedTime && (
              <div className="booking-summary">
                <h3>Appointment Summary</h3>
                <div className="summary-content">
                  <p>
                    <strong>Date:</strong>{' '}
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p>
                    <strong>Time:</strong> {selectedTime}
                  </p>
                  <p>
                    <strong>Donor:</strong> {currentUser.name}
                  </p>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleBackToDashboard}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={!selectedDate || !selectedTime}
              >
                Confirm Appointment
              </button>
            </div>
          </form>
        </div>

        <div className="booking-info-card">
          <h3>Before You Donate</h3>
          <div className="info-list">
            <div className="info-item">
              <span className="info-icon">✓</span>
              <p>Be at least 18 years old</p>
            </div>
            <div className="info-item">
              <span className="info-icon">✓</span>
              <p>Weigh at least 110 pounds</p>
            </div>
            <div className="info-item">
              <span className="info-icon">✓</span>
              <p>Be in good general health</p>
            </div>
            <div className="info-item">
              <span className="info-icon">✓</span>
              <p>Bring a valid photo ID</p>
            </div>
            <div className="info-item">
              <span className="info-icon">✓</span>
              <p>Eat a healthy meal beforehand</p>
            </div>
            <div className="info-item">
              <span className="info-icon">✓</span>
              <p>Drink plenty of water</p>
            </div>
          </div>

          <div className="donation-facts">
            <h4>Did You Know?</h4>
            <ul>
              <li>One donation can save up to 3 lives</li>
              <li>The donation process takes 45-60 minutes</li>
              <li>You can donate every 56 days</li>
              <li>Your body replaces the donated blood within 24-48 hours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;

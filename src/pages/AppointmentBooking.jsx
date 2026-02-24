import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDonationCenters, mockAvailableSlots, mockDonorProfile } from '../data/mockData';

function AppointmentBooking({ user }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [isEligible, setIsEligible] = useState(false);

  // Check eligibility
  useEffect(() => {
    const nextEligible = new Date(mockDonorProfile.nextEligibleDate);
    const today = new Date();
    setIsEligible(nextEligible <= today);
  }, []);

  // Get available dates for the next 7 days
  const getAvailableDates = () => {
    const dates = [];
    const startDate = new Date('2026-02-25'); // Start from a date that has mock data
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  // Update available slots when center and date change
  useEffect(() => {
    if (selectedCenter && selectedDate) {
      const slots = mockAvailableSlots[selectedCenter.id]?.[selectedDate] || [];
      setAvailableSlots(slots);
      setSelectedSlot(null);
    }
  }, [selectedCenter, selectedDate]);

  const handleCenterSelect = (center) => {
    setSelectedCenter(center);
    setSelectedDate(null);
    setSelectedSlot(null);
    setStep(2);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const handleConfirmBooking = () => {
    // In a real app, this would call an API
    setBookingConfirmed(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatShortDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (bookingConfirmed) {
    return (
      <div className="booking-page">
        <div className="booking-confirmed">
          <div className="confirmation-icon">✅</div>
          <h1>Appointment Confirmed!</h1>
          <div className="confirmation-details">
            <div className="detail-item">
              <span className="label">Location:</span>
              <span className="value">{selectedCenter.name}</span>
            </div>
            <div className="detail-item">
              <span className="label">Address:</span>
              <span className="value">{selectedCenter.address}</span>
            </div>
            <div className="detail-item">
              <span className="label">Date:</span>
              <span className="value">{formatDate(selectedDate)}</span>
            </div>
            <div className="detail-item">
              <span className="label">Time:</span>
              <span className="value">{selectedSlot}</span>
            </div>
          </div>
          <div className="confirmation-note">
            <p>📧 A confirmation email has been sent to your registered email address.</p>
            <p>⏰ Please arrive 15 minutes before your scheduled time.</p>
            <p>📋 Remember to bring a valid ID and stay hydrated!</p>
          </div>
          <button 
            onClick={() => navigate('/donor/dashboard')} 
            className="btn-primary"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-header">
        <h1>Book a Donation Appointment</h1>
        <p>Schedule your next life-saving donation</p>
      </div>

      {!isEligible && (
        <div className="eligibility-warning">
          <span className="warning-icon">⚠️</span>
          <div>
            <strong>Note:</strong> You may not be eligible to donate yet based on your last donation date.
            Please check your eligibility status before booking.
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="booking-steps">
        <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <span>Select Location</span>
        </div>
        <div className="step-connector"></div>
        <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <span>Choose Date & Time</span>
        </div>
        <div className="step-connector"></div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <span>Confirm Booking</span>
        </div>
      </div>

      <div className="booking-content">
        {/* Step 1: Location Selection */}
        {step >= 1 && (
          <div className={`booking-section ${step === 1 ? 'current' : 'completed-section'}`}>
            <h2>
              {step > 1 && <span className="check-icon">✓</span>}
              Select Donation Center
            </h2>
            {step === 1 ? (
              <div className="centers-list">
                {mockDonationCenters.map((center) => (
                  <div 
                    key={center.id} 
                    className="center-card"
                    onClick={() => handleCenterSelect(center)}
                  >
                    <div className="center-info">
                      <h3>{center.name}</h3>
                      <p className="address">📍 {center.address}</p>
                      <p className="phone">📞 {center.phone}</p>
                      <p className="hours">🕐 {center.hours}</p>
                    </div>
                    <div className="select-arrow">→</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="selected-summary" onClick={() => setStep(1)}>
                <strong>{selectedCenter?.name}</strong>
                <span>{selectedCenter?.address}</span>
                <button className="btn-change">Change</button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Date & Time Selection */}
        {step >= 2 && (
          <div className={`booking-section ${step === 2 ? 'current' : step > 2 ? 'completed-section' : ''}`}>
            <h2>
              {step > 2 && <span className="check-icon">✓</span>}
              Choose Date & Time
            </h2>
            {step === 2 ? (
              <div className="datetime-selection">
                <div className="date-picker">
                  <h3>Select a Date</h3>
                  <div className="dates-grid">
                    {availableDates.map((date) => (
                      <button
                        key={date}
                        className={`date-btn ${selectedDate === date ? 'selected' : ''}`}
                        onClick={() => handleDateSelect(date)}
                      >
                        <span className="day-name">{formatShortDate(date).split(',')[0]}</span>
                        <span className="day-date">{new Date(date).getDate()}</span>
                        <span className="month">{new Date(date).toLocaleDateString('en-US', { month: 'short' })}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedDate && (
                  <div className="time-picker">
                    <h3>Available Time Slots</h3>
                    {availableSlots.length > 0 ? (
                      <div className="slots-grid">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                            onClick={() => handleSlotSelect(slot)}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="no-slots">No available slots for this date. Please select another date.</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="selected-summary" onClick={() => setStep(2)}>
                <strong>{formatDate(selectedDate)}</strong>
                <span>at {selectedSlot}</span>
                <button className="btn-change">Change</button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="booking-section current">
            <h2>Confirm Your Appointment</h2>
            <div className="confirmation-preview">
              <div className="preview-card">
                <div className="preview-header">
                  <span className="blood-icon-large">🩸</span>
                  <h3>Donation Appointment</h3>
                </div>
                <div className="preview-details">
                  <div className="preview-item">
                    <span className="icon">📍</span>
                    <div>
                      <span className="label">Location</span>
                      <span className="value">{selectedCenter?.name}</span>
                      <span className="subvalue">{selectedCenter?.address}</span>
                    </div>
                  </div>
                  <div className="preview-item">
                    <span className="icon">📅</span>
                    <div>
                      <span className="label">Date & Time</span>
                      <span className="value">{formatDate(selectedDate)}</span>
                      <span className="subvalue">{selectedSlot}</span>
                    </div>
                  </div>
                  <div className="preview-item">
                    <span className="icon">👤</span>
                    <div>
                      <span className="label">Donor</span>
                      <span className="value">{user?.name || mockDonorProfile.name}</span>
                      <span className="subvalue">Blood Type: {user?.bloodType || mockDonorProfile.bloodType}</span>
                    </div>
                  </div>
                </div>
                <div className="preview-actions">
                  <button 
                    onClick={() => setStep(2)} 
                    className="btn-secondary"
                  >
                    Go Back
                  </button>
                  <button 
                    onClick={handleConfirmBooking} 
                    className="btn-primary"
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentBooking;

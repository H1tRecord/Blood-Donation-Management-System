import { useState } from 'react';
import { mockUpcomingAppointments, mockDonorDatabase, mockDonationCenters } from '../data/mockData';

function StaffAppointments() {
  const [appointments, setAppointments] = useState([
    ...mockUpcomingAppointments,
    // Add more mock appointments for different dates
    {
      id: 'APT004',
      donorId: 'D001',
      donorName: 'John Smith',
      bloodType: 'O+',
      date: '2026-02-24',
      time: '9:00 AM',
      center: 'Springfield Blood Center',
      status: 'Checked-In',
    },
    {
      id: 'APT005',
      donorId: 'D002',
      donorName: 'Sarah Johnson',
      bloodType: 'A-',
      date: '2026-02-24',
      time: '10:30 AM',
      center: 'Springfield Blood Center',
      status: 'Pending',
    },
    {
      id: 'APT006',
      donorId: 'D004',
      donorName: 'Emily Davis',
      bloodType: null,
      date: '2026-02-27',
      time: '2:00 PM',
      center: 'Community Hospital Blood Bank',
      status: 'Confirmed',
    },
  ]);
  
  const [selectedDate, setSelectedDate] = useState('2026-02-24');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processData, setProcessData] = useState({
    bloodType: '',
    hemoglobin: '',
    bloodPressure: '',
    notes: '',
  });

  // Generate dates for the week view
  const getWeekDates = () => {
    const dates = [];
    const start = new Date('2026-02-23'); // Start from Monday
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt => apt.date === date);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      full: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return '#17a2b8';
      case 'Pending': return '#ffc107';
      case 'Checked-In': return '#28a745';
      case 'Completed': return '#6c757d';
      case 'Cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const handleStatusChange = (appointmentId, newStatus) => {
    setAppointments(prev => prev.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ));
  };

  const handleProcessAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setProcessData({
      bloodType: appointment.bloodType || '',
      hemoglobin: '',
      bloodPressure: '',
      notes: '',
    });
    setShowProcessModal(true);
  };

  const handleSubmitProcess = () => {
    if (!processData.bloodType || !processData.hemoglobin || !processData.bloodPressure) {
      alert('Please fill in all required health metrics');
      return;
    }

    // Update appointment status to Completed
    setAppointments(prev => prev.map(apt => 
      apt.id === selectedAppointment.id 
        ? { ...apt, status: 'Completed', bloodType: processData.bloodType }
        : apt
    ));

    // In a real app, this would update the donor database with health metrics
    console.log('Processing donation for:', selectedAppointment.donorName, processData);

    setShowProcessModal(false);
    setSelectedAppointment(null);
    alert(`Donation processed successfully for ${selectedAppointment.donorName}!\n\nHealth metrics recorded:\n- Blood Type: ${processData.bloodType}\n- Hemoglobin: ${processData.hemoglobin}\n- Blood Pressure: ${processData.bloodPressure}`);
  };

  const todayAppointments = getAppointmentsForDate(selectedDate);
  const pendingCount = appointments.filter(a => a.status === 'Pending').length;
  const checkedInCount = appointments.filter(a => a.status === 'Checked-In').length;
  const completedTodayCount = appointments.filter(a => a.date === selectedDate && a.status === 'Completed').length;

  return (
    <div className="staff-appointments-page">
      <div className="page-header">
        <h1>Appointment Management</h1>
        <p>Master calendar and appointment processing</p>
      </div>

      {/* Quick Stats */}
      <div className="apt-stats">
        <div className="apt-stat">
          <span className="stat-value">{pendingCount}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="apt-stat highlight">
          <span className="stat-value">{checkedInCount}</span>
          <span className="stat-label">Checked In</span>
        </div>
        <div className="apt-stat success">
          <span className="stat-value">{completedTodayCount}</span>
          <span className="stat-label">Completed Today</span>
        </div>
        <div className="apt-stat">
          <span className="stat-value">{todayAppointments.length}</span>
          <span className="stat-label">Total for {formatDate(selectedDate).month} {formatDate(selectedDate).date}</span>
        </div>
      </div>

      {/* Week Calendar View */}
      <div className="calendar-section">
        <h2>Weekly Calendar</h2>
        <div className="week-calendar">
          {weekDates.map((date) => {
            const dateInfo = formatDate(date);
            const dayAppointments = getAppointmentsForDate(date);
            const isSelected = date === selectedDate;
            const isToday = date === '2026-02-24';
            
            return (
              <div 
                key={date}
                className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => setSelectedDate(date)}
              >
                <div className="day-header">
                  <span className="day-name">{dateInfo.day}</span>
                  <span className="day-number">{dateInfo.date}</span>
                </div>
                <div className="day-appointments">
                  {dayAppointments.length > 0 ? (
                    <>
                      <span className="apt-count">{dayAppointments.length} appointments</span>
                      <div className="apt-dots">
                        {dayAppointments.slice(0, 4).map(apt => (
                          <span 
                            key={apt.id} 
                            className="apt-dot"
                            style={{ backgroundColor: getStatusColor(apt.status) }}
                          ></span>
                        ))}
                        {dayAppointments.length > 4 && <span className="more-dots">+{dayAppointments.length - 4}</span>}
                      </div>
                    </>
                  ) : (
                    <span className="no-apt">No appointments</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Detail View */}
      <div className="day-detail-section">
        <div className="section-header">
          <h2>📅 {formatDate(selectedDate).full}</h2>
          <span className="appointment-count">{todayAppointments.length} appointments</span>
        </div>

        {todayAppointments.length > 0 ? (
          <div className="appointments-timeline">
            {todayAppointments
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((apt) => (
                <div key={apt.id} className={`appointment-card ${apt.status.toLowerCase()}`}>
                  <div className="apt-time-col">
                    <span className="apt-time">{apt.time}</span>
                  </div>
                  <div className="apt-main">
                    <div className="apt-header">
                      <div className="donor-info">
                        <span className="donor-name">{apt.donorName}</span>
                        <span className="donor-id">ID: {apt.donorId}</span>
                      </div>
                      {apt.bloodType ? (
                        <span className="blood-type-badge">{apt.bloodType}</span>
                      ) : (
                        <span className="blood-type-unknown">TBD</span>
                      )}
                    </div>
                    <div className="apt-details">
                      <span className="center-name">📍 {apt.center}</span>
                    </div>
                    <div className="apt-footer">
                      <div className="status-section">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(apt.status) }}
                        >
                          {apt.status}
                        </span>
                        {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                          <select 
                            value={apt.status}
                            onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                            className="status-select"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Checked-In">Checked-In</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        )}
                      </div>
                      <div className="apt-actions">
                        {apt.status === 'Checked-In' && (
                          <button 
                            className="btn-process"
                            onClick={() => handleProcessAppointment(apt)}
                          >
                            Process Donation
                          </button>
                        )}
                        {apt.status === 'Completed' && (
                          <span className="completed-badge">✓ Processed</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="no-appointments">
            <span className="empty-icon">📭</span>
            <p>No appointments scheduled for this date</p>
          </div>
        )}
      </div>

      {/* Process Donation Modal */}
      {showProcessModal && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowProcessModal(false)}>
          <div className="modal-content process-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Process Donation</h2>
              <button className="close-btn" onClick={() => setShowProcessModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="process-donor-info">
                <div className="donor-avatar-large">
                  {selectedAppointment.donorName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3>{selectedAppointment.donorName}</h3>
                  <p>ID: {selectedAppointment.donorId}</p>
                  <p>Appointment: {selectedAppointment.time}</p>
                </div>
              </div>

              <div className="process-form">
                <h4>Health Metrics (Required)</h4>
                
                <div className="form-group">
                  <label htmlFor="bloodType">Blood Type *</label>
                  <select
                    id="bloodType"
                    value={processData.bloodType}
                    onChange={(e) => setProcessData({ ...processData, bloodType: e.target.value })}
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="hemoglobin">Hemoglobin Level *</label>
                    <input
                      type="text"
                      id="hemoglobin"
                      placeholder="e.g., 14.2 g/dL"
                      value={processData.hemoglobin}
                      onChange={(e) => setProcessData({ ...processData, hemoglobin: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="bloodPressure">Blood Pressure *</label>
                    <input
                      type="text"
                      id="bloodPressure"
                      placeholder="e.g., 120/80 mmHg"
                      value={processData.bloodPressure}
                      onChange={(e) => setProcessData({ ...processData, bloodPressure: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Notes (Optional)</label>
                  <textarea
                    id="notes"
                    rows="3"
                    placeholder="Any additional notes about the donation..."
                    value={processData.notes}
                    onChange={(e) => setProcessData({ ...processData, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowProcessModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSubmitProcess}>
                Complete Donation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffAppointments;

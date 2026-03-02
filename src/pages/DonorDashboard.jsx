import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  isEligibleToDonate,
  getDaysUntilEligible,
  calculateDaysSinceLastDonation
} from '../data';
import {
  getAppointments,
  getDonationHistory,
  getDonationRequests,
  getBloodInventory,
  updateDonationRequest,
} from '../data/db';
import './DonorDashboard.css';

const DonorDashboard = () => {
  const { currentUser, resetSessionTimeout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [userAppointments, setUserAppointments] = useState([]);
  const [userDonations, setUserDonations] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [isEligible, setIsEligible] = useState(false);
  const [daysUntilEligible, setDaysUntilEligible] = useState(0);
  const [daysSinceLast, setDaysSinceLast] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [respondingId, setRespondingId] = useState(null);

  useEffect(() => {
    resetSessionTimeout();
    loadDonorData();
  }, [currentUser]);

  const loadDonorData = async () => {
    if (!currentUser) return;

    const [allAppts, allDons, allReqs, allInv] = await Promise.all([
      getAppointments(),
      getDonationHistory(),
      getDonationRequests(),
      getBloodInventory(),
    ]);

    // Filter by Firebase UID
    const userAppts = allAppts.filter(
      (apt) => apt.donorId === currentUser.uid && apt.status !== 'cancelled'
    );
    setUserAppointments(userAppts);

    const userDons = allDons
      .filter((don) => don.donorId === currentUser.uid)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    setUserDonations(userDons);

    const requests = allReqs.filter(
      (req) => req.donorId === currentUser.uid && req.status === 'pending'
    );
    setUserRequests(requests);

    // Store inventory for the "needed blood types" section
    setInventory(allInv);

    // Calculate eligibility
    const eligible = isEligibleToDonate(currentUser.lastDonationDate);
    setIsEligible(eligible);

    if (currentUser.lastDonationDate) {
      const daysUntil = getDaysUntilEligible(currentUser.lastDonationDate);
      setDaysUntilEligible(daysUntil);

      const daysSince = calculateDaysSinceLastDonation(currentUser.lastDonationDate);
      setDaysSinceLast(daysSince);
    }
  };

  const handleStartEdit = () => {
    setEditEmail(currentUser?.email || '');
    setProfileSuccess('');
    setProfileError('');
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileError('');
  };

  const handleSaveProfile = async () => {
    setProfileError('');
    setProfileSuccess('');

    if (!editEmail) {
      setProfileError('Email is required');
      return;
    }

    const result = await updateProfile({ email: editEmail });
    if (result.success) {
      setIsEditingProfile(false);
      setProfileSuccess('Profile updated successfully');
      setTimeout(() => setProfileSuccess(''), 3000);
    }
  };

  const handleRespondToRequest = async (requestId, response) => {
    if (response === 'accepted') {
      // Don't mark accepted yet — wait until the donor actually books an appointment
      navigate('/appointment-booking', { state: { requestId } });
      return;
    }
    setRespondingId(requestId);
    await updateDonationRequest(requestId, {
      status: 'declined',
      responseDate: new Date().toISOString().split('T')[0],
    });
    setRespondingId(null);
    loadDonorData();
  };

  const getNeededBloodTypes = () => {
    return inventory
      .filter(inv => inv.units < 20)
      .sort((a, b) => a.units - b.units)
      .slice(0, 3);
  };

  const upcomingAppointment = userAppointments.find(
    apt => new Date(apt.date) >= new Date() && apt.status !== 'cancelled'
  );

  return (
    <div className="donor-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {currentUser?.name}!</h1>
        <p className="subtitle">Donor Dashboard</p>
      </div>

      <div className="dashboard-grid">
        {/* Eligibility Status Card */}
        <div className="card eligibility-card">
          <h2>Donation Eligibility</h2>
          <div className={`eligibility-status ${isEligible ? 'eligible' : 'ineligible'}`}>
            <div className="status-icon">
              {isEligible ? 'Eligible' : 'Wait'}
            </div>
            <div className="status-content">
              {isEligible ? (
                <>
                  <h3>You are ELIGIBLE to donate!</h3>
                  <p>You can book an appointment now</p>
                  {daysSinceLast && (
                    <p className="days-info">
                      {daysSinceLast} days since your last donation
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h3>Currently INELIGIBLE</h3>
                  <p>
                    You can donate again in <strong>{daysUntilEligible} days</strong>
                  </p>
                  {currentUser.lastDonationDate && (
                    <p className="days-info">
                      Last donation: {new Date(currentUser.lastDonationDate).toLocaleDateString()}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          {isEligible && (
            <button
              className="btn-primary"
              onClick={() => navigate('/appointment-booking')}
            >
              Book Appointment
            </button>
          )}
        </div>

        {/* Profile Summary Card */}
        <div className="card profile-card">
          <div className="profile-card-header">
            <h2>Your Profile</h2>
            {!isEditingProfile && (
              <button className="btn-edit-profile" onClick={handleStartEdit}>
                Edit
              </button>
            )}
          </div>

          {profileSuccess && (
            <div className="success-message" style={{ marginBottom: '0.75rem' }}>
              {profileSuccess}
            </div>
          )}
          {profileError && (
            <div className="error-message" style={{ marginBottom: '0.75rem' }}>
              {profileError}
            </div>
          )}

          {isEditingProfile ? (
            <div className="profile-edit-form">
              <div className="info-row static">
                <span className="label">Blood Type:</span>
                <span className="value blood-type">
                  {currentUser?.bloodType || 'To be determined'}
                </span>
              </div>
              <div className="info-row static">
                <span className="label">Total Donations:</span>
                <span className="value">{currentUser?.donationCount || 0}</span>
              </div>
              <div className="edit-field">
                <label>Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div className="info-row static">
                <span className="label">Member Since:</span>
                <span className="value">
                  {currentUser?.registrationDate ?
                    new Date(currentUser.registrationDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="edit-actions">
                <button className="btn-save" onClick={handleSaveProfile}>Save Changes</button>
                <button className="btn-cancel-edit" onClick={handleCancelEdit}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="profile-info">
              <div className="info-row">
                <span className="label">Blood Type:</span>
                <span className="value blood-type">
                  {currentUser?.bloodType || 'To be determined'}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Total Donations:</span>
                <span className="value">{currentUser?.donationCount || 0}</span>
              </div>
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value">{currentUser?.email}</span>
              </div>
              <div className="info-row">
                <span className="label">Member Since:</span>
                <span className="value">
                  {currentUser?.registrationDate ?
                    new Date(currentUser.registrationDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Appointment Card */}
        <div className="card appointment-card">
          <h2>Upcoming Appointment</h2>
          {upcomingAppointment ? (
            <div className="appointment-details">
              <div className="appointment-info">
                <p className="appointment-date">
                  <span className="appt-label">Date:</span> {new Date(upcomingAppointment.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="appointment-time"><span className="appt-label">Time:</span> {upcomingAppointment.time}</p>
                <p className="appointment-status">
                  Status: <span className={`status-badge ${upcomingAppointment.status}`}>
                    {upcomingAppointment.status}
                  </span>
                </p>
                <p className="confirmation">
                  Confirmation: {upcomingAppointment.confirmationNumber}
                </p>
              </div>
            </div>
          ) : (
            <div className="no-appointment">
              <p>No upcoming appointments</p>
              {isEligible && (
                <button
                  className="btn-secondary"
                  onClick={() => navigate('/appointment-booking')}
                >
                  Book Now
                </button>
              )}
            </div>
          )}
        </div>

        {/* Donation Requests Card */}
        <div className={`card requests-card${userRequests.length > 0 ? ' requests-card--active' : ''}`}>
          <div className="requests-card-header">
            <h2>Donation Requests</h2>
            {userRequests.length > 0 && (
              <span className="requests-badge">{userRequests.length}</span>
            )}
          </div>
          {userRequests.length > 0 ? (
            <>
              <p className="requests-info">Staff has requested your help. Please respond below.</p>
              {userRequests.map((request) => (
                <div key={request.id} className="request-item">
                  <div className="request-header">
                    <span className="blood-type-badge">{request.bloodType}</span>
                    <span className="request-date">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="request-message">{request.message}</p>
                  <p className="request-staff">From: {request.requestedByName}</p>
                  <div className="request-actions">
                    <button
                      className="btn-accept"
                      disabled={respondingId === request.id}
                      onClick={() => handleRespondToRequest(request.id, 'accepted')}
                    >
                      {respondingId === request.id ? 'Processing…' : 'Accept & Book Appointment'}
                    </button>
                    <button
                      className="btn-decline"
                      disabled={respondingId === request.id}
                      onClick={() => handleRespondToRequest(request.id, 'declined')}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <p className="requests-empty">No pending donation requests.</p>
          )}
        </div>

        {/* Blood Types Needed Card */}
        <div className="card needed-card">
          <h2>Blood Types Needed</h2>
          <p className="needed-info">Current inventory status</p>
          <div className="needed-list">
            {getNeededBloodTypes().map((inv) => (
              <div key={inv.type} className="needed-item">
                <span className="blood-type-badge">{inv.type}</span>
                <div className="needed-status">
                  <span className={`status-label ${inv.units < 10 ? 'critical' : 'low'}`}>
                    {inv.units < 10 ? 'CRITICAL' : 'LOW'}
                  </span>
                  <span className="units-count">{inv.units} units</span>
                </div>
              </div>
            ))}
          </div>
          {getNeededBloodTypes().length === 0 && (
            <p className="no-needs">All blood types are adequately stocked</p>
          )}
        </div>

        {/* Donation History Card */}
        <div className="card history-card">
          <h2>Donation History</h2>
          {userDonations.length > 0 ? (
            <div className="history-timeline">
              {userDonations.map((donation, index) => (
                <div key={donation.id} className="history-item">
                  <div className="history-marker">{index + 1}</div>
                  <div className="history-content">
                    <p className="history-date">
                      {new Date(donation.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <div className="history-details">
                      <span className="blood-type-small">{donation.bloodType}</span>
                      <span className="units">{donation.units} unit(s)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-history">
              <p>No donation history yet</p>
              <p className="encouragement">
                Thank you for considering blood donation!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;

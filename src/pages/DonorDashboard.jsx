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
  updateAppointment,
} from '../data/db';
import './DonorDashboard.css';

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const DonorDashboard = () => {
  const { currentUser, resetSessionTimeout, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  const [userAppointments, setUserAppointments] = useState([]);
  const [userDonations, setUserDonations] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [isEligible, setIsEligible] = useState(false);
  const [daysUntilEligible, setDaysUntilEligible] = useState(0);
  const [daysSinceLast, setDaysSinceLast] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [respondingId, setRespondingId] = useState(null);
  const [editCurrentPassword, setEditCurrentPassword] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

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
    setEditCurrentPassword('');
    setEditNewPassword('');
    setEditConfirmPassword('');
    setProfileSuccess('');
    setProfileError('');
    setShowEditModal(true);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setProfileError('');
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowConfirmPw(false);
  };

  const handleSaveProfile = async () => {
    setProfileError('');
    setProfileSuccess('');

    if (!editEmail) {
      setProfileError('Email is required');
      return;
    }

    // Handle password change if any password field is filled
    if (editCurrentPassword || editNewPassword || editConfirmPassword) {
      if (!editCurrentPassword) {
        setProfileError('Please enter your current password');
        return;
      }
      if (!editNewPassword) {
        setProfileError('Please enter a new password');
        return;
      }
      if (editNewPassword.length < 6) {
        setProfileError('New password must be at least 6 characters');
        return;
      }
      if (editNewPassword !== editConfirmPassword) {
        setProfileError('New passwords do not match');
        return;
      }
      const pwResult = await changePassword(editCurrentPassword, editNewPassword);
      if (!pwResult.success) {
        setProfileError(pwResult.message);
        return;
      }
    }

    const result = await updateProfile({ email: editEmail });
    if (result.success) {
      setShowEditModal(false);
      setEditCurrentPassword('');
      setEditNewPassword('');
      setEditConfirmPassword('');
      setShowCurrentPw(false);
      setShowNewPw(false);
      setShowConfirmPw(false);
      setProfileSuccess('Profile updated successfully');
      setTimeout(() => setProfileSuccess(''), 3000);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancellingId(appointmentId);
    await updateAppointment(appointmentId, { status: 'cancelled' });
    setCancellingId(null);
    loadDonorData();
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
            <button className="btn-edit-profile" onClick={handleStartEdit}>
              Edit
            </button>
          </div>

          {profileSuccess && (
            <div className="success-message" style={{ marginBottom: '0.75rem' }}>
              {profileSuccess}
            </div>
          )}

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
                <p className="appointment-status">
                  Status: <span className={`status-badge ${upcomingAppointment.status}`}>
                    {upcomingAppointment.status}
                  </span>
                </p>
                <p className="confirmation">
                  Confirmation: {upcomingAppointment.confirmationNumber}
                </p>
              </div>
              {(upcomingAppointment.status === 'pending' || upcomingAppointment.status === 'confirmed') && (
                <button
                  className="btn-cancel-appointment"
                  disabled={cancellingId === upcomingAppointment.id}
                  onClick={() => handleCancelAppointment(upcomingAppointment.id)}
                >
                  {cancellingId === upcomingAppointment.id ? 'Cancelling…' : 'Cancel Appointment'}
                </button>
              )}
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
          <div className="history-card-header">
            <h2>Donation History</h2>
            {userDonations.length > 0 && (
              <span className="history-count-badge">{userDonations.length} donation{userDonations.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          {userDonations.length > 0 ? (
            <>
              <div className="history-preview">
                {userDonations.slice(0, 3).map((donation, index) => (
                  <div key={donation.id} className="history-preview-row">
                    <span className="hp-num">{index + 1}</span>
                    <span className="hp-date">
                      {new Date(donation.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="hp-type">
                      <span className="blood-type-small">{donation.bloodType}</span>
                    </span>
                    <span className="hp-units">{donation.units}u</span>
                  </div>
                ))}
              </div>
              <button className="btn-view-history" onClick={() => setShowHistoryModal(true)}>
                View Full History →
              </button>
            </>
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

      {/* ===== Edit Profile Modal ===== */}
      {showEditModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleCancelEdit(); }}>
          <div className="modal-card">
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="close-btn" onClick={handleCancelEdit}>×</button>
            </div>
            <div className="modal-content">
              {profileError && (
                <div className="error-message" style={{ marginBottom: '0.75rem' }}>
                  {profileError}
                </div>
              )}
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div className="form-group">
                <label>Change Password <span className="optional-label">(optional — leave blank to keep current)</span></label>
                <div className="pw-wrapper" style={{ marginBottom: '0.5rem' }}>
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={editCurrentPassword}
                    onChange={(e) => setEditCurrentPassword(e.target.value)}
                    placeholder="Current password"
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowCurrentPw(p => !p)} tabIndex={-1} aria-label="Toggle visibility">
                    {showCurrentPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                <div className="pw-wrapper" style={{ marginBottom: '0.5rem' }}>
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={editNewPassword}
                    onChange={(e) => setEditNewPassword(e.target.value)}
                    placeholder="New password (min 6 chars)"
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowNewPw(p => !p)} tabIndex={-1} aria-label="Toggle visibility">
                    {showNewPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                <div className="pw-wrapper">
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={editConfirmPassword}
                    onChange={(e) => setEditConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowConfirmPw(p => !p)} tabIndex={-1} aria-label="Toggle visibility">
                    {showConfirmPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={handleCancelEdit}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveProfile}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Donation History Modal ===== */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowHistoryModal(false); }}>
          <div className="modal-card modal-card--wide">
            <div className="modal-header">
              <h2>Donation History</h2>
              <button className="close-btn" onClick={() => setShowHistoryModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="history-table-wrap">
                <div className="history-table">
                  <div className="history-thead">
                    <div className="ht-col ht-col-num">#</div>
                    <div className="ht-col ht-col-date">Date</div>
                    <div className="ht-col ht-col-type">Blood Type</div>
                    <div className="ht-col ht-col-units">Units</div>
                    <div className="ht-col ht-col-staff">Recorded By</div>
                  </div>
                  {userDonations.map((donation, index) => (
                    <div key={donation.id} className="history-trow">
                      <div className="ht-col ht-col-num">{index + 1}</div>
                      <div className="ht-col ht-col-date">
                        {new Date(donation.date).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </div>
                      <div className="ht-col ht-col-type">
                        <span className="blood-type-small">{donation.bloodType}</span>
                      </div>
                      <div className="ht-col ht-col-units">{donation.units} unit{donation.units !== 1 ? 's' : ''}</div>
                      <div className="ht-col ht-col-staff">{donation.staffName || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowHistoryModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockDonorProfile, mockDonationHistory } from '../data/mockData';

function DonorDashboard({ user }) {
  const [profile] = useState(mockDonorProfile);
  const [donationHistory] = useState(mockDonationHistory);
  const [daysUntilEligible, setDaysUntilEligible] = useState(0);
  const [isEligible, setIsEligible] = useState(false);

  useEffect(() => {
    // Calculate eligibility based on 56-day deferral period
    const nextEligible = new Date(profile.nextEligibleDate);
    const today = new Date();
    const diffTime = nextEligible - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    setDaysUntilEligible(diffDays);
    setIsEligible(diffDays <= 0);
  }, [profile.nextEligibleDate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get the most recent health metrics
  const latestDonation = donationHistory[0];

  return (
    <div className="donor-dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || profile.name}!</h1>
        <p className="subtitle">Your personalized donor dashboard</p>
      </div>

      <div className="dashboard-grid">
        {/* Profile Card */}
        <div className="card profile-card">
          <div className="card-header">
            <h2>Your Profile</h2>
          </div>
          <div className="card-body">
            <div className="profile-avatar">
              <span className="avatar-initials">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </span>
              <span className="blood-type-badge">{profile.bloodType}</span>
            </div>
            <div className="profile-info">
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">{profile.email}</span>
              </div>
              <div className="info-item">
                <span className="label">Phone:</span>
                <span className="value">{profile.phone}</span>
              </div>
              <div className="info-item">
                <span className="label">Total Donations:</span>
                <span className="value highlight">{profile.totalDonations}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility Status Widget */}
        <div className={`card eligibility-card ${isEligible ? 'eligible' : 'not-eligible'}`}>
          <div className="card-header">
            <h2>Eligibility Status</h2>
          </div>
          <div className="card-body">
            <div className="eligibility-content">
              {isEligible ? (
                <>
                  <div className="status-icon">✅</div>
                  <h3>You're Eligible to Donate!</h3>
                  <p>Your 56-day deferral period has passed.</p>
                  <Link to="/donor/appointments" className="btn-primary">
                    Book Appointment
                  </Link>
                </>
              ) : (
                <>
                  <div className="countdown-circle">
                    <span className="days-number">{daysUntilEligible}</span>
                    <span className="days-label">days</span>
                  </div>
                  <h3>Until Next Eligibility</h3>
                  <p>Last donation: {formatDate(profile.lastDonation)}</p>
                  <p className="next-date">
                    Eligible on: {formatDate(profile.nextEligibleDate)}
                  </p>
                </>
              )}
            </div>
            <div className="eligibility-info">
              <small>Based on 56-day whole blood deferral period</small>
            </div>
          </div>
        </div>

        {/* Health Record Summary */}
        <div className="card health-card">
          <div className="card-header">
            <h2>Health Record Summary</h2>
            <span className="subtitle">From your last donation</span>
          </div>
          <div className="card-body">
            <div className="health-metrics">
              <div className="metric">
                <div className="metric-icon">💉</div>
                <div className="metric-details">
                  <span className="metric-label">Hemoglobin Level</span>
                  <span className="metric-value">{latestDonation.hemoglobin}</span>
                  <span className="metric-status normal">Normal</span>
                </div>
              </div>
              <div className="metric">
                <div className="metric-icon">❤️</div>
                <div className="metric-details">
                  <span className="metric-label">Blood Pressure</span>
                  <span className="metric-value">{latestDonation.bloodPressure}</span>
                  <span className="metric-status normal">Normal</span>
                </div>
              </div>
              <div className="metric">
                <div className="metric-icon">🩸</div>
                <div className="metric-details">
                  <span className="metric-label">Blood Type</span>
                  <span className="metric-value">{profile.bloodType}</span>
                  <span className="metric-status">Universal {profile.bloodType === 'O-' ? 'Donor' : ''}</span>
                </div>
              </div>
            </div>
            <p className="health-note">
              <small>* Health metrics are recorded during each donation visit</small>
            </p>
          </div>
        </div>

        {/* Donation History Timeline */}
        <div className="card history-card">
          <div className="card-header">
            <h2>Donation History</h2>
            <span className="badge">{donationHistory.length} donations</span>
          </div>
          <div className="card-body">
            <div className="donation-timeline">
              {donationHistory.map((donation, index) => (
                <div key={donation.id} className="timeline-item">
                  <div className="timeline-marker">
                    <div className="marker-dot"></div>
                    {index < donationHistory.length - 1 && <div className="marker-line"></div>}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="donation-date">{formatDate(donation.date)}</span>
                      <span className={`status-badge ${donation.status.toLowerCase()}`}>
                        {donation.status}
                      </span>
                    </div>
                    <div className="donation-details">
                      <p className="location">📍 {donation.location}</p>
                      <p className="type">Type: {donation.type} ({donation.volume})</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DonorDashboard;

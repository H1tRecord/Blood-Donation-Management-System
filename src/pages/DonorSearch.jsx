import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  users,
  donationRequests,
  isEligibleToDonate,
  calculateDaysSinceLastDonation
} from '../data/mockData';
import './DonorSearch.css';

const DonorSearch = () => {
  const { currentUser, resetSessionTimeout } = useAuth();
  const location = useLocation();
  const [searchBloodType, setSearchBloodType] = useState('');
  const [eligibleDonors, setEligibleDonors] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    resetSessionTimeout();
    
    // Check if blood type was passed from Staff Dashboard
    if (location.state?.bloodType) {
      setSearchBloodType(location.state.bloodType);
      searchDonors(location.state.bloodType);
    }
  }, [location]);

  const searchDonors = (bloodType) => {
    if (!bloodType) {
      setEligibleDonors([]);
      return;
    }

    // Find all donors with matching blood type who are eligible
    const donors = users
      .filter(user => 
        user.role === 'donor' &&
        user.bloodType === bloodType &&
        user.isActive &&
        isEligibleToDonate(user.lastDonationDate)
      )
      .map(donor => ({
        ...donor,
        daysSinceLast: calculateDaysSinceLastDonation(donor.lastDonationDate),
        hasActiveRequest: donationRequests.some(
          req => req.donorId === donor.id && req.status === 'pending' && req.bloodType === bloodType
        )
      }))
      .sort((a, b) => {
        // Sort by: 1) no active request first, 2) more days since last donation
        if (a.hasActiveRequest !== b.hasActiveRequest) {
          return a.hasActiveRequest ? 1 : -1;
        }
        return (b.daysSinceLast || 999) - (a.daysSinceLast || 999);
      });

    setEligibleDonors(donors);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchDonors(searchBloodType);
  };

  const handleRequestDonation = (donor) => {
    setSelectedDonor(donor);
    setRequestMessage(`We urgently need ${searchBloodType} blood. Would you be able to donate soon? Your donation can save lives!`);
    setShowRequestForm(true);
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    
    if (!requestMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    // Create new donation request
    const newRequest = {
      id: `REQ${(donationRequests.length + 1).toString().padStart(3, '0')}`,
      bloodType: searchBloodType,
      requestedBy: currentUser.id,
      requestedByName: currentUser.name,
      donorId: selectedDonor.id,
      donorName: selectedDonor.name,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      message: requestMessage
    };

    // Add to donation requests
    donationRequests.push(newRequest);

    // Log the request (in real app, would send email notification)
    console.log('Donation request sent:', newRequest);

    setShowSuccess(true);
    setShowRequestForm(false);
    
    // Refresh the search to update donor status
    searchDonors(searchBloodType);

    setTimeout(() => {
      setShowSuccess(false);
      setSelectedDonor(null);
      setRequestMessage('');
    }, 3000);
  };

  const handleCancelRequest = () => {
    setShowRequestForm(false);
    setSelectedDonor(null);
    setRequestMessage('');
  };

  return (
    <div className="donor-search">
      <div className="page-header">
        <h1>Search Eligible Donors</h1>
        <p className="subtitle">Find and request donations from eligible donors</p>
      </div>

      {showSuccess && (
        <div className="success-banner">
          Donation request sent successfully to {selectedDonor?.name}!
        </div>
      )}

      <div className="search-content">
        {/* Search Form */}
        <div className="card search-card">
          <h2>Search by Blood Type</h2>
          <form onSubmit={handleSearch}>
            <div className="search-form-group">
              <label htmlFor="bloodType">Blood Type *</label>
              <select
                id="bloodType"
                value={searchBloodType}
                onChange={(e) => setSearchBloodType(e.target.value)}
                required
              >
                <option value="">Select blood type needed</option>
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
            <button type="submit" className="btn-primary">
              Search Eligible Donors
            </button>
          </form>
        </div>

        {/* Search Results */}
        {searchBloodType && (
          <div className="card results-card">
            <div className="results-header">
              <h2>Eligible Donors for {searchBloodType}</h2>
              <span className="results-count">
                {eligibleDonors.length} donor{eligibleDonors.length !== 1 ? 's' : ''} found
              </span>
            </div>

            {eligibleDonors.length > 0 ? (
              <div className="donors-list">
                {eligibleDonors.map((donor) => (
                  <div key={donor.id} className="donor-card">
                    <div className="donor-info">
                      <div className="donor-header">
                        <h3>{donor.name}</h3>
                        <span className="blood-type-badge">{donor.bloodType}</span>
                      </div>
                      <div className="donor-details">
                        <p className="detail-item">
                          <span className="detail-label">Email:</span>
                          <span className="detail-value">{donor.email}</span>
                        </p>
                        <p className="detail-item">
                          <span className="detail-label">Phone:</span>
                          <span className="detail-value">{donor.phone}</span>
                        </p>
                        <p className="detail-item">
                          <span className="detail-label">Total Donations:</span>
                          <span className="detail-value">{donor.donationCount}</span>
                        </p>
                        <p className="detail-item">
                          <span className="detail-label">Last Donation:</span>
                          <span className="detail-value">
                            {donor.lastDonationDate 
                              ? `${new Date(donor.lastDonationDate).toLocaleDateString()} (${donor.daysSinceLast} days ago)`
                              : 'Never donated'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="donor-actions">
                      {donor.hasActiveRequest ? (
                        <div className="active-request-notice">
                          <span className="notice-icon">📧</span>
                          <span>Request Already Sent</span>
                        </div>
                      ) : (
                        <button
                          className="btn-request"
                          onClick={() => handleRequestDonation(donor)}
                        >
                          Request Donation
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No eligible donors found for blood type {searchBloodType}</p>
                <p className="no-results-info">
                  All donors of this blood type may be in their deferral period (must wait 56 days between donations)
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Request Form Modal */}
      {showRequestForm && selectedDonor && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Request Donation</h2>
              <button className="close-btn" onClick={handleCancelRequest}>×</button>
            </div>
            <div className="modal-content">
              <div className="request-summary">
                <p><strong>Donor:</strong> {selectedDonor.name}</p>
                <p><strong>Blood Type:</strong> {searchBloodType}</p>
                <p><strong>Email:</strong> {selectedDonor.email}</p>
              </div>
              <form onSubmit={handleSubmitRequest}>
                <div className="form-group">
                  <label htmlFor="message">Message to Donor *</label>
                  <textarea
                    id="message"
                    rows="6"
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Enter your message to the donor..."
                    required
                  />
                  <small>This message will be sent to the donor via email</small>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCancelRequest}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Send Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="card info-card">
        <h3>About Donation Requests</h3>
        <ul>
          <li>Only eligible donors (56+ days since last donation) are shown</li>
          <li>Donors with active pending requests are marked accordingly</li>
          <li>Donors are sorted by priority: those without active requests and with longer time since last donation appear first</li>
          <li>Donation requests are sent via email notification to donors</li>
          <li>Donors can accept or decline requests from their dashboard</li>
        </ul>
      </div>
    </div>
  );
};

export default DonorSearch;

import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BLOOD_TYPES,
  isEligibleToDonate,
  calculateDaysSinceLastDonation
} from '../data';
import { getUsers, getDonationRequests, createDonationRequest, getDonationHistory } from '../data/db';
import './DonorSearch.css';

const DonorSearch = () => {
  const { currentUser, resetSessionTimeout } = useAuth();
  const location = useLocation();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBloodType, setFilterBloodType] = useState('all');
  const [filterEligibility, setFilterEligibility] = useState('all');

  // Sort
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Request modal
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Profile modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileDonor, setProfileDonor] = useState(null);
  const [profileHistory, setProfileHistory] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);

  const [allUsers, setAllUsers] = useState([]);
  const [allRequests, setAllRequests] = useState([]);

  // Pagination
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    const [fetchedUsers, fetchedRequests] = await Promise.all([
      getUsers(),
      getDonationRequests(),
    ]);
    setAllUsers(fetchedUsers);
    setAllRequests(fetchedRequests);
  };

  useEffect(() => {
    resetSessionTimeout();
    if (location.state?.bloodType) {
      setFilterBloodType(location.state.bloodType);
    }
    loadData();
  }, [location]);

  // Build full donor list with computed fields
  const allDonors = useMemo(() => {
    return allUsers
      .filter(user => user.role === 'donor' && user.isActive)
      .map(donor => ({
        ...donor,
        daysSinceLast: calculateDaysSinceLastDonation(donor.lastDonationDate),
        eligible: isEligibleToDonate(donor.lastDonationDate),
        hasActiveRequest: allRequests.some(
          req => req.donorId === donor.uid && req.status === 'pending'
        )
      }));
  }, [allUsers, allRequests]);

  // Apply filters, search, and sort
  const filteredDonors = useMemo(() => {
    let result = [...allDonors];

    // Blood type filter
    if (filterBloodType !== 'all') {
      result = result.filter(d => d.bloodType === filterBloodType);
    }

    // Eligibility filter
    if (filterEligibility === 'eligible') {
      result = result.filter(d => d.eligible);
    } else if (filterEligibility === 'ineligible') {
      result = result.filter(d => !d.eligible);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        (d.bloodType && d.bloodType.toLowerCase().includes(q))
      );
    }

    // Sort
    const dir = sortDirection === 'asc' ? 1 : -1;
    result.sort((a, b) => {
      switch (sortField) {
        case 'name':
          return dir * a.name.localeCompare(b.name);
        case 'bloodType':
          return dir * (a.bloodType || '').localeCompare(b.bloodType || '');
        case 'donations':
          return dir * ((a.donationCount || 0) - (b.donationCount || 0));
        case 'lastDonation':
          return dir * ((a.daysSinceLast || 9999) - (b.daysSinceLast || 9999));
        case 'eligibility':
          return dir * (Number(b.eligible) - Number(a.eligible));
        default:
          return 0;
      }
    });

    return result;
  }, [allDonors, filterBloodType, filterEligibility, searchQuery, sortField, sortDirection]);

  const handleSort = (field) => {
    setCurrentPage(1);
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIndicator = (field) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  const handleViewProfile = async (donor) => {
    setProfileDonor(donor);
    setProfileLoading(true);
    setShowProfileModal(true);
    const allHistory = await getDonationHistory();
    const donorHistory = allHistory
      .filter(h => h.donorId === donor.uid)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    setProfileHistory(donorHistory);
    setProfileLoading(false);
  };

  const handleRequestDonation = (donor) => {
    setSelectedDonor(donor);
    setRequestMessage(`We urgently need ${donor.bloodType} blood. Would you be able to donate soon? Your donation can save lives!`);
    setShowRequestForm(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!requestMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    const newRequest = {
      bloodType: selectedDonor.bloodType,
      requestedBy: currentUser.uid,
      requestedByName: currentUser.name,
      donorId: selectedDonor.uid,
      donorName: selectedDonor.name,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      message: requestMessage,
    };

    await createDonationRequest(newRequest);
    await loadData();

    setShowSuccess(true);
    setShowRequestForm(false);

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

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterBloodType('all');
    setFilterEligibility('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || filterBloodType !== 'all' || filterEligibility !== 'all';

  const totalPages = Math.max(1, Math.ceil(filteredDonors.length / PAGE_SIZE));
  const pagedDonors = filteredDonors.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset to page 1 whenever filters/search change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterBloodType, filterEligibility]);

  return (
    <div className="donor-search">
      <div className="ds-page-header">
        <div>
          <h1>Donor Search</h1>
          <p className="ds-subtitle">Browse all donors, filter by blood type, and send donation requests</p>
        </div>
      </div>

      {showSuccess && (
        <div className="success-banner">
          Request sent successfully to {selectedDonor?.name}!
        </div>
      )}

      {/* Filters Bar */}
      <div className="card ds-filters-card">
        <div className="ds-filters">
          <div className="ds-filter-group ds-search-group">
            <label>Search</label>
            <input
              type="text"
              className="ds-search-input"
              placeholder="Name, email, phone, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="ds-filter-group">
            <label>Blood Type</label>
            <select value={filterBloodType} onChange={(e) => setFilterBloodType(e.target.value)}>
              <option value="all">All Types</option>
              {BLOOD_TYPES.map(bt => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </select>
          </div>
          <div className="ds-filter-group">
            <label>Eligibility</label>
            <select value={filterEligibility} onChange={(e) => setFilterEligibility(e.target.value)}>
              <option value="all">All</option>
              <option value="eligible">Eligible</option>
              <option value="ineligible">Ineligible</option>
            </select>
          </div>
          {hasActiveFilters && (
            <button className="ds-clear-btn" onClick={handleClearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Donors Table */}
      <div className="card ds-results-card">
        <div className="ds-results-header">
          <h2>Donors</h2>
          <span className="ds-results-count">
            {filteredDonors.length} of {allDonors.length} donor{allDonors.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="ds-table-wrapper">
          <div className="ds-table">
            <div className="ds-table-head">
              <div className="ds-col-name sortable" onClick={() => handleSort('name')}>
                Donor{getSortIndicator('name')}
              </div>
              <div className="ds-col-blood sortable" onClick={() => handleSort('bloodType')}>
                Blood Type{getSortIndicator('bloodType')}
              </div>
              <div className="ds-col-contact">Contact</div>
              <div className="ds-col-donations sortable" onClick={() => handleSort('donations')}>
                Donations{getSortIndicator('donations')}
              </div>
              <div className="ds-col-last sortable" onClick={() => handleSort('lastDonation')}>
                Last Donation{getSortIndicator('lastDonation')}
              </div>
              <div className="ds-col-status sortable" onClick={() => handleSort('eligibility')}>
                Eligibility{getSortIndicator('eligibility')}
              </div>
              <div className="ds-col-action">Action</div>
            </div>

            {filteredDonors.length > 0 ? (
              pagedDonors.map((donor) => (
                <div key={donor.id} className="ds-table-row">
                  <div className="ds-col-name">
                    <span className="ds-donor-name">{donor.name}</span>
                  </div>
                  <div className="ds-col-blood">
                    <span className="blood-type-badge">{donor.bloodType}</span>
                  </div>
                  <div className="ds-col-contact">
                    <span className="ds-contact-line">{donor.email}</span>
                  </div>
                  <div className="ds-col-donations">
                    <span className="ds-donation-count">{donor.donationCount}</span>
                  </div>
                  <div className="ds-col-last">
                    {donor.lastDonationDate ? (
                      <>
                        <span className="ds-date">{new Date(donor.lastDonationDate).toLocaleDateString()}</span>
                        <span className="ds-days-ago">{donor.daysSinceLast} days ago</span>
                      </>
                    ) : (
                      <span className="ds-never">First-time donor</span>
                    )}
                  </div>
                  <div className="ds-col-status">
                    {donor.eligible ? (
                      donor.hasActiveRequest ? (
                        <span className="ds-status-tag pending">Request Pending</span>
                      ) : (
                        <span className="ds-status-tag available">Eligible</span>
                      )
                    ) : (
                      <span className="ds-status-tag ineligible">Ineligible</span>
                    )}
                  </div>
                  <div className="ds-col-action">
                    <button
                      className="ds-btn-view"
                      onClick={() => handleViewProfile(donor)}
                    >
                      View
                    </button>
                    {!donor.eligible ? (
                      <button className="ds-btn-disabled" disabled>Ineligible</button>
                    ) : (
                      <button
                        className="ds-btn-request"
                        onClick={() => handleRequestDonation(donor)}
                      >
                        Request
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="ds-empty-row">
                <p>No donors match your filters</p>
                {hasActiveFilters && (
                  <button className="ds-clear-link" onClick={handleClearFilters}>Clear all filters</button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="ds-pagination">
            <button
              className="ds-page-btn"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ‹ Prev
            </button>

            <div className="ds-page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="ds-page-ellipsis">…</span>
                  ) : (
                    <button
                      key={p}
                      className={`ds-page-num${currentPage === p ? ' active' : ''}`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}
            </div>

            <button
              className="ds-page-btn"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next ›
            </button>

            <span className="ds-page-info">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredDonors.length)} of {filteredDonors.length}
            </span>
          </div>
        )}
      </div>

      {/* Donor Profile Modal */}
      {showProfileModal && profileDonor && (
        <div className="modal-overlay">
          <div className="modal-card ds-profile-modal">
            <div className="modal-header">
              <h2>Donor Profile</h2>
              <button className="close-btn" onClick={() => setShowProfileModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="ds-profile-info">
                <div className="ds-profile-row">
                  <span className="ds-req-label">Name</span>
                  <span className="ds-req-value">{profileDonor.name}</span>
                </div>
                <div className="ds-profile-row">
                  <span className="ds-req-label">Email</span>
                  <span className="ds-req-value">{profileDonor.email}</span>
                </div>
                <div className="ds-profile-row">
                  <span className="ds-req-label">Blood Type</span>
                  <span className="ds-req-value">
                    {profileDonor.bloodType
                      ? <span className="blood-type-badge">{profileDonor.bloodType}</span>
                      : <span className="ds-tbd">To be determined</span>}
                  </span>
                </div>
                <div className="ds-profile-row">
                  <span className="ds-req-label">Total Donations</span>
                  <span className="ds-req-value">{profileDonor.donationCount || 0}</span>
                </div>
                <div className="ds-profile-row">
                  <span className="ds-req-label">Last Donation</span>
                  <span className="ds-req-value">
                    {profileDonor.lastDonationDate
                      ? new Date(profileDonor.lastDonationDate).toLocaleDateString()
                      : 'Never'}
                  </span>
                </div>
                <div className="ds-profile-row">
                  <span className="ds-req-label">Eligibility</span>
                  <span className="ds-req-value">
                    {profileDonor.eligible
                      ? <span className="ds-status-tag available">Eligible</span>
                      : <span className="ds-status-tag ineligible">Ineligible</span>}
                  </span>
                </div>
                <div className="ds-profile-row">
                  <span className="ds-req-label">Member Since</span>
                  <span className="ds-req-value">
                    {profileDonor.registrationDate
                      ? new Date(profileDonor.registrationDate).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="ds-profile-row">
                  <span className="ds-req-label">Status</span>
                  <span className="ds-req-value">
                    {profileDonor.isActive
                      ? <span className="ds-status-tag available">Active</span>
                      : <span className="ds-status-tag ineligible">Inactive</span>}
                  </span>
                </div>
              </div>

              <div className="ds-profile-history">
                <h3>Donation History</h3>
                {profileLoading ? (
                  <p className="ds-profile-loading">Loading history…</p>
                ) : profileHistory.length > 0 ? (
                  <div className="ds-history-table">
                    <div className="ds-ht-head">
                      <div className="ds-ht-col ds-ht-num">#</div>
                      <div className="ds-ht-col ds-ht-date">Date</div>
                      <div className="ds-ht-col ds-ht-type">Blood Type</div>
                      <div className="ds-ht-col ds-ht-units">Units</div>
                      <div className="ds-ht-col ds-ht-staff">Recorded By</div>
                    </div>
                    {profileHistory.map((h, idx) => (
                      <div key={h.id} className="ds-ht-row">
                        <div className="ds-ht-col ds-ht-num">{idx + 1}</div>
                        <div className="ds-ht-col ds-ht-date">
                          {new Date(h.date).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </div>
                        <div className="ds-ht-col ds-ht-type">
                          <span className="blood-type-badge">{h.bloodType}</span>
                        </div>
                        <div className="ds-ht-col ds-ht-units">{h.units} unit{h.units !== 1 ? 's' : ''}</div>
                        <div className="ds-ht-col ds-ht-staff">{h.staffName || '—'}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="ds-profile-empty">No donation history on record.</p>
                )}
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowProfileModal(false)}>Close</button>
                {profileDonor.eligible && !profileDonor.hasActiveRequest && (
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setShowProfileModal(false);
                      handleRequestDonation(profileDonor);
                    }}
                  >
                    Send Donation Request
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestForm && selectedDonor && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Send Donation Request</h2>
              <button className="close-btn" onClick={handleCancelRequest}>×</button>
            </div>
            <div className="modal-content">
              <div className="ds-request-info">
                <div className="ds-request-row">
                  <span className="ds-req-label">Donor</span>
                  <span className="ds-req-value">{selectedDonor.name}</span>
                </div>
                <div className="ds-request-row">
                  <span className="ds-req-label">Blood Type</span>
                  <span className="ds-req-value"><span className="blood-type-badge">{selectedDonor.bloodType}</span></span>
                </div>
                <div className="ds-request-row">
                  <span className="ds-req-label">Email</span>
                  <span className="ds-req-value">{selectedDonor.email}</span>
                </div>
              </div>
              <form onSubmit={handleSubmitRequest}>
                <div className="form-group">
                  <label htmlFor="message">Message to Donor</label>
                  <textarea
                    id="message"
                    rows="5"
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Enter your message to the donor..."
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={handleCancelRequest}>
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
    </div>
  );
};

export default DonorSearch;

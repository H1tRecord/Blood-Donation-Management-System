import { useState, useMemo } from 'react';
import { mockDonorDatabase } from '../data/mockData';

function DonorSearch() {
  const [donors, setDonors] = useState(mockDonorDatabase);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBloodType, setFilterBloodType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const statuses = ['Active', 'Eligible', 'Deferred'];

  const filteredDonors = useMemo(() => {
    return donors.filter(donor => {
      const matchesSearch = searchQuery === '' || 
        donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.phone.includes(searchQuery);

      const matchesBloodType = filterBloodType === 'all' || donor.bloodType === filterBloodType;
      const matchesStatus = filterStatus === 'all' || donor.status === filterStatus;

      return matchesSearch && matchesBloodType && matchesStatus;
    });
  }, [donors, searchQuery, filterBloodType, filterStatus]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Active': return 'status-active';
      case 'Eligible': return 'status-eligible';
      case 'Deferred': return 'status-deferred';
      default: return '';
    }
  };

  const handleViewDonor = (donor) => {
    setSelectedDonor(donor);
    setEditData({
      bloodType: donor.bloodType || '',
      hemoglobin: donor.hemoglobin || '',
      bloodPressure: donor.bloodPressure || '',
      status: donor.status,
    });
    setIsEditing(false);
  };

  const handleSaveChanges = () => {
    setDonors(prev => prev.map(d => 
      d.id === selectedDonor.id 
        ? { ...d, ...editData }
        : d
    ));
    setSelectedDonor({ ...selectedDonor, ...editData });
    setIsEditing(false);
    alert('Donor information updated successfully!');
  };

  return (
    <div className="donor-search-page">
      <div className="page-header">
        <h1>Donor Search & Verification</h1>
        <p>Search and manage donor records</p>
      </div>

      {/* Search & Filter Section */}
      <div className="search-section">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, ID, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              className="clear-btn"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Blood Type:</label>
            <select 
              value={filterBloodType} 
              onChange={(e) => setFilterBloodType(e.target.value)}
            >
              <option value="all">All Types</option>
              {bloodTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count">
        Showing {filteredDonors.length} of {donors.length} donors
      </div>

      {/* Donors Table */}
      <div className="donors-table-container">
        <table className="donors-table">
          <thead>
            <tr>
              <th>Donor ID</th>
              <th>Name</th>
              <th>Blood Type</th>
              <th>Contact</th>
              <th>Last Donation</th>
              <th>Total Donations</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDonors.length > 0 ? (
              filteredDonors.map((donor) => (
                <tr key={donor.id}>
                  <td className="donor-id">{donor.id}</td>
                  <td className="donor-name">
                    <div className="name-cell">
                      <div className="avatar-small">
                        {donor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span>{donor.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="blood-type-badge">{donor.bloodType}</span>
                  </td>
                  <td className="contact-info">
                    <div>{donor.email}</div>
                    <div className="phone">{donor.phone}</div>
                  </td>
                  <td>{formatDate(donor.lastDonation)}</td>
                  <td className="total-donations">{donor.totalDonations}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(donor.status)}`}>
                      {donor.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-view"
                      onClick={() => handleViewDonor(donor)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-results">
                  No donors found matching your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Donor Details Modal */}
      {selectedDonor && (
        <div className="modal-overlay" onClick={() => setSelectedDonor(null)}>
          <div className="modal-content donor-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Donor Information' : 'Donor Details'}</h2>
              <button className="close-btn" onClick={() => setSelectedDonor(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="donor-profile">
                <div className="profile-header">
                  <div className="avatar-large">
                    {selectedDonor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="profile-name">
                    <h3>{selectedDonor.name}</h3>
                    <span className="donor-id-label">ID: {selectedDonor.id}</span>
                  </div>
                  {selectedDonor.bloodType ? (
                    <span className="blood-type-large">{selectedDonor.bloodType}</span>
                  ) : (
                    <span className="blood-type-unknown-large">TBD</span>
                  )}
                </div>

                {isEditing ? (
                  <div className="edit-form">
                    <h4>Update Health Information</h4>
                    <div className="form-group">
                      <label>Blood Type</label>
                      <select
                        value={editData.bloodType}
                        onChange={(e) => setEditData({ ...editData, bloodType: e.target.value })}
                      >
                        <option value="">Not Determined</option>
                        {bloodTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Hemoglobin Level</label>
                      <input
                        type="text"
                        placeholder="e.g., 14.2 g/dL"
                        value={editData.hemoglobin}
                        onChange={(e) => setEditData({ ...editData, hemoglobin: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Blood Pressure</label>
                      <input
                        type="text"
                        placeholder="e.g., 120/80 mmHg"
                        value={editData.bloodPressure}
                        onChange={(e) => setEditData({ ...editData, bloodPressure: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={editData.status}
                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                      >
                        {statuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="profile-details">
                    <div className="detail-row">
                      <span className="label">Email:</span>
                      <span className="value">{selectedDonor.email}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Phone:</span>
                      <span className="value">{selectedDonor.phone}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Blood Type:</span>
                      <span className="value">{selectedDonor.bloodType || 'Not determined yet'}</span>
                    </div>
                    {selectedDonor.hemoglobin && (
                      <div className="detail-row">
                        <span className="label">Last Hemoglobin:</span>
                        <span className="value">{selectedDonor.hemoglobin}</span>
                      </div>
                    )}
                    {selectedDonor.bloodPressure && (
                      <div className="detail-row">
                        <span className="label">Last Blood Pressure:</span>
                        <span className="value">{selectedDonor.bloodPressure}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="label">Last Donation:</span>
                      <span className="value">{formatDate(selectedDonor.lastDonation)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Total Donations:</span>
                      <span className="value highlight">{selectedDonor.totalDonations}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Status:</span>
                      <span className={`status-badge ${getStatusClass(selectedDonor.status)}`}>
                        {selectedDonor.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {isEditing ? (
                <>
                  <button className="btn-secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button className="btn-primary" onClick={handleSaveChanges}>
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-secondary" onClick={() => setSelectedDonor(null)}>
                    Close
                  </button>
                  <button className="btn-primary" onClick={() => setIsEditing(true)}>
                    Edit Health Info
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonorSearch;

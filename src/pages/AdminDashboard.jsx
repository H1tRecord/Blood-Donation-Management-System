import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { users } from '../data';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { currentUser, resetSessionTimeout } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', role: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    resetSessionTimeout();
    loadAccounts();
  }, []);

  const loadAccounts = () => {
    setAccounts([...users]);
  };

  // Sorting
  const handleSort = (field) => {
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

  // Filtering & searching
  const filteredAccounts = accounts
    .filter(user => {
      if (filterRole !== 'all' && user.role !== filterRole) return false;
      if (filterStatus === 'active' && !user.isActive) return false;
      if (filterStatus === 'inactive' && user.isActive) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          user.id.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'name':
          return dir * a.name.localeCompare(b.name);
        case 'email':
          return dir * a.email.localeCompare(b.email);
        case 'role':
          return dir * a.role.localeCompare(b.role);
        case 'registered':
          return dir * (new Date(a.registrationDate) - new Date(b.registrationDate));
        default:
          return 0;
      }
    });

  // Stats
  const totalDonors = accounts.filter(u => u.role === 'donor').length;
  const totalStaff = accounts.filter(u => u.role === 'staff').length;
  const totalAdmins = accounts.filter(u => u.role === 'admin').length;
  const activeAccounts = accounts.filter(u => u.isActive).length;

  // Toggle active status
  const handleToggleStatus = (userId) => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].isActive = !users[userIndex].isActive;
      loadAccounts();
      showToast(`Account ${users[userIndex].isActive ? 'activated' : 'deactivated'} successfully`);
    }
  };

  // Edit user
  const handleStartEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
  };

  const handleSaveEdit = () => {
    if (!editForm.name || !editForm.email || !editForm.phone) {
      alert('All fields are required');
      return;
    }

    const userIndex = users.findIndex(u => u.id === editingUser.id);
    if (userIndex !== -1) {
      users[userIndex].name = editForm.name;
      users[userIndex].email = editForm.email;
      users[userIndex].phone = editForm.phone;
      // Don't allow changing own role or the last admin's role
      if (editingUser.id !== currentUser.id) {
        users[userIndex].role = editForm.role;
      }
      loadAccounts();
      setEditingUser(null);
      showToast('Account updated successfully');
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  // Delete user
  const handleDeleteUser = (userId) => {
    if (userId === currentUser.id) {
      alert('You cannot delete your own account');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      return;
    }

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users.splice(userIndex, 1);
      loadAccounts();
      showToast('Account deleted successfully');
    }
  };

  const showToast = (msg) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <div>
          <h1>Account Management</h1>
          <p className="admin-subtitle">Manage all user accounts in the system</p>
        </div>
      </div>

      {showSuccess && (
        <div className="success-banner">
          {successMessage}
        </div>
      )}

      {/* Stats Row */}
      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <span className="admin-stat-value">{accounts.length}</span>
          <span className="admin-stat-label">Total Accounts</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{totalDonors}</span>
          <span className="admin-stat-label">Donors</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{totalStaff}</span>
          <span className="admin-stat-label">Staff</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{totalAdmins}</span>
          <span className="admin-stat-label">Admins</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{activeAccounts}</span>
          <span className="admin-stat-label">Active</span>
        </div>
      </div>

      {/* Filters */}
      <div className="card admin-filters-card">
        <div className="admin-filters">
          <div className="admin-filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>
          <div className="admin-filter-group">
            <label>Role</label>
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="donor">Donors</option>
              <option value="staff">Staff</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <div className="admin-filter-group">
            <label>Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="card admin-table-card">
        <div className="admin-table-header-row">
          <h2>Accounts ({filteredAccounts.length})</h2>
        </div>

        <div className="admin-table-wrapper">
          <div className="admin-table">
            <div className="admin-table-head">
              <div className="admin-col-id">ID</div>
              <div className="admin-col-name sortable" onClick={() => handleSort('name')}>
                Name{getSortIndicator('name')}
              </div>
              <div className="admin-col-email sortable" onClick={() => handleSort('email')}>
                Email{getSortIndicator('email')}
              </div>
              <div className="admin-col-phone">Phone</div>
              <div className="admin-col-role sortable" onClick={() => handleSort('role')}>
                Role{getSortIndicator('role')}
              </div>
              <div className="admin-col-registered sortable" onClick={() => handleSort('registered')}>
                Registered{getSortIndicator('registered')}
              </div>
              <div className="admin-col-status">Status</div>
              <div className="admin-col-actions">Actions</div>
            </div>

            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((user) => (
                <div key={user.id} className={`admin-table-row ${!user.isActive ? 'inactive-row' : ''}`}>
                  <div className="admin-col-id">
                    <span className="admin-user-id">{user.id}</span>
                  </div>
                  <div className="admin-col-name">
                    <span className="admin-user-name">{user.name}</span>
                    {user.role === 'donor' && user.bloodType && (
                      <span className="blood-type-badge admin-bt">{user.bloodType}</span>
                    )}
                  </div>
                  <div className="admin-col-email">{user.email}</div>
                  <div className="admin-col-phone">{user.phone}</div>
                  <div className="admin-col-role">
                    <span className={`admin-role-tag ${user.role}`}>{user.role}</span>
                  </div>
                  <div className="admin-col-registered">
                    {new Date(user.registrationDate).toLocaleDateString()}
                  </div>
                  <div className="admin-col-status">
                    <span className={`admin-status-dot ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="admin-col-actions">
                    <button
                      className="admin-action-btn edit"
                      onClick={() => handleStartEdit(user)}
                      title="Edit account"
                    >
                      Edit
                    </button>
                    <button
                      className={`admin-action-btn ${user.isActive ? 'deactivate' : 'activate'}`}
                      onClick={() => handleToggleStatus(user.id)}
                      title={user.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {user.isActive ? 'Disable' : 'Enable'}
                    </button>
                    {user.id !== currentUser.id && (
                      <button
                        className="admin-action-btn delete"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete account"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-empty-row">
                <p>No accounts match your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Edit Account</h2>
              <button className="close-btn" onClick={handleCancelEdit}>×</button>
            </div>
            <div className="modal-content">
              <div className="admin-edit-id">
                <span className="admin-edit-id-label">Account ID:</span>
                <span className="admin-edit-id-value">{editingUser.id}</span>
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>

              {editingUser.id !== currentUser.id && (
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  >
                    <option value="donor">Donor</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}

              <div className="modal-actions">
                <button className="btn-secondary" onClick={handleCancelEdit}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSaveEdit}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

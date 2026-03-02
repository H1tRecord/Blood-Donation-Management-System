import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers, updateUserInDB, deleteUserFromDB } from '../data/db';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { currentUser, resetSessionTimeout, adminCreateAccount } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  // Create-account modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    role: 'staff', name: '', email: '', password: '', confirmPassword: '',
  });
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    resetSessionTimeout();
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const all = await getUsers();
    setAccounts(all);
  };

  // Reset page when filters/search/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterRole, filterStatus, sortField, sortDirection]);

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
          user.uid.toLowerCase().includes(q)
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

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / PAGE_SIZE));
  const pagedAccounts = filteredAccounts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Stats
  const totalDonors = accounts.filter(u => u.role === 'donor').length;
  const totalStaff = accounts.filter(u => u.role === 'staff').length;
  const totalAdmins = accounts.filter(u => u.role === 'admin').length;
  const activeAccounts = accounts.filter(u => u.isActive).length;

  // Toggle active status
  const handleToggleStatus = async (userUid) => {
    const target = accounts.find(u => u.uid === userUid);
    if (!target) return;
    const newStatus = !target.isActive;
    await updateUserInDB(userUid, { isActive: newStatus });
    await loadAccounts();
    showToast(`Account ${newStatus ? 'activated' : 'deactivated'} successfully`);
  };

  // Edit user
  const handleStartEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.name || !editForm.email) {
      alert('All fields are required');
      return;
    }
    const updates = {
      name: editForm.name,
      email: editForm.email,
    };
    if (editingUser.uid !== currentUser.uid) {
      updates.role = editForm.role;
    }
    await updateUserInDB(editingUser.uid, updates);
    await loadAccounts();
    setEditingUser(null);
    showToast('Account updated successfully');
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  // Delete user
  const handleDeleteUser = async (userUid) => {
    if (userUid === currentUser.uid) {
      alert('You cannot delete your own account');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      return;
    }
    await deleteUserFromDB(userUid);
    await loadAccounts();
    showToast('Account deleted successfully');
  };

  const showToast = (msg) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Create account
  const openCreateModal = () => {
    setCreateForm({ role: 'staff', name: '', email: '', password: '', confirmPassword: '' });
    setCreateError('');
    setShowCreateModal(true);
  };

  const handleCreateAccount = async () => {
    setCreateError('');
    const { name, email, password, confirmPassword, role } = createForm;

    if (!name || !email || !password || !confirmPassword) {
      setCreateError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setCreateError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setCreateError('Passwords do not match.');
      return;
    }

    setCreateLoading(true);
    const result = await adminCreateAccount({ role, name, email, password });
    setCreateLoading(false);

    if (result.success) {
      setShowCreateModal(false);
      await loadAccounts();
      showToast(result.message);
    } else {
      setCreateError(result.message);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <div>
          <h1>Account Management</h1>
          <p className="admin-subtitle">Manage all user accounts in the system</p>
        </div>
        <button className="btn-create-account" onClick={openCreateModal}>
          + Create Account
        </button>
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
              <div className="admin-col-role sortable" onClick={() => handleSort('role')}>
                Role{getSortIndicator('role')}
              </div>
              <div className="admin-col-registered sortable" onClick={() => handleSort('registered')}>
                Registered{getSortIndicator('registered')}
              </div>
              <div className="admin-col-status">Status</div>
              <div className="admin-col-actions">Actions</div>
            </div>

            {pagedAccounts.length > 0 ? (
              pagedAccounts.map((user) => (
                <div key={user.uid} className={`admin-table-row ${!user.isActive ? 'inactive-row' : ''}`}>
                  <div className="admin-col-id">
                    <span className="admin-user-id" title={user.uid}>{user.uid.slice(0, 8)}…</span>
                  </div>
                  <div className="admin-col-name">
                    <span className="admin-user-name">{user.name}</span>
                    {user.role === 'donor' && user.bloodType && (
                      <span className="blood-type-badge admin-bt">{user.bloodType}</span>
                    )}
                  </div>
                  <div className="admin-col-email">{user.email}</div>
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
                      onClick={() => handleToggleStatus(user.uid)}
                      title={user.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {user.isActive ? 'Disable' : 'Enable'}
                    </button>
                    {user.uid !== currentUser.uid && (
                      <button
                        className="admin-action-btn delete"
                        onClick={() => handleDeleteUser(user.uid)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-pagination">
            <button
              className="admin-page-btn"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ‹ Prev
            </button>

            <div className="admin-page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="admin-page-ellipsis">…</span>
                  ) : (
                    <button
                      key={p}
                      className={`admin-page-num${currentPage === p ? ' active' : ''}`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}
            </div>

            <button
              className="admin-page-btn"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next ›
            </button>

            <span className="admin-page-info">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredAccounts.length)} of {filteredAccounts.length}
            </span>
          </div>
        )}
      </div>

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Create Account</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="modal-content">

              {createError && (
                <div className="create-modal-error">{createError}</div>
              )}

              <div className="form-group">
                <label>Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Nurse Williams"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. nurse.williams@bdms.org"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={createForm.confirmPassword}
                  onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowCreateModal(false)} disabled={createLoading}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleCreateAccount} disabled={createLoading}>
                  {createLoading ? 'Creating…' : 'Create Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <span className="admin-edit-id-label">Firebase UID:</span>
                <span className="admin-edit-id-value">{editingUser.uid}</span>
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

              {editingUser.uid !== currentUser.uid && (
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

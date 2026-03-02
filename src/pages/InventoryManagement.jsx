import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getInventoryStatus,
  getInventoryColor
} from '../data';
import { getBloodInventory, setInventoryItem } from '../data/db';
import './InventoryManagement.css';

// ─── Expiry helpers ───────────────────────────────────────────────────────────

/** Returns the number of days from today until `expirationDate`.
 *  Negative = already expired, 0 = expires today, positive = days remaining */
const getDaysUntilExpiry = (expirationDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expirationDate + 'T00:00:00');
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

/** Scans all batches, purges expired ones, recalculates totals, and returns
 *  an `alerts` list for batches expiring within 7 days. */
const processExpiryData = (inventoryData) => {
  const expired = [];
  const alerts  = [];

  const updatedInventory = inventoryData.map((item) => {
    const cloned = {
      ...item,
      batches: (item.batches || []).map((b) => ({ ...b })),
    };

    const validBatches = [];
    cloned.batches.forEach((batch) => {
      const days = getDaysUntilExpiry(batch.expirationDate);
      if (days <= 0) {
        expired.push({ type: cloned.type, units: batch.units, expirationDate: batch.expirationDate, days });
      } else {
        validBatches.push(batch);
        if (days <= 7) {
          alerts.push({
            type: cloned.type,
            units: batch.units,
            expirationDate: batch.expirationDate,
            daysUntilExpiry: days,
          });
        }
      }
    });

    cloned.batches = validBatches;
    cloned.units   = validBatches.reduce((sum, b) => sum + b.units, 0);

    // Nearest non-expired batch becomes the headline expiration date
    if (validBatches.length > 0) {
      const sorted = [...validBatches].sort(
        (a, b) => new Date(a.expirationDate) - new Date(b.expirationDate)
      );
      cloned.expirationDate = sorted[0].expirationDate;
    }

    return cloned;
  });

  alerts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  return { updatedInventory, expired, alerts };
};

/** Urgency level based on days remaining */
const getExpiryLevel = (days) => {
  if (days <= 1) return 'critical';
  if (days <= 3) return 'warning';
  return 'caution';
};

// ─── Component ───────────────────────────────────────────────────────────────

const InventoryManagement = () => {
  const { currentUser, resetSessionTimeout } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [action, setAction] = useState('add'); // 'add' or 'remove'
  const [quantity, setQuantity] = useState(1);
  const [expirationDate, setExpirationDate] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [sortField, setSortField] = useState('type');
  const [sortDirection, setSortDirection] = useState('asc');
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [autoExpiredUnits, setAutoExpiredUnits] = useState([]);

  useEffect(() => {
    resetSessionTimeout();
    loadInventory();
  }, []);

  const loadInventory = async () => {
    const rawInventory = await getBloodInventory();
    const { updatedInventory, expired, alerts } = processExpiryData(rawInventory);

    // Write back any items that had expired batches removed
    const writePromises = updatedInventory
      .filter((updItem) => expired.some((e) => e.type === updItem.type))
      .map((updItem) => setInventoryItem(updItem.type, {
        ...updItem,
        lastUpdated: new Date().toISOString().split('T')[0],
      }));
    await Promise.all(writePromises);

    setInventory(updatedInventory);
    setExpiryAlerts(alerts);
    setAutoExpiredUnits(expired);
  };

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

  const sortedInventory = [...inventory].sort((a, b) => {
    const dir = sortDirection === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'type':
        return dir * a.type.localeCompare(b.type);
      case 'units':
        return dir * (a.units - b.units);
      case 'status': {
        const statusOrder = (units) => units >= 20 ? 3 : units >= 10 ? 2 : 1;
        return dir * (statusOrder(a.units) - statusOrder(b.units));
      }
      case 'expiration':
        return dir * (new Date(a.expirationDate) - new Date(b.expirationDate));
      case 'updated':
        return dir * (new Date(a.lastUpdated) - new Date(b.lastUpdated));
      default:
        return 0;
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedType || quantity < 1) {
      alert('Please select a blood type and enter a valid quantity');
      return;
    }

    // Find item in current state (deep clone to avoid mutating state directly)
    const inventoryItem = JSON.parse(JSON.stringify(
      inventory.find(item => item.type === selectedType)
    ));

    if (!inventoryItem) {
      alert('Blood type not found');
      return;
    }

    if (action === 'add') {
      if (!expirationDate) {
        alert('Please enter an expiration date for new units');
        return;
      }
      inventoryItem.batches = inventoryItem.batches || [];
      inventoryItem.batches.push({ units: quantity, expirationDate });
      inventoryItem.units += quantity;
      inventoryItem.lastUpdated = new Date().toISOString().split('T')[0];
      const sorted = [...inventoryItem.batches].sort(
        (a, b) => new Date(a.expirationDate) - new Date(b.expirationDate)
      );
      inventoryItem.expirationDate = sorted[0].expirationDate;
      setSuccessMessage(`Successfully added ${quantity} unit(s) of ${selectedType}`);
    } else {
      if (inventoryItem.units < quantity) {
        alert(`Cannot remove ${quantity} units. Only ${inventoryItem.units} units available.`);
        return;
      }
      let remaining = quantity;
      const batches = [...(inventoryItem.batches || [])].sort(
        (a, b) => new Date(a.expirationDate) - new Date(b.expirationDate)
      );
      for (const batch of batches) {
        if (remaining <= 0) break;
        const deduct = Math.min(batch.units, remaining);
        batch.units -= deduct;
        remaining  -= deduct;
      }
      inventoryItem.batches = batches.filter(b => b.units > 0);
      inventoryItem.units -= quantity;
      inventoryItem.lastUpdated = new Date().toISOString().split('T')[0];
      if (inventoryItem.batches.length > 0) {
        inventoryItem.expirationDate = inventoryItem.batches[0].expirationDate;
      }
      setSuccessMessage(`Successfully removed ${quantity} unit(s) of ${selectedType}`);
    }

    await setInventoryItem(selectedType, inventoryItem);
    await loadInventory();

    setShowSuccess(true);
    setSelectedType('');
    setQuantity(1);
    setExpirationDate('');
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getMinExpirationDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  };

  const getMaxExpirationDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 42); // Blood typically lasts 42 days
    return maxDate.toISOString().split('T')[0];
  };

  /**
   * Renders the full expiration cell content:
   * - nearest expiry date (or "—")
   * - one line per batch expiring ≤ 7 days: colored dot + "X units · N days"
   * - if any units were auto-removed for this type: a removed notice
   */
  const renderExpiryCell = (item) => {
    const removedForType = autoExpiredUnits.filter((e) => e.type === item.type);
    const expiringBatches = (item.batches || [])
      .map((b) => ({ ...b, daysUntilExpiry: getDaysUntilExpiry(b.expirationDate) }))
      .filter((b) => b.daysUntilExpiry <= 7)
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    const dateLabel = item.batches && item.batches.length > 0
      ? new Date(item.expirationDate + 'T00:00:00').toLocaleDateString()
      : '—';

    return (
      <div className="expiry-cell">
        <span className="expiry-date">{dateLabel}</span>
        {expiringBatches.map((b, idx) => {
          const level = getExpiryLevel(b.daysUntilExpiry);
          const dayLabel =
            b.daysUntilExpiry === 1 ? '1 day' : `${b.daysUntilExpiry} days`;
          return (
            <span key={idx} className={`expiry-line ${level}`}>
              <span className={`expiry-dot ${level}`}></span>
              {b.units} unit{b.units !== 1 ? 's' : ''} · {dayLabel}
            </span>
          );
        })}
        {removedForType.map((e, idx) => (
          <span key={`rm-${idx}`} className="expiry-line removed">
            <span className="expiry-dot expired"></span>
            {e.units} unit{e.units !== 1 ? 's' : ''} removed
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="inventory-management">
      <div className="page-header">
        <h1>Blood Inventory Management</h1>
        <p className="subtitle">Manage blood stock levels and track inventory</p>
      </div>

      {showSuccess && (
        <div className="success-banner">
          {successMessage}
        </div>
      )}

      <div className="inventory-content">
        {/* Current Inventory Display */}
        <div className="card inventory-display-card">
          <h2>Current Inventory</h2>
          <div className="inventory-table">
            <div className="table-header">
              <div className="col-type sortable" onClick={() => handleSort('type')}>
                Blood Type{getSortIndicator('type')}
              </div>
              <div className="col-units sortable" onClick={() => handleSort('units')}>
                Units{getSortIndicator('units')}
              </div>
              <div className="col-status sortable" onClick={() => handleSort('status')}>
                Status{getSortIndicator('status')}
              </div>
              <div className="col-expiration sortable" onClick={() => handleSort('expiration')}>
                Expiration{getSortIndicator('expiration')}
              </div>
              <div className="col-updated sortable" onClick={() => handleSort('updated')}>
                Last Updated{getSortIndicator('updated')}
              </div>
            </div>
            {sortedInventory.map((item) => {
              const status = getInventoryStatus(item.units);
              const color  = getInventoryColor(item.units);
              return (
                <div key={item.type} className={`table-row ${color}`}>
                  <div className="col-type">
                    <span className="blood-type-badge">{item.type}</span>
                  </div>
                  <div className="col-units">
                    <span className="units-number">{item.units}</span>
                  </div>
                  <div className="col-status">
                    <span className={`status-badge ${status}`}>
                      {status.toUpperCase()}
                    </span>
                  </div>
                  <div className="col-expiration">
                    {renderExpiryCell(item)}
                  </div>
                  <div className="col-updated">
                    {new Date(item.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="inventory-legend">
            <div className="legend-item">
              <span className="legend-color green"></span>
              <span>Adequate (20+ units)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color yellow"></span>
              <span>Low (10-19 units)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color red"></span>
              <span>Critical (&lt;10 units)</span>
            </div>
          </div>
        </div>

        {/* Update Inventory Form */}
        <div className="card inventory-form-card">
          <h2>Update Inventory</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="action">Action *</label>
              <select
                id="action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                required
              >
                <option value="add">Add Units</option>
                <option value="remove">Remove Units</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="bloodType">Blood Type *</label>
              <select
                id="bloodType"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                required
              >
                <option value="">Select blood type</option>
                {inventory.map((item) => (
                  <option key={item.type} value={item.type}>
                    {item.type} (Currently: {item.units} units)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity (units) *</label>
              <input
                type="number"
                id="quantity"
                min="1"
                max="50"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                required
              />
            </div>

            {action === 'add' && (
              <div className="form-group">
                <label htmlFor="expirationDate">Expiration Date *</label>
                <input
                  type="date"
                  id="expirationDate"
                  min={getMinExpirationDate()}
                  max={getMaxExpirationDate()}
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  required
                />
                <small>Blood units typically expire within 42 days</small>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {action === 'add' ? 'Add Units' : 'Remove Units'}
              </button>
            </div>
          </form>

          <div className="form-info">
            <h3>Inventory Management Guidelines</h3>
            <ul>
              <li>
                <strong>Adding Units:</strong> Each addition is tracked as a separate batch with its own expiry date
              </li>
              <li>
                <strong>Removing Units:</strong> Units are deducted from the oldest (nearest-expiry) batch first
              </li>
              <li>
                <strong>Auto-Expiry:</strong> Expired batches are automatically removed from inventory on each page load
              </li>
              <li>
                <strong>Status Levels:</strong>
                <ul>
                  <li>Adequate: 20 or more units</li>
                  <li>Low: 10-19 units (consider requesting donations)</li>
                  <li>Critical: Less than 10 units (urgent action required)</li>
                </ul>
              </li>
              <li>All changes are logged with staff ID and timestamp</li>
            </ul>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="card inventory-stats-card">
          <h2>Inventory Statistics</h2>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-value">
                {inventory.reduce((sum, item) => sum + item.units, 0)}
              </div>
              <div className="stat-label">Total Units</div>
            </div>
            <div className="stat-box adequate">
              <div className="stat-value">
                {inventory.filter(item => item.units >= 20).length}
              </div>
              <div className="stat-label">Adequate Types</div>
            </div>
            <div className="stat-box low">
              <div className="stat-value">
                {inventory.filter(item => item.units >= 10 && item.units < 20).length}
              </div>
              <div className="stat-label">Low Types</div>
            </div>
            <div className="stat-box critical">
              <div className="stat-value">
                {inventory.filter(item => item.units < 10).length}
              </div>
              <div className="stat-label">Critical Types</div>
            </div>
            <div className="stat-box expiring-soon">
              <div className="stat-value">
                {expiryAlerts.length}
              </div>
              <div className="stat-label">Expiry Alerts</div>
            </div>
            <div className="stat-box expired-removed">
              <div className="stat-value">
                {autoExpiredUnits.reduce((sum, e) => sum + e.units, 0)}
              </div>
              <div className="stat-label">Units Expired Today</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;

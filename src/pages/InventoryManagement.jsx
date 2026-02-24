import { useState } from 'react';
import { mockBloodInventory } from '../data/mockData';

function InventoryManagement() {
  const [inventory, setInventory] = useState(mockBloodInventory);
  const [selectedType, setSelectedType] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addUnits, setAddUnits] = useState(1);

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return '#dc3545';
      case 'low': return '#ffc107';
      case 'adequate': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'critical': return 'Critical - Urgent Need';
      case 'low': return 'Low Stock';
      case 'adequate': return 'Adequate Supply';
      default: return 'Unknown';
    }
  };

  const handleAddUnits = () => {
    if (selectedType) {
      setInventory(prev => prev.map(item => {
        if (item.bloodType === selectedType.bloodType) {
          const newUnits = item.units + addUnits;
          let newStatus = 'adequate';
          if (newUnits < 10) newStatus = 'critical';
          else if (newUnits < 20) newStatus = 'low';
          return { ...item, units: newUnits, status: newStatus };
        }
        return item;
      }));
      setShowAddModal(false);
      setAddUnits(1);
      setSelectedType(null);
    }
  };

  const getTotalUnits = () => inventory.reduce((sum, item) => sum + item.units, 0);
  const getExpiringUnits = () => inventory.reduce((sum, item) => sum + item.expiringIn7Days, 0);

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1>Blood Inventory Management</h1>
        <p>Track and manage blood units from collection to distribution</p>
      </div>

      {/* Summary Stats */}
      <div className="inventory-stats">
        <div className="stat-box">
          <span className="stat-number">{getTotalUnits()}</span>
          <span className="stat-text">Total Units</span>
        </div>
        <div className="stat-box warning">
          <span className="stat-number">{getExpiringUnits()}</span>
          <span className="stat-text">Expiring in 7 Days</span>
        </div>
        <div className="stat-box danger">
          <span className="stat-number">{inventory.filter(i => i.status === 'critical').length}</span>
          <span className="stat-text">Critical Types</span>
        </div>
        <div className="stat-box success">
          <span className="stat-number">{inventory.filter(i => i.status === 'adequate').length}</span>
          <span className="stat-text">Adequate Types</span>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="inventory-control-grid">
        {inventory.map((item) => (
          <div 
            key={item.bloodType} 
            className={`blood-type-card ${item.status}`}
            onClick={() => { setSelectedType(item); setShowAddModal(true); }}
          >
            <div className="blood-type-header">
              <span className="type-label">{item.bloodType}</span>
              <span 
                className="status-dot"
                style={{ backgroundColor: getStatusColor(item.status) }}
              ></span>
            </div>
            <div className="blood-type-body">
              <div className="units-display">
                <span className="units-number">{item.units}</span>
                <span className="units-label">units</span>
              </div>
              <div className="blood-type-bar">
                <div 
                  className="bar-fill"
                  style={{ 
                    width: `${Math.min((item.units / 60) * 100, 100)}%`,
                    backgroundColor: getStatusColor(item.status)
                  }}
                ></div>
              </div>
            </div>
            <div className="blood-type-footer">
              <span className={`status-text ${item.status}`}>
                {getStatusLabel(item.status)}
              </span>
              {item.expiringIn7Days > 0 && (
                <span className="expiring-badge">
                  ⚠️ {item.expiringIn7Days} expiring soon
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Units Modal */}
      {showAddModal && selectedType && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Blood Units - {selectedType.bloodType}</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="current-stock">
                <span>Current Stock:</span>
                <strong>{selectedType.units} units</strong>
              </div>
              <div className="form-group">
                <label>Units to Add:</label>
                <div className="units-input">
                  <button 
                    onClick={() => setAddUnits(Math.max(1, addUnits - 1))}
                    className="unit-btn"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={addUnits} 
                    onChange={(e) => setAddUnits(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                  />
                  <button 
                    onClick={() => setAddUnits(addUnits + 1)}
                    className="unit-btn"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="new-total">
                <span>New Total:</span>
                <strong>{selectedType.units + addUnits} units</strong>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAddUnits}>
                Add Units
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="inventory-legend">
        <h3>Stock Level Legend</h3>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#dc3545' }}></span>
            <span>Critical (&lt;10 units)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#ffc107' }}></span>
            <span>Low (10-19 units)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#28a745' }}></span>
            <span>Adequate (20+ units)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryManagement;

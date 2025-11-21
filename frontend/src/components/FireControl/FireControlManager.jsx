import React, { useState, useEffect } from 'react';
import fireControlService from '../../services/fireControlService';
import FieldOfFireConfig from './FieldOfFireConfig';
import '../../styles/components/FireControlManager.css';

const FireControlManager = ({ units, onClose, onUnitUpdate }) => {
  const [activeTab, setActiveTab] = useState('field-of-fire'); // field-of-fire, fire-missions
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [fireMissions, setFireMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFieldOfFireConfig, setShowFieldOfFireConfig] = useState(false);

  useEffect(() => {
    loadFireMissions();
  }, []);

  const loadFireMissions = async () => {
    try {
      setLoading(true);
      const missions = await fireControlService.getUserFireMissions();
      setFireMissions(missions);
    } catch (error) {
      console.error('Failed to load fire missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
    setShowFieldOfFireConfig(true);
  };

  const handleFieldOfFireUpdate = (updatedUnit) => {
    onUnitUpdate(updatedUnit);
    setShowFieldOfFireConfig(false);
    setSelectedUnit(null);
  };

  const handleDeleteFireMission = async (missionId) => {
    if (!confirm('Are you sure you want to delete this fire mission?')) return;

    try {
      await fireControlService.deleteFireMission(missionId);
      loadFireMissions();
    } catch (error) {
      alert('Failed to delete fire mission');
    }
  };

  const handleUpdateFireMissionStatus = async (missionId, status) => {
    try {
      await fireControlService.updateFireMissionStatus(missionId, status);
      loadFireMissions();
    } catch (error) {
      alert('Failed to update fire mission status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PLANNED': '#4a9eff',
      'READY': '#ffaa00',
      'FIRING': '#ff0000',
      'COMPLETE': '#4caf50',
      'CANCELLED': '#888'
    };
    return colors[status] || '#888';
  };

  return (
    <div className="fire-control-overlay">
      <div className="fire-control-modal">
        <div className="fire-control-header">
          <h2>🎯 Fire Control Manager</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="fire-control-tabs">
          <button
            className={activeTab === 'field-of-fire' ? 'active' : ''}
            onClick={() => setActiveTab('field-of-fire')}
          >
            🎯 Fields of Fire
          </button>
          <button
            className={activeTab === 'fire-missions' ? 'active' : ''}
            onClick={() => setActiveTab('fire-missions')}
          >
            💥 Fire Missions
          </button>
        </div>

        <div className="fire-control-content">
          {activeTab === 'field-of-fire' && (
            <div className="field-of-fire-panel">
              {!showFieldOfFireConfig ? (
                <>
                  <div className="panel-header">
                    <h3>Configure Unit Fields of Fire</h3>
                    <p>Select a unit to define its sector of fire</p>
                  </div>

                  <div className="unit-list">
                    {units.filter(u => u.faction === 'BLUE_FORCE').map(unit => (
                      <div key={unit.id} className="unit-item">
                        <div className="unit-info">
                          <strong>{unit.unitType} ({unit.unitRank || 'N/A'})</strong>
                          <div className="unit-details">
                            Position: {unit.position?.latitude.toFixed(4)}, {unit.position?.longitude.toFixed(4)}
                          </div>
                          {unit.fieldOfFire && (
                            <div className="field-of-fire-badge">
                              ✓ Field of Fire Set ({unit.fieldOfFire.priority})
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleUnitSelect(unit)}
                          className="btn-configure"
                        >
                          {unit.fieldOfFire ? '⚙️ Edit' : '➕ Set'}
                        </button>
                      </div>
                    ))}
                    {units.filter(u => u.faction === 'BLUE_FORCE').length === 0 && (
                      <div className="empty-state">
                        No friendly units available. Place units on the map first.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <FieldOfFireConfig
                  unit={selectedUnit}
                  onUpdate={handleFieldOfFireUpdate}
                  onClose={() => {
                    setShowFieldOfFireConfig(false);
                    setSelectedUnit(null);
                  }}
                />
              )}
            </div>
          )}

          {activeTab === 'fire-missions' && (
            <div className="fire-missions-panel">
              <div className="panel-header">
                <h3>Artillery Fire Missions</h3>
                <p>Manage fire support requests</p>
              </div>

              {loading ? (
                <div className="loading">Loading fire missions...</div>
              ) : fireMissions.length === 0 ? (
                <div className="empty-state">
                  <p>No fire missions planned</p>
                  <p>Create fire missions through artillery units on the map</p>
                </div>
              ) : (
                <div className="missions-list">
                  {fireMissions.map(mission => (
                    <div key={mission.id} className="mission-item">
                      <div className="mission-header">
                        <h4>🎯 {mission.callSign || `Mission ${mission.id.substring(0, 8)}`}</h4>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(mission.status) }}
                        >
                          {mission.status}
                        </span>
                      </div>

                      <div className="mission-details">
                        <div className="detail-row">
                          <span className="label">Type:</span>
                          <span>{mission.missionType}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Priority:</span>
                          <span>{mission.priority}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Method:</span>
                          <span>{mission.methodOfFire}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Rounds:</span>
                          <span>{mission.roundsFired} / {mission.roundsAllocated}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Target Radius:</span>
                          <span>{mission.targetRadius}m</span>
                        </div>
                        {mission.description && (
                          <div className="detail-row">
                            <span className="label">Notes:</span>
                            <span>{mission.description}</span>
                          </div>
                        )}
                      </div>

                      <div className="mission-actions">
                        {mission.status === 'PLANNED' && (
                          <button
                            onClick={() => handleUpdateFireMissionStatus(mission.id, 'READY')}
                            className="btn-ready"
                          >
                            ✅ Ready
                          </button>
                        )}
                        {mission.status === 'READY' && (
                          <button
                            onClick={() => handleUpdateFireMissionStatus(mission.id, 'FIRING')}
                            className="btn-fire"
                          >
                            🔥 Execute
                          </button>
                        )}
                        {mission.status === 'FIRING' && (
                          <button
                            onClick={() => handleUpdateFireMissionStatus(mission.id, 'COMPLETE')}
                            className="btn-complete"
                          >
                            ✓ Complete
                          </button>
                        )}
                        {['PLANNED', 'READY'].includes(mission.status) && (
                          <button
                            onClick={() => handleUpdateFireMissionStatus(mission.id, 'CANCELLED')}
                            className="btn-cancel-mission"
                          >
                            ❌ Cancel
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteFireMission(mission.id)}
                          className="btn-delete"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FireControlManager;

import React, { useState, useEffect } from 'react';
import './BattleStatsDashboard.css';

const BattleStatsDashboard = ({ units, isVisible, onClose }) => {
  const [stats, setStats] = useState({
    blueForce: { units: 0, personnel: 0, vehicles: 0, casualties: 0, vehicleLosses: 0 },
    redForce: { units: 0, personnel: 0, vehicles: 0, casualties: 0, vehicleLosses: 0 },
    initialBlue: null,
    initialRed: null
  });

  const [battleEvents, setBattleEvents] = useState([]);

  useEffect(() => {
    if (!units || units.length === 0) return;

    const blueUnits = units.filter(u => u.faction === 'BLUE_FORCE');
    const redUnits = units.filter(u => u.faction === 'RED_FORCE');

    const calculateStats = (unitsList, faction) => {
      return {
        units: unitsList.length,
        personnel: unitsList.reduce((sum, u) => sum + (u.personnel || 0), 0),
        vehicles: unitsList.reduce((sum, u) => sum + (u.vehicles || 0), 0),
        firepower: unitsList.reduce((sum, u) => sum + (u.firepower || 0), 0),
        avgMorale: unitsList.length > 0
          ? (unitsList.reduce((sum, u) => sum + (u.morale || 0), 0) / unitsList.length).toFixed(1)
          : 0,
        avgSupply: unitsList.length > 0
          ? (unitsList.reduce((sum, u) => sum + (u.supplyLevel || 0), 0) / unitsList.length).toFixed(1)
          : 0
      };
    };

    const currentBlue = calculateStats(blueUnits, 'BLUE_FORCE');
    const currentRed = calculateStats(redUnits, 'RED_FORCE');

    // Store initial values if not set
    if (!stats.initialBlue) {
      setStats(prev => ({
        ...prev,
        initialBlue: currentBlue,
        initialRed: currentRed,
        blueForce: currentBlue,
        redForce: currentRed
      }));
    } else {
      // Calculate casualties
      const blueCasualties = stats.initialBlue.personnel - currentBlue.personnel;
      const redCasualties = stats.initialRed.personnel - currentRed.personnel;
      const blueVehicleLosses = stats.initialBlue.vehicles - currentBlue.vehicles;
      const redVehicleLosses = stats.initialRed.vehicles - currentRed.vehicles;

      setStats(prev => ({
        ...prev,
        blueForce: { ...currentBlue, casualties: blueCasualties, vehicleLosses: blueVehicleLosses },
        redForce: { ...currentRed, casualties: redCasualties, vehicleLosses: redVehicleLosses }
      }));

      // Check for significant events
      if (blueCasualties > 0 && blueCasualties !== prev.blueForce.casualties) {
        addBattleEvent(`Blue Force casualties: ${blueCasualties}`, 'blue-damage');
      }
      if (redCasualties > 0 && redCasualties !== prev.redForce.casualties) {
        addBattleEvent(`Red Force casualties: ${redCasualties}`, 'red-damage');
      }
    }
  }, [units]);

  const addBattleEvent = (message, type) => {
    const event = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setBattleEvents(prev => [event, ...prev].slice(0, 10)); // Keep last 10 events
  };

  const getCasualtyRate = (casualties, initial) => {
    if (!initial || initial === 0) return 0;
    return ((casualties / initial) * 100).toFixed(1);
  };

  const getStatusColor = (casualties, initial) => {
    const rate = getCasualtyRate(casualties, initial);
    if (rate < 10) return 'status-good';
    if (rate < 30) return 'status-warning';
    return 'status-critical';
  };

  if (!isVisible) return null;

  const { blueForce, redForce, initialBlue, initialRed } = stats;

  return (
    <div className="battle-stats-dashboard">
      <div className="stats-header">
        <h2>⚔️ Battle Statistics</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="force-comparison">
        <div className="force-panel blue-force-panel">
          <div className="force-header">
            <h3>🔵 BLUE FORCE</h3>
            <span className="force-status">Defending</span>
          </div>
          <div className="force-stats">
            <div className="stat-item">
              <span className="stat-label">Units:</span>
              <span className="stat-value">{blueForce.units}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Personnel:</span>
              <span className="stat-value">
                {blueForce.personnel}
                {blueForce.casualties > 0 && (
                  <span className="casualties"> (-{blueForce.casualties})</span>
                )}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Vehicles:</span>
              <span className="stat-value">
                {blueForce.vehicles}
                {blueForce.vehicleLosses > 0 && (
                  <span className="casualties"> (-{blueForce.vehicleLosses})</span>
                )}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Firepower:</span>
              <span className="stat-value">{blueForce.firepower}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Morale:</span>
              <span className={`stat-value ${blueForce.avgMorale < 50 ? 'low-morale' : ''}`}>
                {blueForce.avgMorale}%
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Supply:</span>
              <span className={`stat-value ${blueForce.avgSupply < 50 ? 'low-supply' : ''}`}>
                {blueForce.avgSupply}%
              </span>
            </div>
            {initialBlue && blueForce.casualties > 0 && (
              <div className={`casualty-summary ${getStatusColor(blueForce.casualties, initialBlue.personnel)}`}>
                <strong>Casualty Rate:</strong> {getCasualtyRate(blueForce.casualties, initialBlue.personnel)}%
              </div>
            )}
          </div>
        </div>

        <div className="vs-divider">
          <div className="vs-icon">⚔️</div>
        </div>

        <div className="force-panel red-force-panel">
          <div className="force-header">
            <h3>🔴 RED FORCE</h3>
            <span className="force-status">Attacking</span>
          </div>
          <div className="force-stats">
            <div className="stat-item">
              <span className="stat-label">Units:</span>
              <span className="stat-value">{redForce.units}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Personnel:</span>
              <span className="stat-value">
                {redForce.personnel}
                {redForce.casualties > 0 && (
                  <span className="casualties"> (-{redForce.casualties})</span>
                )}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Vehicles:</span>
              <span className="stat-value">
                {redForce.vehicles}
                {redForce.vehicleLosses > 0 && (
                  <span className="casualties"> (-{redForce.vehicleLosses})</span>
                )}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Firepower:</span>
              <span className="stat-value">{redForce.firepower}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Morale:</span>
              <span className={`stat-value ${redForce.avgMorale < 50 ? 'low-morale' : ''}`}>
                {redForce.avgMorale}%
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Supply:</span>
              <span className={`stat-value ${redForce.avgSupply < 50 ? 'low-supply' : ''}`}>
                {redForce.avgSupply}%
              </span>
            </div>
            {initialRed && redForce.casualties > 0 && (
              <div className={`casualty-summary ${getStatusColor(redForce.casualties, initialRed.personnel)}`}>
                <strong>Casualty Rate:</strong> {getCasualtyRate(redForce.casualties, initialRed.personnel)}%
              </div>
            )}
          </div>
        </div>
      </div>

      {battleEvents.length > 0 && (
        <div className="battle-events">
          <h3>📋 Battle Events</h3>
          <div className="events-list">
            {battleEvents.map(event => (
              <div key={event.id} className={`event-item ${event.type}`}>
                <span className="event-time">{event.timestamp}</span>
                <span className="event-message">{event.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {initialBlue && initialRed && (
        <div className="battle-summary">
          <h3>📊 Battle Analysis</h3>
          <div className="analysis-grid">
            <div className="analysis-item">
              <span className="analysis-label">Force Ratio:</span>
              <span className="analysis-value">
                {(blueForce.personnel / redForce.personnel || 1).toFixed(2)}:1 (Blue)
              </span>
            </div>
            <div className="analysis-item">
              <span className="analysis-label">Firepower Advantage:</span>
              <span className="analysis-value">
                {blueForce.firepower > redForce.firepower ? '🔵 Blue Force' : '🔴 Red Force'}
              </span>
            </div>
            <div className="analysis-item">
              <span className="analysis-label">Kill Ratio:</span>
              <span className="analysis-value">
                {blueForce.casualties > 0 && redForce.casualties > 0
                  ? `${(redForce.casualties / blueForce.casualties).toFixed(1)}:1`
                  : 'N/A'}
              </span>
            </div>
            <div className="analysis-item">
              <span className="analysis-label">Battle Status:</span>
              <span className="analysis-value">
                {redForce.casualties > blueForce.casualties * 2
                  ? '🔵 Blue Force Victory'
                  : blueForce.casualties > redForce.casualties * 2
                  ? '🔴 Red Force Victory'
                  : '⚔️ Ongoing'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleStatsDashboard;

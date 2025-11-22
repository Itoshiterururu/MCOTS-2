import React from 'react';
import './UnitHealthBar.css';

const UnitHealthBar = ({ unit }) => {
  if (!unit || !unit.unitRank) return null;

  const getHealthPercentage = () => {
    try {
      // Calculate health based on personnel and morale
      const maxPersonnel = getMaxPersonnel(unit.unitRank);
      const personnelHealth = (unit.personnel || 0) / maxPersonnel;
      const moraleHealth = (unit.morale || 100) / 100;
      return ((personnelHealth + moraleHealth) / 2) * 100;
    } catch (error) {
      console.error('Error calculating health percentage:', error);
      return 50; // Default to 50% on error
    }
  };

  const getMaxPersonnel = (rank) => {
    switch(rank) {
      case 'SQUAD': return 10;
      case 'PLATOON': return 30;
      case 'COMPANY': return 120;
      case 'BATTALION': return 500;
      default: return 30;
    }
  };

  const getHealthColor = (percentage) => {
    if (percentage >= 75) return '#2ecc71'; // Green
    if (percentage >= 50) return '#f39c12'; // Yellow/Orange
    if (percentage >= 25) return '#e67e22'; // Orange
    return '#e74c3c'; // Red
  };

  const getStatusIcon = () => {
    const health = getHealthPercentage();
    if (health >= 90) return '✓';
    if (health >= 75) return '⚠';
    if (health >= 50) return '⚡';
    if (health >= 25) return '💥';
    return '💀';
  };

  const healthPercentage = getHealthPercentage();
  const healthColor = getHealthColor(healthPercentage);
  const statusIcon = getStatusIcon();

  return (
    <div className="unit-health-container">
      <div className="health-bar">
        <div
          className="health-fill"
          style={{
            width: `${healthPercentage}%`,
            backgroundColor: healthColor
          }}
        />
      </div>
      <div className="health-details">
        <span className="health-icon">{statusIcon}</span>
        <span className="health-percentage">{Math.round(healthPercentage)}%</span>
      </div>
      {((unit.morale !== undefined && unit.morale < 50) || (unit.supplyLevel !== undefined && unit.supplyLevel < 50)) && (
        <div className="status-warnings">
          {unit.morale !== undefined && unit.morale < 50 && <span className="warning-badge morale">Low Morale</span>}
          {unit.supplyLevel !== undefined && unit.supplyLevel < 50 && <span className="warning-badge supply">Low Supply</span>}
        </div>
      )}
    </div>
  );
};

export default UnitHealthBar;

import React, { useState } from 'react';
import '../../styles/components/Sidebar.css';
import UnitType from '../../enums/UnitType';
import Faction from '../../enums/Faction';
import UnitRank from '../../enums/UnitRank';
import ObstacleType from '../../enums/ObstacleType';
import UnitConfigs from '../../enums/UnitConfigs';
import UnitRankSelector from '../Units/UnitRankSelector';


function Sidebar({ onUnitSelect, onObstacleSelect, selectedUnit, selectedObstacle }) {
  const [selectedLocalUnit, setSelectedLocalUnit] = useState(null);
  const [selectedLocalObstacle, setSelectedLocalObstacle] = useState(null);
  const [showRankSelector, setShowRankSelector] = useState(false);
  const [pendingUnit, setPendingUnit] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});


  // Add effect to sync with parent's state
  React.useEffect(() => {
    setSelectedLocalUnit(selectedUnit);
    setSelectedLocalObstacle(selectedObstacle);
  }, [selectedUnit, selectedObstacle]);

  const handleUnitSelect = (unit, faction) => {
    const unitConfig = UnitConfigs.find(u => u.type === unit && u.faction === faction);
    setPendingUnit({ type: unit, faction: faction, config: unitConfig });
    setShowRankSelector(true);
    setSelectedLocalObstacle(null);
    if (onObstacleSelect) {
      onObstacleSelect(null);
    }
  };
  
  const handleRankSelect = (rank) => {
    if (pendingUnit) {
      const unitData = {
        type: pendingUnit.type,
        faction: pendingUnit.faction,
        unitRank: rank,
        ...getDefaultValues(pendingUnit.type, rank)
      };
      console.log('Selected unit with rank:', unitData);
      setSelectedLocalUnit(unitData);
      onUnitSelect(unitData);
    }
    setShowRankSelector(false);
    setPendingUnit(null);
  };
  
  const handleRankCancel = () => {
    setShowRankSelector(false);
    setPendingUnit(null);
  };

  const getDefaultValues = (unit, rank) => {
    const basePersonnel = getBasePersonnel(rank);
    const baseVehicles = getBaseVehicles(rank);
    
    switch (unit) {
      case UnitType.MECHANIZED:
        return { personnel: Math.round(basePersonnel * 1.2), vehicles: Math.round(baseVehicles * 1.5), firepower: 0 };
      case UnitType.INFANTRY:
        return { personnel: Math.round(basePersonnel * 1.5), vehicles: Math.round(baseVehicles * 0.5), firepower: 0 };
      case UnitType.TANKS:
        return { personnel: Math.round(basePersonnel * 0.8), vehicles: Math.round(baseVehicles * 1.2), firepower: 0 };
      case UnitType.COMMUNICATIONS:
        return { personnel: Math.round(basePersonnel * 0.6), vehicles: Math.round(baseVehicles * 0.8), firepower: 0 };
      case UnitType.ANTI_TANK:
        return { personnel: Math.round(basePersonnel * 0.8), vehicles: Math.round(baseVehicles * 0.6), firepower: 0 };
      case UnitType.RECONNAISSANCE:
        return { personnel: Math.round(basePersonnel * 0.7), vehicles: Math.round(baseVehicles * 1.0), firepower: 0 };
      case UnitType.UAV:
        return { personnel: Math.round(basePersonnel * 0.4), vehicles: Math.round(baseVehicles * 0.3), firepower: 0 };
      case UnitType.AIR_DEFENSE:
        return { personnel: Math.round(basePersonnel * 1.0), vehicles: Math.round(baseVehicles * 0.8), firepower: 0 };
      case UnitType.HOWITZER:
        return { personnel: Math.round(basePersonnel * 1.1), vehicles: Math.round(baseVehicles * 1.0), firepower: 0 };
      case UnitType.MORTAR:
        return { personnel: Math.round(basePersonnel * 0.8), vehicles: Math.round(baseVehicles * 0.6), firepower: 0 };
      case UnitType.ENGINEER:
        return { personnel: Math.round(basePersonnel * 1.2), vehicles: Math.round(baseVehicles * 1.5), firepower: 0 };
      case UnitType.REPAIR:
        return { personnel: Math.round(basePersonnel * 0.9), vehicles: Math.round(baseVehicles * 1.2), firepower: 0 };
      case UnitType.SUPPLY:
        return { personnel: Math.round(basePersonnel * 1.0), vehicles: Math.round(baseVehicles * 2.0), firepower: 0 };
      case UnitType.MEDICAL:
        return { personnel: Math.round(basePersonnel * 0.8), vehicles: Math.round(baseVehicles * 1.0), firepower: 0 };
      case UnitType.LOGISTICS:
        return { personnel: Math.round(basePersonnel * 1.1), vehicles: Math.round(baseVehicles * 1.8), firepower: 0 };
      default:
        return { personnel: basePersonnel, vehicles: baseVehicles, firepower: 0 };
    }
  };
  
  const getBasePersonnel = (rank) => {
    switch (rank) {
      case UnitRank.SQUAD: return 10;
      case UnitRank.PLATOON: return 30;
      case UnitRank.COMPANY: return 120;
      case UnitRank.BATTALION: return 500;
      default: return 30;
    }
  };
  
  const getBaseVehicles = (rank) => {
    switch (rank) {
      case UnitRank.SQUAD: return 1;
      case UnitRank.PLATOON: return 3;
      case UnitRank.COMPANY: return 12;
      case UnitRank.BATTALION: return 50;
      default: return 3;
    }
  };
  
  const getRankLabel = (rank) => {
    switch (rank) {
      case UnitRank.SQUAD: return 'Відділення';
      case UnitRank.PLATOON: return 'Взвод';
      case UnitRank.COMPANY: return 'Рота';
      case UnitRank.BATTALION: return 'Батальйон';
      default: return 'Взвод';
    }
  };

  const handleObstacleSelect = (obstacle) => {
    setSelectedLocalObstacle(obstacle);
    setSelectedLocalUnit(null);
    if (onObstacleSelect) {
      onObstacleSelect(obstacle);
    }
    onUnitSelect(null);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };



  return (
    <>
      <div className="sidebar">
        <div className="sidebar-section">
          <h3 className="sidebar-header" onClick={() => toggleSection('friendly')}>
            Дружні {expandedSections.friendly ? '▼' : '▶'}
          </h3>
          {expandedSections.friendly && (
            <div className="unit-section">
              {UnitConfigs.filter(unit => unit.faction === Faction.BLUE_FORCE).map((unit) => (
                <button 
                  key={`${unit.type}-${unit.faction}`}
                  className={`unit-button ${selectedLocalUnit?.faction === unit.faction && selectedLocalUnit?.type === unit.type ? 'active' : ''}`}
                  onClick={() => handleUnitSelect(unit.type, unit.faction)}
                >
                  <img src={unit.icon} alt={unit.label} className="unit-icon" />
                  {unit.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar-section">
          <h3 className="sidebar-header" onClick={() => toggleSection('enemy')}>
            Ворожі {expandedSections.enemy ? '▼' : '▶'}
          </h3>
          {expandedSections.enemy && (
            <div className="unit-section">
              {UnitConfigs.filter(unit => unit.faction === Faction.RED_FORCE).map((unit) => (
                <button 
                  key={`${unit.type}-${unit.faction}`}
                  className={`unit-button ${selectedLocalUnit?.faction === unit.faction && selectedLocalUnit?.type === unit.type ? 'active' : ''}`}
                  onClick={() => handleUnitSelect(unit.type, unit.faction)}
                >
                  <img src={unit.icon} alt={unit.label} className="unit-icon" />
                  {unit.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar-section">
          <h3 className="sidebar-header" onClick={() => toggleSection('obstacles')}>
            Загородження {expandedSections.obstacles ? '▼' : '▶'}
          </h3>
          {expandedSections.obstacles && (
            <div className="unit-section">
              {Object.values(ObstacleType).map((obstacle) => (
                <button 
                  key={obstacle}
                  className={`unit-button ${selectedLocalObstacle === obstacle ? 'active' : ''}`} 
                  onClick={() => handleObstacleSelect(obstacle)}
                >
                  {obstacle === ObstacleType.MINEFIELD ? 'Мінне поле' : 'Колючий дріт'}
                </button>
              ))}
            </div>
          )}
        </div>

      <div className="section-divider"></div>
      
      <button 
        className="save-battle-btn"
        onClick={() => document.dispatchEvent(new CustomEvent('openSaveDialog'))}
      >
        💾 Зберегти розстановку
      </button>
      
      <button 
        className="load-battle-btn"
        onClick={() => document.dispatchEvent(new CustomEvent('openLoadDialog'))}
      >
        📁 Завантажити розстановку
      </button>
      
      <button 
        className="unit-button"
        onClick={() => document.dispatchEvent(new CustomEvent('clearMap'))}
        style={{
          backgroundColor: '#f44336',
          color: 'white'
        }}
      >
        🗑️ Очистити карту
      </button>
      </div>
      
      {showRankSelector && (
        <UnitRankSelector
          selectedUnit={pendingUnit?.config}
          onRankSelect={handleRankSelect}
          onCancel={handleRankCancel}
        />
      )}
    </>
  );
}

export default Sidebar;


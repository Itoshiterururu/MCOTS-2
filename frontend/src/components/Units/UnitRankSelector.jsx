import React from 'react';
import UnitRank from '../../enums/UnitRank';
import '../../styles/components/UnitRankSelector.css';

const UnitRankSelector = ({ selectedUnit, onRankSelect, onCancel }) => {
  const getRankLabel = (rank) => {
    switch (rank) {
      case UnitRank.SQUAD: return 'Відділення';
      case UnitRank.PLATOON: return 'Взвод';
      case UnitRank.COMPANY: return 'Рота';
      case UnitRank.BATTALION: return 'Батальйон';
      default: return 'Взвод';
    }
  };

  const getRankDescription = (rank) => {
    switch (rank) {
      case UnitRank.SQUAD: return '8-12 осіб, 1-2 техніки';
      case UnitRank.PLATOON: return '20-50 осіб, 3-5 технік';
      case UnitRank.COMPANY: return '80-200 осіб, 10-15 технік';
      case UnitRank.BATTALION: return '300-800 осіб, 40-60 технік';
      default: return '';
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case UnitRank.SQUAD: return '•';
      case UnitRank.PLATOON: return '•••';
      case UnitRank.COMPANY: return '|';
      case UnitRank.BATTALION: return '||';
      default: return '•••';
    }
  };

  return (
    <div className="rank-selector-overlay">
      <div className="rank-selector-modal">
        <h3>Оберіть ранг підрозділу</h3>
        <p className="unit-type-info">
          Тип: {selectedUnit?.label || 'Підрозділ'}
        </p>
        
        <div className="rank-options">
          {Object.values(UnitRank).map(rank => (
            <button
              key={rank}
              className="rank-option"
              onClick={() => onRankSelect(rank)}
            >
              <div className="rank-icon">{getRankIcon(rank)}</div>
              <div className="rank-info">
                <div className="rank-name">{getRankLabel(rank)}</div>
                <div className="rank-description">{getRankDescription(rank)}</div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="rank-modal-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Скасувати
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnitRankSelector;
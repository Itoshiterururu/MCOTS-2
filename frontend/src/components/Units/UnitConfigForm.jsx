import React, { useState } from 'react';
import UnitConfigs from '../../enums/UnitConfigs';
import { calculateFirepower } from '../../utils/calculations';
import '../../styles/components/UnitConfigForm.css';

/**
 * Form component for creating and editing units on the map
 */
const UnitConfigForm = React.memo(({ onSubmit, onCancel, selectedUnit, position, existingUnit, onDelete }) => {
  const [formData, setFormData] = useState({
    personnel: existingUnit?.personnel || selectedUnit?.personnel || 0,
    vehicles: existingUnit?.vehicles || selectedUnit?.vehicles || 0,
    supplyLevel: existingUnit?.supplyLevel || 100,
    morale: existingUnit?.morale || 100,
    status: existingUnit?.status || 'DEFENDING',
    direction: existingUnit?.direction || 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...selectedUnit,
      ...formData,
      position: existingUnit ? existingUnit.position : position
    }, selectedUnit);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  // Helper function for rank labels
  const getRankLabel = (rank) => {
    switch (rank) {
      case 'SQUAD': return 'Відділення';
      case 'PLATOON': return 'Взвод';
      case 'COMPANY': return 'Рота';
      case 'BATTALION': return 'Батальйон';
      default: return 'Взвод';
    }
  };

  // Memoize firepower calculation
  const calculatedFirepower = React.useMemo(() => 
    calculateFirepower(formData.vehicles, formData.supplyLevel, formData.personnel),
    [formData.vehicles, formData.supplyLevel, formData.personnel]
  );

  return (
    <div className="unit-config-overlay" onClick={handleOverlayClick}>
      <form className="unit-config-form" onSubmit={handleSubmit}>
        <h4>{existingUnit ? 'Редагувати підрозділ' : 'Налаштувати підрозділ'}</h4>
        
        {existingUnit && (
          <div className="unit-info">
            <div className="unit-type">
              {UnitConfigs.find(u => 
                u.type === (existingUnit.unitType || existingUnit.type) && 
                u.faction === existingUnit.faction
              )?.label || 'Unit'}
            </div>
            <div className="unit-rank">
              Ранг: {getRankLabel(existingUnit.unitRank || 'PLATOON')}
            </div>
            <div className="position-info">
              Позиція: {existingUnit.position.latitude.toFixed(4)}, {existingUnit.position.longitude.toFixed(4)}
            </div>
          </div>
        )}
        
        <div className="form-group">
          <label>Особовий склад</label>
          <input
            type="number"
            value={formData.personnel}
            onChange={(e) => setFormData(prev => ({ ...prev, personnel: parseInt(e.target.value) || 0 }))}
            min="0"
            max="5000"
            required
          />
        </div>
        <div className="form-group">
          <label>Техніка</label>
          <input
            type="number"
            value={formData.vehicles}
            onChange={(e) => setFormData(prev => ({ ...prev, vehicles: parseInt(e.target.value) || 0 }))}
            min="0"
            max="500"
            required
          />
        </div>
        <div className="form-group">
          <label>Рівень постачання</label>
          <input
            type="number"
            value={formData.supplyLevel}
            onChange={(e) => setFormData(prev => ({ ...prev, supplyLevel: parseInt(e.target.value) || 0 }))}
            min="0"
            max="100"
            required
          />
        </div>
        <div className="form-group">
          <label>Моральний дух</label>
          <input
            type="number"
            value={formData.morale}
            onChange={(e) => setFormData(prev => ({ ...prev, morale: parseInt(e.target.value) || 0 }))}
            min="0"
            max="100"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Статус</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="ATTACKING">Наступ</option>
            <option value="DEFENDING">Оборона</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Напрямок (градуси)</label>
          <input
            type="number"
            value={formData.direction}
            onChange={(e) => setFormData(prev => ({ ...prev, direction: parseInt(e.target.value) || 0 }))}
            min="0"
            max="359"
            placeholder="0 = Північ, 90 = Схід, 180 = Південь, 270 = Захід"
            required
          />
          <small>0° = Північ, 90° = Схід, 180° = Південь, 270° = Захід</small>
        </div>
        
        <div className="form-group">
          <label>Розрахована вогнева міць</label>
          <div className="calculated-value">{calculatedFirepower}</div>
        </div>
        
        <div className="form-actions">
          <button type="submit">{existingUnit ? 'Оновити' : 'Створити'}</button>
          {existingUnit && (
            <>
              <button type="button" onClick={() => onDelete(existingUnit.id)} className="delete-button">
                Видалити
              </button>
              <button type="button" onClick={() => {
                console.log('Place КСП clicked for unit:', existingUnit.id);
                if (window.placeCommandPost) {
                  window.placeCommandPost(existingUnit.id);
                } else {
                  console.error('placeCommandPost function not available');
                }
              }}>
                Розмістити КСП
              </button>
            </>
          )}
          <button type="button" onClick={onCancel}>Скасувати</button>
        </div>
      </form>
    </div>
  );
});

export default UnitConfigForm;
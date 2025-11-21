import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ActionType from '../../enums/ActionType';
import ActionPriority from '../../enums/ActionPriority';
import UnitConfigs from '../../enums/UnitConfigs';

/**
 * Component for managing unit actions
 */
const UnitAction = ({ units, preselectedUnit, onClose, onActionCreate }) => {
  const [selectedActionType, setSelectedActionType] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [targetPosition, setTargetPosition] = useState({ latitude: 0, longitude: 0 });
  const [actionDescription, setActionDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [durationMinutes, setDurationMinutes] = useState(60);

  // При монтуванні компонента або при зміні preselectedUnit, встановлюємо значення за замовчуванням
  useEffect(() => {
    if (preselectedUnit) {
      setSelectedUnitId(preselectedUnit.id);
      // Якщо є позиція юніта, встановлюємо її за замовчуванням як цільову
      if (preselectedUnit.position) {
        setTargetPosition({
          latitude: preselectedUnit.position.latitude,
          longitude: preselectedUnit.position.longitude
        });
      }
    }
  }, [preselectedUnit]);

  // Handle form submission to create a new action
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedUnit = units.find(unit => unit.id === selectedUnitId);
    
    if (!selectedUnit || !selectedActionType) {
      alert('Please select a unit and action type');
      return;
    }

    const newAction = {
      unitId: selectedUnitId,
      unitInfo: selectedUnit, // Додаємо інформацію про юніт для відображення
      actionType: selectedActionType,
      targetPosition: targetPosition,
      targetUnitId: null, // We can add this in the future if needed
      description: actionDescription,
      priority: priority,
      durationSeconds: durationMinutes * 60,
      status: 'PENDING',
      scheduledAt: null, // Execute immediately when created
      executionOrder: null,
      scriptId: null,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + durationMinutes * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      parameters: {} // Empty parameters object for additional data
    };

    onActionCreate(newAction);
    onClose();
  };

  // Використовуємо Portal для рендерингу компонента поза ієрархією DOM
  return createPortal(
    <div className="unit-action-overlay">
      <div className="unit-action-form">
        <div className="action-form-header">
          <h4>Create Action</h4>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Selected Unit</label>
            {preselectedUnit ? (
              // Якщо є передвибраний юніт, показуємо його без випадаючого меню
              <div className="selected-unit-display">
                {(() => {
                  const unitConfig = UnitConfigs.find(
                    config => config.type === (preselectedUnit.unitType || preselectedUnit.type) 
                              && config.faction === preselectedUnit.faction
                  );
                  
                  return (
                    <>
                      <img 
                        src={unitConfig?.icon} 
                        alt={unitConfig?.label || 'Unit'} 
                        className="selected-unit-icon"
                      />
                      <span>{unitConfig?.label || 'Unknown'} - ID: {preselectedUnit.id.slice(0, 5)}</span>
                    </>
                  );
                })()}
              </div>
            ) : (
              // Інакше показуємо випадаюче меню для вибору юніта
              <select 
                value={selectedUnitId} 
                onChange={(e) => setSelectedUnitId(e.target.value)}
                required
              >
                <option value="">-- Select Unit --</option>
                {units.map(unit => {
                  const unitConfig = UnitConfigs.find(
                    config => config.type === (unit.unitType || unit.type) && config.faction === unit.faction
                  );
                  return (
                    <option key={unit.id} value={unit.id}>
                      {unitConfig?.label || 'Unknown'} - ID: {unit.id.slice(0, 5)}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <div className="form-group">
            <label>Action Type</label>
            <select 
              value={selectedActionType} 
              onChange={(e) => setSelectedActionType(e.target.value)}
              required
            >
              <option value="">-- Select Action Type --</option>
              {Object.entries(ActionType).map(([key, value]) => (
                <option key={key} value={value}>{key}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Target Position (Latitude)</label>
            <input
              type="number"
              value={targetPosition.latitude}
              onChange={(e) => setTargetPosition(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
              step="0.0001"
              required
            />
          </div>

          <div className="form-group">
            <label>Target Position (Longitude)</label>
            <input
              type="number"
              value={targetPosition.longitude}
              onChange={(e) => setTargetPosition(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
              step="0.0001"
              required
            />
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              required
            >
              {Object.entries(ActionPriority).map(([key, value]) => (
                <option key={key} value={value}>{key}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
              min="1"
              max="1440"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={actionDescription}
              onChange={(e) => setActionDescription(e.target.value)}
              placeholder="Enter action description..."
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-action">Create</button>
            <button type="button" onClick={onClose} className="cancel-action">Cancel</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default UnitAction;
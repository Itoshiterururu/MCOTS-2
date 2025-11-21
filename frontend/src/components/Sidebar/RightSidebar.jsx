import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/components/RightSidebar.css';
import { UnitActionList, useUnitActionManager } from '../Units/UnitActionManager';
import UnitConfigs from '../../enums/UnitConfigs';
import {getAllObstacles, getAllActions, getUnitsByIds, analyzeBattle, updateUnit, deleteAction} from '../../services/api'



/**
 * Компонент правої бокової панелі для управління діями юнітів
 */
function RightSidebar({ units = [], actions = [], onShowSuccess }) {
  const unitActionManager = useUnitActionManager();
  const [isCreatingAction, setIsCreatingAction] = useState(false);
  const [terrain, setTerrain] = useState('urban');
  const [weather, setWeather] = useState('clear');
  const [newActionData, setNewActionData] = useState({
    unitId: '',
    actionText: '',
    id: null
  });

  const [formErrors, setFormErrors] = useState({
    unitId: false,
    actionText: false
  });
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  // Функція для створення нового плейту для дії
  const handleNewAction = () => {
    setIsCreatingAction(true);
    setIsUpdateMode(false);
    setNewActionData({
      unitId: '',
      actionText: '',
      id: null
    });
    setFormErrors({
      unitId: false,
      actionText: false
    });
  };

  // Функція для скасування створення/редагування дії
  const handleCancelAction = () => {
    setIsCreatingAction(false);
    setIsUpdateMode(false);
    setNewActionData({
      unitId: '',
      actionText: '',
      id: null
    });
    setFormErrors({
      unitId: false,
      actionText: false
    });
    // Reset active action in the action manager as well
    unitActionManager.setActiveAction(null);
  };
  
  // Watch for active action changes to populate the form for editing
  useEffect(() => {
    if (unitActionManager.activeAction) {
      setIsCreatingAction(true);
      setIsUpdateMode(true);
      setNewActionData({
        unitId: unitActionManager.activeAction.unitId,
        actionText: unitActionManager.activeAction.description,
        id: unitActionManager.activeAction.id
      });
      setFormErrors({
        unitId: false,
        actionText: false
      });
    }
  }, [unitActionManager.activeAction]);
  
  // Listen for action deletion events
  useEffect(() => {
    const handleActionDeleted = (event) => {
      // If the deleted action is currently being edited, close the plate
      if (isUpdateMode && newActionData.id === event.detail.actionId) {
        handleCancelAction();
      }
    };
    
    // Add event listener
    document.addEventListener('actionDeleted', handleActionDeleted);
    
    // Cleanup
    return () => {
      document.removeEventListener('actionDeleted', handleActionDeleted);
    };
  }, [isUpdateMode, newActionData.id]);
  
  // Sync external actions with internal state when they change
  useEffect(() => {
    // Update unitActionManager's actions with the enriched actions from App.jsx
    unitActionManager.setActions(actions || []);
  }, [actions]);

  // Функція для оновлення даних нової дії
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewActionData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаємо помилку при заповненні поля
    if (value.trim()) {
      setFormErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  // Функція для валідації форми
  const validateForm = () => {
    const errors = {
      unitId: !newActionData.unitId,
      actionText: !newActionData.actionText.trim()
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const collectData = async () => {
    try {
      const [obstacles, actionsData] = await Promise.all([
        getAllObstacles(),
        getAllActions()
      ]);

      const uniqueUnitIds = [...new Set(actionsData.data.map(action => action.unitId))];
      const unitsResult = await getUnitsByIds(uniqueUnitIds);
        
      return {
        battle_data: {
          units: unitsResult.success ? unitsResult.data : [],
          obstacles: obstacles.data || [],
          actions: actionsData.data || []
        }
      };
    } catch (error) {
      console.error('Error collecting battle data:', error);
      throw new Error('Failed to collect battle data');
    }
  }  
  
  const handleGenerate = async () => {
    try {
      console.log("🎯 Generate button clicked");
      
      const currentActions = await getAllActions(); 
      console.log("📋 Current actions:", currentActions);
      
      if (currentActions.data.length === 0) {
        console.log("❌ No actions found, exiting");
        alert("Немає активних дій для аналізу. Створіть дії для підрозділів.");
        return;
      }

      const currentData = await collectData();
      console.log("📊 Data for Intelligence service:", currentData);

      // Використовуємо нову структуру API з динамічними параметрами
      const resultAnalyze = await analyzeBattle(
        currentData.battle_data, 
        currentActions.data,
        terrain,
        weather
      );
      console.log("🎯 Intelligence service result:", resultAnalyze);
      
      if (resultAnalyze.success) {
        console.log("✅ Analysis successful, processing units...");
        
        // Оновлюємо юніти
        const updatedUnits = await processUnitsFromBattleData(resultAnalyze.data);
        
        // Викликаємо подію щоб примусово оновити карту
        const forceUpdateEvent = new CustomEvent('forceMapUpdate', { 
          detail: { 
            units: updatedUnits,
            timestamp: new Date().getTime()
          }
        });
        document.dispatchEvent(forceUpdateEvent);
        
        // Видаляємо дії
        const actionsData = await getAllActions();
        await Promise.all(actionsData.data.map(action => deleteAction(action.id)));
        
        console.log("🎉 Showing success modal with data:", resultAnalyze.data);
        
        // Показуємо модальне вікно з реальними даними аналізу
        onShowSuccess(resultAnalyze.data);
      } else {
        console.error("❌ Analysis failed:", resultAnalyze.error);
        alert("Помилка аналізу: " + resultAnalyze.error);
      }
    } catch (error) {
      console.error("💥 Generate error:", error);
      alert("Критична помилка: " + error.message);
    }
  };
  
  // Process units data from battle service - update or remove units based on battle results
  const processUnitsFromBattleData = async (battleData) => {
    try {
      if (!battleData || !battleData.units || !Array.isArray(battleData.units)) {
        console.error('Invalid battle data format');
        return;
      }
      
      console.log('Processing units from battle data:', battleData.units);
      const processingResults = [];
      
      // Process each unit from battle service
      for (const unitData of battleData.units) {
        // Skip units without ID
        if (!unitData.id) continue;
        
        // Find existing unit
        const existingUnit = units.find(u => u.id === unitData.id);
        if (!existingUnit) continue;
        
        if (unitData.personnel <= 0) {
          // Delete units with 0 or negative personnel
          try {
            await deleteUnit(unitData.id);
            processingResults.push({
              id: unitData.id,
              action: 'deleted',
              success: true
            });
          } catch (error) {
            console.error(`Error deleting unit ${unitData.id}:`, error);
            processingResults.push({
              id: unitData.id,
              action: 'deleted',
              success: false,
              error
            });
          }
        } else {
          // Make sure position is properly formatted for the map
          let updatedPosition = existingUnit.position;
          
          // If battle data has new position information, use it
          if (unitData.position) {
            updatedPosition = {
              latitude: parseFloat(unitData.position.latitude) || existingUnit.position.latitude,
              longitude: parseFloat(unitData.position.longitude) || existingUnit.position.longitude
            };
          }
          
          // Update unit with new data (position, personnel, etc.)
          const updatedUnitData = {
            id: unitData.id,
            position: updatedPosition,
            status: unitData.status || existingUnit.status,
            personnel: unitData.personnel,
            vehicles: unitData.vehicles !== undefined ? unitData.vehicles : existingUnit.vehicles,
            firepower: unitData.firepower !== undefined ? unitData.firepower : existingUnit.firepower,
            supplyLevel: unitData.supplyLevel !== undefined ? unitData.supplyLevel : existingUnit.supplyLevel,
            morale: unitData.morale !== undefined ? unitData.morale : existingUnit.morale,
            unitType: existingUnit.unitType || existingUnit.type,
            faction: existingUnit.faction
          };          
          try {
            const result = await updateUnit(updatedUnitData);
            if (result.success) {
              processingResults.push({
                id: unitData.id,
                action: 'updated',
                success: true,
                data: result.data
              });
            } else {
              throw new Error(result.error);
            }
          } catch (error) {
            console.error(`Error updating unit ${unitData.id}:`, error);
            processingResults.push({
              id: unitData.id,
              action: 'updated',
              success: false,
              error
            });
          }
        }
      }
            
      // Notify the app about unit changes
      const updatedUnits = units.filter(unit => {
        // Keep unit if it wasn't deleted (no personnel = 0 in battle data)
        const unitFromBattle = battleData.units.find(u => u.id === unit.id);
        return !unitFromBattle || unitFromBattle.personnel > 0;
      }).map(unit => {
        // Apply updates to remaining units
        const updatedUnit = processingResults.find(
          r => r.id === unit.id && r.action === 'updated' && r.success
        );
        return updatedUnit ? updatedUnit.data : unit;
      });
      

      
      // Dispatch a custom event to notify other components about unit updates
      const unitUpdateEvent = new CustomEvent('unitsUpdatedFromBattle', {
        detail: {
          units: updatedUnits,
          processingResults
        }
      });
      document.dispatchEvent(unitUpdateEvent);
      
      return updatedUnits;
    } catch (error) {
      console.error('Error processing units from battle data:', error);
      return null;
    }
  };

  // Функція для створення або оновлення дії
  const handleActionSubmit = async () => {
    // Валідуємо форму перед створенням/оновленням дії
    if (!validateForm()) {
      return;
    }
    
    const selectedUnit = units.find(unit => unit.id === newActionData.unitId);
    
    if (!selectedUnit) {
      alert('Please select a unit');
      return;
    }

    if (isUpdateMode) {
      // Update existing action
      const actionToUpdate = {
        id: newActionData.id,
        unitId: newActionData.unitId,
        description: newActionData.actionText,
        unitInfo: selectedUnit
      };
      
      // Call the API to update the action
      await unitActionManager.updateExistingAction(actionToUpdate);
      
      // Show feedback to the user that action was updated
      const actionPlate = document.createElement('div');
      actionPlate.className = 'action-created-notification';
      
      const notificationContent = document.createElement('div');
      notificationContent.className = 'notification-content';
      
      const title = document.createElement('h4');
      title.textContent = 'Action Updated';
      
      const actionText = document.createElement('p');
      actionText.textContent = newActionData.actionText;
      
      const unitInfo = document.createElement('p');
      unitInfo.textContent = `Unit: ${selectedUnit.id}`;
      
      notificationContent.appendChild(title);
      notificationContent.appendChild(actionText);
      notificationContent.appendChild(unitInfo);
      actionPlate.appendChild(notificationContent);
      
      document.body.appendChild(actionPlate);
      
    } else {
      // Create new action
      const newAction = {
        unitId: newActionData.unitId,
        unitInfo: selectedUnit,
        // Use current unit position as target position
        targetPosition: selectedUnit.position || { latitude: 0, longitude: 0 },
        // Default action type if not specified
        actionType: 'MOVE', 
        // Use actionText as description
        description: newActionData.actionText,
        // Additional required fields for the API
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'PENDING',
        parameters: {}
      };
      
      // Call the API to create the action
      await unitActionManager.addAction(newAction);
      
      // Show feedback to the user that action was created
      const actionPlate = document.createElement('div');
      actionPlate.className = 'action-created-notification';
      
      const notificationContent = document.createElement('div');
      notificationContent.className = 'notification-content';
      
      const title = document.createElement('h4');
      title.textContent = 'Action Created';
      
      const actionText = document.createElement('p');
      actionText.textContent = newActionData.actionText;
      
      const unitInfo = document.createElement('p');
      unitInfo.textContent = `Unit: ${selectedUnit.id}`;
      
      notificationContent.appendChild(title);
      notificationContent.appendChild(actionText);
      notificationContent.appendChild(unitInfo);
      actionPlate.appendChild(notificationContent);
      
      document.body.appendChild(actionPlate);
    }
    
    // Remove the notification after 3 seconds
    setTimeout(() => {
      const notification = document.querySelector('.action-created-notification');
      if (notification) {
        notification.classList.add('fade-out');
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 500);
      }
    }, 3000);
    
    // Close the action form
    handleCancelAction();
  };

  return (
    <div className="right-sidebar">
      <div className="sidebar-header">
        <h3>Unit Actions</h3>
        <button 
          className="add-action-button" 
          onClick={handleNewAction}
          title="Create new action"
          disabled={isCreatingAction}
        >
          +
        </button>
      </div>
      
      {/* Форма для створення або оновлення дії прямо в сайдбарі */}
      {isCreatingAction && (
        <div className="new-action-plate">
          <div className="plate-header">
            <h4>{isUpdateMode ? 'Update Action' : 'New Action'}</h4>
            <button className="close-button" onClick={handleCancelAction}>&times;</button>
          </div>
          
          <div className="plate-content">
            <div className={`form-group ${formErrors.unitId ? 'error' : ''}`}>
              <label htmlFor="unitId">Select Unit</label>
              <select 
                id="unitId"
                name="unitId"
                value={newActionData.unitId}
                onChange={handleInputChange}
                required
                className={formErrors.unitId ? 'error-input' : ''}
              >
                <option value="">-- Select Unit --</option>
                {units.map(unit => {
                  const unitConfig = UnitConfigs.find(
                    config => config.type === (unit.unitType || unit.type) && config.faction === unit.faction
                  );
                  return (
                    <option key={unit.id} value={unit.id}>
                      {unitConfig?.label || 'Unknown'} - Position: {unit.position?.latitude.toFixed(2)}, {unit.position?.longitude.toFixed(2)}
                    </option>
                  );
                })}
              </select>
              {formErrors.unitId && <div className="error-message">Please select a unit</div>}
            </div>

            <div className={`form-group ${formErrors.actionText ? 'error' : ''}`}>
              <label htmlFor="actionText">Action Text</label>
              <textarea
                id="actionText"
                name="actionText"
                value={newActionData.actionText}
                onChange={handleInputChange}
                placeholder="Enter action text..."
                rows="3"
                className={formErrors.actionText ? 'error-input' : ''}
                required
              />
              {formErrors.actionText && <div className="error-message">Action description is required</div>}
            </div>

            <div className="plate-actions">
              <button onClick={handleActionSubmit} className={isUpdateMode ? "update-btn" : "create-btn"}>
                {isUpdateMode ? 'Update' : 'Create'}
              </button>
              <button onClick={handleCancelAction} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
      
      <div className="unit-section">
        <UnitActionList 
          actions={unitActionManager.actions} 
          onSelectAction={unitActionManager.selectAction}
          onDeleteAction={unitActionManager.deleteAction}
          activeActionId={isUpdateMode ? newActionData.id : null}
        />
      </div>

      {/* Параметри симуляції */}
      <div className="simulation-params">
        <h4>Параметри симуляції</h4>
        
        <div className="param-group">
          <label htmlFor="terrain">Місцевість:</label>
          <select 
            id="terrain"
            value={terrain}
            onChange={(e) => setTerrain(e.target.value)}
          >
            <option value="urban">Міська</option>
            <option value="forest">Ліс</option>
            <option value="open">Відкрита</option>
            <option value="mountain">Гірська</option>
          </select>
        </div>
        
        <div className="param-group">
          <label htmlFor="weather">Погода:</label>
          <select 
            id="weather"
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
          >
            <option value="clear">Ясно</option>
            <option value="rain">Дощ</option>
            <option value="fog">Туман</option>
            <option value="snow">Сніг</option>
          </select>
        </div>
      </div>

      <div className="generate-button-container">
        <button 
          className="generate-button"
          onClick={handleGenerate}
        >
          Generate
        </button>
      </div>
    </div>
  );
}

export default RightSidebar;
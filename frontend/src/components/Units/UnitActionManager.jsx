import React, { useState, useEffect, useCallback } from 'react';
import UnitConfigs from '../../enums/UnitConfigs';
import { createAction, deleteAction as deleteActionApi, getAllActions, updateAction } from '../../services/api';

/**
 * Hook to manage unit actions
 */
export const useUnitActionManager = () => {
  const [actions, setActions] = useState([]);
  const [showActionForm, setShowActionForm] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to fetch actions that can be called anytime
  const refreshActions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllActions();
      if (response.success) {
        setActions(response.data || []);
      } else {
        console.error('Failed to fetch actions:', response.error);
      }
    } catch (error) {
      console.error('Error fetching actions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch all actions when the component mounts
  useEffect(() => {
    refreshActions();
    
    // Set up periodic refresh (every 30 seconds)
    const intervalId = setInterval(() => {
      refreshActions();
    }, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [refreshActions]);
  
  // Add a new action
  const addAction = async (action) => {
    setIsLoading(true);
    try {
      const response = await createAction(action);
      if (response.success) {
        // Add new actions to the bottom of the list (end of the array)
        setActions(prev => [...prev, response.data]);
      } else {
        console.error('Failed to create action:', response.error);
      }
    } catch (error) {
      console.error('Error creating action:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete an action by ID
  const deleteAction = async (actionId) => {
    setIsLoading(true);
    try {
      const response = await deleteActionApi(actionId);
      if (response.success) {
        setActions(prev => prev.filter(action => action.id !== actionId));
        
        // If the action being deleted is currently being edited, close the plate
        if (activeAction && activeAction.id === actionId) {
          setActiveAction(null);
          setShowActionForm(false);
          
          // Dispatch an event to notify other components that this action was deleted
          const actionDeleteEvent = new CustomEvent('actionDeleted', { 
            detail: { actionId } 
          });
          document.dispatchEvent(actionDeleteEvent);
        }
      } else {
        console.error('Failed to delete action:', response.error);
      }
    } catch (error) {
      console.error('Error deleting action:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Select an action as active and prepare for update
  const selectAction = (action) => {
    setActiveAction(action);
    setShowActionForm(true);
  };
  
  // Update an existing action
  const updateExistingAction = async (actionData) => {
    setIsLoading(true);
    try {
      const response = await updateAction(actionData);
      if (response.success) {
        // Replace the old action with the updated one
        setActions(prev => prev.map(action => 
          action.id === actionData.id ? response.data : action
        ));
        setActiveAction(null);
      } else {
        console.error('Failed to update action:', response.error);
      }
    } catch (error) {
      console.error('Error updating action:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    actions,
    setActions, // Додаємо функцію setActions до експортованого об'єкту
    showActionForm,
    setShowActionForm,
    activeAction,
    setActiveAction,
    addAction,
    deleteAction,
    selectAction,
    updateExistingAction,
    isLoading
  };
};

/**
 * Component to display the list of unit actions
 */
export const UnitActionList = ({ actions, onSelectAction, onDeleteAction, activeActionId = null }) => {
  // Filter out the currently edited action if activeActionId is provided
  const filteredActions = activeActionId 
    ? actions.filter(action => action.id !== activeActionId) 
    : actions;
    
  if (!filteredActions || filteredActions.length === 0) {
    return <div className="no-actions">No actions available</div>;
  }

  return (
    <div className="action-list">
      {filteredActions.map(action => {
        // Знаходимо конфігурацію юніта для відображення іконки
        let unitConfig = null;
        if (action.unitInfo) {
          unitConfig = UnitConfigs.find(
            config => config.type === (action.unitInfo.unitType || action.unitInfo.type) 
                      && config.faction === action.unitInfo.faction
          );
        }
        
        return (
          <div key={action.id} className="action-item">
            <div className="action-body">
              {unitConfig && (
                <div className="action-unit">
                  <img src={unitConfig.icon} alt={unitConfig.label} className="action-unit-icon" />
                  <span>{unitConfig.label}</span>
                </div>
              )}
              <p className="action-description">{action.description || "No description"}</p>
            </div>
            <div className="action-footer">
              <button onClick={() => onSelectAction(action)} className="view-action-btn">Update</button>
              <button onClick={() => onDeleteAction(action.id)} className="delete-action-btn">Delete</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
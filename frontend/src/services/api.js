import ApiUrl from '../enums/ApiUrl';
import { apiRequest, createCrudOperations } from '../utils/apiHelpers';
import authService from './authService';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost';

const MAP_SERVICE_API = ApiUrl.MAP_SERVICE;
const INTELLIGENCE_SERVICE_API = ApiUrl.INTELLIGENCE_SERVICE;

// CRUD operations for different entities
const unitsCrud = createCrudOperations(`${MAP_SERVICE_API}/units`);
const actionsCrud = createCrudOperations(`${MAP_SERVICE_API}/actions`);
const obstaclesCrud = createCrudOperations(`${MAP_SERVICE_API}/obstacles`);

export const deleteUnit = async (unitId) => {
  const result = await unitsCrud.delete(unitId);
  if (!result.success) {
    console.error('Error deleting unit:', result.error);
    throw new Error(result.error);
  }
  return true;
};

export const createUnit = async (unitData) => {
  try {
    const formattedData = {
      unitType: unitData.unitType || unitData.type,
      faction: unitData.faction,
      unitRank: unitData.unitRank,
      position: {
        latitude: unitData.position.latitude,
        longitude: unitData.position.longitude
      },
      status: unitData.status,
      personnel: unitData.personnel,
      vehicles: unitData.vehicles,
      firepower: unitData.firepower,
      supplyLevel: unitData.supplyLevel,
      morale: unitData.morale
    };

    return apiRequest(`${MAP_SERVICE_API}/units`, {
      method: 'POST',
      body: JSON.stringify(formattedData)
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUnit = async (unitData) => {
  try {
    return apiRequest(`${MAP_SERVICE_API}/units/${unitData.id}`, {
      method: 'PUT',
      body: JSON.stringify(unitData)
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUnitByID = async (unitId) => {
  try {
    return apiRequest(`${MAP_SERVICE_API}/units/${unitId}`);
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Action API functions
export const createAction = async (actionData) => {
  const formattedData = {
    unitId: actionData.unitId,
    description: actionData.description || actionData.actionText,
    actionType: actionData.actionType || null,
    priority: actionData.priority || 'MEDIUM',
    targetPosition: actionData.targetPosition || null,
    targetUnitId: actionData.targetUnitId || null,
    durationSeconds: actionData.durationSeconds || null,
    scheduledAt: actionData.scheduledAt || null,
    executionOrder: actionData.executionOrder || null,
    scriptId: actionData.scriptId || null
  };

  const result = await apiRequest(`${MAP_SERVICE_API}/actions`, {
    method: 'POST',
    body: JSON.stringify(formattedData)
  });

  if (result.success) {
    result.data = {
      ...result.data,
      unitInfo: actionData.unitInfo
    };
  }

  return result;
};

export const getUnitActions = async (unitId) => {
  return apiRequest(`${MAP_SERVICE_API}/actions/unit/${unitId}`);
};

// Optimized function to get all actions with unit info in one batch
export const getAllActionsWithUnits = async () => {
  try {
    const [actionsResult, unitsResult] = await Promise.all([
      getAllActions(),
      getAllUnits()
    ]);
    
    if (!actionsResult.success || !unitsResult.success) {
      return {
        success: false,
        error: actionsResult.error || unitsResult.error
      };
    }
    
    const unitsMap = new Map(unitsResult.data.map(unit => [unit.id, unit]));
    const enrichedActions = actionsResult.data.map(action => ({
      ...action,
      unitInfo: unitsMap.get(action.unitId) || null
    }));
    
    return { success: true, data: enrichedActions };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAllActions = () => actionsCrud.getAll();



export const updateAction = async (actionData) => {
  const formattedData = {
    id: actionData.id,
    unitId: actionData.unitId,
    description: actionData.description,
    actionType: actionData.actionType || null,
    status: actionData.status || null,
    priority: actionData.priority || null,
    targetPosition: actionData.targetPosition || null,
    targetUnitId: actionData.targetUnitId || null,
    durationSeconds: actionData.durationSeconds || null,
    scheduledAt: actionData.scheduledAt || null,
    executionOrder: actionData.executionOrder || null,
    scriptId: actionData.scriptId || null,
    failureReason: actionData.failureReason || null,
    updatedAt: new Date().toISOString()
  };

  const result = await apiRequest(`${MAP_SERVICE_API}/actions/${actionData.id}`, {
    method: 'PUT',
    body: JSON.stringify(formattedData)
  });

  if (result.success) {
    result.data = {
      ...result.data,
      unitInfo: actionData.unitInfo
    };
  }

  return result;
};

export const deleteAction = async (actionId) => {
  return apiRequest(`${MAP_SERVICE_API}/actions/${actionId}`, {
    method: 'DELETE'
  });
};



// Obstacle API functions
export const createObstacle = async (obstacleData) => {
  const formattedData = {
    startPosition: {
      latitude: obstacleData.startPosition.latitude,
      longitude: obstacleData.startPosition.longitude
    },
    endPosition: {
      latitude: obstacleData.endPosition.latitude,
      longitude: obstacleData.endPosition.longitude
    },
    type: obstacleData.type
  };

  return apiRequest(`${MAP_SERVICE_API}/obstacles`, {
    method: 'POST',
    body: JSON.stringify(formattedData)
  });
};

export const getAllObstacles = () => obstaclesCrud.getAll();



export const deleteObstacle = async (obstacleId) => {
  return apiRequest(`${MAP_SERVICE_API}/obstacles/${obstacleId}`, {
    method: 'DELETE'
  });
};

export const analyzeBattle = async (battleData, actions = [], terrain = 'urban', weather = 'clear') => {
  const requestData = {
    battle_data: battleData,
    actions: actions.map(action => ({
      unitId: action.unitId,
      description: action.description,
      priority: action.priority || 'MEDIUM',
      timeframe: action.timeframe || 'SHORT'
    })),
    terrain: terrain,
    weather: weather,
    max_tokens: 1500,
    temperature: 0.7
  };

  return apiRequest(`${INTELLIGENCE_SERVICE_API}/analyze`, {
    method: 'POST',
    body: JSON.stringify(requestData)
  });
};

// Batch API functions to solve N+1 problem
export const getUnitsByIds = async (unitIds) => {
  return apiRequest(`${MAP_SERVICE_API}/units/batch`, {
    method: 'POST',
    body: JSON.stringify({ unitIds })
  });
};

export const getAllUnits = () => unitsCrud.getAll();

// Script API functions
export const createScript = async (scriptData) => {
  return apiRequest(`${MAP_SERVICE_API}/scripts`, {
    method: 'POST',
    body: JSON.stringify(scriptData)
  });
};

export const getAllScripts = () =>
  apiRequest(`${MAP_SERVICE_API}/scripts`);

export const getScriptById = (scriptId) =>
  apiRequest(`${MAP_SERVICE_API}/scripts/${scriptId}`);

export const deleteScript = (scriptId) =>
  apiRequest(`${MAP_SERVICE_API}/scripts/${scriptId}`, { method: 'DELETE' });

export const activateScript = (scriptId) =>
  apiRequest(`${MAP_SERVICE_API}/scripts/${scriptId}/activate`, { method: 'POST' });

export const deactivateScript = (scriptId) =>
  apiRequest(`${MAP_SERVICE_API}/scripts/${scriptId}/deactivate`, { method: 'POST' });

export const pauseScript = (scriptId) =>
  apiRequest(`${MAP_SERVICE_API}/scripts/${scriptId}/pause`, { method: 'POST' });

export const resumeScript = (scriptId) =>
  apiRequest(`${MAP_SERVICE_API}/scripts/${scriptId}/resume`, { method: 'POST' });

// Script Action API functions
export const addScriptAction = async (scriptId, actionData) => {
  return apiRequest(`${MAP_SERVICE_API}/scripts/${scriptId}/actions`, {
    method: 'POST',
    body: JSON.stringify(actionData)
  });
};

export const getScriptActions = (scriptId) =>
  apiRequest(`${MAP_SERVICE_API}/scripts/${scriptId}/actions`);

export const deleteScriptAction = (scriptId, actionId) =>
  apiRequest(`${MAP_SERVICE_API}/scripts/${scriptId}/actions/${actionId}`, { method: 'DELETE' });

export const triggerScriptActionManually = (scriptId, actionId) =>
  apiRequest(`${MAP_SERVICE_API}/scripts/${scriptId}/actions/${actionId}/trigger`, { method: 'POST' });

export const reorderScriptActions = (scriptId, actionIds) =>
  apiRequest(`${MAP_SERVICE_API}/scripts/${scriptId}/actions/reorder`, {
    method: 'POST',
    body: JSON.stringify(actionIds)
  });

// Communications API functions
export const getCommsCoverageStats = (faction) =>
  apiRequest(`${MAP_SERVICE_API}/communications/stats/${faction}`);

export const getIsolatedUnits = (faction) =>
  apiRequest(`${MAP_SERVICE_API}/communications/isolated/${faction}`);

export const refreshCommsStatus = () =>
  apiRequest(`${MAP_SERVICE_API}/communications/refresh`, { method: 'POST' });



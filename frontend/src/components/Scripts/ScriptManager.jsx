import React, { useState, useEffect } from 'react';
import {
  getAllScripts,
  createScript,
  deleteScript,
  activateScript,
  deactivateScript,
  pauseScript,
  resumeScript,
  getScriptActions,
  addScriptAction,
  deleteScriptAction
} from '../../services/api';
import ActionType from '../../enums/ActionType';
import ActionPriority from '../../enums/ActionPriority';
import UnitConfigs from '../../enums/UnitConfigs';
import '../../styles/components/Scripts.css';

const ScriptManager = ({ units, onClose }) => {
  const [scripts, setScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState(null);
  const [scriptActions, setScriptActions] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddAction, setShowAddAction] = useState(false);
  const [loading, setLoading] = useState(false);

  // Script creation form
  const [newScript, setNewScript] = useState({
    name: '',
    description: '',
    targetFaction: 'RED_FORCE'
  });

  // Action creation form
  const [newAction, setNewAction] = useState({
    unitId: '',
    executionOrder: 1,
    actionType: 'MOVE',
    description: '',
    priority: 'MEDIUM',
    triggerType: 'TIME_BASED',
    delaySeconds: 0,
    condition: 'NONE',
    conditionValue: null,
    targetPosition: { latitude: 0, longitude: 0 },
    targetUnitId: null,
    durationSeconds: 60
  });

  useEffect(() => {
    loadScripts();
  }, []);

  useEffect(() => {
    if (selectedScript) {
      loadScriptActions(selectedScript.id);
    }
  }, [selectedScript]);

  const loadScripts = async () => {
    setLoading(true);
    const result = await getAllScripts();
    if (result.success) {
      setScripts(result.data);
    }
    setLoading(false);
  };

  const loadScriptActions = async (scriptId) => {
    const result = await getScriptActions(scriptId);
    if (result.success) {
      setScriptActions(result.data);
    }
  };

  const handleCreateScript = async (e) => {
    e.preventDefault();
    const result = await createScript(newScript);
    if (result.success) {
      setScripts([...scripts, result.data]);
      setShowCreateForm(false);
      setNewScript({ name: '', description: '', targetFaction: 'RED_FORCE' });
    }
  };

  const handleDeleteScript = async (scriptId) => {
    if (window.confirm('Are you sure you want to delete this script?')) {
      const result = await deleteScript(scriptId);
      if (result.success) {
        setScripts(scripts.filter(s => s.id !== scriptId));
        if (selectedScript?.id === scriptId) {
          setSelectedScript(null);
          setScriptActions([]);
        }
      }
    }
  };

  const handleActivateScript = async (scriptId) => {
    const result = await activateScript(scriptId);
    if (result.success) {
      setScripts(scripts.map(s => s.id === scriptId ? result.data : s));
      if (selectedScript?.id === scriptId) {
        setSelectedScript(result.data);
      }
    }
  };

  const handleDeactivateScript = async (scriptId) => {
    const result = await deactivateScript(scriptId);
    if (result.success) {
      setScripts(scripts.map(s => s.id === scriptId ? result.data : s));
      if (selectedScript?.id === scriptId) {
        setSelectedScript(result.data);
      }
    }
  };

  const handlePauseScript = async (scriptId) => {
    const result = await pauseScript(scriptId);
    if (result.success) {
      setScripts(scripts.map(s => s.id === scriptId ? result.data : s));
      if (selectedScript?.id === scriptId) {
        setSelectedScript(result.data);
      }
    }
  };

  const handleResumeScript = async (scriptId) => {
    const result = await resumeScript(scriptId);
    if (result.success) {
      setScripts(scripts.map(s => s.id === scriptId ? result.data : s));
      if (selectedScript?.id === scriptId) {
        setSelectedScript(result.data);
      }
    }
  };

  const handleAddAction = async (e) => {
    e.preventDefault();
    if (!selectedScript) return;

    const result = await addScriptAction(selectedScript.id, {
      ...newAction,
      scriptId: selectedScript.id
    });

    if (result.success) {
      setScriptActions([...scriptActions, result.data]);
      setShowAddAction(false);
      setNewAction({
        ...newAction,
        executionOrder: newAction.executionOrder + 1,
        description: ''
      });
    }
  };

  const handleDeleteAction = async (actionId) => {
    if (!selectedScript) return;
    const result = await deleteScriptAction(selectedScript.id, actionId);
    if (result.success) {
      setScriptActions(scriptActions.filter(a => a.id !== actionId));
    }
  };

  const getUnitLabel = (unitId) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return 'Unknown';
    const config = UnitConfigs.find(c => c.type === unit.unitType && c.faction === unit.faction);
    return config?.label || unit.unitType;
  };

  const getStatusBadge = (script) => {
    if (script.isActive && !script.isPaused) return <span className="status-badge active">Running</span>;
    if (script.isActive && script.isPaused) return <span className="status-badge paused">Paused</span>;
    return <span className="status-badge inactive">Inactive</span>;
  };

  // Filter units by selected script's target faction
  const filteredUnits = selectedScript
    ? units.filter(u => u.faction === selectedScript.targetFaction)
    : units;

  return (
    <div className="script-manager-overlay">
      <div className="script-manager">
        <div className="script-manager-header">
          <h3>🎭 Enemy Script Manager</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="script-manager-content">
          {/* Scripts List */}
          <div className="scripts-panel">
            <div className="panel-header">
              <h4>Scripts</h4>
              <button
                className="btn-primary"
                onClick={() => setShowCreateForm(true)}
              >
                + New Script
              </button>
            </div>

            {loading ? (
              <div className="loading">Loading scripts...</div>
            ) : (
              <div className="scripts-list">
                {scripts.map(script => (
                  <div
                    key={script.id}
                    className={`script-item ${selectedScript?.id === script.id ? 'selected' : ''}`}
                    onClick={() => setSelectedScript(script)}
                  >
                    <div className="script-info">
                      <div className="script-name">{script.name}</div>
                      <div className="script-faction">{script.targetFaction}</div>
                      {getStatusBadge(script)}
                    </div>
                    <div className="script-stats">
                      {script.completedActions}/{script.totalActions} actions
                    </div>
                    <div className="script-controls">
                      {!script.isActive && (
                        <button onClick={(e) => { e.stopPropagation(); handleActivateScript(script.id); }}>
                          ▶️
                        </button>
                      )}
                      {script.isActive && !script.isPaused && (
                        <button onClick={(e) => { e.stopPropagation(); handlePauseScript(script.id); }}>
                          ⏸️
                        </button>
                      )}
                      {script.isActive && script.isPaused && (
                        <button onClick={(e) => { e.stopPropagation(); handleResumeScript(script.id); }}>
                          ▶️
                        </button>
                      )}
                      {script.isActive && (
                        <button onClick={(e) => { e.stopPropagation(); handleDeactivateScript(script.id); }}>
                          ⏹️
                        </button>
                      )}
                      <button
                        className="delete-btn"
                        onClick={(e) => { e.stopPropagation(); handleDeleteScript(script.id); }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
                {scripts.length === 0 && (
                  <div className="no-scripts">No scripts created yet</div>
                )}
              </div>
            )}
          </div>

          {/* Script Actions */}
          <div className="actions-panel">
            {selectedScript ? (
              <>
                <div className="panel-header">
                  <h4>Actions: {selectedScript.name}</h4>
                  <button
                    className="btn-primary"
                    onClick={() => setShowAddAction(true)}
                  >
                    + Add Action
                  </button>
                </div>
                <div className="script-description">{selectedScript.description}</div>

                <div className="actions-timeline">
                  {scriptActions.map((action, index) => (
                    <div key={action.id} className={`action-item status-${action.status?.toLowerCase()}`}>
                      <div className="action-order">{action.executionOrder}</div>
                      <div className="action-details">
                        <div className="action-type">{action.actionType}</div>
                        <div className="action-unit">{getUnitLabel(action.unitId)}</div>
                        <div className="action-trigger">
                          {action.triggerType === 'TIME_BASED' && `After ${action.delaySeconds}s`}
                          {action.triggerType === 'IMMEDIATE' && 'Immediate'}
                          {action.triggerType === 'CONDITION_BASED' && action.condition}
                        </div>
                        <div className="action-description">{action.description}</div>
                        <div className="action-status">{action.status}</div>
                      </div>
                      <button
                        className="delete-action-btn"
                        onClick={() => handleDeleteAction(action.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {scriptActions.length === 0 && (
                    <div className="no-actions">No actions added yet</div>
                  )}
                </div>
              </>
            ) : (
              <div className="no-selection">Select a script to view actions</div>
            )}
          </div>
        </div>

        {/* Create Script Form */}
        {showCreateForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h4>Create New Script</h4>
              <form onSubmit={handleCreateScript}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={newScript.name}
                    onChange={(e) => setNewScript({ ...newScript, name: e.target.value })}
                    placeholder="e.g., Counter-attack at dawn"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newScript.description}
                    onChange={(e) => setNewScript({ ...newScript, description: e.target.value })}
                    placeholder="Describe the script scenario..."
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Target Faction</label>
                  <select
                    value={newScript.targetFaction}
                    onChange={(e) => setNewScript({ ...newScript, targetFaction: e.target.value })}
                  >
                    <option value="RED_FORCE">Red Force (Enemy)</option>
                    <option value="BLUE_FORCE">Blue Force (Friendly)</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Create</button>
                  <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Action Form */}
        {showAddAction && selectedScript && (
          <div className="modal-overlay">
            <div className="modal-content action-form">
              <h4>Add Script Action</h4>
              <form onSubmit={handleAddAction}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Unit</label>
                    <select
                      value={newAction.unitId}
                      onChange={(e) => setNewAction({ ...newAction, unitId: e.target.value })}
                      required
                    >
                      <option value="">-- Select Unit --</option>
                      {filteredUnits.map(unit => (
                        <option key={unit.id} value={unit.id}>
                          {getUnitLabel(unit.id)} - {unit.id.slice(0, 8)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Order</label>
                    <input
                      type="number"
                      value={newAction.executionOrder}
                      onChange={(e) => setNewAction({ ...newAction, executionOrder: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Action Type</label>
                    <select
                      value={newAction.actionType}
                      onChange={(e) => setNewAction({ ...newAction, actionType: e.target.value })}
                    >
                      {Object.values(ActionType).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={newAction.priority}
                      onChange={(e) => setNewAction({ ...newAction, priority: e.target.value })}
                    >
                      {Object.values(ActionPriority).map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Trigger Type</label>
                  <select
                    value={newAction.triggerType}
                    onChange={(e) => setNewAction({ ...newAction, triggerType: e.target.value })}
                  >
                    <option value="IMMEDIATE">Immediate</option>
                    <option value="TIME_BASED">Time Based</option>
                    <option value="CONDITION_BASED">Condition Based</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>

                {newAction.triggerType === 'TIME_BASED' && (
                  <div className="form-group">
                    <label>Delay (seconds)</label>
                    <input
                      type="number"
                      value={newAction.delaySeconds}
                      onChange={(e) => setNewAction({ ...newAction, delaySeconds: parseInt(e.target.value) })}
                      min="0"
                    />
                  </div>
                )}

                {newAction.triggerType === 'CONDITION_BASED' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Condition</label>
                      <select
                        value={newAction.condition}
                        onChange={(e) => setNewAction({ ...newAction, condition: e.target.value })}
                      >
                        <option value="NONE">None</option>
                        <option value="UNIT_IN_RANGE">Enemy in Range</option>
                        <option value="UNDER_ATTACK">Under Attack</option>
                        <option value="SUPPLY_LOW">Supply Low</option>
                        <option value="MORALE_LOW">Morale Low</option>
                        <option value="PREVIOUS_ACTION_COMPLETE">Previous Complete</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Threshold</label>
                      <input
                        type="number"
                        value={newAction.conditionValue || ''}
                        onChange={(e) => setNewAction({ ...newAction, conditionValue: parseFloat(e.target.value) })}
                        placeholder="e.g., 5 for km, 30 for %"
                      />
                    </div>
                  </div>
                )}

                {(newAction.actionType === 'MOVE' || newAction.actionType === 'ATTACK' || newAction.actionType === 'FLANK') && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Target Latitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={newAction.targetPosition.latitude}
                        onChange={(e) => setNewAction({
                          ...newAction,
                          targetPosition: { ...newAction.targetPosition, latitude: parseFloat(e.target.value) }
                        })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Target Longitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={newAction.targetPosition.longitude}
                        onChange={(e) => setNewAction({
                          ...newAction,
                          targetPosition: { ...newAction.targetPosition, longitude: parseFloat(e.target.value) }
                        })}
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={newAction.description}
                    onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                    placeholder="e.g., Move to flanking position"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">Add Action</button>
                  <button type="button" onClick={() => setShowAddAction(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptManager;

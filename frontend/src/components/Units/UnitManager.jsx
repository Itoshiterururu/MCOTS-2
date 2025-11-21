import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import { createUnit, updateUnit, deleteUnit, getUnitActions, deleteAction } from '../../services/api';
import UnitConfigs from '../../enums/UnitConfigs';
import Faction from '../../enums/Faction';
import { calculateFirepower } from '../../utils/calculations';
import { UnitParabola } from './ParabolaRenderer';
import { CommandPost } from './CommandPost';
import ReactDOM from 'react-dom/client';
import UnitHealthBar from './UnitHealthBar';

/**
 * Hook to manage units on the map
 */
export const useUnitManager = (units = [], onUnitCreated) => {
  const [showUnitForm, setShowUnitForm] = React.useState(false);
  const [selectedExistingUnit, setSelectedExistingUnit] = React.useState(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [commandPosts, setCommandPosts] = React.useState({});
  const [placingCommandPost, setPlacingCommandPost] = React.useState(null);

  // Handle clicking on the map to create a new unit
  const handleMapClick = (position, selectedUnit, onPositionSelect) => {
    if (selectedUnit) {
      onPositionSelect?.(position);
      setShowUnitForm(true);
    }
  };

  // Handle clicking on an existing unit
  const handleExistingUnitClick = (unit) => {
    // Prevent showing form if unit was just dragged
    if (!isDragging) {
      setSelectedExistingUnit(unit);
      setShowUnitForm(true);
    }
    setIsDragging(false);
  };

  // Handle marker drag start
  const handleMarkerDrag = () => {
    setIsDragging(true);
  };

  // Handle marker drag end and update unit position
  const handleMarkerDragEnd = async (e, unit) => {
    try {
      const newPosition = e.target.getLatLng();
      
      const updatedUnit = {
        ...unit,
        position: {
          latitude: newPosition.lat,
          longitude: newPosition.lng
        }
      };

      const result = await updateUnit(updatedUnit);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update unit position');
      }
      
      // Update local units state
      const updatedUnits = units.map(u => u.id === unit.id ? result.data : u);
      onUnitCreated(updatedUnits);
      
    } catch (error) {
      console.error('Failed to update unit position:', error);
    }
  };

  // Handle unit deletion
  const handleUnitDelete = async (unitId) => {
    try {
      // First, get all actions associated with this unit
      const actionsResponse = await getUnitActions(unitId);
      
      if (actionsResponse.success) {
        // Delete all actions associated with this unit
        const deletePromises = actionsResponse.data.map(action => 
          deleteAction(action.id)
        );
        
        // Wait for all action deletions to complete
        await Promise.all(deletePromises);
        console.log(`Deleted ${actionsResponse.data.length} actions associated with unit ${unitId}`);
        
        // Create and dispatch a custom event to notify other components about actions being deleted
        const actionDeleteEvent = new CustomEvent('unitActionsDeleted', { 
          detail: { 
            unitId: String(unitId),
            deletedActionIds: actionsResponse.data.map(action => String(action.id))
          }
        });
        document.dispatchEvent(actionDeleteEvent);
      }
      
      // Delete command post if exists
      setCommandPosts(prev => {
        const updated = { ...prev };
        delete updated[unitId];
        return updated;
      });
      
      // Now delete the unit itself
      await deleteUnit(unitId);
      
      // Update the parent's state by filtering out the deleted unit
      const updatedUnits = units.filter(u => u.id !== unitId);
      onUnitCreated(updatedUnits);
      setShowUnitForm(false);
      setSelectedExistingUnit(null);
      return true;
    } catch (error) {
      console.error('Failed to delete unit:', error);
      return false;
    }
  };

  // Handle unit form submission (create or update)
  const handleUnitFormSubmit = async (unitData, selectedUnit) => {
    try {
      if (selectedExistingUnit) {
        // Updating existing unit
        const updatedUnit = {
          id: selectedExistingUnit.id,
          position: unitData.position,
          status: unitData.status,
          personnel: unitData.personnel,
          vehicles: unitData.vehicles,
          firepower: calculateFirepower(unitData.vehicles, unitData.supplyLevel, unitData.personnel),
          supplyLevel: unitData.supplyLevel,
          morale: unitData.morale,
          direction: unitData.direction,
          updatedAt: new Date().toISOString(),
          // Preserve other fields
          unitType: selectedExistingUnit.unitType || selectedExistingUnit.type,
          faction: selectedExistingUnit.faction,
          unitRank: selectedExistingUnit.unitRank
        };
        
        const result = await updateUnit(updatedUnit);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to update unit');
        }
        
        // Update local units state
        const updatedUnits = units.map(u => u.id === selectedExistingUnit.id ? result.data : u);
        onUnitCreated(updatedUnits);
      } else {
        // Creating new unit
        const newUnitData = {
          unitType: selectedUnit.type,
          faction: selectedUnit.faction,
          unitRank: selectedUnit.unitRank,
          position: unitData.position,
          status: unitData.status,
          personnel: unitData.personnel,
          vehicles: unitData.vehicles,
          supplyLevel: unitData.supplyLevel,
          morale: unitData.morale,
          direction: unitData.direction,
          firepower: calculateFirepower(unitData.vehicles, unitData.supplyLevel, unitData.personnel)
        };
        console.log('Creating unit with data:', JSON.stringify(newUnitData, null, 2));
        const newUnit = await createUnit(newUnitData);
        if (newUnit.success && newUnit.data) {
          onUnitCreated(newUnit.data);
        } else {
          throw new Error(newUnit.error || 'Failed to create unit');
        }
      }
      
      // Close form and clear state
      setShowUnitForm(false);
      setSelectedExistingUnit(null);
      return true;
    } catch (error) {
      console.error('Failed to save unit:', error);
      return false;
    }
  };

  // Handle unit form cancel
  const handleUnitFormCancel = (onPositionSelect) => {
    setShowUnitForm(false);
    setSelectedExistingUnit(null);
    onPositionSelect?.(null);
  };

  // Process battle analysis results - update/delete units based on analysis
  const processUnitAnalysisResults = async (result, mapRef) => {
    // Check if there are unit data in the result
    if (!result?.data?.unitData?.units || !Array.isArray(result.data.unitData.units)) {
      console.error('No unit data found in analysis result');
      return null;
    }
    
    // Collect all updated units data
    const updatedUnitsData = [];
    
    // Process all units from the analysis result
    const movePromises = result.data.unitData.units.map(async unitData => {
      // Check if the unit has ID
      if (unitData.id) {
        // Find the unit by its ID in the current units list
        const existingUnit = units.find(u => u.id === unitData.id);
        
        // If such unit is found, process it according to its personnel value
        if (existingUnit) {
          // If personnel is 0, delete the unit
          if (unitData.personnel === 0) {
            try {
              await deleteUnit(unitData.id);
              console.log(`Unit ${unitData.id} deleted because personnel is 0`);
              return null;
            } catch (error) {
              console.error(`Failed to delete unit ${unitData.id}:`, error);
            }
          } else {
            // Create a new unit object with updated properties
            const updatedUnitObject = {
              ...existingUnit, // Keep existing properties
              ...unitData,     // Override with new properties from battle service
              // Make sure position is properly structured
              position: unitData.position || existingUnit.position
            };
            
            // Update the unit data in the database
            const result = await updateUnit(updatedUnitObject);
            
            if (result.success && result.data) {
              updatedUnitsData.push(result.data);
              return result.data;
            }
          }
        }
      }
      return null;
    });
    
    try {
      // Wait for all update requests to complete
      await Promise.all(movePromises);
      
      // Bulk update units state, keeping only non-deleted units
      const allUpdatedUnits = units
        .filter(unit => {
          const unitFromAnalysis = result.data.unitData.units.find(u => u.id === unit.id);
          // Keep unit if:
          // 1. It wasn't in the analyzed area
          // 2. It was in the analyzed area but doesn't have personnel === 0
          return !unitFromAnalysis || unitFromAnalysis.personnel !== 0;
        })
        .map(unit => {
          // Update properties of remaining units
          const updatedUnit = updatedUnitsData.find(u => u && u.id === unit.id);
          return updatedUnit || unit;
        });
      
      // Update state through callback
      onUnitCreated(allUpdatedUnits);
      
      // Consistently wait just long enough for the React to re-render with new positions
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return allUpdatedUnits;
    } catch (error) {
      console.error('Error processing unit analysis results:', error);
      return null;
    }
  };

  // Handle command post placement
  const handlePlaceCommandPost = (unitId) => {
    console.log('Placing command post for unit:', unitId);
    setPlacingCommandPost(unitId);
    setShowUnitForm(false);
    setSelectedExistingUnit(null);
  };

  const handleCommandPostClick = (position) => {
    if (placingCommandPost) {
      console.log('Command post placed at:', position);
      const unit = units.find(u => u.id === placingCommandPost);
      if (unit) {
        const unitConfig = UnitConfigs.find(u => u.type === unit.unitType && u.faction === unit.faction);
        setCommandPosts(prev => ({
          ...prev,
          [placingCommandPost]: {
            position,
            config: unitConfig,
            rank: unit.unitRank,
            id: placingCommandPost
          }
        }));
      }
      setPlacingCommandPost(null);
    }
  };

  const handleDeleteCommandPost = (unitId) => {
    setCommandPosts(prev => {
      const updated = { ...prev };
      delete updated[unitId];
      return updated;
    });
  };

  return {
    showUnitForm,
    setShowUnitForm,
    selectedExistingUnit,
    setSelectedExistingUnit,
    isDragging,
    setIsDragging,
    commandPosts,
    setCommandPosts,
    placingCommandPost,
    handleMapClick,
    handleExistingUnitClick,
    handleMarkerDrag,
    handleMarkerDragEnd,
    handleUnitDelete,
    handleUnitFormSubmit,
    handleUnitFormCancel,
    processUnitAnalysisResults,
    handlePlaceCommandPost,
    handleCommandPostClick,
    handleDeleteCommandPost
  };
};

/**
 * Get area width based on unit rank (in meters)
 */
const getUnitAreaWidth = (rank) => {
  switch(rank) {
    case 'PLATOON': return 400;
    case 'COMPANY': return 2000;
    case 'BATTALION': return 7000;
    default: return 0;
  }
};

/**
 * Get area depth based on unit rank (in meters)
 */
const getUnitAreaDepth = (rank) => {
  switch(rank) {
    case 'PLATOON': return 300;
    case 'COMPANY': return 1100;
    case 'BATTALION': return 3000;
    default: return 0;
  }
};

/**
 * Get rank symbol for display
 */
const getRankSymbol = (rank) => {
  switch(rank) {
    case 'SQUAD': return '•';
    case 'PLATOON': return '•••';
    case 'COMPANY': return '|';
    case 'BATTALION': return '||';
    default: return '•••';
  }
};

/**
 * Create custom icon with rank indicator
 */
const createUnitIcon = (unitConfig, rank, isDestroyed = false) => {
  const rankSymbol = getRankSymbol(rank);

  if (isDestroyed) {
    // Show destroyed marker
    return new DivIcon({
      html: `
        <div class="custom-unit-marker destroyed-unit">
          <div style="font-size: 32px; filter: grayscale(100%) opacity(0.7);">💀</div>
          <div class="destroyed-label" style="position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%); color: #e74c3c; font-size: 10px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.9); background: rgba(0,0,0,0.8); padding: 2px 6px; border-radius: 3px; white-space: nowrap;">DESTROYED</div>
        </div>
      `,
      className: 'custom-unit-icon destroyed',
      iconSize: [40, 60],
      iconAnchor: [20, 30]
    });
  }

  return new DivIcon({
    html: `
      <div class="custom-unit-marker">
        <img src="${unitConfig.icon}" alt="unit" style="width: ${unitConfig.size[0]}px; height: ${unitConfig.size[1]}px;" />
        <div class="rank-indicator" style="position: absolute; top: -8px; left: 50%; transform: translateX(-50%); color: white; font-size: 12px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.9); background: rgba(0,0,0,0.7); padding: 1px 4px; border-radius: 3px; line-height: 1; pointer-events: none; z-index: 1000;">${rankSymbol}</div>
      </div>
    `,
    className: 'custom-unit-icon',
    iconSize: [unitConfig.size[0], unitConfig.size[1] + 15],
    iconAnchor: [unitConfig.size[0]/2, unitConfig.size[1]/2]
  });
};

/**
 * Component to render unit areas for blue forces only
 */
export const UnitAreaRenderer = React.memo(({ units }) => {
  const blueUnits = units.filter(unit => unit.faction === Faction.BLUE_FORCE && unit.unitRank !== 'SQUAD');
  
  return (
    <>
      {blueUnits.map(unit => {
        if (!unit?.position) {
          return null;
        }
        
        const width = getUnitAreaWidth(unit.unitRank);
        const depth = getUnitAreaDepth(unit.unitRank);
        if (width === 0) return null;
        
        const direction = unit.direction || 0;
        
        return (
          <UnitParabola
            key={`parabola-${unit.id}-${direction}`}
            unit={unit}
            width={width}
            depth={depth}
            direction={direction}
          />
        );
      })}
    </>
  );
});

/**
 * Component to render command posts
 */
export const CommandPostRenderer = React.memo(({ commandPosts, onDelete }) => {
  return (
    <>
      {Object.entries(commandPosts).map(([unitId, cpData]) => (
        <CommandPost
          key={`cp-${unitId}`}
          position={cpData.position}
          unit={cpData}
          onDelete={onDelete}
        />
      ))}
    </>
  );
});

/**
 * Component to render units on the map
 */
export const UnitRenderer = React.memo(({ 
  units, 
  isCropping, 
  selectedPosition, 
  selectedUnit,
  selectedExistingUnit,
  onMarkerDrag,
  onMarkerDragEnd,
  onUnitClick
}) => {
  // Create a ref to store marker references for animations
  const markerRefs = React.useRef({});
  
  // Store previous positions to detect programmatic changes
  const previousPositionsRef = React.useRef({});
  
  // Track whether dragging is happening
  const isDraggingRef = React.useRef({});
  
  // Memoize units that actually changed
  const changedUnits = React.useMemo(() => {
    return units.filter(unit => {
      if (!unit?.id || !unit?.position) return false;
      const prevPos = previousPositionsRef.current[unit.id];
      const newPos = [unit.position.latitude, unit.position.longitude];
      return !prevPos || prevPos[0] !== newPos[0] || prevPos[1] !== newPos[1];
    });
  }, [units]);

  // Effect to handle smooth transitions only for changed units
  React.useEffect(() => {
    changedUnits.forEach(unit => {
      const marker = markerRefs.current[unit.id];
      if (!marker) return;
      
      const newPos = [unit.position.latitude, unit.position.longitude];
      const prevPos = previousPositionsRef.current[unit.id];
      
      if (prevPos && !isDraggingRef.current[unit.id]) {
        const element = marker.getElement();
        if (element) {
          element.style.transition = 'transform 0.8s ease-in-out';
        }
        marker.setLatLng(newPos);
      } else {
        marker.setLatLng(newPos);
      }
      
      previousPositionsRef.current[unit.id] = newPos;
    });
  }, [changedUnits]);

  return (
    <>
      {/* Show marker for new unit placement */}
      {selectedPosition && selectedUnit && !selectedExistingUnit && (
        <NewUnitMarker selectedUnit={selectedUnit} position={selectedPosition} />
      )}

      {/* Display existing units */}
      {React.useMemo(() => units.map(unit => {
        if (unit && unit.position) {
          const position = [unit.position.latitude, unit.position.longitude];
          const unitConfig = UnitConfigs.find(u => u.type === unit.unitType && u.faction === unit.faction);
          if (!unitConfig) {
            console.warn(`Unit config not found for type: ${unit.unitType}, faction: ${unit.faction}`);
            return null;
          }

          const unitRank = unit.unitRank || 'PLATOON';
          const isDestroyed = unit.status === 'DESTROYED' || (unit.personnel !== undefined && unit.personnel <= 0);
          const customIcon = createUnitIcon(unitConfig, unitRank, isDestroyed);

          return (
            <Marker
              key={unit.id}
              position={position}
              icon={customIcon}
              draggable={!isCropping && !isDestroyed} // Destroyed units can't be dragged
              opacity={isDestroyed ? 0.7 : 1.0}
              eventHandlers={{
                click: (e) => {
                  // Left-click just shows popup, prevent opening edit form
                  e.originalEvent.stopPropagation();
                },
                contextmenu: (e) => {
                  // Right-click opens edit form
                  e.originalEvent.preventDefault();
                  onUnitClick(unit);
                },
                dragstart: (e) => {
                  // Mark this unit as currently being dragged
                  isDraggingRef.current[unit.id] = true;

                  // Remove any transition during manual drag
                  const element = e.target.getElement();
                  if (element) {
                    element.style.transition = 'none';
                  }

                  onMarkerDrag(e, unit);
                },
                dragend: (e) => {
                  // Unit is no longer being dragged
                  isDraggingRef.current[unit.id] = false;

                  // Update the stored position
                  const newPos = e.target.getLatLng();
                  previousPositionsRef.current[unit.id] = [newPos.lat, newPos.lng];

                  onMarkerDragEnd(e, unit);
                },
                add: (e) => {
                  // Store reference to the marker for animations
                  markerRefs.current[unit.id] = e.target;
                  // Initialize position tracking
                  previousPositionsRef.current[unit.id] = position;
                }
              }}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: isDestroyed ? '#e74c3c' : '#333' }}>
                    {unitConfig.name} ({unitRank})
                    {isDestroyed && <span style={{ marginLeft: '8px', fontSize: '14px' }}>💀</span>}
                  </h3>
                  {isDestroyed && (
                    <div style={{
                      padding: '6px 10px',
                      background: 'rgba(231, 76, 60, 0.2)',
                      border: '1px solid #e74c3c',
                      borderRadius: '4px',
                      color: '#e74c3c',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      marginBottom: '8px',
                      textAlign: 'center'
                    }}>
                      ⚠️ UNIT DESTROYED
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                    <div><strong>Type:</strong> {unit.unitType}</div>
                    <div><strong>Faction:</strong> {unit.faction === Faction.BLUE_FORCE ? '🔵 Blue Force' : '🔴 Red Force'}</div>
                    <div><strong>Personnel:</strong> {unit.personnel || 0}</div>
                    <div><strong>Vehicles:</strong> {unit.vehicles || 0}</div>
                    <div><strong>Firepower:</strong> {unit.firepower || 0}</div>
                  </div>
                  {!isDestroyed && <UnitHealthBar unit={unit} />}
                </div>
              </Popup>
            </Marker>
          );
        }
        return null;
      }), [units, isCropping, onUnitClick, onMarkerDrag, onMarkerDragEnd])}
    </>
  );
});

/**
 * Component to render a new unit marker
 */
const NewUnitMarker = React.memo(({ selectedUnit, position }) => {
  const selectedUnitConfig = UnitConfigs.find(
    u => u.type === (selectedUnit.unitType || selectedUnit.type) && u.faction === selectedUnit.faction
  );
  
  if (!selectedUnitConfig || !position) return null;

  const unitRank = selectedUnit.unitRank || 'PLATOON';
  const customIcon = createUnitIcon(selectedUnitConfig, unitRank);

  return (
    <Marker
      position={[position.latitude, position.longitude]}
      icon={customIcon}
    />
  );
});
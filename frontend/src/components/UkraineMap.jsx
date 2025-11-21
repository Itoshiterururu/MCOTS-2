import React, { useRef, useEffect, forwardRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import ObstacleType from '../enums/ObstacleType';
import '../styles/components/Map.css';
import '../styles/components/Communications.css';

// Import extracted components
import MapInteractions from './Map/Core/MapInteractions';
import MapControls from './Map/MapControls';
import UnitConfigForm from './Units/UnitConfigForm';
import { ObstacleRenderer, useObstacleManager } from './Obstacles/ObstacleManager';
import { UnitRenderer, useUnitManager, UnitAreaRenderer, CommandPostRenderer } from './Units/UnitManager';
import ConfirmationDialog from './UI/ConfirmationDialog';
import CommunicationOverlay from './Communications/CommunicationOverlay';
import FieldOfFireOverlay from './FireControl/FieldOfFireOverlay';
import FireMissionOverlay from './FireControl/FireMissionOverlay';
import MovementTrails from './Units/MovementTrails';

const UkraineMap = forwardRef(({ selectedPosition, onPositionSelect, units = [], obstacles = [], selectedUnit, selectedObstacle, onUnitCreated, onObstacleCreated, onObstacleSelect }, ref) => {
  // Refs
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // State for notification and confirmation dialogs
  const [notification, setNotification] = React.useState(null);
  const [confirmDialog, setConfirmDialog] = React.useState({
    show: false,
    message: '',
    obstacleId: null
  });

  // State for communications overlay
  const [showCommsOverlay, setShowCommsOverlay] = React.useState(true);

  // State for field of fire and fire missions
  const [showFieldOfFire, setShowFieldOfFire] = React.useState(true);
  const [showFireMissions, setShowFireMissions] = React.useState(true);
  const [fireMissions, setFireMissions] = React.useState([]);
  
  // Configuration for obstacle colors
  const obstacleColors = React.useMemo(() => ({
    [ObstacleType.MINEFIELD]: { color: '#000000', dashArray: '5, 10' },
    [ObstacleType.WIRE]: { color: '#75B548', dashArray: '10, 5' }
  }), []);

  // Use custom hooks for different functionality
  const obstacle = useObstacleManager(onObstacleCreated);
  const unitManager = useUnitManager(units, onUnitCreated);

  // Fetch fire missions
  useEffect(() => {
    const fetchFireMissions = async () => {
      try {
        const { default: fireControlService } = await import('../services/fireControlService');
        const missions = await fireControlService.getUserFireMissions();
        setFireMissions(missions);
      } catch (error) {
        console.error('Failed to fetch fire missions:', error);
      }
    };

    fetchFireMissions();
    const interval = setInterval(fetchFireMissions, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);
  
  // Make the ref accessible to parent component
  React.useImperativeHandle(ref, () => ({
    getMap: () => mapRef.current,
  }));

  // React to selectedObstacle changes from parent component
  useEffect(() => {
    if (selectedObstacle) {
      // Display notification to guide user
      setNotification({
        show: true,
        type: 'info',
        message: 'Click on the map to place the start point of the obstacle.',
        timeout: 5000
      });
    } else {
      // Exit obstacle placement mode when obstacle is deselected
      obstacle.setObstacleStart(null);
    }
  }, [selectedObstacle]);

  // Handle obstacle click confirmation
  const showDeleteConfirmation = (obstacleId, obstacleType) => {
    setConfirmDialog({
      show: true,
      message: `Are you sure you want to delete this ${obstacleType === ObstacleType.MINEFIELD ? 'minefield' : 'barbed wire'}?`,
      obstacleId: obstacleId
    });
  };

  // Handle obstacle click on map
  const handleObstacleClickMap = (e) => {
    obstacle.handleObstacleClick(e, selectedObstacle, onObstacleSelect, setNotification, onObstacleCreated);
  };

  // Expose command post placement function globally
  React.useEffect(() => {
    window.placeCommandPost = unitManager.handlePlaceCommandPost;
    return () => {
      delete window.placeCommandPost;
    };
  }, [unitManager.handlePlaceCommandPost]);

  // Add a useEffect to handle notification timeouts
  useEffect(() => {
    if (notification?.show) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, notification.timeout || 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);
  
  // Listen for force map update events to ensure units get repositioned
  useEffect(() => {
    const handleForceMapUpdate = (event) => {
      if (mapRef.current) {
        console.log('UkraineMap received forceMapUpdate event, updating map rendering');
        // Force the map to redraw by invalidating its size, which helps with rendering
        mapRef.current.invalidateSize();
      }
    };
    
    const handleClearMap = async () => {
      try {
        // Delete all units
        const unitDeletePromises = units.map(unit => 
          fetch(`/api/v1/map/units/${unit.id}`, { 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          })
        );
        
        // Delete all obstacles
        const obstacleDeletePromises = obstacles.map(obstacle => 
          fetch(`/api/v1/map/obstacles/${obstacle.id}`, { 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          })
        );
        
        await Promise.all([...unitDeletePromises, ...obstacleDeletePromises]);
        onUnitCreated([]);
        onObstacleCreated([]);
        
        // Clear command posts
        unitManager.setCommandPosts({});
        
        // Trigger obstacle update
        document.dispatchEvent(new CustomEvent('obstaclesCleared'));
      } catch (error) {
        console.error('Failed to clear map:', error);
      }
    };
    
    document.addEventListener('forceMapUpdate', handleForceMapUpdate);
    document.addEventListener('clearMap', handleClearMap);
    
    return () => {
      document.removeEventListener('forceMapUpdate', handleForceMapUpdate);
      document.removeEventListener('clearMap', handleClearMap);
    };
  }, [units, obstacles, onUnitCreated, onObstacleCreated, unitManager]);

  return (
    <div 
      className={`map-container ${selectedObstacle ? 'obstacle-placement-active' : ''}`}
      ref={mapContainerRef}
    >
      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <ConfirmationDialog
          message={confirmDialog.message}
          onConfirm={() => {
            obstacle.handleObstacleDelete(confirmDialog.obstacleId, setNotification);
            setConfirmDialog({ show: false, message: '', obstacleId: null });
          }}
          onCancel={() => setConfirmDialog({ show: false, message: '', obstacleId: null })}
        />
      )}

      {/* Notification component */}
      {notification?.show && (
        <div 
          className={`notification ${notification.type}`}
          style={{ '--notification-timeout': notification.timeout }}
        >
          {notification.message}
        </div>
      )}
      
      {/* Map Container */}
      <MapContainer 
        center={[48.379433, 31.165581]} 
        zoom={6} 
        id="map"
        preferCanvas={true}
        ref={mapRef}
      >
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          attribution='© <a href="https://stadiamaps.com/">Stadia Maps</a>'
          maxZoom={20}
        />

        {/* Map Controls */}
        <MapControls units={units} />

        {/* Map Interaction Handler */}
        <MapInteractions
          selectedUnit={!selectedObstacle ? selectedUnit : null}
          isPlacingObstacle={!!selectedObstacle}
          isPlacingCommandPost={!!unitManager.placingCommandPost}
          onObstacleClick={handleObstacleClickMap}
          onPositionSelect={(pos) => {
            console.log('UkraineMap: Position selected', pos, 'placingCommandPost:', unitManager.placingCommandPost);
            if (unitManager.placingCommandPost) {
              unitManager.handleCommandPostClick(pos);
            } else {
              unitManager.handleMapClick(pos, selectedUnit, onPositionSelect);
            }
          }}
          onMouseMove={obstacle.handleObstacleMouseMove}
        />

        {/* Render communications coverage overlay */}
        <CommunicationOverlay units={units} showOverlay={showCommsOverlay} />

        {/* Render field of fire sectors */}
        {showFieldOfFire && <FieldOfFireOverlay units={units} />}

        {/* Render fire mission zones */}
        {showFireMissions && <FireMissionOverlay fireMissions={fireMissions} />}

        {/* Render movement trails */}
        <MovementTrails units={units} />

        {/* Render unit areas */}
        <UnitAreaRenderer units={units} />
        
        {/* Render obstacles */}
        <ObstacleRenderer
          obstacles={obstacles}
          obstacleColors={obstacleColors}
          onObstacleClick={showDeleteConfirmation}
          obstacleStart={obstacle.obstacleStart}
          currentMouseLatLng={obstacle.currentMouseLatLng}
          selectedObstacle={selectedObstacle}
        />
        
        {/* Render command posts */}
        <CommandPostRenderer
          commandPosts={unitManager.commandPosts}
          onDelete={unitManager.handleDeleteCommandPost}
        />
        
        {/* Render units */}
        <UnitRenderer
          units={units}
          selectedPosition={selectedPosition}
          selectedUnit={selectedUnit}
          selectedExistingUnit={unitManager.selectedExistingUnit}
          onMarkerDrag={unitManager.handleMarkerDrag}
          onMarkerDragEnd={unitManager.handleMarkerDragEnd}
          onUnitClick={unitManager.handleExistingUnitClick}
        />
      </MapContainer>

      {/* Unit configuration form */}
      {unitManager.showUnitForm && (
        <UnitConfigForm
          onSubmit={(data) => unitManager.handleUnitFormSubmit(data, selectedUnit)}
          onCancel={() => unitManager.handleUnitFormCancel(onPositionSelect)}
          selectedUnit={selectedUnit}
          position={selectedPosition}
          existingUnit={unitManager.selectedExistingUnit}
          onDelete={unitManager.handleUnitDelete}
        />
      )}

      {/* Map overlay toggles */}
      <div className="map-controls">
        <label className={`comms-overlay-toggle ${showCommsOverlay ? 'active' : ''}`}>
          <input
            type="checkbox"
            checked={showCommsOverlay}
            onChange={(e) => setShowCommsOverlay(e.target.checked)}
          />
          📡 Communications Coverage
        </label>

        <label className={`comms-overlay-toggle ${showFieldOfFire ? 'active' : ''}`}>
          <input
            type="checkbox"
            checked={showFieldOfFire}
            onChange={(e) => setShowFieldOfFire(e.target.checked)}
          />
          🎯 Fields of Fire
        </label>

        <label className={`comms-overlay-toggle ${showFireMissions ? 'active' : ''}`}>
          <input
            type="checkbox"
            checked={showFireMissions}
            onChange={(e) => setShowFireMissions(e.target.checked)}
          />
          💥 Fire Missions
        </label>
      </div>
    </div>
  );
});

export default UkraineMap;
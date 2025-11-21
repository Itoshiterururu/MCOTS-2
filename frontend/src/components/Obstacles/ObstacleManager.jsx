import React from 'react';
import { Polyline, Marker } from 'react-leaflet';
import { Icon } from 'leaflet';
import { createObstacle, deleteObstacle, getAllObstacles } from '../../services/api';
import ObstacleType from '../../enums/ObstacleType';

/**
 * Component to render wire icons along a wire obstacle
 */
const WireIcons = ({ startPosition, endPosition, obstacleId, onObstacleClick, isPlacement = false }) => {
  // Function to calculate positions for points along the line based on line length
  const calculateIconPositions = (start, end) => {
    const positions = [];
    
    // Add start point
    positions.push(start);
    
    // Calculate distance between points in degrees
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Define fixed spacing between icons (in degrees)
    const iconSpacing = 0.01; // Approximately ~60000m (60km) depending on latitude
    
    // Calculate how many icons should be placed based on distance
    const numIcons = Math.max(0, Math.floor(distance / iconSpacing));
    
    // Place icons at even intervals
    if (numIcons > 0) {
      for (let i = 1; i <= numIcons; i++) {
        const ratio = i / (numIcons + 1);
        const lat = start[0] + dx * ratio;
        const lng = start[1] + dy * ratio;
        positions.push([lat, lng]);
      }
    }
    
    // Add end point
    positions.push(end);
    
    return positions;
  };
  
  const start = [startPosition.latitude, startPosition.longitude];
  const end = [endPosition.latitude, endPosition.longitude];
  
  const iconPositions = calculateIconPositions(start, end);
  
  const wireIcon = new Icon({
    iconUrl: '/icons/Wire.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
  
  // Handler for icon click
  const handleIconClick = (e) => {
    if (isPlacement || !onObstacleClick || !obstacleId) return;
    
    // Stop propagation to prevent map click
    e.originalEvent.stopPropagation();
    
    // Call the obstacle click function with the wire's ID
    onObstacleClick(obstacleId, ObstacleType.WIRE);
  };
  
  return (
    <>
      {iconPositions.map((position, index) => (
        <Marker 
          key={`wire-${obstacleId}-${index}`} 
          position={position} 
          icon={wireIcon} 
          zIndexOffset={1000}
          eventHandlers={{
            click: handleIconClick
          }}
        />
      ))}
    </>
  );
};

/**
 * Component to render minefield icons along a minefield obstacle
 */
const MinefieldIcons = React.memo(({ startPosition, endPosition, obstacleId, onObstacleClick, isPlacement = false }) => {
  // Function to calculate positions for points along the line based on line length
  const calculateIconPositions = React.useCallback((start, end) => {
    const positions = [];
    
    // Calculate distance between points in degrees
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Define fixed spacing between icons (in degrees)
    const iconSpacing = 0.01; // Same spacing as wire icons
    
    // Calculate how many icons should be placed based on distance
    const numIcons = Math.max(0, Math.floor(distance / iconSpacing));
    
    // Place icons at even intervals but skip start and end points
    if (numIcons > 0) {
      for (let i = 1; i <= numIcons; i++) {
        const ratio = i / (numIcons + 1);
        const lat = start[0] + dx * ratio;
        const lng = start[1] + dy * ratio;
        positions.push([lat, lng]);
      }
    }
    
    return positions;
  }, []);
  
  const start = [startPosition.latitude, startPosition.longitude];
  const end = [endPosition.latitude, endPosition.longitude];
  
  // Memoize icon positions to prevent unnecessary re-renders
  const iconPositions = React.useMemo(() => 
    calculateIconPositions(start, end), 
  [start, end, calculateIconPositions]);
  
  // Create two alternating minefield icons with proper anchoring
  const minefield1Icon = React.useMemo(() => new Icon({
    iconUrl: '/icons/Minefield_1.png',
    iconSize: [38, 32],
    iconAnchor: [19, 16] // Center anchor point
  }), []);
  
  const minefield2Icon = React.useMemo(() => new Icon({
    iconUrl: '/icons/Minefield_2.png',
    iconSize: [38, 32],
    iconAnchor: [19, 16] // Center anchor point
  }), []);
  
  // Handler for icon click
  const handleIconClick = React.useCallback((e) => {
    if (isPlacement || !onObstacleClick || !obstacleId) return;
    
    // Stop propagation to prevent map click
    e.originalEvent.stopPropagation();
    
    // Call the obstacle click function with the minefield's ID
    onObstacleClick(obstacleId, ObstacleType.MINEFIELD);
  }, [isPlacement, onObstacleClick, obstacleId]);
  
  return (
    <>
      {iconPositions.map((position, index) => (
        <Marker 
          key={`minefield-${obstacleId}-${index}`}
          position={position} 
          icon={index % 2 === 0 ? minefield1Icon : minefield2Icon} 
          zIndexOffset={1000}
          eventHandlers={{
            click: handleIconClick
          }}
        />
      ))}
    </>
  );
});

/**
 * Hook to manage obstacles on the map
 */
export const useObstacleManager = (onObstacleCreated) => {
  const [obstacles, setObstacles] = React.useState([]);
  const [obstacleStart, setObstacleStart] = React.useState(null);
  const [currentMouseLatLng, setCurrentMouseLatLng] = React.useState(null);

  // Load obstacles when component mounts
  React.useEffect(() => {
    const fetchObstacles = async () => {
      try {
        const result = await getAllObstacles();
        if (result.success) {
          setObstacles(result.data);
        } else {
          console.error('Failed to fetch obstacles:', result.error);
        }
      } catch (error) {
        console.error('Error fetching obstacles:', error);
      }
    };

    fetchObstacles();
  }, []);

  // Handle mouse movement for obstacle placement preview
  const handleObstacleMouseMove = (e) => {
    if (obstacleStart) {
      setCurrentMouseLatLng([e.latlng.lat, e.latlng.lng]);
    }
  };

  // Handle map click for obstacle placement
  const handleObstacleClick = async (e, selectedObstacle, onObstacleSelect, setNotification, onObstacleCreated) => {
    if (!selectedObstacle) return;
    
    // Ensure we're working with a valid event with latlng
    if (!e || !e.latlng) {
      console.error('Invalid click event for obstacle placement:', e);
      return;
    }
    
    console.log('Obstacle click handler:', selectedObstacle, obstacleStart ? 'placing end point' : 'placing start point');
    
    if (!obstacleStart) {
      // First click - set start point
      setObstacleStart([e.latlng.lat, e.latlng.lng]);
      setCurrentMouseLatLng([e.latlng.lat, e.latlng.lng]);
      
      // Update notification for second point
      if (setNotification) {
        setNotification({
          show: true,
          type: 'info',
          message: 'Now click to place the end point of the obstacle.',
          timeout: 5000
        });
      }
    } else {
      // Second click - create obstacle between points
      try {
        // Prevent creating obstacles that are too small (might be accidental double-clicks)
        const startLat = obstacleStart[0];
        const startLng = obstacleStart[1];
        const endLat = e.latlng.lat;
        const endLng = e.latlng.lng;
        
        const distance = Math.sqrt(
          Math.pow(endLat - startLat, 2) + 
          Math.pow(endLng - startLng, 2)
        );
        
        if (distance < 0.0001) { // Very small threshold to prevent microscopic obstacles
          console.warn('Obstacle too small, ignoring');
          return;
        }
        
        const newObstacle = {
          startPosition: {
            latitude: startLat,
            longitude: startLng
          },
          endPosition: {
            latitude: endLat,
            longitude: endLng
          },
          type: selectedObstacle
        };
        
        const result = await createObstacle(newObstacle);
        
        if (result.success) {
          // Add new obstacle to state
          setObstacles(prev => [...prev, result.data]);
          
          // Notify parent component
          if (onObstacleCreated) {
            onObstacleCreated(result.data);
          }
          
          // Show success notification
          if (setNotification) {
            setNotification({
              show: true,
              type: 'success',
              message: `${selectedObstacle === 'MINEFIELD' ? 'Minefield' : 'Barbed Wire'} has been placed successfully.`,
              timeout: 3000
            });
          }
        } else {
          throw new Error(result.error || 'Failed to create obstacle');
        }
      } catch (error) {
        console.error('Error creating obstacle:', error);
        
        // Show error notification
        if (setNotification) {
          setNotification({
            show: true,
            type: 'error',
            message: 'Failed to place obstacle. Please try again.',
            timeout: 5000
          });
        }
      } finally {
        // Reset obstacle start point
        setObstacleStart(null);
        setCurrentMouseLatLng(null);
        
        // Cancel obstacle selection in the sidebar
        if (onObstacleSelect) {
          onObstacleSelect(null);
        }
      }
    }
  };
  
  // Function to handle obstacle deletion
  const handleObstacleDelete = async (obstacleId, setNotification) => {
    try {
      const result = await deleteObstacle(obstacleId);
      
      if (result.success) {
        // Remove obstacle from state
        setObstacles(prev => prev.filter(obs => obs.id !== obstacleId));
        
        // Show success notification
        if (setNotification) {
          setNotification({
            show: true,
            type: 'success',
            message: 'Obstacle removed successfully.',
            timeout: 3000
          });
        }
        return true;
      } else {
        throw new Error(result.error || 'Failed to delete obstacle');
      }
    } catch (error) {
      console.error('Error deleting obstacle:', error);
      
      // Show error notification
      if (setNotification) {
        setNotification({
          show: true,
          type: 'error',
          message: 'Failed to remove obstacle. Please try again.',
          timeout: 5000
        });
      }
      return false;
    }
  };

  return {
    obstacles,
    setObstacles,
    obstacleStart,
    setObstacleStart,
    currentMouseLatLng,
    setCurrentMouseLatLng,
    handleObstacleMouseMove,
    handleObstacleClick,
    handleObstacleDelete
  };
};

/**
 * Component to render obstacles on the map
 */
export const ObstacleRenderer = ({ 
  obstacles, 
  obstacleColors, 
  onObstacleClick,
  obstacleStart,
  currentMouseLatLng,
  selectedObstacle
}) => {
  // Use useLeaflet hook to get the map instance if available
  const [map, setMap] = React.useState(null);

  // Get the map instance once the component is mounted
  React.useEffect(() => {
    if (window.L && window.L.map && document.getElementById('map')) {
      try {
        // Try to get existing map instance
        const mapInstance = window.L.map._layers ? 
          Object.values(window.L.map._layers).find(layer => layer._container)?.context : 
          null;
        
        setMap(mapInstance);
      } catch (error) {
        console.error('Error accessing map instance:', error);
      }
    }
  }, []);

  return (
    <>
      {/* Display permanent obstacles */}
      {obstacles.map(obstacle => {
        if (!obstacle || !obstacle.startPosition || !obstacle.endPosition) return null;
        
        const positions = [
          [obstacle.startPosition.latitude, obstacle.startPosition.longitude],
          [obstacle.endPosition.latitude, obstacle.endPosition.longitude]
        ];
        
        const style = obstacleColors[obstacle.type] || { color: '#000000', dashArray: '5, 5' };
        
        // Calculate parallel lines for minefield
        let rightParallelLine = null;
        let leftParallelLine = null;
        let startConnectingLine = null;
        let endConnectingLine = null;
        
        if (obstacle.type === ObstacleType.MINEFIELD) {
          const p1 = positions[0];
          const p2 = positions[1];
          
          // Calculate perpendicular vectors (to the right and left)
          const dx = p2[0] - p1[0];  // Change in latitude
          const dy = p2[1] - p1[1];  // Change in longitude
          const len = Math.sqrt(dx * dx + dy * dy);
          
          if (len > 0) {
            // Normalize and rotate 90 degrees to get perpendicular vectors
            const perpX = dy / len;   // Perpendicular X (positive Y direction becomes positive X)
            const perpY = -dx / len;  // Perpendicular Y (positive X direction becomes negative Y)
            
            // Fixed distance in coordinate units (doubled from previous 100 pixels to 200 pixels)
            const offset = 0.002;  // Doubled the offset to increase distance between lines
            
            // Calculate the corner points for right and left parallel lines
            const rightStart = [positions[0][0] + perpX * offset, positions[0][1] + perpY * offset];
            const rightEnd = [positions[1][0] + perpX * offset, positions[1][1] + perpY * offset];
            const leftStart = [positions[0][0] - perpX * offset, positions[0][1] - perpY * offset];
            const leftEnd = [positions[1][0] - perpX * offset, positions[1][1] - perpY * offset];
            
            // Generate right parallel line coordinates
            rightParallelLine = [rightStart, rightEnd];
            
            // Generate left parallel line coordinates
            leftParallelLine = [leftStart, leftEnd];
            
            // Create connecting lines at the start and end
            startConnectingLine = [leftStart, rightStart];
            endConnectingLine = [leftEnd, rightEnd];
          }
        }
        
        return (
          <React.Fragment key={obstacle.id}>
            {/* Main obstacle line */}
            <Polyline 
              positions={positions}
              pathOptions={{
                color: style.color,
                weight: 4,
                dashArray: '',
                opacity: obstacle.type === ObstacleType.MINEFIELD ? 0 : 1
              }}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  if (onObstacleClick) onObstacleClick(obstacle.id, obstacle.type);
                }
              }}
            />
            
            {/* Parallel lines for minefield (both sides) */}
            {obstacle.type === ObstacleType.MINEFIELD && rightParallelLine && (
              <Polyline
                key={`${obstacle.id}-parallel-right`}
                positions={rightParallelLine}
                pathOptions={{
                  color: style.color,
                  weight: 4,
                  dashArray: '',
                  opacity: 1
                }}
                eventHandlers={{
                  click: (e) => {
                    e.originalEvent.stopPropagation();
                    if (onObstacleClick) onObstacleClick(obstacle.id, obstacle.type);
                  }
                }}
              />
            )}
            
            {/* Left parallel line for minefield */}
            {obstacle.type === ObstacleType.MINEFIELD && leftParallelLine && (
              <Polyline
                key={`${obstacle.id}-parallel-left`}
                positions={leftParallelLine}
                pathOptions={{
                  color: style.color,
                  weight: 4,
                  dashArray: '',
                  opacity: 1
                }}
                eventHandlers={{
                  click: (e) => {
                    e.originalEvent.stopPropagation();
                    if (onObstacleClick) onObstacleClick(obstacle.id, obstacle.type);
                  }
                }}
              />
            )}
            
            {/* Connecting line at the start of the minefield */}
            {obstacle.type === ObstacleType.MINEFIELD && startConnectingLine && (
              <Polyline
                key={`${obstacle.id}-connect-start`}
                positions={startConnectingLine}
                pathOptions={{
                  color: style.color,
                  weight: 4,
                  dashArray: '',
                  opacity: 1
                }}
                eventHandlers={{
                  click: (e) => {
                    e.originalEvent.stopPropagation();
                    if (onObstacleClick) onObstacleClick(obstacle.id, obstacle.type);
                  }
                }}
              />
            )}
            
            {/* Connecting line at the end of the minefield */}
            {obstacle.type === ObstacleType.MINEFIELD && endConnectingLine && (
              <Polyline
                key={`${obstacle.id}-connect-end`}
                positions={endConnectingLine}
                pathOptions={{
                  color: style.color,
                  weight: 4,
                  dashArray: '',
                  opacity: 1
                }}
                eventHandlers={{
                  click: (e) => {
                    e.originalEvent.stopPropagation();
                    if (onObstacleClick) onObstacleClick(obstacle.id, obstacle.type);
                  }
                }}
              />
            )}
            
            {/* Wire icons */}
            {obstacle.type === ObstacleType.WIRE && (
              <WireIcons 
                startPosition={obstacle.startPosition} 
                endPosition={obstacle.endPosition} 
                obstacleId={obstacle.id}
                onObstacleClick={onObstacleClick}
              />
            )}

            {/* Minefield icons */}
            {obstacle.type === ObstacleType.MINEFIELD && (
              <MinefieldIcons 
                startPosition={obstacle.startPosition} 
                endPosition={obstacle.endPosition} 
                obstacleId={obstacle.id}
                onObstacleClick={onObstacleClick}
              />
            )}
          </React.Fragment>
        );
      })}
      
      {/* Display obstacle being placed - line from start point to current mouse position */}
      {obstacleStart && currentMouseLatLng && (
        <>
          <Polyline 
            positions={[
              obstacleStart,
              currentMouseLatLng
            ]}
            pathOptions={{
              color: obstacleColors[selectedObstacle]?.color || '#000000',
              weight: 4,
              dashArray: obstacleColors[selectedObstacle]?.dashArray || '5, 5',
              opacity: 1
            }}
          />
          {/* Прибрано відображення іконок на етапі розміщення перешкоди */}
        </>
      )}
    </>
  );
};
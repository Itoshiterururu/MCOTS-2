import React, { useEffect, useRef } from 'react';
import { useMapEvents } from 'react-leaflet';

/**
 * Component to handle map interactions like clicks and mouse movements
 */
const MapInteractions = ({ 
  selectedUnit, 
  onPositionSelect, 
  isPlacingObstacle, 
  onObstacleClick, 
  onMouseMove,
  isPlacingCommandPost
}) => {
  // Add a ref to track the last click time to prevent double clicks
  const lastClickTime = useRef(0);

  const map = useMapEvents({
    click(e) {
      // Prevent rapid double-clicks that could cause issues
      const now = Date.now();
      if (now - lastClickTime.current < 300) { // 300ms threshold
        return;
      }
      lastClickTime.current = now;
      
      if (isPlacingObstacle) {
        if (onObstacleClick) {
          // Ensure we're passing a valid click event
          console.log("MapInteractions: Obstacle click detected", e.latlng);
          onObstacleClick(e);
        }
        return;
      }

      // Always pass position for command post or unit placement
      const position = {
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      };
      
      if (onPositionSelect) {
        console.log('MapInteractions: Position selected', position, 'isPlacingCommandPost:', isPlacingCommandPost);
        onPositionSelect(position);
      }
    },
    // Add mousemove event handler
    mousemove(e) {
      if (isPlacingObstacle && onMouseMove) {
        onMouseMove(e);
      }
    }
  });

  useEffect(() => {
    if (isPlacingObstacle) {
      map.dragging.disable();
      map.scrollWheelZoom.disable();
    } else {
      map.dragging.enable();
      map.scrollWheelZoom.enable();
    }
  }, [isPlacingObstacle, map]);

  return null;
};

export default MapInteractions;
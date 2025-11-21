import React from 'react';
import { Polygon } from 'react-leaflet';

/**
 * Generate smooth parabolic curve (y = x²)
 * @param {Array} center - [lat, lng] center position
 * @param {number} width - width in meters
 * @param {number} direction - direction in degrees (0 = north, 90 = east, etc.)
 * @param {number} depth - depth of parabola in meters (default: width/4)
 * @returns {Array} Array of [lat, lng] points forming smooth parabola
 */
const generateParabolaPoints = (center, width, direction = 0, depth = null) => {
  const [centerLat, centerLng] = center;
  const actualDepth = depth || width / 4;
  const halfWidth = width / 2;
  const directionRad = (direction * Math.PI) / 180;
  const earthRadius = 6371000;
  
  const points = [];
  const numPoints = 60;
  
  // Generate smooth parabolic curve y = x²
  for (let i = 0; i <= numPoints; i++) {
    const t = (i / numPoints) * 2 - 1; // t from -1 to 1
    const x = t * halfWidth;
    const y = (t * t * t * t) * actualDepth; // More curved edges y = x⁴
    
    // Convert to degrees and rotate
    const xDelta = x / earthRadius * (180 / Math.PI);
    const yDelta = y / earthRadius * (180 / Math.PI);
    const rotatedX = xDelta * Math.cos(directionRad) - yDelta * Math.sin(directionRad);
    const rotatedY = xDelta * Math.sin(directionRad) + yDelta * Math.cos(directionRad);
    
    const lat = centerLat + rotatedY;
    const lng = centerLng + rotatedX / Math.cos(centerLat * Math.PI / 180);
    points.push([lat, lng]);
  }
  
  points.push(points[0]); // Close shape
  return points;
};

/**
 * Component to render a single parabola for a unit
 */
export const UnitParabola = React.memo(({ unit, width, direction = 0 }) => {
  if (!unit?.position) return null;
  
  const center = [unit.position.latitude, unit.position.longitude];
  const points = generateParabolaPoints(center, width, direction);
  
  return (
    <Polygon
      key={`parabola-${unit.id}`}
      positions={points}
      pathOptions={{
        color: '#0066ff',
        fillColor: '#0066ff',
        fillOpacity: 0.2,
        weight: 2,
        opacity: 0.8
      }}
    />
  );
});

export default UnitParabola;
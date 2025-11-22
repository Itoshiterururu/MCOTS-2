import React from 'react';
import { Polygon, Polyline, Circle } from 'react-leaflet';

const FieldOfFireOverlay = ({ units }) => {
  // Calculate points for field of fire sector
  const calculateSectorPoints = (unit) => {
    if (!unit.fieldOfFire || !unit.position) return null;

    const { latitude, longitude } = unit.position;
    const { leftAzimuth, rightAzimuth, maxRange, minRange } = unit.fieldOfFire;

    // Convert meters to approximate degrees (rough approximation)
    const maxRangeDeg = maxRange / 111000; // 1 degree ≈ 111km
    const minRangeDeg = minRange / 111000;

    // Generate arc points
    const points = [];
    const numPoints = 20; // Number of points in the arc

    let startAngle = leftAzimuth;
    let endAngle = rightAzimuth;

    // Handle wrapping around 0/360
    if (endAngle < startAngle) {
      endAngle += 360;
    }

    const angleStep = (endAngle - startAngle) / numPoints;

    // Outer arc
    for (let i = 0; i <= numPoints; i++) {
      const angle = (startAngle + (i * angleStep)) % 360;
      const angleRad = (angle - 90) * Math.PI / 180; // Adjust for coordinate system

      const lat = latitude + maxRangeDeg * Math.sin(angleRad);
      const lng = longitude + maxRangeDeg * Math.cos(angleRad) / Math.cos(latitude * Math.PI / 180);

      points.push([lat, lng]);
    }

    // Inner arc (reverse direction)
    if (minRange > 0) {
      for (let i = numPoints; i >= 0; i--) {
        const angle = (startAngle + (i * angleStep)) % 360;
        const angleRad = (angle - 90) * Math.PI / 180;

        const lat = latitude + minRangeDeg * Math.sin(angleRad);
        const lng = longitude + minRangeDeg * Math.cos(angleRad) / Math.cos(latitude * Math.PI / 180);

        points.push([lat, lng]);
      }
    } else {
      // If no min range, close at center
      points.push([latitude, longitude]);
    }

    return points;
  };

  // Calculate center line
  const calculateCenterLine = (unit) => {
    if (!unit.fieldOfFire || !unit.position) return null;

    const { latitude, longitude } = unit.position;
    const { centerAzimuth, maxRange } = unit.fieldOfFire;

    const maxRangeDeg = maxRange / 111000;
    const angleRad = (centerAzimuth - 90) * Math.PI / 180;

    const endLat = latitude + maxRangeDeg * Math.sin(angleRad);
    const endLng = longitude + maxRangeDeg * Math.cos(angleRad) / Math.cos(latitude * Math.PI / 180);

    return [
      [latitude, longitude],
      [endLat, endLng]
    ];
  };

  const getColor = (unit) => {
    if (!unit.fieldOfFire) return '#888';

    switch (unit.fieldOfFire.priority) {
      case 'PRIMARY':
        return unit.faction === 'BLUE_FORCE' ? '#0066cc' : '#cc0000';
      case 'SECONDARY':
        return '#ffaa00';
      case 'FINAL_PROTECTIVE_FIRE':
        return '#ff0000';
      default:
        return '#888';
    }
  };

  return (
    <>
      {units.filter(u => u && u.fieldOfFire && u.fieldOfFire.active).map(unit => {
        const sectorPoints = calculateSectorPoints(unit);
        const centerLine = calculateCenterLine(unit);
        const color = getColor(unit);

        if (!sectorPoints || !centerLine) return null;

        return (
          <React.Fragment key={`fof-${unit.id}`}>
            {/* Field of fire sector */}
            <Polygon
              positions={sectorPoints}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.2,
                weight: 2,
                dashArray: '10, 10'
              }}
            />

            {/* Center line */}
            <Polyline
              positions={centerLine}
              pathOptions={{
                color: '#ffff00',
                weight: 2,
                dashArray: '5, 5',
                opacity: 0.8
              }}
            />

            {/* Min range circle (dead zone) */}
            {unit.fieldOfFire.minRange > 0 && (
              <Circle
                center={[unit.position.latitude, unit.position.longitude]}
                radius={unit.fieldOfFire.minRange}
                pathOptions={{
                  color: '#ff6600',
                  fillColor: '#ff6600',
                  fillOpacity: 0.1,
                  weight: 1,
                  dashArray: '5, 5'
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default FieldOfFireOverlay;

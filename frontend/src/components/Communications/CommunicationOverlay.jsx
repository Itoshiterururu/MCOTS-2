import React from 'react';
import { Circle, Tooltip } from 'react-leaflet';

/**
 * Component that renders communication coverage areas for COMMUNICATIONS units
 */
const CommunicationOverlay = ({ units, showOverlay = true }) => {
  if (!showOverlay) return null;

  // Filter only COMMUNICATIONS units
  const commsUnits = units.filter(unit =>
    unit && unit.position && (unit.unitType === 'COMMUNICATIONS' || unit.type === 'COMMUNICATIONS')
  );

  if (commsUnits.length === 0) return null;

  return (
    <>
      {commsUnits.map(unit => {
        if (!unit || !unit.position || !unit.position.latitude || !unit.position.longitude) {
          return null;
        }

        // Range is in km, Leaflet needs meters
        const radiusInMeters = (unit.range || 8) * 1000;

        // Color based on faction
        const isBlueForce = unit.faction === 'BLUE_FORCE';
        const strokeColor = isBlueForce ? '#0066cc' : '#cc0000';
        const fillColor = isBlueForce ? '#0088ff' : '#ff4444';

        return (
          <Circle
            key={`comms-coverage-${unit.id}`}
            center={[unit.position.latitude, unit.position.longitude]}
            radius={radiusInMeters}
            pathOptions={{
              color: strokeColor,
              fillColor: fillColor,
              fillOpacity: 0.08,
              weight: 2,
              dashArray: '10, 5',
              opacity: 0.6
            }}
          >
            <Tooltip>
              <div>
                <strong>Communications Coverage</strong><br />
                Faction: {isBlueForce ? 'Blue Force' : 'Red Force'}<br />
                Range: {unit.range || 8} km<br />
                Signal Strength: {unit.commsStrength || 100}%
              </div>
            </Tooltip>
          </Circle>
        );
      })}
    </>
  );
};

export default CommunicationOverlay;

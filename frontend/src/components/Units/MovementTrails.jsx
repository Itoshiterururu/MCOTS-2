import React, { useEffect, useState } from 'react';
import { Polyline } from 'react-leaflet';
import Faction from '../../enums/Faction';

/**
 * Component to track and display unit movement trails
 */
const MovementTrails = ({ units }) => {
  const [trails, setTrails] = useState({});

  useEffect(() => {
    if (!units || units.length === 0) return;

    setTrails(prevTrails => {
      const newTrails = { ...prevTrails };

      units.forEach(unit => {
        if (!unit?.id || !unit?.position || unit.status === 'DESTROYED') return;

        const position = [unit.position.latitude, unit.position.longitude];

        if (!newTrails[unit.id]) {
          // Initialize trail for new unit
          newTrails[unit.id] = {
            positions: [position],
            faction: unit.faction,
            unitType: unit.unitType
          };
        } else {
          const lastPos = newTrails[unit.id].positions[newTrails[unit.id].positions.length - 1];

          // Only add if position changed significantly (more than 0.0001 degrees ~ 11 meters)
          if (Math.abs(lastPos[0] - position[0]) > 0.0001 || Math.abs(lastPos[1] - position[1]) > 0.0001) {
            newTrails[unit.id].positions.push(position);

            // Keep only last 20 positions to avoid cluttering
            if (newTrails[unit.id].positions.length > 20) {
              newTrails[unit.id].positions.shift();
            }
          }
        }
      });

      return newTrails;
    });
  }, [units]);

  // Listen for map clear events
  useEffect(() => {
    const handleClearTrails = () => {
      setTrails({});
    };

    document.addEventListener('clearMap', handleClearTrails);
    document.addEventListener('obstaclesCleared', handleClearTrails);

    return () => {
      document.removeEventListener('clearMap', handleClearTrails);
      document.removeEventListener('obstaclesCleared', handleClearTrails);
    };
  }, []);

  return (
    <>
      {Object.entries(trails).map(([unitId, trail]) => {
        if (trail.positions.length < 2) return null;

        const color = trail.faction === Faction.BLUE_FORCE ? '#4a90e2' : '#e74c3c';

        return (
          <Polyline
            key={`trail-${unitId}`}
            positions={trail.positions}
            color={color}
            weight={2}
            opacity={0.6}
            dashArray="5, 10"
          />
        );
      })}
    </>
  );
};

export default MovementTrails;

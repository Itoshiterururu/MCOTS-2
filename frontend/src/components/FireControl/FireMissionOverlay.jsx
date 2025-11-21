import React from 'react';
import { Circle, Polygon, Popup } from 'react-leaflet';

const FireMissionOverlay = ({ fireMissions }) => {
  const getColor = (mission) => {
    switch (mission.status) {
      case 'PLANNED':
        return '#4a9eff';
      case 'READY':
        return '#ffaa00';
      case 'FIRING':
        return '#ff0000';
      case 'COMPLETE':
        return '#4caf50';
      case 'CANCELLED':
        return '#888';
      default:
        return '#888';
    }
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      'FLASH': '🔴 FLASH',
      'IMMEDIATE': '🟠 IMMEDIATE',
      'PRIORITY': '🟡 PRIORITY',
      'ROUTINE': '⚪ ROUTINE'
    };
    return labels[priority] || priority;
  };

  return (
    <>
      {fireMissions.map(mission => {
        const color = getColor(mission);

        return (
          <React.Fragment key={`fire-mission-${mission.id}`}>
            {/* Target area - circular */}
            {mission.targetCenter && mission.targetRadius && (
              <>
                {/* Target center circle */}
                <Circle
                  center={[mission.targetCenter.latitude, mission.targetCenter.longitude]}
                  radius={mission.targetRadius}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.3,
                    weight: 3,
                    dashArray: mission.status === 'FIRING' ? '5, 5' : 'none'
                  }}
                >
                  <Popup>
                    <div className="fire-mission-popup">
                      <h4>🎯 {mission.callSign || 'Fire Mission'}</h4>
                      <div><strong>Type:</strong> {mission.missionType}</div>
                      <div><strong>Status:</strong> {mission.status}</div>
                      <div><strong>Priority:</strong> {getPriorityLabel(mission.priority)}</div>
                      <div><strong>Method:</strong> {mission.methodOfFire}</div>
                      <div><strong>Rounds:</strong> {mission.roundsFired} / {mission.roundsAllocated}</div>
                      {mission.description && <div><strong>Notes:</strong> {mission.description}</div>}
                    </div>
                  </Popup>
                </Circle>

                {/* Effects radius (danger zone) */}
                {mission.effectsRadius && (
                  <Circle
                    center={[mission.targetCenter.latitude, mission.targetCenter.longitude]}
                    radius={mission.effectsRadius}
                    pathOptions={{
                      color: '#ff6600',
                      fillColor: '#ff6600',
                      fillOpacity: 0.1,
                      weight: 2,
                      dashArray: '10, 5'
                    }}
                  />
                )}
              </>
            )}

            {/* Target area - polygonal */}
            {mission.targetPolygon && mission.targetPolygon.length > 0 && (
              <Polygon
                positions={mission.targetPolygon.map(p => [p.latitude, p.longitude])}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.3,
                  weight: 3
                }}
              >
                <Popup>
                  <div className="fire-mission-popup">
                    <h4>🎯 {mission.callSign || 'Fire Mission'}</h4>
                    <div><strong>Type:</strong> {mission.missionType}</div>
                    <div><strong>Status:</strong> {mission.status}</div>
                    <div><strong>Priority:</strong> {getPriorityLabel(mission.priority)}</div>
                    <div><strong>Method:</strong> {mission.methodOfFire}</div>
                    <div><strong>Rounds:</strong> {mission.roundsFired} / {mission.roundsAllocated}</div>
                    {mission.description && <div><strong>Notes:</strong> {mission.description}</div>}
                  </div>
                </Popup>
              </Polygon>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default FireMissionOverlay;

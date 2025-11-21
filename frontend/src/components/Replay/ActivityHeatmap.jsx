import React, { useEffect, useState } from 'react';
import { Circle } from 'react-leaflet';

const ActivityHeatmap = ({ events, snapshots, currentSnapshotIndex }) => {
  const [activityZones, setActivityZones] = useState([]);

  useEffect(() => {
    calculateActivityZones();
  }, [events, snapshots, currentSnapshotIndex]);

  const calculateActivityZones = () => {
    if (!events || !snapshots || snapshots.length === 0) return;

    // Get events up to current time
    const currentTime = snapshots[currentSnapshotIndex]?.timestamp;
    if (!currentTime) return;

    const relevantEvents = events.filter(event => {
      return new Date(event.timestamp) <= new Date(currentTime);
    });

    // Create a grid to count events by location
    const grid = {};
    const gridSize = 0.5; // degrees (about 55km at this latitude)

    relevantEvents.forEach(event => {
      if (event.location) {
        const gridX = Math.floor(event.location.latitude / gridSize);
        const gridY = Math.floor(event.location.longitude / gridSize);
        const key = `${gridX},${gridY}`;

        if (!grid[key]) {
          grid[key] = {
            lat: gridX * gridSize + gridSize / 2,
            lng: gridY * gridSize + gridSize / 2,
            count: 0,
            events: []
          };
        }

        grid[key].count++;
        grid[key].events.push(event);
      }
    });

    // Convert to array and sort by intensity
    const zones = Object.values(grid)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Show top 20 zones

    setActivityZones(zones);
  };

  const getHeatmapColor = (count, maxCount) => {
    const intensity = count / maxCount;

    if (intensity > 0.7) return { color: '#ff0000', opacity: 0.6 };
    if (intensity > 0.4) return { color: '#ff6600', opacity: 0.5 };
    if (intensity > 0.2) return { color: '#ffaa00', opacity: 0.4 };
    return { color: '#ffff00', opacity: 0.3 };
  };

  if (activityZones.length === 0) return null;

  const maxCount = Math.max(...activityZones.map(z => z.count));

  return (
    <>
      {activityZones.map((zone, idx) => {
        const { color, opacity } = getHeatmapColor(zone.count, maxCount);
        const radius = Math.min(30000 + (zone.count * 5000), 80000); // Scale radius

        return (
          <Circle
            key={idx}
            center={[zone.lat, zone.lng]}
            radius={radius}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: opacity,
              weight: 0
            }}
          />
        );
      })}
    </>
  );
};

export default ActivityHeatmap;

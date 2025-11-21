import React from 'react';
import { useMap } from 'react-leaflet';
import '../../styles/components/MapControls.css';

const MapControls = ({ units }) => {
  const map = useMap();

  // Calculate center of battle based on units
  const centerOnBattle = () => {
    if (units.length === 0) return;

    // Calculate average position of all units
    const avgLat = units.reduce((sum, u) => sum + u.position.latitude, 0) / units.length;
    const avgLng = units.reduce((sum, u) => sum + u.position.longitude, 0) / units.length;

    // Find bounds to determine zoom
    const lats = units.map(u => u.position.latitude);
    const lngs = units.map(u => u.position.longitude);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Calculate the bounds with padding
    const bounds = [
      [minLat - 0.01, minLng - 0.01],
      [maxLat + 0.01, maxLng + 0.01]
    ];

    // Fit map to bounds
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  };

  // Default battle area (Kyiv region - based on demo script coordinates)
  const centerOnDefaultBattle = () => {
    map.setView([50.4901, 30.5734], 11); // Center between blue and red forces
  };

  return (
    <div className="map-zoom-controls">
      <button
        className="map-control-btn center-battle-btn"
        onClick={units.length > 0 ? centerOnBattle : centerOnDefaultBattle}
        title="Центрувати на бойовій зоні"
      >
        🎯 Центрувати на бою
      </button>
      <button
        className="map-control-btn zoom-in-btn"
        onClick={() => map.zoomIn()}
        title="Збільшити"
      >
        ➕
      </button>
      <button
        className="map-control-btn zoom-out-btn"
        onClick={() => map.zoomOut()}
        title="Зменшити"
      >
        ➖
      </button>
    </div>
  );
};

export default MapControls;

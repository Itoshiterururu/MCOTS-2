import React from 'react';
import { Marker } from 'react-leaflet';
import { DivIcon } from 'leaflet';

/**
 * Create command post icon based on unit config
 */
const createCommandPostIcon = (unitConfig, rank) => {
  const getRankSymbol = (rank) => {
    switch(rank) {
      case 'SQUAD': return '•';
      case 'PLATOON': return '•••';
      case 'COMPANY': return '|';
      case 'BATTALION': return '||';
      default: return '•••';
    }
  };
  
  const rankSymbol = getRankSymbol(rank);
  
  return new DivIcon({
    html: `
      <div class="command-post-marker" style="position: relative;">
        <img src="${unitConfig.icon}" alt="unit" style="width: ${unitConfig.size[0]}px; height: ${unitConfig.size[1]}px;" />
        <div class="rank-indicator" style="position: absolute; top: -8px; left: 50%; transform: translateX(-50%); color: white; font-size: 12px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.9); background: rgba(0,0,0,0.7); padding: 1px 4px; border-radius: 3px; line-height: 1; pointer-events: none; z-index: 1000;">${rankSymbol}</div>
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: 3px;
          height: ${unitConfig.size[1] + 10}px;
          background: #000;
          z-index: 1001;
        "></div>
      </div>
    `,
    className: 'command-post-icon',
    iconSize: [unitConfig.size[0], unitConfig.size[1] + 15],
    iconAnchor: [unitConfig.size[0]/2, unitConfig.size[1]/2]
  });
};

/**
 * Component to render command posts
 */
export const CommandPost = React.memo(({ position, unit, onDelete }) => {
  const icon = createCommandPostIcon(unit.config, unit.rank);
  
  return (
    <Marker
      position={[position.latitude, position.longitude]}
      icon={icon}
      eventHandlers={{
        contextmenu: () => onDelete && onDelete(unit.id)
      }}
    />
  );
});

export default CommandPost;
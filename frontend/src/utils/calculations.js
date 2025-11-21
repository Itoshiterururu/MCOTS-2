// Simple firepower calculation for frontend (backend will override)
export const calculateFirepower = (vehicles, supplyLevel, personnel) => {
  return Math.round(((vehicles / 5.0) * (supplyLevel / 5.0) * (personnel / 5.0)) / 100.0);
};

// Icon positions calculation for obstacles
export const calculateIconPositions = (start, end, includeEndpoints = true) => {
  const positions = [];
  
  if (includeEndpoints) positions.push(start);
  
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const distance = Math.sqrt(dx * dx + dy * dy);
  const iconSpacing = 0.01;
  const numIcons = Math.max(0, Math.floor(distance / iconSpacing));
  
  if (numIcons > 0) {
    for (let i = 1; i <= numIcons; i++) {
      const ratio = i / (numIcons + 1);
      positions.push([start[0] + dx * ratio, start[1] + dy * ratio]);
    }
  }
  
  if (includeEndpoints) positions.push(end);
  
  return positions;
};
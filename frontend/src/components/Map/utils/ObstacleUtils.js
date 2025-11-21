/**
 * Utility functions for handling map obstacles
 */

/**
 * Check if a line (obstacle) intersects with a rectangle (crop area)
 */
export const isObstacleInCropArea = (obstacle, bounds) => {
  if (!obstacle || !obstacle.startPosition || !obstacle.endPosition || !bounds) return false;
  
  // Convert obstacle start and end positions to leaflet latLng objects
  const startPoint = [obstacle.startPosition.latitude, obstacle.startPosition.longitude];
  const endPoint = [obstacle.endPosition.latitude, obstacle.endPosition.longitude];
  
  // Check if either end of the obstacle is inside the bounds
  if (bounds.contains(startPoint) || bounds.contains(endPoint)) {
    return true;
  }
  
  // Check if the line intersects with any of the rectangle edges
  const rectangleCorners = [
    [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
    [bounds.getNorthWest().lat, bounds.getNorthWest().lng],
    [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
    [bounds.getSouthEast().lat, bounds.getSouthEast().lng]
  ];
  
  // Check each edge of the rectangle for intersection
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    if (doLineSegmentsIntersect(
      startPoint[0], startPoint[1], 
      endPoint[0], endPoint[1], 
      rectangleCorners[i][0], rectangleCorners[i][1], 
      rectangleCorners[j][0], rectangleCorners[j][1]
    )) {
      return true;
    }
  }
  
  return false;
};

/**
 * Helper function to check if two line segments intersect
 */
export const doLineSegmentsIntersect = (p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y) => {
  // Calculate the direction of the lines
  const d1x = p2x - p1x;
  const d1y = p2y - p1y;
  const d2x = p4x - p3x;
  const d2y = p4y - p3y;
  
  // Calculate the determinant
  const denominator = d1y * d2x - d1x * d2y;
  
  // If denominator is zero, lines are parallel
  if (denominator === 0) {
    return false;
  }
  
  // Calculate the parameters of intersection
  const ua = ((p3x - p1x) * d1y - (p3y - p1y) * d1x) / denominator;
  const ub = ((p3x - p1x) * d2y - (p3y - p1y) * d2x) / denominator;
  
  // Check if the intersection point is within both line segments
  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
};
package uaigroup.mapservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Position {
    private double latitude;
    private double longitude;
    
    public GeoJsonPoint toGeoJsonPoint() {
        // GeoJSON format: [longitude, latitude]
        return new GeoJsonPoint(this.longitude, this.latitude);
    }
    
    public static Position fromGeoJsonPoint(GeoJsonPoint point) {
        if (point == null) {
            throw new IllegalArgumentException("GeoJsonPoint cannot be null");
        }
        return new Position(point.getY(), point.getX());
    }
}

package uaigroup.mapservice.controller.dto;

import lombok.Data;

@Data
public class FieldOfFireRequest {
    private int centerAzimuth;
    private int leftAzimuth;
    private int rightAzimuth;
    private int maxRange;
    private int minRange;
    private boolean active;
    private String priority; // PRIMARY, SECONDARY, FINAL_PROTECTIVE_FIRE
    private String description;
}

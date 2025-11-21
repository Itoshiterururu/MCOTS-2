package uaigroup.mapservice.controller.dto;

import lombok.Data;
import uaigroup.mapservice.model.*;

@Data
public class FormationCreateRequest {
    private UnitType unitType;
    private UnitRank rank;
    private Faction faction;
    private Position hqPosition;
    private FormationType formationType;
    private int spacing; // meters, default 100
    private int orientation; // degrees, default 0 (North)
}

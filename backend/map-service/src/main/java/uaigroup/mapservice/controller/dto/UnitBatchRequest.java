package uaigroup.mapservice.controller.dto;

import lombok.Data;
import java.util.List;

@Data
public class UnitBatchRequest {
    private List<String> unitIds;
}
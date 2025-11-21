package uaigroup.mapservice.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.stereotype.Component;
import uaigroup.mapservice.model.GeneralUnit;

@Component
public class GeneralUnitJsonConverter {
    
    private final ObjectMapper objectMapper;
    
    public GeneralUnitJsonConverter() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }
    
    /**
     * Конвертує об'єкт GeneralUnit в JSON рядок
     */
    public String toJson(GeneralUnit unit) {
        try {
            return objectMapper.writeValueAsString(unit);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting GeneralUnit to JSON", e);
        }
    }
    
    /**
     * Створює об'єкт GeneralUnit з JSON рядка
     */
    public GeneralUnit fromJson(String json) {
        try {
            return objectMapper.readValue(json, GeneralUnit.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting JSON to GeneralUnit", e);
        }
    }
}
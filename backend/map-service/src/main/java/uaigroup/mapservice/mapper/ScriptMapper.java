package uaigroup.mapservice.mapper;

import org.springframework.stereotype.Component;
import uaigroup.mapservice.controller.dto.ScriptCreateRequest;
import uaigroup.mapservice.model.Script;

import java.util.UUID;

@Component
public class ScriptMapper {

    public Script toEntity(ScriptCreateRequest request, String userId) {
        Script script = new Script();

        script.setId(UUID.randomUUID().toString());
        script.setUserId(userId);
        script.setName(request.name());
        script.setDescription(request.description());
        script.setTargetFaction(request.targetFaction());
        script.setActive(false);
        script.setPaused(false);
        script.setTotalDurationSeconds(0);
        script.setElapsedSeconds(0);
        script.setTotalActions(0);
        script.setCompletedActions(0);
        script.setFailedActions(0);

        return script;
    }
}

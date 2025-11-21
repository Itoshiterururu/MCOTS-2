package uaigroup.mapservice.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uaigroup.mapservice.controller.dto.ScriptActionCreateRequest;
import uaigroup.mapservice.controller.dto.ScriptCreateRequest;
import uaigroup.mapservice.mapper.ScriptActionMapper;
import uaigroup.mapservice.mapper.ScriptMapper;
import uaigroup.mapservice.model.Script;
import uaigroup.mapservice.model.ScriptAction;
import uaigroup.mapservice.repository.ScriptActionRepository;
import uaigroup.mapservice.repository.ScriptRepository;
import uaigroup.mapservice.service.ScriptExecutionService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/map/scripts")
@RequiredArgsConstructor
public class ScriptController {

    private final ScriptRepository scriptRepository;
    private final ScriptActionRepository scriptActionRepository;
    private final ScriptMapper scriptMapper;
    private final ScriptActionMapper scriptActionMapper;
    private final ScriptExecutionService scriptExecutionService;

    // ======== Script CRUD ========

    @PostMapping
    public ResponseEntity<Script> createScript(
            @Valid @RequestBody ScriptCreateRequest request,
            HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).build();

        Script script = scriptMapper.toEntity(request, username);
        return ResponseEntity.ok(scriptRepository.save(script));
    }

    @GetMapping
    public ResponseEntity<List<Script>> getUserScripts(HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(scriptRepository.findByUserId(username));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Script> getScriptById(
            @PathVariable String id,
            HttpServletRequest httpRequest) {
        if (!isAuthenticated(httpRequest)) return ResponseEntity.status(401).build();

        return scriptRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScript(
            @PathVariable String id,
            HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).build();

        Script script = scriptRepository.findById(id).orElse(null);
        if (script == null) return ResponseEntity.notFound().build();
        if (!script.getUserId().equals(username)) return ResponseEntity.status(403).build();

        // Delete all associated actions first
        scriptActionRepository.deleteByScriptId(id);
        scriptRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }

    // ======== Script Control ========

    @PostMapping("/{id}/activate")
    public ResponseEntity<Script> activateScript(
            @PathVariable String id,
            HttpServletRequest httpRequest) {
        if (!isAuthenticated(httpRequest)) return ResponseEntity.status(401).build();

        try {
            Script script = scriptExecutionService.activateScript(id);
            return ResponseEntity.ok(script);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<Script> deactivateScript(
            @PathVariable String id,
            HttpServletRequest httpRequest) {
        if (!isAuthenticated(httpRequest)) return ResponseEntity.status(401).build();

        try {
            Script script = scriptExecutionService.deactivateScript(id);
            return ResponseEntity.ok(script);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/pause")
    public ResponseEntity<Script> pauseScript(
            @PathVariable String id,
            HttpServletRequest httpRequest) {
        if (!isAuthenticated(httpRequest)) return ResponseEntity.status(401).build();

        try {
            Script script = scriptExecutionService.pauseScript(id);
            return ResponseEntity.ok(script);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/resume")
    public ResponseEntity<Script> resumeScript(
            @PathVariable String id,
            HttpServletRequest httpRequest) {
        if (!isAuthenticated(httpRequest)) return ResponseEntity.status(401).build();

        try {
            Script script = scriptExecutionService.resumeScript(id);
            return ResponseEntity.ok(script);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ======== Script Actions CRUD ========

    @PostMapping("/{scriptId}/actions")
    public ResponseEntity<ScriptAction> addActionToScript(
            @PathVariable String scriptId,
            @Valid @RequestBody ScriptActionCreateRequest request,
            HttpServletRequest httpRequest) {
        if (!isAuthenticated(httpRequest)) return ResponseEntity.status(401).build();

        // Verify script exists
        if (!scriptRepository.existsById(scriptId)) {
            return ResponseEntity.notFound().build();
        }

        ScriptAction action = scriptActionMapper.toEntity(request);
        action.setScriptId(scriptId);

        ScriptAction saved = scriptActionRepository.save(action);

        // Update script total actions count
        Script script = scriptRepository.findById(scriptId).orElse(null);
        if (script != null) {
            script.setTotalActions(script.getTotalActions() + 1);
            scriptRepository.save(script);
        }

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{scriptId}/actions")
    public ResponseEntity<List<ScriptAction>> getScriptActions(
            @PathVariable String scriptId,
            HttpServletRequest httpRequest) {
        if (!isAuthenticated(httpRequest)) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(
                scriptActionRepository.findByScriptIdOrderByExecutionOrderAsc(scriptId)
        );
    }

    @GetMapping("/{scriptId}/actions/{actionId}")
    public ResponseEntity<ScriptAction> getScriptAction(
            @PathVariable String scriptId,
            @PathVariable String actionId,
            HttpServletRequest httpRequest) {
        if (!isAuthenticated(httpRequest)) return ResponseEntity.status(401).build();

        return scriptActionRepository.findById(actionId)
                .filter(action -> action.getScriptId().equals(scriptId))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{scriptId}/actions/{actionId}")
    public ResponseEntity<Void> deleteScriptAction(
            @PathVariable String scriptId,
            @PathVariable String actionId,
            HttpServletRequest httpRequest) {
        if (!isAuthenticated(httpRequest)) return ResponseEntity.status(401).build();

        ScriptAction action = scriptActionRepository.findById(actionId).orElse(null);
        if (action == null || !action.getScriptId().equals(scriptId)) {
            return ResponseEntity.notFound().build();
        }

        scriptActionRepository.deleteById(actionId);

        // Update script total actions count
        Script script = scriptRepository.findById(scriptId).orElse(null);
        if (script != null && script.getTotalActions() > 0) {
            script.setTotalActions(script.getTotalActions() - 1);
            scriptRepository.save(script);
        }

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{scriptId}/actions/{actionId}/trigger")
    public ResponseEntity<ScriptAction> triggerActionManually(
            @PathVariable String scriptId,
            @PathVariable String actionId,
            HttpServletRequest httpRequest) {
        if (!isAuthenticated(httpRequest)) return ResponseEntity.status(401).build();

        try {
            ScriptAction action = scriptExecutionService.triggerActionManually(actionId);
            return ResponseEntity.ok(action);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{scriptId}/actions/reorder")
    public ResponseEntity<List<ScriptAction>> reorderActions(
            @PathVariable String scriptId,
            @RequestBody List<String> actionIds,
            HttpServletRequest httpRequest) {
        if (!isAuthenticated(httpRequest)) return ResponseEntity.status(401).build();

        int order = 1;
        for (String actionId : actionIds) {
            ScriptAction action = scriptActionRepository.findById(actionId).orElse(null);
            if (action != null && action.getScriptId().equals(scriptId)) {
                action.setExecutionOrder(order++);
                scriptActionRepository.save(action);
            }
        }

        return ResponseEntity.ok(
                scriptActionRepository.findByScriptIdOrderByExecutionOrderAsc(scriptId)
        );
    }

    private boolean isAuthenticated(HttpServletRequest request) {
        return request.getAttribute("username") != null;
    }
}

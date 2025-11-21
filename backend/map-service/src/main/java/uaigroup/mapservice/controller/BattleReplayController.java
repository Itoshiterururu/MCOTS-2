package uaigroup.mapservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uaigroup.mapservice.controller.dto.ReplayStartRequest;
import uaigroup.mapservice.model.BattleEvent;
import uaigroup.mapservice.model.BattleReplay;
import uaigroup.mapservice.service.BattleReplayService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/replays")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BattleReplayController {

    private final BattleReplayService replayService;

    /**
     * Start recording a new battle replay
     */
    @PostMapping("/start")
    public ResponseEntity<BattleReplay> startRecording(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody ReplayStartRequest request) {
        try {
            BattleReplay replay = replayService.startRecording(
                    userId,
                    request.getBattleName(),
                    request.getDescription()
            );
            return ResponseEntity.ok(replay);
        } catch (IllegalStateException e) {
            log.error("Failed to start recording: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Stop the current recording
     */
    @PostMapping("/stop")
    public ResponseEntity<BattleReplay> stopRecording(@RequestHeader("X-User-Id") String userId) {
        try {
            BattleReplay replay = replayService.stopRecording(userId);
            return ResponseEntity.ok(replay);
        } catch (IllegalStateException e) {
            log.error("Failed to stop recording: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Record an event during battle
     */
    @PostMapping("/event")
    public ResponseEntity<Void> recordEvent(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody BattleEvent event) {
        replayService.recordEvent(userId, event);
        return ResponseEntity.ok().build();
    }

    /**
     * Manually capture a snapshot
     */
    @PostMapping("/snapshot")
    public ResponseEntity<Void> captureSnapshot(@RequestHeader("X-User-Id") String userId) {
        replayService.captureSnapshot(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Get all replays for the current user
     */
    @GetMapping
    public ResponseEntity<List<BattleReplay>> getUserReplays(@RequestHeader("X-User-Id") String userId) {
        List<BattleReplay> replays = replayService.getUserReplays(userId);
        return ResponseEntity.ok(replays);
    }

    /**
     * Get a specific replay by ID
     */
    @GetMapping("/{replayId}")
    public ResponseEntity<BattleReplay> getReplay(@PathVariable String replayId) {
        try {
            BattleReplay replay = replayService.getReplay(replayId);
            return ResponseEntity.ok(replay);
        } catch (IllegalArgumentException e) {
            log.error("Replay not found: {}", replayId);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a replay
     */
    @DeleteMapping("/{replayId}")
    public ResponseEntity<Void> deleteReplay(@PathVariable String replayId) {
        replayService.deleteReplay(replayId);
        return ResponseEntity.ok().build();
    }
}

package com.itams.controller;

import com.itams.model.AssetLog;
import com.itams.repository.AssetLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "*")
public class AssetLogController {

    @Autowired
    private AssetLogRepository assetLogRepository;

    // GET all logs (newest first)
    @GetMapping
    public List<AssetLog> getAllLogs() {
        return assetLogRepository.findAllByOrderByTimestampDesc();
    }

    // GET logs for a specific asset
    @GetMapping("/asset/{assetId}")
    public List<AssetLog> getLogsByAsset(@PathVariable String assetId) {
        return assetLogRepository.findByAssetIdOrderByTimestampDesc(assetId);
    }

    // POST: Create a new log entry
    @PostMapping
    public ResponseEntity<AssetLog> createLog(@RequestBody Map<String, String> body) {
        AssetLog log = new AssetLog(
            body.get("assetId"),
            body.get("assetName"),
            body.get("action"),
            body.get("user"),
            body.getOrDefault("userEmail", ""),
            body.getOrDefault("performedBy", "Admin")
        );
        AssetLog saved = assetLogRepository.save(log);
        return ResponseEntity.ok(saved);
    }

    // DELETE a specific log (optional admin cleanup)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLog(@PathVariable String id) {
        assetLogRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

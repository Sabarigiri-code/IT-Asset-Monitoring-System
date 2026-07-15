package com.itams.controller;

import com.itams.model.Asset;
import com.itams.repository.AssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@CrossOrigin(origins = "*")
public class AssetController {

    @Autowired
    private AssetRepository assetRepository;

    // GET: Retrieve all assets from MongoDB
    @GetMapping
    public List<Asset> getAllAssets() {
        return assetRepository.findAll();
    }

    // GET: Retrieve single asset by ID
    @GetMapping("/{id}")
    public Asset getAssetById(@PathVariable String id) {
        return assetRepository.findById(id).orElseThrow(() -> new RuntimeException("Asset not found"));
    }

    // POST: Add a new asset to MongoDB
    @PostMapping
    public Asset createAsset(@RequestBody Asset asset) {
        return assetRepository.save(asset);
    }

    // PUT: Update an existing asset
    @PutMapping("/{id}")
    public Asset updateAsset(@PathVariable String id, @RequestBody Asset assetDetails) {
        Asset asset = assetRepository.findById(id).orElseThrow(() -> new RuntimeException("Asset not found"));
        
        asset.setName(assetDetails.getName());
        asset.setType(assetDetails.getType());
        asset.setCategory(assetDetails.getCategory());
        asset.setStatus(assetDetails.getStatus());
        asset.setAssignee(assetDetails.getAssignee());
        asset.setHealth(assetDetails.getHealth());
        asset.setDateAdded(assetDetails.getDateAdded());
        asset.setDeadlineDate(assetDetails.getDeadlineDate());
        
        return assetRepository.save(asset);
    }

    // DELETE: Delete an asset
    @DeleteMapping("/{id}")
    public void deleteAsset(@PathVariable String id) {
        assetRepository.deleteById(id);
    }
}

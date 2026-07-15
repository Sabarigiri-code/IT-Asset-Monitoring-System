package com.itams.repository;

import com.itams.model.AssetLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface AssetLogRepository extends MongoRepository<AssetLog, String> {
    List<AssetLog> findAllByOrderByTimestampDesc();
    List<AssetLog> findByAssetIdOrderByTimestampDesc(String assetId);
}

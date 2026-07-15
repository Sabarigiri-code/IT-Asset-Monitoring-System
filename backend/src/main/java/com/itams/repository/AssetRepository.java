package com.itams.repository;

import com.itams.model.Asset;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetRepository extends MongoRepository<Asset, String> {
    // Spring Data MongoDB automatically implements basic CRUD methods:
    // save(), findById(), findAll(), deleteById(), etc.
    
    // Custom query method example:
    // List<Asset> findByType(String type);
}

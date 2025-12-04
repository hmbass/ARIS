package com.aris.domain.asset.repository;

import com.aris.domain.asset.entity.Asset;
import com.aris.domain.asset.entity.AssetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Asset Repository
 */
@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    
    Optional<Asset> findByAssetNumber(String assetNumber);
    
    boolean existsByAssetNumber(String assetNumber);
    
    @Query("SELECT a FROM Asset a " +
           "WHERE (:assetType IS NULL OR a.assetType = :assetType) " +
           "AND (:isExpired IS NULL OR a.isExpired = :isExpired) " +
           "AND (:managerId IS NULL OR a.manager.id = :managerId) " +
           "AND a.deletedAt IS NULL")
    Page<Asset> search(@Param("assetType") AssetType assetType,
                      @Param("isExpired") Boolean isExpired,
                      @Param("managerId") Long managerId,
                      Pageable pageable);
}










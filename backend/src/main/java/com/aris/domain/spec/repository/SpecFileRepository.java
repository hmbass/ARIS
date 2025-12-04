package com.aris.domain.spec.repository;

import com.aris.domain.spec.entity.SpecFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * SPEC 파일 Repository
 */
@Repository
public interface SpecFileRepository extends JpaRepository<SpecFile, Long> {
    
    /**
     * SPEC별 첨부파일 목록 조회
     */
    @Query("SELECT f FROM SpecFile f WHERE f.specification.id = :specId")
    List<SpecFile> findBySpecificationId(@Param("specId") Long specId);
    
    /**
     * SPEC별 첨부파일 개수 조회
     */
    @Query("SELECT COUNT(f) FROM SpecFile f WHERE f.specification.id = :specId")
    Long countBySpecificationId(@Param("specId") Long specId);
}










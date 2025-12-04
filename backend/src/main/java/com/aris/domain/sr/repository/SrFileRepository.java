package com.aris.domain.sr.repository;

import com.aris.domain.sr.entity.SrFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * SR 파일 Repository
 */
@Repository
public interface SrFileRepository extends JpaRepository<SrFile, Long> {
    
    /**
     * SR별 첨부파일 목록 조회
     */
    @Query("SELECT f FROM SrFile f WHERE f.serviceRequest.id = :srId")
    List<SrFile> findByServiceRequestId(@Param("srId") Long srId);
    
    /**
     * SR별 첨부파일 개수 조회
     */
    @Query("SELECT COUNT(f) FROM SrFile f WHERE f.serviceRequest.id = :srId")
    Long countByServiceRequestId(@Param("srId") Long srId);
}










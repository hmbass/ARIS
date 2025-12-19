package com.aris.domain.release.repository;

import com.aris.domain.release.entity.Release;
import com.aris.domain.release.entity.ReleaseStatus;
import com.aris.domain.release.entity.ReleaseType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Release Repository
 */
@Repository
public interface ReleaseRepository extends JpaRepository<Release, Long> {
    
    Optional<Release> findByReleaseNumber(String releaseNumber);
    
    boolean existsByReleaseNumber(String releaseNumber);
    
    @Query("SELECT COUNT(r) FROM Release r " +
           "WHERE EXTRACT(YEAR FROM r.createdAt) = :year " +
           "AND EXTRACT(MONTH FROM r.createdAt) = :month")
    Long countByYearAndMonth(@Param("year") int year, @Param("month") int month);
    
    @Query("SELECT MAX(r.releaseNumber) FROM Release r WHERE r.releaseNumber LIKE :prefix%")
    String findMaxReleaseNumberByPrefix(@Param("prefix") String prefix);
    
    @Query("SELECT r FROM Release r " +
           "WHERE (:title IS NULL OR r.title LIKE %:title%) " +
           "AND (:releaseType IS NULL OR r.releaseType = :releaseType) " +
           "AND (:status IS NULL OR r.status = :status) " +
           "AND (:requesterId IS NULL OR r.requester.id = :requesterId) " +
           "AND r.deletedAt IS NULL")
    Page<Release> search(@Param("title") String title,
                        @Param("releaseType") ReleaseType releaseType,
                        @Param("status") ReleaseStatus status,
                        @Param("requesterId") Long requesterId,
                        Pageable pageable);
    
    /**
     * 승인 가능한 릴리즈 목록 조회 (요청됨 상태)
     */
    @Query("SELECT r FROM Release r " +
           "WHERE r.status = 'REQUESTED' " +
           "AND r.deletedAt IS NULL " +
           "ORDER BY r.createdAt DESC")
    List<Release> findApprovableReleases();
}










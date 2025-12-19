package com.aris.domain.spec.repository;

import com.aris.domain.spec.entity.Specification;
import com.aris.domain.spec.entity.SpecStatus;
import com.aris.domain.spec.entity.SpecType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * SPEC Repository
 */
@Repository
public interface SpecificationRepository extends JpaRepository<Specification, Long> {
    
    /**
     * SPEC 번호로 조회
     */
    @Query("SELECT s FROM Specification s " +
           "LEFT JOIN FETCH s.serviceRequest " +
           "LEFT JOIN FETCH s.assignee " +
           "WHERE s.specNumber = :specNumber AND s.deletedAt IS NULL")
    Optional<Specification> findBySpecNumber(@Param("specNumber") String specNumber);
    
    /**
     * SPEC 번호 중복 확인
     */
    boolean existsBySpecNumber(String specNumber);
    
    /**
     * SR별 SPEC 조회
     */
    @Query("SELECT s FROM Specification s WHERE s.serviceRequest.id = :srId AND s.deletedAt IS NULL")
    Optional<Specification> findByServiceRequestId(@Param("srId") Long srId);
    
    /**
     * 담당자별 SPEC 목록 조회
     */
    @Query("SELECT s FROM Specification s WHERE s.assignee.id = :assigneeId AND s.deletedAt IS NULL")
    List<Specification> findByAssigneeId(@Param("assigneeId") Long assigneeId);
    
    /**
     * 검색 및 필터링
     */
    @Query("SELECT s FROM Specification s " +
           "WHERE (:specType IS NULL OR s.specType = :specType) " +
           "AND (:status IS NULL OR s.status = :status) " +
           "AND (:assigneeId IS NULL OR s.assignee.id = :assigneeId) " +
           "AND (:startDate IS NULL OR s.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR s.createdAt <= :endDate) " +
           "AND s.deletedAt IS NULL")
    Page<Specification> search(@Param("specType") SpecType specType,
                                @Param("status") SpecStatus status,
                                @Param("assigneeId") Long assigneeId,
                                @Param("startDate") LocalDateTime startDate,
                                @Param("endDate") LocalDateTime endDate,
                                Pageable pageable);
    
    /**
     * 연도/월별 SPEC 개수 조회 (자동 채번용) - 삭제된 것 포함
     */
    @Query("SELECT COUNT(s) FROM Specification s " +
           "WHERE EXTRACT(YEAR FROM s.createdAt) = :year " +
           "AND EXTRACT(MONTH FROM s.createdAt) = :month")
    Long countByYearAndMonth(@Param("year") int year, @Param("month") int month);
    
    /**
     * 특정 패턴으로 시작하는 SPEC 번호 중 가장 큰 번호 조회 (자동 채번용)
     */
    @Query("SELECT MAX(s.specNumber) FROM Specification s WHERE s.specNumber LIKE :prefix%")
    String findMaxSpecNumberByPrefix(@Param("prefix") String prefix);
    
    /**
     * 승인 요청 가능한 SPEC 목록 조회 (진행중 상태인 것만)
     */
    @Query("SELECT s FROM Specification s " +
           "WHERE s.status = 'IN_PROGRESS' " +
           "AND s.deletedAt IS NULL " +
           "ORDER BY s.createdAt DESC")
    List<Specification> findApprovable();
    
    /**
     * 담당자의 승인 요청 가능한 SPEC 목록 조회
     */
    @Query("SELECT s FROM Specification s " +
           "WHERE s.assignee.id = :assigneeId " +
           "AND s.status = 'IN_PROGRESS' " +
           "AND s.deletedAt IS NULL " +
           "ORDER BY s.createdAt DESC")
    List<Specification> findApprovableByAssigneeId(@Param("assigneeId") Long assigneeId);
    
    /**
     * 담당자의 최근 SPEC 목록 조회 (대시보드용)
     */
    @Query("SELECT s FROM Specification s " +
           "WHERE s.assignee.id = :assigneeId " +
           "AND s.deletedAt IS NULL " +
           "ORDER BY s.createdAt DESC")
    List<Specification> findRecentByAssigneeId(@Param("assigneeId") Long assigneeId, Pageable pageable);
}


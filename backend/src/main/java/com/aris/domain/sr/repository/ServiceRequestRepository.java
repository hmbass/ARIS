package com.aris.domain.sr.repository;

import com.aris.domain.sr.entity.ServiceRequest;
import com.aris.domain.sr.entity.SrStatus;
import com.aris.domain.sr.entity.SrType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * SR Repository
 */
@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    
    /**
     * SR 번호로 조회
     */
    @Query("SELECT sr FROM ServiceRequest sr " +
           "LEFT JOIN FETCH sr.project " +
           "LEFT JOIN FETCH sr.requester " +
           "WHERE sr.srNumber = :srNumber AND sr.deletedAt IS NULL")
    Optional<ServiceRequest> findBySrNumber(@Param("srNumber") String srNumber);
    
    /**
     * SR 번호 중복 확인
     */
    boolean existsBySrNumber(String srNumber);
    
    /**
     * 프로젝트별 SR 목록 조회
     */
    @Query("SELECT sr FROM ServiceRequest sr WHERE sr.project.id = :projectId AND sr.deletedAt IS NULL")
    List<ServiceRequest> findByProjectId(@Param("projectId") Long projectId);
    
    /**
     * 요청자별 SR 목록 조회
     */
    @Query("SELECT sr FROM ServiceRequest sr WHERE sr.requester.id = :requesterId AND sr.deletedAt IS NULL")
    List<ServiceRequest> findByRequesterId(@Param("requesterId") Long requesterId);
    
    /**
     * 검색 및 필터링
     */
    @Query("SELECT sr FROM ServiceRequest sr " +
           "WHERE (:title IS NULL OR sr.title LIKE %:title%) " +
           "AND (:srType IS NULL OR sr.srType = :srType) " +
           "AND (:status IS NULL OR sr.status = :status) " +
           "AND (:projectId IS NULL OR sr.project.id = :projectId) " +
           "AND (:requesterId IS NULL OR sr.requester.id = :requesterId) " +
           "AND (:startDate IS NULL OR sr.requestDate >= :startDate) " +
           "AND (:endDate IS NULL OR sr.requestDate <= :endDate) " +
           "AND sr.deletedAt IS NULL")
    Page<ServiceRequest> search(@Param("title") String title,
                                 @Param("srType") SrType srType,
                                 @Param("status") SrStatus status,
                                 @Param("projectId") Long projectId,
                                 @Param("requesterId") Long requesterId,
                                 @Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate,
                                 Pageable pageable);
    
    /**
     * 연도/월별 SR 개수 조회 (자동 채번용)
     */
    @Query("SELECT COUNT(sr) FROM ServiceRequest sr " +
           "WHERE EXTRACT(YEAR FROM sr.requestDate) = :year " +
           "AND EXTRACT(MONTH FROM sr.requestDate) = :month " +
           "AND sr.deletedAt IS NULL")
    Long countByYearAndMonth(@Param("year") int year, @Param("month") int month);
}


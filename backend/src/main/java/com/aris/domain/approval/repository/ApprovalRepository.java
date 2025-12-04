package com.aris.domain.approval.repository;

import com.aris.domain.approval.entity.Approval;
import com.aris.domain.approval.entity.ApprovalStatus;
import com.aris.domain.approval.entity.ApprovalType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 승인 Repository
 */
@Repository
public interface ApprovalRepository extends JpaRepository<Approval, Long> {
    
    /**
     * 승인 번호로 조회
     */
    @Query("SELECT a FROM Approval a " +
           "LEFT JOIN FETCH a.approvalLines " +
           "WHERE a.approvalNumber = :approvalNumber AND a.deletedAt IS NULL")
    Optional<Approval> findByApprovalNumber(@Param("approvalNumber") String approvalNumber);
    
    /**
     * 승인 번호 중복 확인
     */
    boolean existsByApprovalNumber(String approvalNumber);
    
    /**
     * 대상별 승인 조회
     */
    @Query("SELECT a FROM Approval a " +
           "WHERE a.approvalType = :approvalType " +
           "AND a.targetId = :targetId " +
           "AND a.deletedAt IS NULL")
    Optional<Approval> findByApprovalTypeAndTargetId(@Param("approvalType") ApprovalType approvalType,
                                                      @Param("targetId") Long targetId);
    
    /**
     * 요청자별 승인 목록 조회
     */
    @Query("SELECT a FROM Approval a WHERE a.requester.id = :requesterId AND a.deletedAt IS NULL")
    List<Approval> findByRequesterId(@Param("requesterId") Long requesterId);
    
    /**
     * 승인자의 대기 중인 승인 목록 조회
     */
    @Query("SELECT DISTINCT a FROM Approval a " +
           "JOIN a.approvalLines al " +
           "WHERE al.approver.id = :approverId " +
           "AND a.status = 'PENDING' " +
           "AND al.stepOrder = a.currentStep " +
           "AND a.deletedAt IS NULL")
    List<Approval> findPendingApprovalsByApproverId(@Param("approverId") Long approverId);
    
    /**
     * 검색 및 필터링
     */
    @Query("SELECT a FROM Approval a " +
           "WHERE (:approvalType IS NULL OR a.approvalType = :approvalType) " +
           "AND (:status IS NULL OR a.status = :status) " +
           "AND (:requesterId IS NULL OR a.requester.id = :requesterId) " +
           "AND a.deletedAt IS NULL")
    Page<Approval> search(@Param("approvalType") ApprovalType approvalType,
                          @Param("status") ApprovalStatus status,
                          @Param("requesterId") Long requesterId,
                          Pageable pageable);
    
    /**
     * 연도/월별 승인 개수 조회 (자동 채번용)
     */
    @Query("SELECT COUNT(a) FROM Approval a " +
           "WHERE EXTRACT(YEAR FROM a.requestedAt) = :year " +
           "AND EXTRACT(MONTH FROM a.requestedAt) = :month " +
           "AND a.deletedAt IS NULL")
    Long countByYearAndMonth(@Param("year") int year, @Param("month") int month);
}


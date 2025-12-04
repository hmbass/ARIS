package com.aris.domain.approval.repository;

import com.aris.domain.approval.entity.ApprovalLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 승인라인 Repository
 */
@Repository
public interface ApprovalLineRepository extends JpaRepository<ApprovalLine, Long> {
    
    /**
     * 승인별 승인라인 목록 조회
     */
    @Query("SELECT al FROM ApprovalLine al WHERE al.approval.id = :approvalId ORDER BY al.stepOrder")
    List<ApprovalLine> findByApprovalId(@Param("approvalId") Long approvalId);
    
    /**
     * 승인자별 승인라인 목록 조회
     */
    @Query("SELECT al FROM ApprovalLine al WHERE al.approver.id = :approverId")
    List<ApprovalLine> findByApproverId(@Param("approverId") Long approverId);
}










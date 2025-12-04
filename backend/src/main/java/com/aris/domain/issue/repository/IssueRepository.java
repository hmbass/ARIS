package com.aris.domain.issue.repository;

import com.aris.domain.issue.entity.Issue;
import com.aris.domain.issue.entity.IssueStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Issue Repository
 */
@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {
    
    Optional<Issue> findByIssueNumber(String issueNumber);
    
    boolean existsByIssueNumber(String issueNumber);
    
    @Query("SELECT COUNT(i) FROM Issue i " +
           "WHERE EXTRACT(YEAR FROM i.createdAt) = :year " +
           "AND EXTRACT(MONTH FROM i.createdAt) = :month " +
           "AND i.deletedAt IS NULL")
    Long countByYearAndMonth(@Param("year") int year, @Param("month") int month);
    
    @Query("SELECT i FROM Issue i " +
           "WHERE (:title IS NULL OR i.title LIKE %:title%) " +
           "AND (:status IS NULL OR i.status = :status) " +
           "AND (:reporterId IS NULL OR i.reporter.id = :reporterId) " +
           "AND (:assigneeId IS NULL OR i.assignee.id = :assigneeId) " +
           "AND i.deletedAt IS NULL")
    Page<Issue> search(@Param("title") String title,
                      @Param("status") IssueStatus status,
                      @Param("reporterId") Long reporterId,
                      @Param("assigneeId") Long assigneeId,
                      Pageable pageable);
}










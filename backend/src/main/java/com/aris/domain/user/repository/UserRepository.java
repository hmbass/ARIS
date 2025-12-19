package com.aris.domain.user.repository;

import com.aris.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * User Repository
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 이메일로 사용자 조회
     */
    Optional<User> findByEmail(String email);

    /**
     * 이메일로 사용자 조회 (역할 포함)
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.email = :email AND u.deletedAt IS NULL")
    Optional<User> findByEmailWithRoles(@Param("email") String email);

    /**
     * 이메일 중복 체크
     */
    boolean existsByEmail(String email);

    /**
     * 사용자 검색 (필터링)
     */
    @Query("SELECT u FROM User u " +
           "WHERE (:name IS NULL OR u.name LIKE %:name%) " +
           "AND (:companyId IS NULL OR u.company.id = :companyId) " +
           "AND (:departmentId IS NULL OR u.department.id = :departmentId) " +
           "AND (:isActive IS NULL OR u.isActive = :isActive) " +
           "AND u.deletedAt IS NULL")
    Page<User> search(@Param("name") String name,
                      @Param("companyId") Long companyId,
                      @Param("departmentId") Long departmentId,
                      @Param("isActive") Boolean isActive,
                      Pageable pageable);

    /**
     * 회사별 활성 사용자 조회
     */
    @Query("SELECT u FROM User u WHERE u.company.id = :companyId AND u.isActive = true AND u.deletedAt IS NULL")
    Page<User> findActiveUsersByCompany(@Param("companyId") Long companyId, Pageable pageable);
    
    /**
     * 활성화된 사용자 목록 조회 (PM 선택용)
     */
    Page<User> findByIsActiveTrueAndDeletedAtIsNull(Pageable pageable);
    
    /**
     * 삭제되지 않은 사용자 목록 조회
     */
    Page<User> findByDeletedAtIsNull(Pageable pageable);
}










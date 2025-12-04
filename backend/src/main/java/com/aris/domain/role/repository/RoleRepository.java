package com.aris.domain.role.repository;

import com.aris.domain.role.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Role Repository
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    /**
     * 역할명으로 조회
     */
    Optional<Role> findByName(String name);

    /**
     * 역할명 중복 체크
     */
    boolean existsByName(String name);

    /**
     * 역할 타입별 조회
     */
    @Query("SELECT r FROM Role r WHERE r.roleType = :roleType AND r.deletedAt IS NULL")
    List<Role> findByRoleType(Role.RoleType roleType);

    /**
     * 삭제되지 않은 역할 조회
     */
    @Query("SELECT r FROM Role r WHERE r.id = :id AND r.deletedAt IS NULL")
    Optional<Role> findByIdAndNotDeleted(Long id);

    /**
     * 모든 활성 역할 조회
     */
    @Query("SELECT r FROM Role r WHERE r.deletedAt IS NULL ORDER BY r.roleType, r.name")
    List<Role> findAllActive();
}










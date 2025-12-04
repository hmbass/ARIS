package com.aris.domain.menu.repository;

import com.aris.domain.menu.entity.MenuPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * MenuPermission Repository
 */
@Repository
public interface MenuPermissionRepository extends JpaRepository<MenuPermission, Long> {

    /**
     * 메뉴와 역할로 권한 조회
     */
    Optional<MenuPermission> findByMenuIdAndRoleId(Long menuId, Long roleId);

    /**
     * 메뉴별 권한 목록 조회
     */
    List<MenuPermission> findByMenuId(Long menuId);

    /**
     * 역할별 권한 목록 조회
     */
    List<MenuPermission> findByRoleId(Long roleId);

    /**
     * 메뉴와 역할 권한 존재 여부
     */
    boolean existsByMenuIdAndRoleId(Long menuId, Long roleId);

    /**
     * 역할 ID 목록으로 권한 조회
     */
    @Query("SELECT mp FROM MenuPermission mp WHERE mp.role.id IN :roleIds")
    List<MenuPermission> findByRoleIdIn(@Param("roleIds") List<Long> roleIds);
}










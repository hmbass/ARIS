package com.aris.domain.menu.repository;

import com.aris.domain.menu.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Menu Repository
 */
@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {

    /**
     * 최상위 메뉴 조회 (parent_id가 null)
     */
    @Query("SELECT m FROM Menu m WHERE m.parent IS NULL AND m.isVisible = true AND m.deletedAt IS NULL ORDER BY m.sortOrder")
    List<Menu> findRootMenus();

    /**
     * 하위 메뉴 조회
     */
    @Query("SELECT m FROM Menu m WHERE m.parent.id = :parentId AND m.isVisible = true AND m.deletedAt IS NULL ORDER BY m.sortOrder")
    List<Menu> findByParentId(@Param("parentId") Long parentId);

    /**
     * 사용자 역할에 따른 접근 가능한 메뉴 조회
     */
    @Query("SELECT DISTINCT m FROM Menu m " +
           "LEFT JOIN MenuPermission mp ON mp.menu.id = m.id " +
           "WHERE mp.role.id IN :roleIds " +
           "AND mp.canRead = true " +
           "AND m.isVisible = true " +
           "AND m.deletedAt IS NULL " +
           "ORDER BY m.depth, m.sortOrder")
    List<Menu> findAccessibleMenusByRoleIds(@Param("roleIds") List<Long> roleIds);

    /**
     * 삭제되지 않은 메뉴 조회
     */
    @Query("SELECT m FROM Menu m WHERE m.id = :id AND m.deletedAt IS NULL")
    Optional<Menu> findByIdAndNotDeleted(@Param("id") Long id);
}










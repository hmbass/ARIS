package com.aris.domain.company.repository;

import com.aris.domain.company.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Department Repository
 */
@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    /**
     * 회사별 부서 조회
     */
    @Query("SELECT d FROM Department d WHERE d.company.id = :companyId AND d.deletedAt IS NULL ORDER BY d.sortOrder")
    List<Department> findByCompanyId(@Param("companyId") Long companyId);

    /**
     * 상위 부서의 하위 부서 조회
     */
    @Query("SELECT d FROM Department d WHERE d.parent.id = :parentId AND d.deletedAt IS NULL ORDER BY d.sortOrder")
    List<Department> findByParentId(@Param("parentId") Long parentId);

    /**
     * 최상위 부서 조회 (parent_id가 null)
     */
    @Query("SELECT d FROM Department d WHERE d.company.id = :companyId AND d.parent IS NULL AND d.deletedAt IS NULL ORDER BY d.sortOrder")
    List<Department> findRootDepartmentsByCompanyId(@Param("companyId") Long companyId);

    /**
     * 삭제되지 않은 부서 조회
     */
    @Query("SELECT d FROM Department d WHERE d.id = :id AND d.deletedAt IS NULL")
    Optional<Department> findByIdAndNotDeleted(@Param("id") Long id);
}










package com.aris.domain.company.repository;

import com.aris.domain.company.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Company Repository
 */
@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    /**
     * 회사 코드로 조회
     */
    Optional<Company> findByCode(String code);

    /**
     * 사업자등록번호로 조회
     */
    Optional<Company> findByBusinessNumber(String businessNumber);

    /**
     * 회사 코드 중복 체크
     */
    boolean existsByCode(String code);

    /**
     * 사업자등록번호 중복 체크
     */
    boolean existsByBusinessNumber(String businessNumber);

    /**
     * 삭제되지 않은 회사 조회
     */
    @Query("SELECT c FROM Company c WHERE c.id = :id AND c.deletedAt IS NULL")
    Optional<Company> findByIdAndNotDeleted(Long id);
    
    /**
     * 회사명으로 조회
     */
    Optional<Company> findByName(String name);
}










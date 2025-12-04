package com.aris.domain.company.entity;

import com.aris.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 부서/파트 엔티티 (계층 구조 지원)
 */
@Entity
@Table(name = "departments", indexes = {
        @Index(name = "idx_dept_company", columnList = "company_id"),
        @Index(name = "idx_dept_parent", columnList = "parent_id"),
        @Index(name = "idx_dept_deleted", columnList = "deleted_at")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Department extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, length = 50)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Department parent;

    @Column(nullable = false)
    private Integer depth = 0;

    @Column(nullable = false)
    private Integer sortOrder = 0;

    @Builder
    public Department(Company company, String name, Department parent, Integer depth, Integer sortOrder) {
        this.company = company;
        this.name = name;
        this.parent = parent;
        this.depth = depth != null ? depth : 0;
        this.sortOrder = sortOrder != null ? sortOrder : 0;
    }

    /**
     * 부서 정보 수정
     */
    public void updateInfo(String name, Department parent) {
        this.name = name;
        this.parent = parent;
        if (parent != null) {
            this.depth = parent.getDepth() + 1;
        } else {
            this.depth = 0;
        }
    }

    /**
     * 정렬 순서 변경
     */
    public void changeSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}










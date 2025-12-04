package com.aris.domain.role.entity;

import com.aris.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 역할/권한 엔티티
 */
@Entity
@Table(name = "roles", indexes = {
        @Index(name = "idx_role_type", columnList = "role_type"),
        @Index(name = "idx_role_deleted", columnList = "deleted_at")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Role extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(length = 200)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoleType roleType;

    @Builder
    public Role(String name, String description, RoleType roleType) {
        this.name = name;
        this.description = description;
        this.roleType = roleType;
    }

    /**
     * 역할 정보 수정
     */
    public void updateInfo(String description) {
        this.description = description;
    }

    /**
     * 역할 타입
     */
    public enum RoleType {
        SYSTEM,   // 시스템 권한
        MENU,     // 메뉴 권한
        FUNCTION  // 기능 권한
    }
}










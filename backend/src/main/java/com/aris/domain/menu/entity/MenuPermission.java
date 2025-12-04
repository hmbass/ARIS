package com.aris.domain.menu.entity;

import com.aris.domain.role.entity.Role;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 메뉴 권한 엔티티
 */
@Entity
@Table(name = "menu_permissions", indexes = {
        @Index(name = "idx_menu_perm_menu", columnList = "menu_id"),
        @Index(name = "idx_menu_perm_role", columnList = "role_id")
}, uniqueConstraints = {
        @UniqueConstraint(columnNames = {"menu_id", "role_id"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MenuPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id", nullable = false)
    private Menu menu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(nullable = false)
    private Boolean canRead = true;

    @Column(nullable = false)
    private Boolean canCreate = false;

    @Column(nullable = false)
    private Boolean canUpdate = false;

    @Column(nullable = false)
    private Boolean canDelete = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false, updatable = false, length = 50)
    private String createdBy;

    @Builder
    public MenuPermission(Menu menu, Role role, Boolean canRead, Boolean canCreate,
                          Boolean canUpdate, Boolean canDelete, String createdBy) {
        this.menu = menu;
        this.role = role;
        this.canRead = canRead != null ? canRead : true;
        this.canCreate = canCreate != null ? canCreate : false;
        this.canUpdate = canUpdate != null ? canUpdate : false;
        this.canDelete = canDelete != null ? canDelete : false;
        this.createdAt = LocalDateTime.now();
        this.createdBy = createdBy != null ? createdBy : "system";
    }

    /**
     * 권한 수정
     */
    public void updatePermissions(Boolean canRead, Boolean canCreate, Boolean canUpdate, Boolean canDelete) {
        this.canRead = canRead;
        this.canCreate = canCreate;
        this.canUpdate = canUpdate;
        this.canDelete = canDelete;
    }
}










package com.aris.domain.menu.entity;

import com.aris.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 메뉴 엔티티 (계층 구조)
 */
@Entity
@Table(name = "menus", indexes = {
        @Index(name = "idx_menu_parent", columnList = "parent_id"),
        @Index(name = "idx_menu_visible", columnList = "is_visible"),
        @Index(name = "idx_menu_deleted", columnList = "deleted_at")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Menu extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 100)
    private String path;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Menu parent;

    @Column(nullable = false)
    private Integer depth = 0;

    @Column(nullable = false)
    private Integer sortOrder = 0;

    @Column(length = 50)
    private String icon;

    @Column(nullable = false)
    private Boolean isVisible = true;

    @Builder
    public Menu(String name, String path, Menu parent, Integer depth, 
                Integer sortOrder, String icon, Boolean isVisible) {
        this.name = name;
        this.path = path;
        this.parent = parent;
        this.depth = depth != null ? depth : 0;
        this.sortOrder = sortOrder != null ? sortOrder : 0;
        this.icon = icon;
        this.isVisible = isVisible != null ? isVisible : true;
    }

    /**
     * 메뉴 정보 수정
     */
    public void updateInfo(String name, String path, Menu parent, String icon) {
        this.name = name;
        this.path = path;
        this.parent = parent;
        this.icon = icon;
        
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

    /**
     * 노출 여부 변경
     */
    public void changeVisibility(Boolean isVisible) {
        this.isVisible = isVisible;
    }
}










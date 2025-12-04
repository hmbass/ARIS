package com.aris.domain.partner.entity;

import com.aris.domain.user.entity.User;
import com.aris.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * 파트너 Entity
 */
@Entity
@Table(name = "partners")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Partner extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 20)
    private String businessNumber;

    @Column(length = 50)
    private String ceoName;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isClosed = false;

    @Column
    private LocalDate closedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;

    /**
     * 파트너 수정
     */
    public void updatePartner(String name, String ceoName, User manager) {
        this.name = name;
        this.ceoName = ceoName;
        this.manager = manager;
    }

    /**
     * 파트너 폐업 처리
     */
    public void close() {
        this.isClosed = true;
        this.closedAt = LocalDate.now();
    }

    /**
     * 파트너 재개업 처리
     */
    public void reopen() {
        this.isClosed = false;
        this.closedAt = null;
    }
}










package com.aris.domain.company.entity;

import com.aris.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 회사 엔티티
 */
@Entity
@Table(name = "companies", indexes = {
        @Index(name = "idx_company_code", columnList = "code"),
        @Index(name = "idx_company_business_number", columnList = "business_number"),
        @Index(name = "idx_company_deleted", columnList = "deleted_at")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Company extends BaseEntity {

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

    @Column(length = 200)
    private String address;

    @Column(length = 20)
    private String phoneNumber;

    @Column(nullable = false)
    private Boolean isClosed = false;

    @Column
    private LocalDate closedAt;

    @Builder
    public Company(String code, String name, String businessNumber, String ceoName,
                   String address, String phoneNumber) {
        this.code = code;
        this.name = name;
        this.businessNumber = businessNumber;
        this.ceoName = ceoName;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.isClosed = false;
    }

    /**
     * 회사 정보 수정
     */
    public void updateInfo(String name, String ceoName, String address, String phoneNumber) {
        this.name = name;
        this.ceoName = ceoName;
        this.address = address;
        this.phoneNumber = phoneNumber;
    }

    /**
     * 폐업 처리
     */
    public void close(LocalDate closedAt) {
        this.isClosed = true;
        this.closedAt = closedAt;
    }
}










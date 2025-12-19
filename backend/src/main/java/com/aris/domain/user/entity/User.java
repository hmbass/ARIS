package com.aris.domain.user.entity;

import com.aris.domain.company.entity.Company;
import com.aris.domain.company.entity.Department;
import com.aris.domain.role.entity.Role;
import com.aris.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * 사용자 엔티티
 */
@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_user_email", columnList = "email"),
        @Index(name = "idx_user_company", columnList = "company_id"),
        @Index(name = "idx_user_department", columnList = "department_id"),
        @Index(name = "idx_user_active", columnList = "is_active"),
        @Index(name = "idx_user_deleted", columnList = "deleted_at")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 20)
    private String phoneNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(length = 20)
    private String employeeNumber;

    @Column(length = 50)
    private String position;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private Boolean isApproved = false;

    @Column
    private LocalDate resignedAt;

    @Column
    private LocalDateTime lastLoginAt;

    @Column
    private LocalDateTime passwordChangedAt;

    @Column(nullable = false)
    private Integer failedLoginCount = 0;

    @Column(nullable = false)
    private Boolean isLocked = false;

    @Column(nullable = false)
    private Boolean passwordChangeRequired = false;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    @Builder
    public User(String email, String password, String name, String phoneNumber,
                Company company, Department department, String employeeNumber, String position,
                Boolean isActive, Boolean isApproved, Boolean isLocked) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.company = company;
        this.department = department;
        this.employeeNumber = employeeNumber;
        this.position = position;
        this.isActive = isActive != null ? isActive : true;
        this.isApproved = isApproved != null ? isApproved : false;
        this.failedLoginCount = 0;
        this.isLocked = isLocked != null ? isLocked : false;
    }

    /**
     * 사용자 정보 수정
     */
    public void updateInfo(String name, String phoneNumber, String position, Department department) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.position = position;
        this.department = department;
    }

    /**
     * 비밀번호 변경
     */
    public void changePassword(String newPassword) {
        this.password = newPassword;
        this.passwordChangedAt = LocalDateTime.now();
        this.passwordChangeRequired = false;
    }

    /**
     * 초기 비밀번호 변경 필요 설정
     */
    public void requirePasswordChange() {
        this.passwordChangeRequired = true;
    }

    /**
     * 로그인 성공 처리
     */
    public void loginSuccess() {
        this.lastLoginAt = LocalDateTime.now();
        this.failedLoginCount = 0;
        this.isLocked = false;
    }

    /**
     * 로그인 실패 처리
     */
    public void loginFailed() {
        this.failedLoginCount++;
        if (this.failedLoginCount >= 5) {
            this.isLocked = true;
        }
    }

    /**
     * 계정 활성화
     */
    public void activate() {
        this.isActive = true;
    }

    /**
     * 계정 비활성화
     */
    public void deactivate() {
        this.isActive = false;
    }

    /**
     * 계정 승인
     */
    public void approve() {
        this.isApproved = true;
    }

    /**
     * 계정 잠금 해제
     */
    public void unlock() {
        this.isLocked = false;
        this.failedLoginCount = 0;
    }

    /**
     * 역할 부여
     */
    public void addRole(Role role) {
        this.roles.add(role);
    }

    /**
     * 퇴사 처리
     */
    public void resign(LocalDate resignedAt) {
        this.resignedAt = resignedAt;
        this.isActive = false;
    }

    /**
     * 이름 수정
     */
    public void updateName(String name) {
        this.name = name;
    }

    /**
     * 전화번호 수정
     */
    public void updatePhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    /**
     * 직급 수정
     */
    public void updatePosition(String position) {
        this.position = position;
    }

    /**
     * 부서 수정
     */
    public void updateDepartment(Department department) {
        this.department = department;
    }

    /**
     * 사번 수정
     */
    public void updateEmployeeNumber(String employeeNumber) {
        this.employeeNumber = employeeNumber;
    }

    /**
     * 활성화 상태 토글
     */
    public void toggleActive() {
        this.isActive = !this.isActive;
    }

    /**
     * 역할 할당
     */
    public void assignRole(Role role) {
        this.roles.add(role);
    }

    /**
     * 역할 제거
     */
    public void removeRole(Role role) {
        this.roles.remove(role);
    }
}








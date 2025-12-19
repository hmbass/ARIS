package com.aris.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * 사용자 생성 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class UserCreateRequest {

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 8, max = 20, message = "비밀번호는 8~20자여야 합니다.")
    private String password;

    @NotBlank(message = "이름은 필수입니다.")
    @Size(max = 50, message = "이름은 50자 이내여야 합니다.")
    private String name;

    @Size(max = 20, message = "전화번호는 20자 이내여야 합니다.")
    private String phoneNumber;

    private Long companyId;
    
    @Size(max = 100, message = "회사명은 100자 이내여야 합니다.")
    private String companyName;  // 직접 입력용 회사명

    private Long departmentId;

    @Size(max = 20, message = "사번은 20자 이내여야 합니다.")
    private String employeeNumber;

    @Size(max = 50, message = "직급은 50자 이내여야 합니다.")
    private String position;
    
    private List<String> roleNames;  // 역할명 목록 (예: ["ROLE_USER", "ROLE_SYSTEM_ADMIN"])
}










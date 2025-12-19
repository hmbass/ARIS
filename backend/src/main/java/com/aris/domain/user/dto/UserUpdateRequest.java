package com.aris.domain.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * 사용자 정보 수정 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class UserUpdateRequest {

    @Size(max = 50, message = "이름은 50자 이내여야 합니다.")
    private String name;

    @Size(max = 20, message = "전화번호는 20자 이내여야 합니다.")
    private String phoneNumber;

    @Size(max = 50, message = "직급은 50자 이내여야 합니다.")
    private String position;

    private Long departmentId;
    
    @Size(max = 20, message = "사번은 20자 이내여야 합니다.")
    private String employeeNumber;
    
    private List<String> roleNames;  // 역할명 목록
}










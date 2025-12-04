package com.aris.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 에러 코드 및 메시지 정의
 */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    
    // Common
    INVALID_INPUT("C001", "입력값이 올바르지 않습니다."),
    INTERNAL_SERVER_ERROR("C999", "서버 오류가 발생했습니다."),
    RESOURCE_NOT_FOUND("C002", "요청한 리소스를 찾을 수 없습니다."),
    
    // User
    USER_NOT_FOUND("U001", "사용자를 찾을 수 없습니다."),
    DUPLICATE_EMAIL("U002", "이미 존재하는 이메일입니다."),
    INVALID_PASSWORD("U003", "비밀번호가 일치하지 않습니다."),
    USER_NOT_ACTIVE("U004", "비활성화된 사용자입니다."),
    USER_NOT_APPROVED("U005", "승인되지 않은 사용자입니다."),
    USER_LOCKED("U006", "계정이 잠겨있습니다."),
    
    // Auth
    UNAUTHORIZED("A001", "인증이 필요합니다."),
    FORBIDDEN("A002", "권한이 없습니다."),
    INVALID_TOKEN("A003", "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN("A004", "만료된 토큰입니다."),
    INVALID_CREDENTIALS("A005", "이메일 또는 비밀번호가 올바르지 않습니다."),
    
    // Company
    COMPANY_NOT_FOUND("CP001", "회사를 찾을 수 없습니다."),
    DUPLICATE_COMPANY_CODE("CP002", "이미 존재하는 회사 코드입니다."),
    DUPLICATE_BUSINESS_NUMBER("CP003", "이미 존재하는 사업자등록번호입니다."),
    
    // Role
    ROLE_NOT_FOUND("R001", "역할을 찾을 수 없습니다."),
    DUPLICATE_ROLE_NAME("R002", "이미 존재하는 역할명입니다."),
    
    // Menu
    MENU_NOT_FOUND("M001", "메뉴를 찾을 수 없습니다."),
    
    // Department
    DEPARTMENT_NOT_FOUND("D001", "부서를 찾을 수 없습니다."),
    
    // Project
    PROJECT_NOT_FOUND("PJ001", "프로젝트를 찾을 수 없습니다."),
    DUPLICATE_PROJECT_CODE("PJ002", "이미 존재하는 프로젝트 코드입니다."),
    INVALID_PROJECT_STATUS("PJ003", "유효하지 않은 프로젝트 상태입니다."),
    
    // Service Request (SR)
    SR_NOT_FOUND("SR001", "SR을 찾을 수 없습니다."),
    DUPLICATE_SR_NUMBER("SR002", "이미 존재하는 SR 번호입니다."),
    INVALID_SR_STATUS("SR003", "유효하지 않은 SR 상태입니다."),
    SR_CANNOT_BE_MODIFIED("SR004", "해당 상태에서는 SR을 수정할 수 없습니다."),
    SR_ALREADY_APPROVED("SR005", "이미 승인된 SR입니다."),
    
    // Specification (SPEC)
    SPEC_NOT_FOUND("SP001", "SPEC을 찾을 수 없습니다."),
    DUPLICATE_SPEC_NUMBER("SP002", "이미 존재하는 SPEC 번호입니다."),
    INVALID_SPEC_STATUS("SP003", "유효하지 않은 SPEC 상태입니다."),
    SPEC_CANNOT_BE_CREATED("SP004", "승인된 SR만 SPEC을 생성할 수 있습니다."),
    SPEC_CANNOT_BE_MODIFIED("SP005", "해당 상태에서는 SPEC을 수정할 수 없습니다."),
    
    // Approval
    APPROVAL_NOT_FOUND("AP001", "승인 정보를 찾을 수 없습니다."),
    DUPLICATE_APPROVAL_NUMBER("AP002", "이미 존재하는 승인 번호입니다."),
    INVALID_APPROVAL_STATUS("AP003", "유효하지 않은 승인 상태입니다."),
    NOT_APPROVAL_AUTHORITY("AP004", "승인 권한이 없습니다."),
    APPROVAL_ALREADY_PROCESSED("AP005", "이미 처리된 승인입니다."),
    INVALID_APPROVAL_STEP("AP006", "유효하지 않은 승인 단계입니다."),
    
    // File
    FILE_NOT_FOUND("F001", "파일을 찾을 수 없습니다."),
    FILE_UPLOAD_FAILED("F002", "파일 업로드에 실패했습니다."),
    FILE_SIZE_EXCEEDED("F003", "파일 크기가 제한을 초과했습니다."),
    INVALID_FILE_TYPE("F004", "허용되지 않는 파일 형식입니다."),
    
    // Issue
    ISSUE_NOT_FOUND("IS001", "이슈를 찾을 수 없습니다."),
    DUPLICATE_ISSUE_NUMBER("IS002", "이미 존재하는 이슈 번호입니다."),
    INVALID_ISSUE_STATUS("IS003", "유효하지 않은 이슈 상태입니다."),
    
    // Release
    RELEASE_NOT_FOUND("RL001", "릴리즈를 찾을 수 없습니다."),
    DUPLICATE_RELEASE_NUMBER("RL002", "이미 존재하는 릴리즈 번호입니다."),
    INVALID_RELEASE_STATUS("RL003", "유효하지 않은 릴리즈 상태입니다."),
    RELEASE_ALREADY_DEPLOYED("RL004", "이미 배포된 릴리즈입니다."),
    
    // Incident
    INCIDENT_NOT_FOUND("IC001", "장애를 찾을 수 없습니다."),
    DUPLICATE_INCIDENT_NUMBER("IC002", "이미 존재하는 장애 번호입니다."),
    INVALID_INCIDENT_STATUS("IC003", "유효하지 않은 장애 상태입니다."),
    INCIDENT_ALREADY_RESOLVED("IC004", "이미 해결된 장애입니다."),
    
    // Partner
    PARTNER_NOT_FOUND("PT001", "파트너를 찾을 수 없습니다."),
    DUPLICATE_PARTNER_CODE("PT002", "이미 존재하는 파트너 코드입니다."),
    DUPLICATE_PARTNER_BUSINESS_NUMBER("PT003", "이미 존재하는 사업자등록번호입니다."),
    PARTNER_ALREADY_CLOSED("PT004", "이미 폐업된 파트너입니다."),
    
    // Asset
    ASSET_NOT_FOUND("AS001", "자산을 찾을 수 없습니다."),
    DUPLICATE_ASSET_NUMBER("AS002", "이미 존재하는 자산 번호입니다."),
    ASSET_ALREADY_EXPIRED("AS003", "이미 폐기된 자산입니다.");
    
    private final String code;
    private final String message;
}


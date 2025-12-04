package com.aris.domain.approval.dto;

import com.aris.domain.approval.entity.ApprovalType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * 승인 요청 생성 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class ApprovalRequest {
    
    @NotNull(message = "승인 유형은 필수입니다.")
    private ApprovalType approvalType;
    
    @NotNull(message = "대상 ID는 필수입니다.")
    private Long targetId;
    
    @NotEmpty(message = "승인자 목록은 필수입니다.")
    private List<Long> approverIds;
}










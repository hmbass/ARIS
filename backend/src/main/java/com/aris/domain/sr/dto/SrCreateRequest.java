package com.aris.domain.sr.dto;

import com.aris.domain.sr.entity.SrCategory;
import com.aris.domain.sr.entity.SrType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * SR 등록 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class SrCreateRequest {
    
    @NotBlank(message = "SR 제목은 필수입니다.")
    @Size(max = 200, message = "SR 제목은 200자 이내여야 합니다.")
    private String title;
    
    @NotNull(message = "SR 유형은 필수입니다.")
    private SrType srType;
    
    // srCategory는 선택사항 (없으면 srType에 따라 자동 설정)
    private SrCategory srCategory;
    
    // businessRequirement는 선택사항
    private String businessRequirement;
    
    @NotNull(message = "프로젝트 ID는 필수입니다.")
    private Long projectId;
    
    private Long requesterDeptId;
    
    // requestDate는 선택사항 (없으면 오늘 날짜 사용)
    private LocalDate requestDate;
    
    private LocalDate dueDate;
    
    private String priority;
}






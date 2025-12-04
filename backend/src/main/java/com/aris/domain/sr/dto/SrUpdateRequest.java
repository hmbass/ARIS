package com.aris.domain.sr.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * SR 수정 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class SrUpdateRequest {
    
    @NotBlank(message = "SR 제목은 필수입니다.")
    @Size(max = 200, message = "SR 제목은 200자 이내여야 합니다.")
    private String title;
    
    @NotBlank(message = "비즈니스 요구사항은 필수입니다.")
    private String businessRequirement;
    
    private LocalDate dueDate;
    
    private String priority;
}










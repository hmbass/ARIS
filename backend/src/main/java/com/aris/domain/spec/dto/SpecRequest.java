package com.aris.domain.spec.dto;

import com.aris.domain.spec.entity.SpecCategory;
import com.aris.domain.spec.entity.SpecType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * SPEC 등록/수정 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class SpecRequest {
    
    @NotNull(message = "SR ID는 필수입니다.")
    private Long srId;
    
    @NotNull(message = "SPEC 유형은 필수입니다.")
    private SpecType specType;
    
    @NotNull(message = "SPEC 분류는 필수입니다.")
    private SpecCategory specCategory;
    
    private BigDecimal functionPoint;
    
    private BigDecimal manDay;
    
    private Long assigneeId;
    
    private Long reviewerId;
}










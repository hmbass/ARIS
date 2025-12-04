package com.aris.domain.asset.dto;

import com.aris.domain.asset.entity.AssetType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.time.LocalDate;

@Builder
public record AssetRequest(
        @NotNull(message = "자산 유형은 필수입니다.")
        AssetType assetType,
        
        @Size(max = 100, message = "시리얼 번호는 100자를 초과할 수 없습니다.")
        String serialNumber,
        
        // acquiredAt는 선택사항 (없으면 오늘 날짜 사용)
        LocalDate acquiredAt,
        
        Long managerId
) {}






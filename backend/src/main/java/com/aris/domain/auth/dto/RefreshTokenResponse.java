package com.aris.domain.auth.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 토큰 갱신 응답 DTO
 */
@Getter
@Builder
public class RefreshTokenResponse {
    private String accessToken;
    private String refreshToken;
}




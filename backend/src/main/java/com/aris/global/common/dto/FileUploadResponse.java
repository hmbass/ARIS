package com.aris.global.common.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 파일 업로드 응답 DTO
 */
@Getter
@Builder
public class FileUploadResponse {
    
    private Long fileId;
    private String originalFilename;
    private String storedFilename;
    private Long fileSize;
    private String contentType;
    private String downloadUrl;
}










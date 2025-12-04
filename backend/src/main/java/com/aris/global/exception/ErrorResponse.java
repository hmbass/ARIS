package com.aris.global.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 에러 응답 DTO
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    
    private final String code;
    private final String message;
    private final LocalDateTime timestamp;
    private final List<FieldErrorDetail> errors;
    
    public static ErrorResponse of(ErrorCode errorCode) {
        return ErrorResponse.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static ErrorResponse of(ErrorCode errorCode, String message) {
        return ErrorResponse.builder()
                .code(errorCode.getCode())
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static ErrorResponse of(ErrorCode errorCode, BindingResult bindingResult) {
        return ErrorResponse.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .timestamp(LocalDateTime.now())
                .errors(FieldErrorDetail.of(bindingResult))
                .build();
    }
    
    /**
     * 필드 에러 상세 정보
     */
    @Getter
    @Builder
    public static class FieldErrorDetail {
        private final String field;
        private final String value;
        private final String reason;
        
        public static List<FieldErrorDetail> of(BindingResult bindingResult) {
            List<FieldError> fieldErrors = bindingResult.getFieldErrors();
            List<FieldErrorDetail> errors = new ArrayList<>();
            
            for (FieldError fieldError : fieldErrors) {
                errors.add(FieldErrorDetail.builder()
                        .field(fieldError.getField())
                        .value(fieldError.getRejectedValue() != null ? 
                               fieldError.getRejectedValue().toString() : "")
                        .reason(fieldError.getDefaultMessage())
                        .build());
            }
            
            return errors;
        }
    }
}










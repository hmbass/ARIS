package com.aris.domain.release.dto;

import com.aris.domain.release.entity.Release;
import com.aris.domain.release.entity.ReleaseStatus;
import com.aris.domain.release.entity.ReleaseType;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 릴리즈 응답 DTO
 */
@Builder
public record ReleaseResponse(
        Long id,
        String releaseNumber,
        String title,
        ReleaseType releaseType,
        ReleaseStatus status,
        String content,
        Long requesterId,
        String requesterName,
        String requesterDeptName,
        Long approverId,
        String approverName,
        LocalDateTime scheduledAt,
        LocalDateTime deployedAt,
        LocalDateTime createdAt,
        String createdBy,
        LocalDateTime updatedAt,
        String updatedBy
) {
    public static ReleaseResponse from(Release release) {
        return ReleaseResponse.builder()
                .id(release.getId())
                .releaseNumber(release.getReleaseNumber())
                .title(release.getTitle())
                .releaseType(release.getReleaseType())
                .status(release.getStatus())
                .content(release.getContent())
                .requesterId(release.getRequester().getId())
                .requesterName(release.getRequester().getName())
                .requesterDeptName(release.getRequesterDept() != null ? release.getRequesterDept().getName() : null)
                .approverId(release.getApprover() != null ? release.getApprover().getId() : null)
                .approverName(release.getApprover() != null ? release.getApprover().getName() : null)
                .scheduledAt(release.getScheduledAt())
                .deployedAt(release.getDeployedAt())
                .createdAt(release.getCreatedAt())
                .createdBy(release.getCreatedBy())
                .updatedAt(release.getUpdatedAt())
                .updatedBy(release.getUpdatedBy())
                .build();
    }
}










package com.aris.domain.sr.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * SR 첨부파일 Entity
 */
@Entity
@Table(name = "sr_files")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SrFile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sr_id", nullable = false)
    private ServiceRequest serviceRequest;
    
    @Column(name = "original_filename", nullable = false)
    private String originalFilename;
    
    @Column(name = "stored_filename", nullable = false)
    private String storedFilename;
    
    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;
    
    @Column(name = "file_size", nullable = false)
    private Long fileSize;
    
    @Column(name = "content_type", length = 100)
    private String contentType;
    
    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;
    
    @Column(name = "uploaded_by", nullable = false, length = 50)
    private String uploadedBy;
    
    @Builder
    public SrFile(ServiceRequest serviceRequest, String originalFilename, String storedFilename,
                  String filePath, Long fileSize, String contentType,
                  LocalDateTime uploadedAt, String uploadedBy) {
        this.serviceRequest = serviceRequest;
        this.originalFilename = originalFilename;
        this.storedFilename = storedFilename;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.contentType = contentType;
        this.uploadedAt = uploadedAt;
        this.uploadedBy = uploadedBy;
    }
}










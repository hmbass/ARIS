package com.aris.domain.asset.controller;

import com.aris.domain.asset.dto.AssetRequest;
import com.aris.domain.asset.dto.AssetResponse;
import com.aris.domain.asset.entity.AssetType;
import com.aris.domain.asset.service.AssetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
@Tag(name = "Asset", description = "자산 관리 API")
public class AssetController {
    
    private final AssetService assetService;
    
    @PostMapping
    @Operation(summary = "자산 등록", description = "새로운 자산을 등록합니다.")
    public ResponseEntity<AssetResponse> createAsset(@Valid @RequestBody AssetRequest request) {
        AssetResponse response = assetService.createAsset(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "자산 조회", description = "자산 ID로 상세 정보를 조회합니다.")
    public ResponseEntity<AssetResponse> getAsset(@PathVariable Long id) {
        AssetResponse response = assetService.getAsset(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/number/{assetNumber}")
    @Operation(summary = "자산 번호로 조회", description = "자산 번호로 상세 정보를 조회합니다.")
    public ResponseEntity<AssetResponse> getAssetByNumber(@PathVariable String assetNumber) {
        AssetResponse response = assetService.getAssetByNumber(assetNumber);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @Operation(summary = "자산 목록 조회", description = "자산 목록을 페이징하여 조회합니다.")
    public ResponseEntity<Page<AssetResponse>> getAssets(
            @Parameter(description = "자산 유형") @RequestParam(required = false) AssetType assetType,
            @Parameter(description = "폐기 여부") @RequestParam(required = false) Boolean isExpired,
            @Parameter(description = "담당자 ID") @RequestParam(required = false) Long managerId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<AssetResponse> response = assetService.getAssets(assetType, isExpired, managerId, pageable);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "자산 수정", description = "자산 정보를 수정합니다.")
    public ResponseEntity<AssetResponse> updateAsset(
            @PathVariable Long id,
            @Valid @RequestBody AssetRequest request) {
        AssetResponse response = assetService.updateAsset(id, request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/expire")
    @Operation(summary = "자산 폐기", description = "자산을 폐기 처리합니다.")
    public ResponseEntity<AssetResponse> expireAsset(@PathVariable Long id) {
        AssetResponse response = assetService.expireAsset(id);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/restore")
    @Operation(summary = "자산 복원", description = "자산을 복원 처리합니다.")
    public ResponseEntity<AssetResponse> restoreAsset(@PathVariable Long id) {
        AssetResponse response = assetService.restoreAsset(id);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "자산 삭제", description = "자산을 삭제합니다 (Soft Delete).")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }
}










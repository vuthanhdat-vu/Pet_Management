package com.QuanLiPet.controller;

import com.QuanLiPet.dto.request.MedicalRecordRequest;
import com.QuanLiPet.dto.response.MedicalRecordResponse;
import com.QuanLiPet.dto.response.PageResponse;
import com.QuanLiPet.service.MedicalService;
import com.QuanLiPet.utils.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MedicalRecordController {
    private final MedicalService medicalService;

    @PostMapping("/pets/{petId}/medical-records")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> createMedicalRecord(
            @PathVariable Long petId,
            @RequestBody @Valid MedicalRecordRequest request
    ) {
        return ApiResponse.created("Tạo hồ sơ y tế thành công", medicalService.createMedicalRecord(petId, request));
    }

    @GetMapping("/medical-records")
    public ResponseEntity<ApiResponse<PageResponse<MedicalRecordResponse>>> getAllMedicalRecords(
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.ok(medicalService.getAllMedicalRecords(pageable));
    }

    @GetMapping("/medical-records/{id}")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> getMedicalRecordById(
            @PathVariable Long id
    ) {
        return ApiResponse.ok(medicalService.getMedicalRecordById(id));
    }

    @GetMapping("/pets/{petId}/medical-records")
    public ResponseEntity<ApiResponse<PageResponse<MedicalRecordResponse>>> getMedicalRecordsByPetId(
            @PathVariable Long petId,
            @PageableDefault(page = 0, size = 10, sort = "visitDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.ok(medicalService.getMedicalRecordsByPetId(petId, pageable));
    }

    @PutMapping("/medical-records/{id}")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> updateMedicalRecord(
            @PathVariable Long id,
            @RequestBody @Valid MedicalRecordRequest request
    ) {
        return ApiResponse.ok("Cập nhật hồ sơ y tế thành công", medicalService.updateMedicalRecord(id, request));
    }

    @DeleteMapping("/medical-records/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMedicalRecord(
            @PathVariable Long id
    ) {
        medicalService.deleteMedicalRecord(id);
        return ApiResponse.ok("Xóa hồ sơ y tế thành công");
    }
}

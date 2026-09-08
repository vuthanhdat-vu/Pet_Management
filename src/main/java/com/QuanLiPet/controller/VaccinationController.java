package com.QuanLiPet.controller;

import com.QuanLiPet.dto.request.VaccinationRequest;
import com.QuanLiPet.dto.response.PageResponse;
import com.QuanLiPet.dto.response.VaccinationResponse;
import com.QuanLiPet.service.VaccinationService;
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
public class VaccinationController {
    private final VaccinationService vaccinationService;

    @PostMapping("/pets/{petId}/vaccinations")
    public ResponseEntity<ApiResponse<VaccinationResponse>> createVaccination(
            @PathVariable Long petId,
            @RequestBody @Valid VaccinationRequest request
    ) {
        return ApiResponse.created("Tạo lịch tiêm phòng thành công", vaccinationService.createVaccination(petId, request));
    }

    @GetMapping("/vaccinations")
    public ResponseEntity<ApiResponse<PageResponse<VaccinationResponse>>> getAllVaccinations(
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.ok(vaccinationService.getAllVaccinations(pageable));
    }

    @GetMapping("/vaccinations/{id}")
    public ResponseEntity<ApiResponse<VaccinationResponse>> getVaccinationById(
            @PathVariable Long id
    ) {
        return ApiResponse.ok(vaccinationService.getVaccinationById(id));
    }

    @GetMapping("/pets/{petId}/vaccinations")
    public ResponseEntity<ApiResponse<PageResponse<VaccinationResponse>>> getVaccinationsByPetId(
            @PathVariable Long petId,
            @PageableDefault(page = 0, size = 10, sort = "vaccinationDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.ok(vaccinationService.getVaccinationsByPetId(petId, pageable));
    }

    @PutMapping("/vaccinations/{id}")
    public ResponseEntity<ApiResponse<VaccinationResponse>> updateVaccination(
            @PathVariable Long id,
            @RequestBody @Valid VaccinationRequest request
    ) {
        return ApiResponse.ok("Cập nhật lịch tiêm phòng thành công", vaccinationService.updateVaccination(id, request));
    }

    @DeleteMapping("/vaccinations/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVaccination(
            @PathVariable Long id
    ) {
        vaccinationService.deleteVaccination(id);
        return ApiResponse.ok("Xóa lịch tiêm phòng thành công");
    }
}

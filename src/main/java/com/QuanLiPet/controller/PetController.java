package com.QuanLiPet.controller;

import com.QuanLiPet.dto.request.PetRequest;
import com.QuanLiPet.dto.response.PageResponse;
import com.QuanLiPet.dto.response.PetResponse;
import com.QuanLiPet.service.PetService;
import com.QuanLiPet.utils.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/pets")
@RequiredArgsConstructor
public class PetController {
    private final PetService petService;

    @PostMapping
    public ResponseEntity<ApiResponse<PetResponse>> createPet(@RequestBody @Valid PetRequest request) {
        return ApiResponse.created("Tạo thú cưng thành công", petService.createPet(request));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PetResponse>>> getAllPets(
            @RequestParam(required = false) String search,
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.ok(petService.getAllPets(search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PetResponse>> getPetById(@PathVariable Long id) {
        return ApiResponse.ok(petService.getPetById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PetResponse>> updatePet(
            @PathVariable Long id,
            @RequestBody @Valid PetRequest request
    ) {
        return ApiResponse.ok("Cập nhật thú cưng thành công", petService.updatePet(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePet(@PathVariable Long id) {
        petService.deletePet(id);
        return ApiResponse.ok("Xóa thú cưng thành công");
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PetResponse>> uploadPetImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        PetResponse response = petService.uploadPetImage(id, file);
        return ApiResponse.ok("Tải ảnh thú cưng thành công", response);
    }
}

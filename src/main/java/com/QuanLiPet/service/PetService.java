package com.QuanLiPet.service;

import com.QuanLiPet.dto.request.PetRequest;
import com.QuanLiPet.dto.response.PageResponse;
import com.QuanLiPet.dto.response.PetResponse;
import com.QuanLiPet.entity.Pet;
import com.QuanLiPet.entity.User;
import com.QuanLiPet.enums.ApplicationExceptionCode;
import com.QuanLiPet.exception.ApplicationException;
import com.QuanLiPet.repository.PetRepository;
import com.QuanLiPet.repository.UserRepository;
import com.QuanLiPet.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PetService {
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public PetResponse createPet(PetRequest request){
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));
        Pet pet = new Pet();
        updatePetFromRequest(pet, request);
        pet.setOwner(user);
        petRepository.save(pet);
        return convertToResponse(pet);
    }

    @Transactional(readOnly = true)
    public PageResponse<PetResponse> getAllPets(String search, Pageable pageable){
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));

        Page<Pet> page;
        boolean hasSearch = (search != null && !search.trim().isEmpty());

        if (isAdmin(user)) {
            if (hasSearch) {
                page = petRepository.searchAll(search.trim(), pageable);
            } else {
                page = petRepository.findAll(pageable);
            }
        } else {
            if (hasSearch) {
                page = petRepository.searchByOwnerId(user.getId(), search.trim(), pageable);
            } else {
                page = petRepository.findByOwnerId(user.getId(), pageable);
            }
        }

        List<PetResponse> content = page.getContent().stream()
                .map(this::convertToResponse)
                .toList();

        return PageResponse.of(page, content);
    }

    @Transactional(readOnly = true)
    public PetResponse getPetById(Long id){
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.PET_NOT_FOUND));

        if (!isAdmin(user) && !pet.getOwner().getId().equals(user.getId())) {
            throw new ApplicationException(ApplicationExceptionCode.ACCESS_DENIED);
        }

        return convertToResponse(pet);
    }

    @Transactional
    public PetResponse updatePet(Long id, PetRequest request){
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.PET_NOT_FOUND));

        if (!isAdmin(user) && !pet.getOwner().getId().equals(user.getId())) {
            throw new ApplicationException(ApplicationExceptionCode.ACCESS_DENIED);
        }

        updatePetFromRequest(pet, request);
        Pet updatedPet = petRepository.save(pet);
        return convertToResponse(updatedPet);
    }

    @Transactional
    public void deletePet(Long id) {
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.PET_NOT_FOUND));

        if (!isAdmin(user) && !pet.getOwner().getId().equals(user.getId())) {
            throw new ApplicationException(ApplicationExceptionCode.ACCESS_DENIED);
        }

        if (pet.getImageUrl() != null) {
            fileStorageService.deleteFile(pet.getImageUrl());
        }

        petRepository.delete(pet);
    }

    @Transactional
    public PetResponse uploadPetImage(Long petId, MultipartFile file) {
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.PET_NOT_FOUND));

        if (!isAdmin(user) && !pet.getOwner().getId().equals(user.getId())) {
            throw new ApplicationException(ApplicationExceptionCode.ACCESS_DENIED);
        }

        if (pet.getImageUrl() != null) {
            fileStorageService.deleteFile(pet.getImageUrl());
        }

        String imageUrl = fileStorageService.storeFile(file);
        pet.setImageUrl(imageUrl);
        petRepository.save(pet);

        return convertToResponse(pet);
    }

    private boolean isAdmin(User user) {
        return user.getRole() != null && "ROLE_ADMIN".equalsIgnoreCase(user.getRole().getName());
    }

    private PetResponse convertToResponse(Pet pet){
        return PetResponse.builder()
                .id(pet.getId())
                .name(pet.getName())
                .species(pet.getSpecies())
                .breed(pet.getBreed())
                .gender(pet.getGender())
                .dateOfBirth(pet.getDateOfBirth())
                .weight(pet.getWeight())
                .description(pet.getDescription())
                .imageUrl(pet.getImageUrl())
                .ownerId(pet.getOwner() != null ? pet.getOwner().getId() : null)
                .createdAt(pet.getCreatedAt())
                .updatedAt(pet.getUpdatedAt())
                .build();
    }

    private void updatePetFromRequest(Pet pet, PetRequest request) {
        pet.setName(request.getName());
        pet.setSpecies(request.getSpecies());
        pet.setBreed(request.getBreed());
        pet.setGender(request.getGender());
        pet.setDateOfBirth(request.getDateOfBirth());
        pet.setWeight(request.getWeight());
        pet.setDescription(request.getDescription());
        if (request.getImageUrl() != null) {
            pet.setImageUrl(request.getImageUrl());
        }
    }
}

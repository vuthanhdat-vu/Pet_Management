package com.QuanLiPet.service;

import com.QuanLiPet.dto.request.VaccinationRequest;
import com.QuanLiPet.dto.response.PageResponse;
import com.QuanLiPet.dto.response.VaccinationResponse;
import com.QuanLiPet.entity.Pet;
import com.QuanLiPet.entity.User;
import com.QuanLiPet.entity.Vaccination;
import com.QuanLiPet.enums.ApplicationExceptionCode;
import com.QuanLiPet.exception.ApplicationException;
import com.QuanLiPet.repository.PetRepository;
import com.QuanLiPet.repository.UserRepository;
import com.QuanLiPet.repository.VaccinationRepository;
import com.QuanLiPet.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VaccinationService {
    private final VaccinationRepository vaccinationRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;

    @Transactional
    public VaccinationResponse createVaccination(Long petId, VaccinationRequest request){
        validateVaccinationDates(request);
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.PET_NOT_FOUND));

        checkPetAccess(pet, user);

        Vaccination vaccination = new Vaccination();
        updateFromRequest(vaccination, request);
        vaccination.setPet(pet);
        vaccinationRepository.save(vaccination);
        return convertToResponse(vaccination);
    }

    @Transactional(readOnly = true)
    public PageResponse<VaccinationResponse> getAllVaccinations(Pageable pageable){
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));

        Page<Vaccination> page;
        if (isAdmin(user)) {
            page = vaccinationRepository.findAll(pageable);
        } else {
            page = vaccinationRepository.findByOwnerId(user.getId(), pageable);
        }

        List<VaccinationResponse> content = page.getContent().stream()
                .map(this::convertToResponse)
                .toList();
        return PageResponse.of(page, content);
    }

    @Transactional(readOnly = true)
    public PageResponse<VaccinationResponse> getVaccinationsByPetId(Long petId, Pageable pageable) {
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.PET_NOT_FOUND));

        checkPetAccess(pet, user);

        Page<Vaccination> page = vaccinationRepository.findByPetId(petId, pageable);
        List<VaccinationResponse> content = page.getContent().stream()
                .map(this::convertToResponse)
                .toList();
        return PageResponse.of(page, content);
    }

    @Transactional(readOnly = true)
    public VaccinationResponse getVaccinationById(Long id){
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));
        Vaccination vaccination = vaccinationRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.VACCINATION_NOT_FOUND));

        checkPetAccess(vaccination.getPet(), user);

        return convertToResponse(vaccination);
    }

    @Transactional
    public VaccinationResponse updateVaccination(Long id, VaccinationRequest request){
        validateVaccinationDates(request);
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));
        Vaccination vaccination = vaccinationRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.VACCINATION_NOT_FOUND));

        checkPetAccess(vaccination.getPet(), user);

        updateFromRequest(vaccination, request);
        vaccinationRepository.save(vaccination);
        return convertToResponse(vaccination);
    }

    @Transactional
    public void deleteVaccination(Long id){
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));
        Vaccination vaccination = vaccinationRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.VACCINATION_NOT_FOUND));

        checkPetAccess(vaccination.getPet(), user);

        vaccinationRepository.delete(vaccination);
    }

    private boolean isAdmin(User user) {
        return user.getRole() != null && "ROLE_ADMIN".equalsIgnoreCase(user.getRole().getName());
    }

    private void checkPetAccess(Pet pet, User user) {
        if (!isAdmin(user) && !pet.getOwner().getId().equals(user.getId())) {
            throw new ApplicationException(ApplicationExceptionCode.ACCESS_DENIED);
        }
    }

    private VaccinationResponse convertToResponse(Vaccination vaccination){
        return VaccinationResponse.builder()
                .id(vaccination.getId())
                .petId(vaccination.getPet().getId())
                .vaccineName(vaccination.getVaccineName())
                .vaccinationDate(vaccination.getVaccinationDate())
                .nextVaccinationDate(vaccination.getNextVaccinationDate())
                .build();
    }

    private void updateFromRequest(Vaccination vaccination, VaccinationRequest request){
        vaccination.setVaccineName(request.getVaccineName());
        vaccination.setVaccinationDate(request.getVaccinationDate());
        vaccination.setNextVaccinationDate(request.getNextVaccinationDate());
    }

    private void validateVaccinationDates(VaccinationRequest request) {
        if (request.getNextVaccinationDate() != null
                && !request.getNextVaccinationDate().isAfter(request.getVaccinationDate())) {
            throw new ApplicationException(ApplicationExceptionCode.INVALID_VACCINATION_DATE);
        }
    }
}

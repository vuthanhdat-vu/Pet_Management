package com.QuanLiPet.service;

import com.QuanLiPet.dto.request.MedicalRecordRequest;
import com.QuanLiPet.dto.response.MedicalRecordResponse;
import com.QuanLiPet.dto.response.PageResponse;
import com.QuanLiPet.entity.MedicalRecord;
import com.QuanLiPet.entity.Pet;
import com.QuanLiPet.entity.User;
import com.QuanLiPet.enums.ApplicationExceptionCode;
import com.QuanLiPet.exception.ApplicationException;
import com.QuanLiPet.repository.MedicalRecordRepository;
import com.QuanLiPet.repository.PetRepository;
import com.QuanLiPet.repository.UserRepository;
import com.QuanLiPet.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicalService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;

    @Transactional
    public MedicalRecordResponse createMedicalRecord(
            Long petId,
            MedicalRecordRequest request
    ) {
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.PET_NOT_FOUND));

        checkPetAccess(pet, user);

        MedicalRecord medicalRecord = new MedicalRecord();
        medicalRecord.setPet(pet);
        updateFromRequest(medicalRecord, request);
        medicalRecordRepository.save(medicalRecord);
        return convertToResponse(medicalRecord);
    }

    @Transactional(readOnly = true)
    public PageResponse<MedicalRecordResponse> getAllMedicalRecords(Pageable pageable){
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));

        Page<MedicalRecord> page;
        if (isAdmin(user)) {
            page = medicalRecordRepository.findAll(pageable);
        } else {
            page = medicalRecordRepository.findByOwnerId(user.getId(), pageable);
        }

        List<MedicalRecordResponse> content = page.getContent().stream()
                .map(this::convertToResponse)
                .toList();
        return PageResponse.of(page, content);
    }

    @Transactional(readOnly = true)
    public PageResponse<MedicalRecordResponse> getMedicalRecordsByPetId(Long petId, Pageable pageable) {
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.PET_NOT_FOUND));

        checkPetAccess(pet, user);

        Page<MedicalRecord> page = medicalRecordRepository.findByPetId(petId, pageable);
        List<MedicalRecordResponse> content = page.getContent().stream()
                .map(this::convertToResponse)
                .toList();
        return PageResponse.of(page, content);
    }

    @Transactional(readOnly = true)
    public MedicalRecordResponse getMedicalRecordById(Long id){
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));
        MedicalRecord medicalRecord = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.MEDICAL_RECORD_NOT_FOUND));

        checkPetAccess(medicalRecord.getPet(), user);

        return convertToResponse(medicalRecord);
    }

    @Transactional
    public MedicalRecordResponse updateMedicalRecord(Long id, MedicalRecordRequest request){
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));
        MedicalRecord medicalRecord = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.MEDICAL_RECORD_NOT_FOUND));

        checkPetAccess(medicalRecord.getPet(), user);

        updateFromRequest(medicalRecord, request);
        medicalRecordRepository.save(medicalRecord);
        return convertToResponse(medicalRecord);
    }

    @Transactional
    public void deleteMedicalRecord(Long id){
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));
        MedicalRecord medicalRecord = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.MEDICAL_RECORD_NOT_FOUND));

        checkPetAccess(medicalRecord.getPet(), user);
        medicalRecordRepository.delete(medicalRecord);
    }

    private boolean isAdmin(User user) {
        return user.getRole() != null && "ROLE_ADMIN".equalsIgnoreCase(user.getRole().getName());
    }

    private void checkPetAccess(Pet pet, User user) {
        if (!isAdmin(user) && !pet.getOwner().getId().equals(user.getId())) {
            throw new ApplicationException(ApplicationExceptionCode.ACCESS_DENIED);
        }
    }

    private MedicalRecordResponse convertToResponse(MedicalRecord medicalRecord){
        return MedicalRecordResponse.builder()
                .id(medicalRecord.getId())
                .petId(medicalRecord.getPet().getId())
                .visitDate(medicalRecord.getVisitDate())
                .symptoms(medicalRecord.getSymptoms())
                .diagnosis(medicalRecord.getDiagnosis())
                .treatment(medicalRecord.getTreatment())
                .prescription(medicalRecord.getPrescription())
                .notes(medicalRecord.getNotes())
                .createdAt(medicalRecord.getCreatedAt())
                .updatedAt(medicalRecord.getUpdatedAt())
                .build();
    }

    private void updateFromRequest(MedicalRecord medicalRecord, MedicalRecordRequest request){
        medicalRecord.setVisitDate(request.getVisitDate());
        medicalRecord.setSymptoms(request.getSymptoms());
        medicalRecord.setDiagnosis(request.getDiagnosis());
        medicalRecord.setTreatment(request.getTreatment());
        medicalRecord.setPrescription(request.getPrescription());
        medicalRecord.setNotes(request.getNotes());
    }
}

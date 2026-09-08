package com.QuanLiPet.repository;

import com.QuanLiPet.entity.MedicalRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPetId(Long petId);
    Page<MedicalRecord> findByPetId(Long petId, Pageable pageable);

    @Query("SELECT m FROM MedicalRecord m WHERE m.pet.owner.id = :ownerId")
    Page<MedicalRecord> findByOwnerId(@Param("ownerId") Long ownerId, Pageable pageable);
}
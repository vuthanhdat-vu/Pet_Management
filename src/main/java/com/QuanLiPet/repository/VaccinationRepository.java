package com.QuanLiPet.repository;

import com.QuanLiPet.entity.Vaccination;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface VaccinationRepository extends JpaRepository<Vaccination, Long> {
    List<Vaccination> findByPetId(Long petId);
    Page<Vaccination> findByPetId(Long petId, Pageable pageable);

    @Query("SELECT v FROM Vaccination v WHERE v.pet.owner.id = :ownerId")
    Page<Vaccination> findByOwnerId(@Param("ownerId") Long ownerId, Pageable pageable);
}
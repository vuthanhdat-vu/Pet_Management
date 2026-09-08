package com.QuanLiPet.repository;

import com.QuanLiPet.entity.Pet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findPetsByOwnerId(Long ownerId);
    Optional<Pet> findByIdAndOwnerId(Long id, Long ownerId);

    Page<Pet> findByOwnerId(Long ownerId, Pageable pageable);

    @Query("SELECT p FROM Pet p WHERE p.owner.id = :ownerId AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.species) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Pet> searchByOwnerId(@Param("ownerId") Long ownerId, @Param("search") String search, Pageable pageable);

    @Query("SELECT p FROM Pet p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.species) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Pet> searchAll(@Param("search") String search, Pageable pageable);
}
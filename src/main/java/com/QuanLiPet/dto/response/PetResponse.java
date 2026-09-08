package com.QuanLiPet.dto.response;

import com.QuanLiPet.enums.Gender;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PetResponse {
    private Long id;
    private String name;
    private String species;
    private String breed;
    private Gender gender;
    private LocalDate dateOfBirth;
    private Double weight;
    private String description;
    private String imageUrl;
    private Long ownerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

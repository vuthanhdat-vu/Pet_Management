package com.QuanLiPet.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MedicalRecordResponse {

    private Long id;

    private Long petId;

    private LocalDate visitDate;

    private String symptoms;

    private String diagnosis;

    private String treatment;

    private String prescription;

    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
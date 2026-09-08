package com.QuanLiPet.dto.response;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VaccinationResponse {
    private Long id;

    private Long petId;

    private String vaccineName;

    private LocalDate vaccinationDate;

    private LocalDate nextVaccinationDate;
}

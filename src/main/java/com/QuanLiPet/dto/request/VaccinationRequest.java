package com.QuanLiPet.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class VaccinationRequest {
    @NotBlank(message = "Tên vaccine không được để trống")
    @Size(max = 100, message = "Tên vaccine không vượt quá 100 kí tự")
    private String vaccineName;

    @NotNull(message = "Ngày tiêm không được để trống")
    @PastOrPresent(message = "Ngày tiêm không được ở tương lai")
    private LocalDate vaccinationDate;

    private LocalDate nextVaccinationDate;
}

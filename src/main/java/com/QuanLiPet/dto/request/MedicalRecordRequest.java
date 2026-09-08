package com.QuanLiPet.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class MedicalRecordRequest {

    @PastOrPresent(message = "Ngày khám không được ở tương lai")
    private LocalDate visitDate;

    @NotBlank(message = "Triệu chứng không được để trống")
    @Size(max = 2000, message = "Triệu chứng không được vượt quá 2000 ký tự")
    private String symptoms;

    @NotBlank(message = "Chẩn đoán không được để trống")
    @Size(max = 2000, message = "Chẩn đoán không được vượt quá 2000 ký tự")
    private String diagnosis;

    @NotBlank(message = "Phương pháp điều trị không được để trống")
    @Size(max = 2000, message = "Phương pháp điều trị không được vượt quá 2000 ký tự")
    private String treatment;

    @Size(max = 2000, message = "Đơn thuốc không được vượt quá 2000 ký tự")
    private String prescription;

    @Size(max = 2000, message = "Ghi chú không được vượt quá 2000 ký tự")
    private String notes;

}
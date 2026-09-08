package com.QuanLiPet.dto.request;

import com.QuanLiPet.enums.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PetRequest {

    @NotBlank(message = "Tên không được để trống")
    @Size(max = 100, message = "Tên không vượt quá 100 ký tự")
    private String name;

    @NotBlank(message = "Tên loài không được để trống")
    @Size(max = 50, message = "Tên loài không vượt quá 50 ký tự")
    private String species;

    @Size(max = 100, message = "Tên giống không vượt quá 100 ký tự")
    private String breed;

    private Gender gender;

    @PastOrPresent(message = "Ngày sinh phải sớm hơn hoặc là hôm nay")
    private LocalDate dateOfBirth;

    @Positive(message = "cân nặng phải lớn hơn không")
    private Double weight;

    @Size(max = 1000, message = "Mô tả không quá 1000 ký tự")
    private String description;

    private String imageUrl;
}
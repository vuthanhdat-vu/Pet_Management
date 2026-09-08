package com.QuanLiPet.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(max = 100, message = "Tên đăng nhập không quá 100 kí tự")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(max = 20, message = "Mật khẩu không quá 20 kí tự")
    private String password;
}

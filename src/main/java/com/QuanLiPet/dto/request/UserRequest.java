package com.QuanLiPet.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRequest {
    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(max = 100, message = "Tên không vượt quá 100 ký tự")
    private String username;

    @NotBlank(message = "Email khong duoc de trong")
    @Email(message = "Khong dung dinh dang email")
    @Size(max = 100, message = "email khong vuot qua 100 ky tu")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 100, message = "Mật khẩu phải từ 6 đến 100 ký tự")
    private String password;
}

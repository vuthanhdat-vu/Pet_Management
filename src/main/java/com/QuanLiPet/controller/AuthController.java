package com.QuanLiPet.controller;

import com.QuanLiPet.dto.request.LoginRequest;
import com.QuanLiPet.dto.request.UserRequest;
import com.QuanLiPet.dto.response.LoginResponse;
import com.QuanLiPet.dto.response.UserResponse;
import com.QuanLiPet.service.AuthService;
import com.QuanLiPet.service.UserService;
import com.QuanLiPet.utils.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody @Valid LoginRequest request) {
        return ApiResponse.ok("Đăng nhập thành công", authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@RequestBody @Valid UserRequest request) {
        return ApiResponse.created("Đăng ký thành công", userService.createUser(request));
    }
}

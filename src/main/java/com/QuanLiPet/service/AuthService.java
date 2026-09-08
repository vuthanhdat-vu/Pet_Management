package com.QuanLiPet.service;

import com.QuanLiPet.dto.request.LoginRequest;
import com.QuanLiPet.dto.response.LoginResponse;
import com.QuanLiPet.enums.ApplicationExceptionCode;
import com.QuanLiPet.exception.ApplicationException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        try {
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword());
            Authentication authentication = authenticationManager.authenticate(authenticationToken);
            String token = jwtService.generateToken(authentication);
            return LoginResponse.builder()
                    .token(token)
                    .build();
        } catch (BadCredentialsException e) {
            throw new ApplicationException(ApplicationExceptionCode.INVALID_CREDENTIALS);
        }
    }
}

package com.QuanLiPet.utils;

import com.QuanLiPet.enums.ApplicationExceptionCode;
import com.QuanLiPet.exception.ApplicationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    private SecurityUtils() {

    }

    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ApplicationException(ApplicationExceptionCode.ACCESS_DENIED);
        }
        return authentication.getName();
    }
}
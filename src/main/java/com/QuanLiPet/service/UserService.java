package com.QuanLiPet.service;

import com.QuanLiPet.dto.request.ChangePasswordRequest;
import com.QuanLiPet.dto.request.UserRequest;
import com.QuanLiPet.dto.response.PageResponse;
import com.QuanLiPet.dto.response.UserResponse;
import com.QuanLiPet.entity.Role;
import com.QuanLiPet.entity.User;
import com.QuanLiPet.enums.ApplicationExceptionCode;
import com.QuanLiPet.exception.ApplicationException;
import com.QuanLiPet.repository.RoleRepository;
import com.QuanLiPet.repository.UserRepository;
import com.QuanLiPet.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public UserResponse createUser(UserRequest request){
        if (userRepository.existsByUsername(request.getUsername())){
            throw new ApplicationException(ApplicationExceptionCode.USER_ALREADY_EXISTS);
        }
        if (userRepository.existsByEmail(request.getEmail())){
            throw new ApplicationException(ApplicationExceptionCode.EMAIL_ALREADY_EXISTS);
        }
        User user = new User();
        updateUserFromRequest(user, request);
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_USER").build()));
        user.setRole(userRole);
        userRepository.save(user);
        return convertToResponse(user);
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getAllUsers(String search, Pageable pageable){
        Page<User> page;
        if (search != null && !search.trim().isEmpty()) {
            page = userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    search.trim(), search.trim(), pageable
            );
        } else {
            page = userRepository.findAll(pageable);
        }
        List<UserResponse> content = page.getContent().stream()
                .map(this::convertToResponse)
                .toList();
        return PageResponse.of(page, content);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));

        if (isAdmin(currentUser) || currentUser.getId().equals(targetUser.getId())) {
            return convertToResponse(targetUser);
        } else {
            throw new ApplicationException(ApplicationExceptionCode.ACCESS_DENIED);
        }
    }

    @Transactional
    public UserResponse updateUser(Long id, UserRequest request) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));

        if (!isAdmin(currentUser) && !currentUser.getId().equals(targetUser.getId())) {
            throw new ApplicationException(ApplicationExceptionCode.ACCESS_DENIED);
        }

        if (!targetUser.getUsername().equals(request.getUsername())
                && userRepository.existsByUsername(request.getUsername())) {
            throw new ApplicationException(ApplicationExceptionCode.USER_ALREADY_EXISTS);
        }

        if (!targetUser.getEmail().equals(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new ApplicationException(ApplicationExceptionCode.EMAIL_ALREADY_EXISTS);
        }

        updateUserFromRequest(targetUser, request);
        userRepository.save(targetUser);
        return convertToResponse(targetUser);
    }

    @Transactional
    public void deleteUser(Long id){
        String currentUsername = SecurityUtils.getCurrentUsername();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));

        if (!isAdmin(currentUser)) {
            throw new ApplicationException(ApplicationExceptionCode.ACCESS_DENIED);
        }

        if (!userRepository.existsById(id)) {
            throw new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND);
        }
        userRepository.deleteById(id);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ApplicationException(ApplicationExceptionCode.CURRENT_PASSWORD_INCORRECT);
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ApplicationException(ApplicationExceptionCode.CONFIRM_PASSWORD_MISMATCH);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public UserResponse uploadAvatar(Long userId, MultipartFile file) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ApplicationException(ApplicationExceptionCode.USER_NOT_FOUND));

        if (!isAdmin(currentUser) && !currentUser.getId().equals(targetUser.getId())) {
            throw new ApplicationException(ApplicationExceptionCode.ACCESS_DENIED);
        }

        if (targetUser.getAvatarUrl() != null) {
            fileStorageService.deleteFile(targetUser.getAvatarUrl());
        }

        String avatarUrl = fileStorageService.storeFile(file);
        targetUser.setAvatarUrl(avatarUrl);
        userRepository.save(targetUser);

        return convertToResponse(targetUser);
    }

    private boolean isAdmin(User user) {
        return user.getRole() != null && "ROLE_ADMIN".equalsIgnoreCase(user.getRole().getName());
    }

    private void updateUserFromRequest(User user, UserRequest request){
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
    }

    private UserResponse convertToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}

package com.QuanLiPet.service;

import com.QuanLiPet.enums.ApplicationExceptionCode;
import com.QuanLiPet.exception.ApplicationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    private final Path uploadPath;
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "webp");

    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadPath);
        } catch (IOException e) {
            log.error("Không thể tạo thư mục upload: {}", e.getMessage());
            throw new ApplicationException(ApplicationExceptionCode.FILE_STORAGE_ERROR);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApplicationException(ApplicationExceptionCode.FILE_EMPTY);
        }

        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(fileExtension)) {
            throw new ApplicationException(ApplicationExceptionCode.INVALID_FILE_TYPE);
        }

        String newFileName = UUID.randomUUID() + "." + fileExtension;

        try {
            Path targetLocation = this.uploadPath.resolve(newFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + newFileName;
        } catch (IOException ex) {
            log.error("Lỗi khi lưu trữ file: {}", ex.getMessage());
            throw new ApplicationException(ApplicationExceptionCode.FILE_STORAGE_ERROR);
        }
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("/uploads/")) {
            return;
        }
        try {
            String fileName = fileUrl.replace("/uploads/", "");
            Path filePath = this.uploadPath.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            log.warn("Không thể xoá file cũ: {}", ex.getMessage());
        }
    }
}

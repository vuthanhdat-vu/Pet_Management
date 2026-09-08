package com.QuanLiPet.enums;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ApplicationExceptionCode {

    INVALID_INPUT(HttpStatus.BAD_REQUEST, "Dữ liệu đầu vào không hợp lệ"),
    PASSWORD_NOT_MATCH(HttpStatus.BAD_REQUEST, "Mật khẩu không khớp"),
    CURRENT_PASSWORD_INCORRECT(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không chính xác"),
    CONFIRM_PASSWORD_MISMATCH(HttpStatus.BAD_REQUEST, "Mật khẩu xác nhận không khớp với mật khẩu mới"),
    INVALID_VACCINATION_DATE(HttpStatus.BAD_REQUEST, "Ngày tiêm tiếp theo phải sau ngày tiêm lần đầu"),
    INVALID_FILE_TYPE(HttpStatus.BAD_REQUEST, "Định dạng file không hợp lệ (chỉ chấp nhận JPG, PNG, WEBP)"),
    FILE_EMPTY(HttpStatus.BAD_REQUEST, "File tải lên không được để trống"),
    FILE_STORAGE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể lưu trữ file"),

    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Tên đăng nhập hoặc mật khẩu không đúng"),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "Token đã hết hạn"),
    TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "Token không hợp lệ"),

    ACCESS_DENIED(HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện hành động này"),

    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"),
    PET_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy thú cưng"),
    ROLE_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy vai trò người dùng"),
    MEDICAL_RECORD_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ y tế"),
    VACCINATION_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy lịch tiêm phòng"),

    USER_ALREADY_EXISTS(HttpStatus.CONFLICT, "Tên đăng nhập đã tồn tại"),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "Email đã được sử dụng"),

    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống, vui lòng thử lại sau");

    private final HttpStatus httpStatus;
    private final String message;

    ApplicationExceptionCode(HttpStatus httpStatus, String message) {
        this.httpStatus = httpStatus;
        this.message = message;
    }

    public int getCode() {
        return this.httpStatus.value();
    }
}

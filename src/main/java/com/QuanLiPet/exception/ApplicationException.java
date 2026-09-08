package com.QuanLiPet.exception;

import com.QuanLiPet.enums.ApplicationExceptionCode;
import lombok.Getter;

@Getter
public class ApplicationException extends RuntimeException {

    private final int code;
    private final String message;
    private final ApplicationExceptionCode applicationExceptionCode;

    public ApplicationException(ApplicationExceptionCode applicationExceptionCode) {
        super(applicationExceptionCode.getMessage());
        this.applicationExceptionCode = applicationExceptionCode;
        this.code = applicationExceptionCode.getCode();
        this.message = applicationExceptionCode.getMessage();
    }
}

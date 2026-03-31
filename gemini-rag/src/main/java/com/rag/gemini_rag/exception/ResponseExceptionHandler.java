package com.rag.gemini_rag.exception;

import com.rag.gemini_rag.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.Date;

@ControllerAdvice
public class ResponseExceptionHandler extends ResponseEntityExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(ResponseExceptionHandler.class);
    @Value("${spring.application.name}")
    private String appName;
    public ResponseExceptionHandler() {
    }

    @ExceptionHandler(value = {ResourceNotFoundException.class})
    public ResponseEntity<?> handleResourceNotFoundExceptions(ResourceNotFoundException ex, WebRequest req) {
        ErrorResponse error = new ErrorResponse(
            new Date(),
            HttpStatus.NOT_FOUND.value(),
            HttpStatus.NOT_FOUND.getReasonPhrase(),
            ex.getMessage(),
            appName,
            req.getDescription(false)
        );
        return  new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

}

package com.wecreate.api.exceptions;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", java.time.Instant.now().toString());
        body.put("status", ex.getStatusCode().value());
        body.put("error", ex.getReason()); // This contains the "Can't load..." message
        body.put("message", ex.getReason()); // Set it as message too for frontend compatibility
        
        return new ResponseEntity<>(body, ex.getStatusCode());
    }
}

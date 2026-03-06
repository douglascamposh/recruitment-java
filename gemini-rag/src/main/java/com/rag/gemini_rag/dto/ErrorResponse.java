package com.rag.gemini_rag.dto;

import java.util.Date;

public record ErrorResponse(
        Date timestamp,
        int status,
        String error,
        String message,
        String service,
        String path
) {}

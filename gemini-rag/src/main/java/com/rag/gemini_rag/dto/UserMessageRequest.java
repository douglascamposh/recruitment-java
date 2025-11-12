package com.rag.gemini_rag.dto;

import java.time.LocalDateTime;

public record UserMessageRequest(
        String userId,
        String articleId,
        String text,
        LocalDateTime date,
        String additionalInfo
) {}

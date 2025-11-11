package com.rag.gemini_rag.dto;

public record UserMessageAnalysisResult(
        String category,
        String sentiment,
        boolean isSpammer
) {}
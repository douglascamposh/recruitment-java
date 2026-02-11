package com.rag.gemini_rag.dto;

import jakarta.validation.constraints.NotBlank;

public record MatchRequest(
        @NotBlank(message = "The job description is required")
        String jobDescription
) {
}

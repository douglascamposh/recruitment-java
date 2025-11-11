package com.rag.gemini_rag.dto;

import javax.validation.constraints.NotNull;

public record FaqRequest(
        @NotNull String imageUrl,
        @NotNull String productName
) {}

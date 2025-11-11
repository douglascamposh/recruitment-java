package com.rag.gemini_rag.dto;

import com.rag.gemini_rag.enums.VisualFormat;

public record VisualFormatRecommendation(
        VisualFormat format,
        String justification
) {}

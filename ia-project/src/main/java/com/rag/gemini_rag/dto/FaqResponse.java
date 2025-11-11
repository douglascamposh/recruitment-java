package com.rag.gemini_rag.dto;

import java.util.List;

public record FaqResponse(
        List<FaqItem> faqs
) {
    public record FaqItem(String question, String answer) {}
}


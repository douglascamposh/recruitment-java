package com.rag.gemini_rag.dto;

public record MessageAnalysisResult(
        String category,   // spam, potential_customer, general_inquiry
        String sentiment   // positive, neutral, negative
) {}
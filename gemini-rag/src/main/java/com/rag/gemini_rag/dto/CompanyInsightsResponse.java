package com.rag.gemini_rag.dto;

import java.util.List;

public record CompanyInsightsResponse(
        boolean companyInfoFound,
        String companyInsights,
        List<String> possibleQuestions,
        List<String> tips
) {}

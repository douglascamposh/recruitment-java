package com.rag.gemini_rag.dto;

public record ImprovementCandidateRequest(
        CandidateProfile profile,
        String improvedText
) {}

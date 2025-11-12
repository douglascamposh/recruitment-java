package com.rag.gemini_rag.dto;

public record CandidateMatch(
        CandidateProfile profile,
        Float similarityScore
) {}

package com.rag.gemini_rag.dto;

public record ImprovementCandidateResponse(
        CandidateProfile profile,
        String improvedText,
        InterviewPrep interviewPrep
) {}

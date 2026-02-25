package com.rag.gemini_rag.dto;

import java.util.List;

public record InterviewPrep (
        String seniorityLevel,
        String interviewReadiness,
        String companyInsights,
        List<String> potentialQuestions,
        List<CourseRecommendation> recommendedCourses,
        boolean companyInfoFound
) { }

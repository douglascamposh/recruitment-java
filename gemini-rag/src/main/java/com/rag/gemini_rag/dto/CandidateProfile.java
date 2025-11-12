package com.rag.gemini_rag.dto;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document("candidate_profiles")
public record CandidateProfile(
        @Id
        String id,
        String originalFileName,
        String candidateName,
        String summary,
        List<String> skills,
        List<Experience> workExperience,
        String education
) {
    public record Experience(String role, String company, String duration) {}
}
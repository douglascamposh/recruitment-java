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
        String email,
        String phone,
        String sex,
        String nationality,
        String location,
        List<String> skills,
        List<Education> education,
        List<Experience> workExperience,
        List<Language> languages,
        List<String> certifications,
        LinkProfile links
) {
    public record Experience(String role, String company, String duration, String jobDescription) {}
}
package com.rag.gemini_rag.service;

import com.rag.gemini_rag.dto.ImprovementCandidateRequest;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface ICvImprovementService {
    ImprovementCandidateRequest getImprovedCvProfile(MultipartFile cvFile, String targetJobDescription) throws IOException;
}

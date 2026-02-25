package com.rag.gemini_rag.service;

import com.rag.gemini_rag.dto.ImprovementCandidateResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface ICvImprovementService {
    ImprovementCandidateResponse getImprovedCvProfile(MultipartFile cvFile, String targetJobDescription, String companyName) throws IOException;
}

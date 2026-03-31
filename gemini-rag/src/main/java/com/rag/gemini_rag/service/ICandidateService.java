package com.rag.gemini_rag.service;

import com.rag.gemini_rag.dto.CandidateProfile;
import com.rag.gemini_rag.dto.ImprovementCandidateResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface ICandidateService {
    CandidateProfile ingestAndProcessCv(MultipartFile cvFile) throws IOException;
    CandidateProfile saveImprovedProfile(ImprovementCandidateResponse candidate);
    Page<CandidateProfile> getCandidatesByUserId(String userId, Pageable pageable);
    CandidateProfile getCandidateById(String id);
}

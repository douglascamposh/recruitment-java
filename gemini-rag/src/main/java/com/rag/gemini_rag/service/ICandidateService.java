package com.rag.gemini_rag.service;

import com.rag.gemini_rag.dto.CandidateProfile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface ICandidateService {
    CandidateProfile ingestAndProcessCv(MultipartFile cvFile) throws IOException;
}

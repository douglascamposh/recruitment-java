package com.rag.gemini_rag.controller;

import com.rag.gemini_rag.dto.CandidateProfile;
import com.rag.gemini_rag.dto.ImprovementCandidateRequest;
import com.rag.gemini_rag.service.ICandidateService;
import com.rag.gemini_rag.service.ICvImprovementService;
import com.rag.gemini_rag.service.IRecruitmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/candidates")
public class CandidateController {
    private final ICandidateService candidateService;
    private final ICvImprovementService cvImprovementService;
    public CandidateController(ICandidateService candidateService, ICvImprovementService cvImprovementService) {
        this.candidateService = candidateService;
        this.cvImprovementService = cvImprovementService;
    }

    @PostMapping()
    public ResponseEntity<?> save(@RequestBody ImprovementCandidateRequest candidate) {
        if (candidate == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "The file is empty."));
        }
        CandidateProfile processedProfile = candidateService.saveImprovedProfile(candidate) ;
        return ResponseEntity.status(HttpStatus.CREATED).body(processedProfile);
    }

    @PostMapping("/ingest")
    public ResponseEntity<?> ingestCv(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "The file is empty."));
        }
        try {
            CandidateProfile processedProfile = candidateService.ingestAndProcessCv(file);
            return ResponseEntity.status(HttpStatus.CREATED).body(processedProfile);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "error at processing the file: " + e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

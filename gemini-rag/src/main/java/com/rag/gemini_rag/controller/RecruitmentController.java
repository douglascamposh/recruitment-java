package com.rag.gemini_rag.controller;

import com.rag.gemini_rag.dto.CandidateMatch;
import com.rag.gemini_rag.dto.CandidateProfile;
import com.rag.gemini_rag.service.ICandidateService;
import com.rag.gemini_rag.service.IRecruitmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class RecruitmentController {

    private final ICandidateService candidateService;
    private final IRecruitmentService recruitmentService;

    public RecruitmentController(ICandidateService candidateService, IRecruitmentService recruitmentService) {
        this.candidateService = candidateService;
        this.recruitmentService = recruitmentService;
    }

    @PostMapping("/candidates/ingest")
    public ResponseEntity<?> ingestCv(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El archivo está vacío."));
        }
        try {
            CandidateProfile processedProfile = candidateService.ingestAndProcessCv(file);
            return ResponseEntity.status(HttpStatus.CREATED).body(processedProfile);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Error al procesar el archivo: " + e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/recruitment/match")
    public ResponseEntity<List<CandidateMatch>> findMatches(@RequestBody Map<String, String> payload) {
        String jobDescription = payload.get("jobDescription");
        if (jobDescription == null || jobDescription.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        // Puedes añadir un parámetro para topK si quieres que sea configurable
        List<CandidateMatch> matches = recruitmentService.findBestCandidatesForJob(jobDescription, 5);
        return ResponseEntity.ok(matches);
    }
}

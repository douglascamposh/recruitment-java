package com.rag.gemini_rag.controller;

import com.rag.gemini_rag.dto.CandidateMatch;
import com.rag.gemini_rag.dto.MatchRequest;
import com.rag.gemini_rag.service.IRecruitmentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recruitment")
public class RecruitmentController {

    private static final Logger log = LoggerFactory.getLogger(RecruitmentController.class);
    private final IRecruitmentService recruitmentService;

    public RecruitmentController(IRecruitmentService recruitmentService) {
        this.recruitmentService = recruitmentService;
    }

    @PostMapping("/match")
    public ResponseEntity<List<CandidateMatch>> findMatches(@Valid @RequestBody MatchRequest matchRequest) {
        String jobDescription = matchRequest.jobDescription();
        if (jobDescription == null || jobDescription.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        // Puedes añadir un parámetro para topK si quieres que sea configurable
        List<CandidateMatch> matches = recruitmentService.findBestCandidatesForJob(jobDescription, 5);
        return ResponseEntity.ok(matches);
    }
}

package com.rag.gemini_rag.controller;

import com.rag.gemini_rag.dto.ImprovementCandidateResponse;
import com.rag.gemini_rag.service.ICvImprovementService;
import com.rag.gemini_rag.service.IRateLimitingService;
import com.rag.gemini_rag.utils.Utils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/cvs")
public class CVController {
    private final ICvImprovementService cvImprovementService;
    private final IRateLimitingService rateLimitingService;

    public CVController(ICvImprovementService cvImprovementService, IRateLimitingService rateLimitingService) {
        this.cvImprovementService = cvImprovementService;
        this.rateLimitingService = rateLimitingService;
    }

    @PostMapping("/improve")
    public ResponseEntity<?> improveCv(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "jobDescription", required = false) String jobDescription,
            @RequestParam(value = "companyName", required = false) String companyName,
            HttpServletRequest request) {
        String clientIp = Utils.getClientIp(request);

        if (!rateLimitingService.allowRequest(clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "You've reached the limit of 3 free optimizations per day. Please come back tomorrow."));
        }
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "The file is empty."));
        }

        try {
            ImprovementCandidateResponse improvedCv = cvImprovementService.getImprovedCvProfile(file, jobDescription, companyName);
            return ResponseEntity.ok(improvedCv);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error processing the file: " + e.getMessage()));
        }
    }

}

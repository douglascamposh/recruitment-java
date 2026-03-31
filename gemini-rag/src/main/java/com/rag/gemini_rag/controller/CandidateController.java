package com.rag.gemini_rag.controller;

import com.rag.gemini_rag.dto.CandidateProfile;
import com.rag.gemini_rag.dto.ImprovementCandidateResponse;
import com.rag.gemini_rag.service.ICandidateService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/candidates")
public class CandidateController {
    private final ICandidateService candidateService;
    public CandidateController(ICandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @GetMapping()
    public ResponseEntity<?> candidatesByUserId(
            @RequestParam("userId") String userId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        if (userId == null || userId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "The userId parameter is required."));
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<CandidateProfile> candidateProfilesPage = candidateService.getCandidatesByUserId(userId, pageable);

        if (candidateProfilesPage.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "No candidate profiles found for the given userId."));
        }

        return ResponseEntity.ok(candidateProfilesPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CandidateProfile> getCandidateById(@PathVariable("id") String id) {
         return ResponseEntity.ok(candidateService.getCandidateById(id));
    }

    @PostMapping()
    public ResponseEntity<?> save(@RequestBody ImprovementCandidateResponse candidate) {
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

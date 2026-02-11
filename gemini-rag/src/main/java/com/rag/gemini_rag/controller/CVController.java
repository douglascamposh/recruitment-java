package com.rag.gemini_rag.controller;

import com.rag.gemini_rag.dto.ImprovementCandidateRequest;
import com.rag.gemini_rag.service.ICvImprovementService;
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

    public CVController(ICvImprovementService cvImprovementService) {
        this.cvImprovementService = cvImprovementService;
    }

    @PostMapping("/improve")
    public ResponseEntity<?> improveCv(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "jobDescription", required = false) String jobDescription) {
        // quizas agregar un valor para recomendarle cursos que puede hacer para mejorar el CV de acuerdo al puesto de trabajo.
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "The file is empty."));
        }

        try {
            ImprovementCandidateRequest improvedCv = cvImprovementService.getImprovedCvProfile(file, jobDescription);
            return ResponseEntity.ok(improvedCv);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error processing the file: " + e.getMessage()));
        }
    }
}

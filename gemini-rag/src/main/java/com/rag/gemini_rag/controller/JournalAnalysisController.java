package com.rag.gemini_rag.controller;

import com.rag.gemini_rag.dto.JournalAnalysisRequest;
import com.rag.gemini_rag.dto.JournalAnalysisResult;
import com.rag.gemini_rag.service.IJournalAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/journals")
public class JournalAnalysisController {
    private final IJournalAnalysisService journalAnalysisService;
    public JournalAnalysisController(IJournalAnalysisService journalAnalysisService) {
        this.journalAnalysisService = journalAnalysisService;
    }
    @PostMapping
    public ResponseEntity<JournalAnalysisResult> analyzeJournalEntry(@RequestBody JournalAnalysisRequest journalEntry) {
        JournalAnalysisResult journalAnalysisResult = journalAnalysisService.analyzeAndSaveJournal(journalEntry);
        return ResponseEntity.ok(journalAnalysisResult);
    }
    @GetMapping
    public ResponseEntity<String> getReflectionOnRecentJournals(
            @RequestParam String userId,
            @RequestParam(defaultValue = "5") int limit) {
        String reflection = journalAnalysisService.getReflectionOnRecentJournals(userId, limit);
        return ResponseEntity.ok(reflection);
    }
}

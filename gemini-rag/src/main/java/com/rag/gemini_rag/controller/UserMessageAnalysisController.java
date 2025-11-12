package com.rag.gemini_rag.controller;
import com.rag.gemini_rag.dto.UserMessageAnalysisResult;
import com.rag.gemini_rag.dto.UserMessageRequest;
import com.rag.gemini_rag.service.IUserMessageAnalysisService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class UserMessageAnalysisController {

    private final IUserMessageAnalysisService analysisService;

    public UserMessageAnalysisController(IUserMessageAnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping("/contextual-analyze")
    public UserMessageAnalysisResult analyzeMessages(@RequestBody List<UserMessageRequest> messages) {
        if (messages == null || messages.size() < 1) {
            throw new IllegalArgumentException("At least one message is required");
        }

        // El último es el mensaje nuevo, el resto es historial
        UserMessageRequest latest = messages.get(messages.size() - 1);
        List<UserMessageRequest> history = messages.subList(0, messages.size() - 1);

        return analysisService.analyze(latest, history);
    }

    @GetMapping("/spammers")
    public List<String> getAllSpammers() {
        return analysisService.getAllSuspectedSpammers();
    }

    @GetMapping("/is-spammer/{userId}")
    public boolean isSpammer(@PathVariable String userId) {
        return analysisService.isSuspectedSpammer(userId);
    }
}

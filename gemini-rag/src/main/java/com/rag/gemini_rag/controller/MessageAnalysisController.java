package com.rag.gemini_rag.controller;

import com.rag.gemini_rag.dto.MessageAnalysisResult;
import com.rag.gemini_rag.dto.MessageRequest;
import com.rag.gemini_rag.service.IMessageAnalysisService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/messages")
public class MessageAnalysisController {

    private final IMessageAnalysisService analysisService;

    public MessageAnalysisController(IMessageAnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping("/analyze")
    public MessageAnalysisResult analyzeMessage(@RequestBody MessageRequest request) {
        return analysisService.analyze(request.text());
    }
}

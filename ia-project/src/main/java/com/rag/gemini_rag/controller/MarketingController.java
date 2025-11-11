package com.rag.gemini_rag.controller;

import com.rag.gemini_rag.dto.ContentBriefResponse;
import com.rag.gemini_rag.dto.FaqRequest;
import com.rag.gemini_rag.dto.FaqResponse;
import com.rag.gemini_rag.dto.PromptRequest;
import com.rag.gemini_rag.service.IMarketingOrchestratorService;
import com.rag.gemini_rag.service.IMultimodalFaqService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.net.MalformedURLException;

@RestController
@RequestMapping("/api/v1/marketing")
public class MarketingController {
    private final IMarketingOrchestratorService marketingOrchestrator;
    private final IMultimodalFaqService multimodalFaqService;

    public MarketingController(IMarketingOrchestratorService marketingOrchestrator, IMultimodalFaqService multimodalFaqService) {
        this.marketingOrchestrator = marketingOrchestrator;
        this.multimodalFaqService = multimodalFaqService;
    }

    @PostMapping("/generate-brief")
    public ResponseEntity<ContentBriefResponse> generateContentBrief(@RequestBody PromptRequest request) {
        ContentBriefResponse response = marketingOrchestrator.generateBrief(request.prompt());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate-faqs-from-image")
    public ResponseEntity<FaqResponse> generateFaqsFromImage(@Valid @RequestBody FaqRequest request) {
        try {
            FaqResponse response = multimodalFaqService.generateFaqsFromImage(request);
            return ResponseEntity.ok(response);
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
